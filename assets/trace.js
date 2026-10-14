/* O Traço do Movimento — one continuous line drawn through the page by scroll.
   Each [data-trace] section draws its own segment; segments meet at the section
   edges (data-out of one = data-in of the next), so the line reads as one.
   The segments are drawn as ONE stroke: a single travelled distance is poured
   into them in order, so only one head ever moves. Scroll is measured along the
   route itself (vertical travel, plus horizontal runs and loops), never by height
   alone, so flat stretches don't fire off and climbing loops don't stall.
   A faint dotted trail shows the route ahead; the stroke fills it. */
(function () {
  'use strict';
  window.__trace = true;
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  var mqMobile = window.matchMedia('(max-width: 760px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-trace]'));
  var STEP = 4;
  // [route share of the scroll schedule, weight of sideways travel] — see build()
  // glide length: longer on big screens (sweeps read as one gesture), shorter where the view is small
  function glide() { return window.innerHeight < 520 ? 0.8 : mqMobile.matches ? 0.83 : 0.895; }
  var SMOOTH = glide();
  var MIX = [0.55, 0.8];
  var states = [];
  var introStart = 0, INTRO = 2400;
  var vw = window.innerWidth, vh = window.innerHeight;

  function attr(el, name, mob) {
    var m = el.dataset[name + 'M'];
    return mob && m !== undefined ? m : el.dataset[name];
  }
  function nums(s) { return s.trim().split(/\s+/).map(Number); }
  function mk(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // centripetal Catmull-Rom (alpha 0.5): no cusps and no bulging when anchors are unevenly spaced.
  // Control points are clamped to the viewport, and a cubic stays inside its control hull.
  // Returns the path data and the same rounded numbers, 8 per cubic (start, two controls, end), for sample().
  function catmull(p, w) {
    var lo = 4, hi = w - 4;
    function cx(v) { return Math.min(hi, Math.max(lo, v)).toFixed(1); }
    function dist(a, b) { return Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5); }
    var x0 = p[0][0].toFixed(1), y0 = p[0][1].toFixed(1), c = [];
    var d = 'M' + x0 + ' ' + y0;
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var d1 = dist(p0, p1), d2 = dist(p1, p2), d3 = dist(p2, p3), b1 = [], b2 = [];
      for (var k = 0; k < 2; k++) {
        b1[k] = d1 < 1e-3 ? p1[k] + (p2[k] - p1[k]) / 3 :
          (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2));
        b2[k] = d3 < 1e-3 ? p2[k] - (p2[k] - p1[k]) / 3 :
          (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2));
      }
      var seg = [cx(b1[0]), b1[1].toFixed(1), cx(b2[0]), b2[1].toFixed(1), p2[0].toFixed(1), p2[1].toFixed(1)];
      d += 'C' + seg.join(' ');
      c.push(+x0, +y0, +seg[0], +seg[1], +seg[2], +seg[3], +seg[4], +seg[5]);
      x0 = seg[4]; y0 = seg[5];
    }
    return { d: d, c: c };
  }

  // points every STEP px along the path, by arithmetic: each cubic is cut into short chords
  // (about one per 6px of its control polygon), the chord lengths are rescaled to the browser's own
  // path length (the length the dash and the words use), and the table is read at i * STEP.
  // getPointAtLength walks the path from its start on every call, which froze slow phones for a second.
  function sample(c, len, n, xs, ys) {
    var subs = [], m = 1, o, j;
    for (o = 0; o < c.length; o += 8) {
      var pl = Math.hypot(c[o + 2] - c[o], c[o + 3] - c[o + 1]) + Math.hypot(c[o + 4] - c[o + 2], c[o + 5] - c[o + 3]) +
        Math.hypot(c[o + 6] - c[o + 4], c[o + 7] - c[o + 5]);
      var sb = Math.max(8, Math.min(160, Math.ceil(pl / 6)));
      subs.push(sb); m += sb;
    }
    var px = new Float64Array(m), py = new Float64Array(m), cum = new Float64Array(m), k = 1;
    px[0] = c[0]; py[0] = c[1];
    for (o = 0; o < c.length; o += 8) {
      for (j = 1, sb = subs[o / 8]; j <= sb; j++) {
        var t = j / sb, mt = 1 - t, a = mt * mt * mt, b = 3 * mt * mt * t, e = 3 * mt * t * t, f = t * t * t;
        px[k] = a * c[o] + b * c[o + 2] + e * c[o + 4] + f * c[o + 6];
        py[k] = a * c[o + 1] + b * c[o + 3] + e * c[o + 5] + f * c[o + 7];
        cum[k] = cum[k - 1] + Math.hypot(px[k] - px[k - 1], py[k] - py[k - 1]); k++;
      }
    }
    var sc = cum[m - 1] > 0 ? len / cum[m - 1] : 0, h = 1;
    for (var i = 0; i < n; i++) {
      var L = Math.min(i * STEP, len);
      while (h < m - 1 && cum[h] * sc < L) h++;
      var l0 = cum[h - 1] * sc, l1 = cum[h] * sc, r = l1 > l0 ? Math.min(1, Math.max(0, (L - l0) / (l1 - l0))) : 0;
      xs[i] = px[h - 1] + (px[h] - px[h - 1]) * r; ys[i] = py[h - 1] + (py[h] - py[h - 1]) * r;
    }
  }

  // anchors are measured at rest: subtract any entrance translate still applied above them
  function restShift(el, stop) {
    var dx = 0, dy = 0;
    for (var n = el; n && n !== stop; n = n.parentElement) {
      var t = getComputedStyle(n).translate;
      if (t && t !== 'none') { var v = t.split(' '); dx += parseFloat(v[0]) || 0; dy += parseFloat(v[1]) || 0; }
    }
    return [dx, dy];
  }

  function points(sec, mob) {
    var w = sec.clientWidth, h = sec.offsetHeight, sr = sec.getBoundingClientRect();
    var pts = [], refs = [], lead = Math.min(+(attr(sec, 'lead', mob) || 70), h * 0.1);
    // L / R: the line's lanes in the side margins, derived from the real content edges at this width
    var wrap = sec.querySelector('.wrap, .lk-wrap'), cl = 0, cr = w;
    if (wrap) {
      var wr = wrap.getBoundingClientRect(), wc = getComputedStyle(wrap);
      cl = wr.left - sr.left + parseFloat(wc.paddingLeft); cr = wr.right - sr.left - parseFloat(wc.paddingRight);
    }
    var L = Math.max(6, cl * 0.45), R = Math.min(w - 6, w - (w - cr) * 0.45);
    function X(v) { return v === 'L' ? L : v === 'R' ? R : +v * w; }
    var inX = attr(sec, 'in', mob);
    if (inX !== undefined) pts.push([X(inX), 0], [X(inX), lead]);
    sec.querySelectorAll('[data-pt]').forEach(function (a) {
      var spec = attr(a, 'pt', mob);
      if (!spec || spec === 'skip' || !a.getClientRects().length) return;
      if (mob && a.closest('[data-skip-m]')) return;
      var r = a.getBoundingClientRect(), f = spec.trim().split(/\s+/), sh = restShift(a, sec);
      var x = r.left - sr.left - sh[0], y = r.top - sr.top - sh[1];
      pts.push([f[0] === 'L' ? L : f[0] === 'R' ? R : x + +f[0] * r.width, y + +f[1] * r.height]);
      if (a.hasAttribute('data-tick')) refs.push({ el: a, p: pts[pts.length - 1] });
      var loop = attr(a, 'loop', mob);
      if (loop) {
        var lp = nums(loop), cx = x + r.width / 2, cy = y + r.height / 2;
        // turns < 0 runs the loop the other way; optional 5th value = sample step in degrees
        var dir = lp[3] < 0 ? -1 : 1, st = lp[4] || 40;
        for (var t = st; t <= Math.abs(lp[3]) * 360; t += st) {
          var ang = (lp[2] + dir * t) * Math.PI / 180;
          pts.push([cx + lp[0] * r.width * Math.cos(ang), cy + lp[1] * r.height * Math.sin(ang)]);
        }
      }
    });
    var outX = attr(sec, 'out', mob);
    if (outX !== undefined) pts.push([X(outX), h - lead], [X(outX), h]);
    var zone = null, z = (mob && sec.querySelector('[data-front-zone-m]')) || sec.querySelector('[data-front-zone]');
    if (z && z.getClientRects().length) {
      var zr = z.getBoundingClientRect(), zs = restShift(z, sec);
      zone = [zr.left - sr.left - zs[0], zr.top - sr.top - zs[1], zr.width, zr.height];
    } else {
      var front = attr(sec, 'front', mob);
      if (front) { var fr = nums(front); zone = [fr[0] * w, fr[1] * h, (fr[2] - fr[0]) * w, (fr[3] - fr[1]) * h]; }
    }
    pts.forEach(function (p) { p[0] = Math.min(w - 6, Math.max(6, p[0])); });
    pts = pts.filter(function (p, i) {
      var q = pts[i - 1];
      return !q || Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) > 4;
    });
    return { w: w, h: h, pts: pts, refs: refs, zone: zone };
  }

  // audit hook: the anchor list each section would draw through right now

  function build() {
    pinLayout();
    var mob = mqMobile.matches;
    var geo = sections.map(function (sec) { return points(sec, mob); });
    var sy = window.scrollY;
    // page positions are cached here so the frame loop never has to read layout
    sections.forEach(function (sec, si) {
      if (states[si]) { states[si].top = sec.getBoundingClientRect().top + sy; states[si].h = sec.offsetHeight; }
    });

    sections.forEach(function (sec, si) {
      var g = geo[si];
      if (g.pts.length < 2) return;
      var cr = catmull(g.pts, g.w), d = cr.d;
      var s = states[si];
      var zkey = g.zone ? g.zone.map(Math.round).join(',') : '';
      if (s && s.d === d && s.w === g.w && s.h === g.h && s.zkey === zkey) return;
      var vb = '0 0 ' + g.w + ' ' + g.h, id = 'trace-' + si;

      if (!s) {
        s = states[si] = { sec: sec, drawn: -1, ghosts: [], words: [], intro: sec.hasAttribute('data-intro'),
          penAt: parseFloat(sec.dataset.pen || '0.62') };
        s.svg = mk('svg', { 'class': 'trace', 'aria-hidden': 'true', focusable: 'false' });
        sec.insertBefore(s.svg, sec.firstChild);
        s.trail = mk('path', { 'class': 'trail' }, s.svg);
        var nG = reduce ? 0 : +(sec.dataset.ghosts || 0);
        for (var gI = nG; gI >= 1; gI--) {
          s.ghosts.push(mk('path', { 'class': 'ghost', transform: 'translate(' + (-gI * 13) + ' ' + (gI * 9) + ')', opacity: [0, .34, .2, .1][gI] || .08 }, s.svg));
        }
        s.path = mk('path', { 'class': 'ln', id: id }, s.svg);
        s.pen = mk('circle', { r: 5.5, 'class': 'pen', opacity: 0 }, s.svg);
        s.lines = [s.path];
        if (sec.dataset.front || sec.querySelector('[data-front-zone],[data-front-zone-m]')) {
          s.fsvg = mk('svg', { 'class': 'trace front', 'aria-hidden': 'true', focusable: 'false' });
          var cp = mk('clipPath', { id: id + '-clip' }, mk('defs', {}, s.fsvg));
          s.clip = mk('rect', {}, cp);
          s.lines.push(mk('path', { 'class': 'ln', 'clip-path': 'url(#' + id + '-clip)' }, s.fsvg));
          sec.appendChild(s.fsvg);
        }
      }
      s.d = d; s.w = g.w; s.h = g.h; s.zkey = zkey;
      s.top = sec.getBoundingClientRect().top + window.scrollY;
      s.trail.setAttribute('d', d);
      [s.svg, s.fsvg].forEach(function (svg) {
        if (!svg) return;
        svg.setAttribute('viewBox', vb); svg.setAttribute('width', g.w); svg.setAttribute('height', g.h);
      });
      s.lines.concat(s.ghosts).forEach(function (l) { l.setAttribute('d', d); });
      if (s.clip) {
        var zz = g.zone || [0, 0, 0, 0];
        s.clip.setAttribute('x', zz[0]); s.clip.setAttribute('y', zz[1]);
        s.clip.setAttribute('width', zz[2]); s.clip.setAttribute('height', zz[3]);
      }

      var len = s.path.getTotalLength();
      var n = Math.ceil(len / STEP) + 1;
      var xs = new Float32Array(n), ys = new Float32Array(n), u = new Float32Array(n), cm = new Float32Array(n);
      sample(cr.c, len, n, xs, ys);
      for (var i = 0; i < n; i++) {
        cm[i] = i ? Math.max(cm[i - 1], ys[i]) : ys[i];
        u[i] = i ? u[i - 1] + Math.abs(ys[i] - ys[i - 1]) + MIX[1] * Math.abs(xs[i] - xs[i - 1]) : 0;
      }
      // scroll schedule for this segment: 60% "the head sits at the reading line" (cumulative depth),
      // 40% "every stretch costs scroll" (route length rescaled to the same depth range).
      // Both are monotonic, so the blend is too: flat runs and climbing loops are spread over
      // the scroll instead of firing off or stalling, and the head never strays far from view.
      var v = new Float32Array(n), span = cm[n - 1] - cm[0], ut = u[n - 1] || 1;
      for (var q = 0; q < n; q++) v[q] = (1 - MIX[0]) * cm[q] + MIX[0] * (cm[0] + u[q] / ut * span);
      s.len = len; s.n = n; s.xs = xs; s.ys = ys; s.v = v;
      s.drawn = -1;

      // where each tick sits along the line
      s.refs = g.refs.map(function (ref) {
        var best = 0, bd = Infinity;
        for (var i = 0; i < n; i++) {
          var dx = xs[i] - ref.p[0], dy = ys[i] - ref.p[1], dd = dx * dx + dy * dy;
          if (dd < bd) { bd = dd; best = i; }
        }
        return { el: ref.el, at: Math.min(best * STEP, len) };
      });

      // words ride on rightward stretches of the line
      s.words.forEach(function (w) { w.el.remove(); });
      s.words = [];
      if (sec.dataset.words) {
        var list = sec.dataset.words.split('|'), range = nums(attr(sec, 'wordsRange', mob) || '0 1');
        var fs = mob ? 13 : 15, cw = fs * 0.52, gap = mob ? 22 : 34;
        // data-words-strict: first try to keep every word off the outside of clockwise bends (letters
        // splay there); if that leaves a word without room, fall back to the looser rule
        for (var strict = sec.hasAttribute('data-words-strict') ? 1 : 0; strict >= 0; strict--) {
        s.words.forEach(function (w) { w.el.remove(); });
        s.words = [];
        var idx = Math.floor(range[0] * len / STEP), i1 = Math.floor(range[1] * len / STEP), k = 0;
        while (k < list.length && idx < i1) {
          var need = Math.ceil(list[k].length * cw / STEP), ok = idx + need < n;
          for (var j = idx; ok && j < idx + need; j++) {
            var ddx = xs[j + 1] - xs[j], ddy = ys[j + 1] - ys[j];
            if (!(ddx > 0 && Math.abs(ddy) < ddx * 0.9)) ok = false;
          }
          if (ok) {
            // letters crowd on tight bends: keep the turn across a word under ~30°
            var a0 = Math.atan2(ys[idx + 1] - ys[idx], xs[idx + 1] - xs[idx]);
            var a1 = Math.atan2(ys[idx + need] - ys[idx + need - 1], xs[idx + need] - xs[idx + need - 1]);
            if (Math.abs(a1 - a0) > 0.52 || (strict && a1 - a0 > 0.26)) ok = false;
          }
          if (ok) {
            var t = mk('text', { dy: -10 });
            s.svg.insertBefore(t, s.pen);
            t.style.fontSize = fs + 'px';
            mk('textPath', { href: '#' + id, startOffset: (idx * STEP).toFixed(0) }, t).textContent = list[k];
            s.words.push({ el: t, at: (idx + need) * STEP });
            k++; idx += need + Math.ceil(gap / STEP);
          } else idx++;
        }
        if (k === list.length) break;
        }
      }
      s.lines.concat(s.ghosts).forEach(function (l) { l.style.strokeDasharray = len + ' ' + (len + 20); });
    });
    offsets();
    schedule();
  }

  // where each segment starts on the single continuous stroke
  var total = 0, maxScroll = Infinity;
  function offsets() {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    total = 0;
    states.forEach(function (s) { if (s && s.len) { s.off = total; total += s.len; } });
  }

  // the opening draws at a walking pace: soft start, soft finish, duration grows with length
  function easeInOut(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var introDur = INTRO;

  // length along a segment once the reading line is `depth` px into the section
  function lengthAt(s, depth) {
    var v = s.v, n = s.n;
    if (depth <= v[0]) return 0;
    if (depth >= v[n - 1]) return s.len;
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (v[mid] <= depth) lo = mid; else hi = mid; }
    var a = v[lo], b = v[hi];
    return Math.min(s.len, (lo + (b > a ? (depth - a) / (b - a) : 0)) * STEP);
  }

  // total distance the stroke should have travelled for this scroll position (no layout reads)
  var lastTarget = 0;
  var started = false;
  function target(sy, now) {
    if (reduce) return total;
    // nothing draws until the opening is armed, so the line never starts, retracts and restarts
    if (!started) return 0;
    // at the very bottom of the page the stroke completes, whatever is left
    if (sy >= maxScroll - 2) return total;
    var D = 0;
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      if (!s || !s.len) continue;
      var dl = s.intro ? s.len : lengthAt(s, sy + vh * s.penAt - s.top);
      D += dl;
      if (dl < s.len) break;
    }
    if (introStart) {
      var t = (now - introStart) / introDur;
      if (t < 1) {
        var first = states.find(function (s) { return s && s.intro; });
        if (first) D = Math.min(D, first.off + first.len * easeInOut(t));
      }
    }
    return D;
  }

  var curD = 0, last = 0, running = false;
  function frame(now) {
    running = false;
    var dt = last ? Math.min(64, now - last) : 16;
    last = now;
    // read phase: scroll position and the few layout reads, before any write
    var sy = window.scrollY;
    filmRead();
    if (now - lastSweep > 180) { sweep(); lastSweep = now; }
    var goal = lastTarget = target(sy, now);
    // the pen follows its goal with a ~150ms glide: long sideways runs become a sweep, not a zip
    var k = reduce ? 1 : 1 - Math.pow(SMOOTH, dt / 16.7);
    var diff = goal - curD;
    curD = Math.abs(diff) < 0.5 ? goal : curD + diff * k;
    var busy = Math.abs(goal - curD) > 0.5 || (introStart && now - introStart < introDur);
    // write phase: pour the travelled distance into the segments, in order
    var rem = curD;
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      if (!s || !s.len) continue;
      var dr = Math.max(0, Math.min(s.len, rem));
      rem -= dr;
      if (Math.abs(dr - s.drawn) < 0.3) continue;
      s.drawn = dr;
      var off = s.len - dr;
      for (var l = 0; l < s.lines.length; l++) s.lines[l].style.strokeDashoffset = off;
      // echoes only appear once the head has a real stroke behind it
      var gOp = Math.max(0, Math.min(1, (dr - 60) / 140));
      for (var g = 0; g < s.ghosts.length; g++) {
        var gp = s.ghosts[g].style;
        gp.strokeDashoffset = Math.min(s.len, off + (g + 1) * 40);
        gp.visibility = gOp ? 'visible' : 'hidden';
        gp.strokeOpacity = gOp;
      }
      if (dr > 2 && dr < s.len - 2) {
        var j = Math.min(s.n - 1, Math.round(dr / STEP));
        s.pen.setAttribute('cx', s.xs[j]); s.pen.setAttribute('cy', s.ys[j]); s.pen.setAttribute('opacity', 1);
      } else s.pen.setAttribute('opacity', 0);
      for (var r = 0; r < s.refs.length; r++) s.refs[r].el.classList.toggle('is-reached', dr >= s.refs[r].at - 2);
      for (var w = 0; w < s.words.length; w++) s.words[w].el.classList.toggle('on', dr >= s.words[w].at);
    }
    filmWrite();
    if (busy) schedule(); else last = 0;
  }
  var lastSweep = 0;
  function schedule() { if (!running) { running = true; requestAnimationFrame(frame); } }

  // pinned gallery: the Espaço stage sticks under the header; vertical scroll slides the photos
  // sideways (with a short hold on the first and last frame), then the page releases and scrolls on
  var strip = document.querySelector('.strip');
  var pinSec = document.getElementById('espaco');
  var pin = document.querySelector('[data-pin]'), stage = document.querySelector('[data-stage]');
  var pinOn = !!(strip && pin && stage && !reduce);
  var pinTop = 72, travel = 0, hold = 0, filmX = -1, filmLast = -1, pinHeld = false, stripOnly = false, headOp = 1, headLast = -1;
  var pinHead = stage && stage.querySelector('.espaco-head');
  function pinLayout() {
    if (!pinOn) return;
    pinSec.classList.add('is-pinned');
    strip.removeAttribute('tabindex');
    var hdr = document.querySelector('[data-header]');
    var top = hdr ? hdr.offsetHeight : 72, avail = window.innerHeight - top;
    var head = stage.querySelector('.espaco-head'), wrap = stage.querySelector('.strip-wrap');
    var cap = strip.querySelector('.frame-cap');
    var mob = mqMobile.matches, vwid = document.documentElement.clientWidth;
    var baseW = mob ? Math.min(vwid * 0.72, 400) : Math.min(320, Math.max(240, vwid * 0.24));
    var capH = cap ? cap.offsetHeight + 8 : 44;
    var gap = parseFloat(getComputedStyle(wrap).marginTop) || 32;
    var headH = head.offsetHeight;
    // keep the heading on stage when the photos still get a decent size; otherwise let it scroll off
    var room = avail - 32 - headH - gap - capH;
    var withHead = room >= Math.min(baseW * 1.25, 300);
    if (!withHead) room = avail - 48 - capH;
    var w = Math.max(150, Math.min(baseW, room / 1.25));
    pinSec.style.setProperty('--frame-w', Math.round(w) + 'px');
    pinSec.classList.toggle('pin-strip-only', !withHead);
    stripOnly = !withHead;
    pinSec.style.setProperty('--stage-h', Math.round(avail) + 'px');
    // the stage is only as tall as its content (no empty space in the page flow);
    // it is centred under the header by where it sticks
    var stick = withHead
      ? Math.round(top + Math.max(0, (avail - stage.offsetHeight) / 2))
      : Math.round(top + (avail - wrap.offsetHeight) / 2 - wrap.offsetTop);
    pinSec.style.setProperty('--stage-top', stick + 'px');
    strip.style.transform = 'none'; filmLast = -1;
    var frames = strip.querySelectorAll('.frame'), last = frames[frames.length - 1];
    var padR = parseFloat(getComputedStyle(strip).paddingRight) || 0;
    travel = Math.max(0, Math.round(last.getBoundingClientRect().right + padR - vwid));
    hold = Math.round(Math.min(160, window.innerHeight * 0.18));
    pinTop = stick;
    pinSec.style.setProperty('--pin-h', Math.round(stage.offsetHeight + travel + 2 * hold) + 'px');
  }
  function filmRead() {
    filmX = -1;
    if (!pinOn || !travel) return;
    var r = pin.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
    var p = Math.min(1, Math.max(0, (pinTop - r.top - hold) / travel));
    filmX = Math.round(p * travel);
    // short screens: the heading gives way to the photos during the hold, and returns on the way back up
    headOp = stripOnly ? Math.max(0, Math.min(1, 1 - (pinTop - r.top) / Math.max(1, hold))) : 1;
    // while the gallery is held, the floating button steps aside so it never covers a caption
    var held = r.top <= pinTop + 1 && r.bottom > pinTop + stage.offsetHeight + 1;
    if (held !== pinHeld) { pinHeld = held; fabState(); }
  }
  function filmWrite() {
    if (filmX >= 0 && filmX !== filmLast) { strip.style.transform = 'translate3d(' + (-filmX) + 'px,0,0)'; filmLast = filmX; }
    if (pinHead && headOp !== headLast) { pinHead.style.opacity = headOp; headLast = headOp; }
  }

  // rebuild only when geometry changes; ignore mobile URL-bar height jitter
  var rt;
  function rebuild() { clearTimeout(rt); rt = setTimeout(build, 120); }
  window.addEventListener('resize', function () {
    if (window.innerWidth !== vw || Math.abs(window.innerHeight - vh) > 160) {
      vw = window.innerWidth; vh = window.innerHeight; SMOOTH = glide(); rebuild();
    }
  });
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(rebuild);
    sections.forEach(function (s) { ro.observe(s); });
  }
  window.addEventListener('scroll', schedule, { passive: true });

  // entrances: content arrives as it comes into view
  var sweep = function () {};
  var revealSel = 'h1,h2,.display-name,.hero-lead,.hero-actions,.lead,.measure>p,.sobre-role,.quote-row>*,.spec-help,' +
    '.insta-row,.route>h3,.route-sub,.route>.btn,.clinic-info,.testimonial,.dep-rating,.dep-head>.link-quiet,.final-copy>.btn,.final-note,.coopmed,.sobre-copy>.btn,' +
    '.sinais-list>li,.spec,.step,.diffs>div,.faq,.stops>li,.frame,.lk-role,.lk-cref,.lk-greet,.lk-links>*,.steps-cta,.footer-grid>*,' +
    '.oque-photo img,.sinais-photo img,.clinic-map,.hero-figure,.sobre-figure,.final-figure,.lk-figure';
  function reveal() {
    if (!root.classList.contains('js-motion')) return;
    var els = Array.prototype.slice.call(document.querySelectorAll(revealSel));
    // siblings that arrive together are staggered in reading order
    var groups = new Map();
    els.forEach(function (el) {
      var key = el.closest('.hero-copy,.final-copy,.lk-wrap,.sobre-copy') || el.parentElement;
      var n = groups.get(key) || 0;
      el.style.setProperty('--i', Math.min(n, 7));
      groups.set(key, n + 1);
    });
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    // a clipped heading has no visible area to observe, so watch its parent instead
    var watch = new Map();
    els.forEach(function (el) {
      var t = el.matches('h1,h2,.display-name') ? el.parentElement : el;
      (watch.get(t) || watch.set(t, []).get(t)).push(el);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        watch.get(e.target).forEach(function (el) { el.classList.add('in'); });
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    watch.forEach(function (_, t) { io.observe(t); });
    var pending = els.slice();
    sweep = function () {
      if (!pending.length) return;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        var t = el.matches('h1,h2,.display-name') ? el.parentElement : el;
        if (t.getBoundingClientRect().top < vh) { el.classList.add('in'); return false; }
        return true;
      });
    };
  }

  function start() {
    // a deep link (#duvidas) is reached before the pinned gallery makes the page taller; if the browser
    // had already landed on its target, land on it again now (a scroll the visitor made is left alone)
    var tg = location.hash && document.querySelector(':target'), landed = false;
    if (tg) {
      landed = Math.abs(tg.getBoundingClientRect().top - (parseFloat(getComputedStyle(tg).scrollMarginTop) || 0)) < 2 ||
        window.scrollY >= root.scrollHeight - window.innerHeight - 2;
    }
    build();
    if (landed) tg.scrollIntoView();
    // from here on in-page links glide (site.css: html.is-ready)
    root.classList.add('is-ready');
    started = true;
    var first = states.find(function (s) { return s && s.intro; });
    if (!reduce && first && window.scrollY < 40) {
      introDur = Math.min(3600, Math.max(2200, first.len / 0.9));
      introStart = performance.now();
    } else {
      curD = target(window.scrollY, performance.now());
    }
    schedule();
  }
  reveal();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  window.addEventListener('load', rebuild);

  // menu sheet (below 1080px)
  var toggle = document.querySelector('[data-menu-toggle]'), sheet = document.querySelector('[data-menu]');
  if (toggle && sheet) {
    var label = toggle.querySelector('.sr-only');
    // while the sheet is open, the page behind it is out of reach for Tab and screen readers (the header stays)
    var behind = Array.prototype.slice.call(document.querySelectorAll('.skip, main, footer.footer, [data-fab]'));
    var setMenu = function (open) {
      root.classList.toggle('menu-open', open);
      behind.forEach(function (el) { el.inert = open; });
      toggle.setAttribute('aria-expanded', open);
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
      if (open) { sheet.removeAttribute('inert'); var f = sheet.querySelector('a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60); }
      else { sheet.setAttribute('inert', ''); }
    };
    toggle.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  // FAQ: answers slide open and closed; one open at a time, both directions animated.
  // Without JS (or with reduced motion) the native <details name="faq"> accordion stays in charge.
  var faqs = Array.prototype.slice.call(document.querySelectorAll('details.faq'));
  if (faqs.length && !reduce && 'animate' in document.body) {
    var EASE_OPEN = 'cubic-bezier(.16,1,.3,1)', EASE_CLOSE = 'cubic-bezier(.4,0,.2,1)';
    faqs.forEach(function (d) { d.removeAttribute('name'); });
    // the line keeps its old path while an answer moves, so it steps back (site.css #duvidas.faq-moving)
    // and is rebuilt on the new layout as soon as the last animation ends
    var anim = new WeakMap(), faqSec = document.getElementById('duvidas');
    var moving = function () { if (faqSec) faqSec.classList.add('faq-moving'); };
    var settled = function () {
      if (faqs.some(function (o) { return anim.has(o); })) return;
      if (faqSec) faqSec.classList.remove('faq-moving');
      var s = states[sections.indexOf(faqSec)], len0 = s ? s.len : 0, off0 = s ? s.off : 0;
      clearTimeout(rt); build();
      if (!s) return;
      // whatever is drawn past this section stays exactly where it is (no retract and regrow); inside it,
      // where the line was out of sight while the list moved, the head lands straight on its new place
      if (curD > off0 + len0) curD += s.len - len0;
      else if (curD > off0) curD = Math.min(target(window.scrollY, performance.now()), s.off + s.len);
    };
    var stop = function (d) { var a = anim.get(d); if (a) { a.cancel(); anim.delete(d); } };
    var closeFaq = function (d) {
      var body = d.querySelector('.faq-a');
      stop(d);
      var h = body.offsetHeight, pb = getComputedStyle(body).paddingBottom;
      d.classList.add('is-closing');
      var a = body.animate([
        { height: h + 'px', paddingBottom: pb, opacity: 1 },
        { height: '0px', paddingBottom: '0px', opacity: 0 }
      ], { duration: 320, easing: EASE_CLOSE });
      anim.set(d, a); moving();
      a.onfinish = function () { d.open = false; d.classList.remove('is-closing'); anim.delete(d); settled(); };
    };
    var openFaq = function (d) {
      faqs.forEach(function (o) { if (o !== d && o.open && !o.classList.contains('is-closing')) closeFaq(o); });
      stop(d);
      d.classList.remove('is-closing');
      d.open = true;
      var body = d.querySelector('.faq-a');
      var h = body.offsetHeight, pb = getComputedStyle(body).paddingBottom;
      var a = body.animate([
        { height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-6px)' },
        { height: h + 'px', paddingBottom: pb, opacity: 1, transform: 'none' }
      ], { duration: 460, easing: EASE_OPEN });
      anim.set(d, a); moving();
      a.onfinish = function () { anim.delete(d); settled(); };
    };
    faqs.forEach(function (d) {
      d.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open && !d.classList.contains('is-closing')) closeFaq(d); else openFaq(d);
      });
    });
  }

  // header + floating button
  var fabHidden = {};
  function fabState() { var f = document.querySelector('[data-fab]'); if (f) f.classList.toggle('is-hidden', !!(fabHidden.topo || fabHidden.agendar || pinHeld)); }
  var header = document.querySelector('[data-header]');
  var fab = document.querySelector('[data-fab]');
  function chrome() { if (header) header.classList.toggle('is-solid', window.scrollY > 24); }
  window.addEventListener('scroll', chrome, { passive: true });
  chrome();
  if (fab && 'IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { fabHidden[e.target.id] = e.isIntersecting; });
      fabState();
    }, { threshold: 0.15 });
    ['topo', 'agendar'].forEach(function (id) { var t = document.getElementById(id); if (t) fio.observe(t); });
  }
})();
