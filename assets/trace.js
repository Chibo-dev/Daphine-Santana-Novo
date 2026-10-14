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
    return { w: w, h: h, pts: pts, refs: refs, zone: zone, cl: cl, cr: cr };
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
      if (s) { s.cl = g.cl; s.cr = g.cr; }
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
      s.d = d; s.w = g.w; s.h = g.h; s.zkey = zkey; s.cl = g.cl; s.cr = g.cr;
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
      // loops (the line turns >= 300° within 500px): the crawl rides them round without turning over twice
      var ang = new Float32Array(n), lp = new Uint8Array(n);
      for (var a = 1; a < n; a++) {
        var da = Math.atan2(ys[a] - ys[a - 1], xs[a] - xs[a - 1]) - (a > 1 ? Math.atan2(ys[a - 1] - ys[a - 2], xs[a - 1] - xs[a - 2]) : 0);
        da -= 2 * Math.PI * Math.round(da / (2 * Math.PI));
        ang[a] = a > 1 ? ang[a - 1] + da : Math.atan2(ys[1] - ys[0], xs[1] - xs[0]);
      }
      for (var a0 = 1; a0 < n; a0++) for (var a1 = a0 + 1; a1 < Math.min(n, a0 + 125); a1++) {
        if (Math.abs(ang[a1] - ang[a0]) >= 5.24) { for (var a2 = a0; a2 <= a1; a2++) lp[a2] = 1; break; }
      }
      s.loop = lp;
      // where the child turns to at the very end (the final button), in section coordinates
      var goal = sec.querySelector('[data-child-goal]');
      if (goal) { var gr = goal.getBoundingClientRect(); s.goal = gr.left + gr.width / 2 - sec.getBoundingClientRect().left; } else s.goal = null;
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

  // THE CHILD: one child rides the head of the stroke and grows up along the page:
  // sitting in the hero, crawling, walking, then running to the final button.
  // Rigs: <template id="crawler-<stage>"> in index.html (origin on the line, facing +x, y up is negative;
  // [data-part] groups rotate about data-pivot, nested parts compose: shin in leg, forearm in arm, head in body).
  // Poses: the four functions below are the final stage poses, copied verbatim
  // (pose(t, time, idle): t = gait phase, one cycle per pose.stride rig units of line; time in ms; idle 0..1).
  function poseSit(t, time, idle) {
    // SIT stage (6–8 months): a baby sitting on the line, bum at the origin, legs out in front.
    // Gait = a bum-scoot. t in [0,1) is one hitch: both heels plant out front and pull the bum
    // toward them (knees rise, torso leans in, arms reach ahead), then the legs reach out again.
    // Angles in degrees, SVG rotate (positive = clockwise); lean > 0 tips the whole figure forward
    // about the origin (the bum). The legs are solved with 2-bone IK so the planted heels stay put
    // on the line in world space while the origin advances by pose.stride per cycle.
    t = t - Math.floor(t);
    time = time || 0;
    idle = idle > 0 ? (idle < 1 ? idle : 1) : 0;
    var R = Math.PI / 180, TAU = 2 * Math.PI;
    var DUTY = 0.6;            // share of the cycle the heels are planted
    var SWEEP = 5;             // heel travel (rig units) relative to the bum while planted
    var LIFT = 2.2;            // heel lift at mid-reach
    var GROUND = -1.1;         // heel stroke centre: its 2.2 stroke sits in y ∈ [-2.2, 0]
    // rest geometry, must match rig.svg: hip pivot, knee pivot, heel tip (figure-local units)
    var LEGS = {
      near: { P: [4.5, -5], K: [12, -10], F: [19.5, -1.1] },
      far:  { P: [2.3, -5], K: [9.8, -10], F: [17.3, -1.1] }
    };
    function sq(x) { return x * x; }
    function mix(a, b) { return a + (b - a) * idle; }

    // ---- gait (bum-scoot) ----
    var hitch = sq(Math.sin(Math.PI * t));               // 0 at t=0 (neutral), 1 at mid-hitch
    var g = {
      lean: 5 * hitch,                                   // tip into the pull
      bodyY: -0.4 * hitch,                               // bum lifts a hair as it hitches
      nearArm: -14 * hitch,                              // both hands reach ahead
      farArm: -10 * hitch,
      head: -2.5 * hitch + 2 * Math.sin(TAU * t)         // keeps the gaze level, small nod
    };
    function heelX(F) {                                  // heel x in world (line) units, origin = bum
      if (t < DUTY) return F - SWEEP * t / DUTY;         // planted: slides back at exactly the stride rate
      var s = (t - DUTY) / (1 - DUTY);
      return F - SWEEP + SWEEP * s * s * (3 - 2 * s);    // reach out again, eased
    }
    var heelLift = t < DUTY ? 0 : LIFT * Math.sin(Math.PI * (t - DUTY) / (1 - DUTY));

    // ---- idle life: slow rock on the bum + happy arm bounce (periods 3.2 s / 1.6 s) ----
    var rock = Math.sin(TAU * time / 3200), bounce = Math.sin(TAU * time / 1600);
    var i = {
      lean: 2.2 * rock,
      bodyY: 0,
      nearArm: -8 - 7 * bounce,
      farArm: -7 - 6 * Math.sin(TAU * time / 1600 + 0.9),
      head: -1.2 * rock + 2.5 * Math.sin(TAU * time / 3200 + 1.3)
    };

    var out = {
      lean: mix(g.lean, i.lean),
      bodyY: mix(g.bodyY, i.bodyY),
      nearArm: mix(g.nearArm, i.nearArm),
      farArm: mix(g.farArm, i.farArm),
      head: mix(g.head, i.head)
    };

    // ---- 2-bone IK: heel target (world, relative to origin) -> thigh + shin rotations ----
    function leg(L) {
      var tx = mix(heelX(L.F[0]), L.F[0]);
      var ty = mix(GROUND - heelLift, GROUND);
      var c = Math.cos(-out.lean * R), s = Math.sin(-out.lean * R);
      var lx = tx * c - ty * s, ly = tx * s + ty * c;    // undo the whole-figure lean
      var P = L.P, K = L.K, F = L.F;
      var l1 = Math.hypot(K[0] - P[0], K[1] - P[1]), l2 = Math.hypot(F[0] - K[0], F[1] - K[1]);
      var dx = lx - P[0], dy = ly - P[1], d = Math.hypot(dx, dy);
      d = Math.max(Math.abs(l1 - l2) + 1e-3, Math.min(l1 + l2 - 1e-3, d));
      var a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
      var th = Math.atan2(dy, dx) - a;                    // knee bends up
      var kx = P[0] + l1 * Math.cos(th), ky = P[1] + l1 * Math.sin(th);
      var sh = Math.atan2(ly - ky, lx - kx);
      var th0 = Math.atan2(K[1] - P[1], K[0] - P[0]), sh0 = Math.atan2(F[1] - K[1], F[0] - K[0]);
      var thigh = (th - th0) / R;
      return [thigh, (sh - sh0) / R - thigh];
    }
    var n = leg(LEGS.near), f = leg(LEGS.far);
    out.nearLeg = n[0]; out.nearShin = n[1];
    out.farLeg = f[0]; out.farShin = f[1];
    return out;
  }
  poseSit.stride = 25 / 3;   // = SWEEP / DUTY = 8.333 rig units per hitch: planted heels do not slide
  poseSit.neutral = 0;       // legs out, torso upright, arms at rest: every angle 0
  function poseCrawl(t) {
    // t in [0,1) = one stride. Diagonal gait: near-arm + far-leg together,
    // far-arm + near-leg half a stride later. Angles in degrees (SVG rotate,
    // positive = clockwise); a negative angle swings the hand/knee forward (+x).
    var DUTY = 0.6;                        // share of the stride a limb is planted
    function reach(p) {                    // +1 = reached forward, -1 = pushed back
      p = p - Math.floor(p);
      if (p < DUTY) return 1 - 2 * p / DUTY;          // stance: slides back at a steady rate (planted)
      return -Math.cos(Math.PI * (p - DUTY) / (1 - DUTY)); // swing: eased reach forward
    }
    var ARM = 22, LEG = 18;
    var a = reach(t), b = reach(t + 0.5);
    return {
      nearArm: -ARM * a,
      farLeg:  -LEG * a,
      farArm:  -ARM * b,
      nearLeg: -LEG * b,
      bodyY:   -0.6 * Math.cos(4 * Math.PI * (t - DUTY / 2)) // up at mid-stance, twice a stride
    };
  }
  poseCrawl.stride = 10.8;  // rig units of line per stride (no-slip = hand sweep / DUTY). Per frame:
                       // t += sign(ds) * min(|ds| / pose.stride, 2.5 * dt), ds = head travel in rig units.
  poseCrawl.rest = 0.3;     // t ≡ 0.3 (mod 0.5): all limb angles 0, body at the top of its bob; ease here when idle
  poseCrawl.trailGap = 16;  // stroke ends at the origin; the dotted trail starts 16 rig units ahead
  poseCrawl.neutral = poseCrawl.rest;
  function poseWalk(t, time, idle) {
    // WALK: a 12-15 month toddler's first steps. t in [0,1) = one gait cycle (two steps):
    // the near foot plants at t=0, the far foot at t=.5. Toddler tells: short steps, long double
    // support (DUTY .65), flat-footed plonk landing (foot drops straight down, no heel roll),
    // high-stepping swing, bent knees, arms held up in high guard (no reciprocal arm swing yet),
    // slight forward pitch into each step, and a vertical bob twice a cycle (tall in double support,
    // sinking onto the bent stance knee at passing; hips are fixed pivots, so this keeps legs and body agreeing).
    // Expects the whole figure rotated by rotate(lean 0 0) in rig space (before any mirror).
    // Legs are solved by IK in the line's frame, so planted feet do not slide, even under lean.
    // Angles in degrees, SVG sense (positive = clockwise); shins/head are nested, so relative.
    var PI = Math.PI, cos = Math.cos, sin = Math.sin;
    t = t - Math.floor(t); time = time || 0;
    idle = Math.max(0, Math.min(1, idle || 0));
    var k = idle * idle * (3 - 2 * idle);
    function mix(a, b) { return a + (b - a) * k; }

    var DUTY = 0.65, STRIDE = 13, SWEEP = STRIDE * DUTY, SOLE = -1.1, LIFT = 4.4, LOW = 0.075;
    // rig geometry (generated with rig.svg)
    var LT = 10.3, LS = 8.7;
    var HIP_N = [-0.3,-19.4], HIP_F = [-1.7,-19.4], C_N = 0.9, C_F = -0.9;
    var REST_N = [69.355, 84.601], REST_F = [85.101, 112.502]; // rest thigh / shin directions

    var w = 4 * PI * (t - LOW);                       // 0 in the middle of each double support
    // ---- walking ----
    var wBob  = -1.1 * cos(w);                        // bob twice a cycle: up while both legs are long (double
                                                      // support), sinks onto the bent stance knee at passing
    var wLean = 3 + 1.2 * cos(w + 0.6);               // tips forward into each landing, recovers at passing
    var lag   = -cos(w - 0.9);                        // a beat after the sink
    var wHead = 2 * lag;                              // head nods with the sink
    var see   = sin(2 * PI * (t - LOW));              // slow balance see-saw of the guard arms
    var wNA = -2 + 3 * see + 2.5 * lag;               // near hand (forward): + = down
    var wFA =  2 + 3 * see - 2.5 * lag;               // far hand (back):    + = up
    // ---- idle: standing on a wide base, balancing ----
    var s1 = sin(2 * PI * time / 2900), s2 = sin(2 * PI * time / 2300 + 1.3), s3 = sin(2 * PI * time / 4100 + 0.4);
    var iLean = 1 + 1.5 * s1;                         // slow fore-aft sway over planted feet
    var iBob  = 0.25 * s2;
    var iHead = 3 * s3;
    var iNA = 4 - 4 * s1 + 1.5 * s2;                  // arms answer the sway (lean forward -> guard rises)
    var iFA = -2 + 4 * s1 - 1.5 * s2;

    var lean = mix(wLean, iLean), bodyY = mix(wBob, iBob);

    function foot(p, c) {                             // ankle in the line frame (origin advances STRIDE per cycle)
      p = p - Math.floor(p);
      var x = c + SWEEP / 2 - STRIDE * p, y = SOLE;
      if (p >= DUTY) {
        var q = (p - DUTY) / (1 - DUTY), u = Math.min(1, q / 0.8);
        x += STRIDE * u * u * (3 - 2 * u);            // reach done at q=.8 ...
        var e = Math.min(1, q / 0.3), b = sin(PI * Math.pow(q, 0.8)) * e * e * (3 - 2 * e);
        y -= LIFT * b;                                // lift eased in (zero vertical speed at toe-off), then the foot drops flat
      }
      return [x, y];
    }
    var L = lean * PI / 180, cl = cos(L), sl = sin(L);
    function leg(H, A, rest) {                        // two-bone IK, knee forward
      var ax = A[0] * cl + A[1] * sl, ay = -A[0] * sl + A[1] * cl;   // undo whole-figure lean
      var dx = ax - H[0], dy = ay - H[1];
      var d = Math.min(Math.sqrt(dx * dx + dy * dy), LT + LS - 1e-4);
      var ft = Math.atan2(dy, dx) - Math.acos((LT * LT + d * d - LS * LS) / (2 * LT * d));
      var kx = H[0] + LT * cos(ft), ky = H[1] + LT * sin(ft);
      var fs = Math.atan2(ay - ky, ax - kx);
      var th = ft * 180 / PI - rest[0];
      return [th, fs * 180 / PI - rest[1] - th];
    }
    var n = leg(HIP_N, foot(t, C_N), REST_N), f = leg(HIP_F, foot(t + 0.5, C_F), REST_F);
    return {
      nearLeg: n[0], nearShin: n[1], farLeg: f[0], farShin: f[1],
      nearArm: mix(wNA, iNA), farArm: mix(wFA, iFA), head: mix(wHead, iHead),
      bodyY: bodyY, lean: lean
    };
  }
  poseWalk.stride = 13;    // rig units per cycle = foot sweep 8.45 / DUTY 0.65; planted feet are IK-pinned, slip ~0
  poseWalk.neutral = 0.075;   // mid double-support, feet at +-4.15 (t+.5 is the mirror-equivalent neutral)
  function poseRun(t, time, idle) {
    // RUN (3-4 years). t in [0,1) = one stride (two steps): near foot lands at t=0, far foot at t=.5.
    // Degrees, SVG sense (positive = clockwise): a negative thigh / upper-arm angle swings it forward,
    // a positive shin angle folds the knee, a negative forearm angle folds the elbow up in front.
    // Legs are solved by IK in the ground frame (the rig turned by `lean` about the origin), so a
    // planted foot slides back exactly pose.stride per stride (no slip) and stays on the line.
    var D = Math.PI / 180, DUTY = 0.34, LEAN = 14;
    var THIGH = 12.8, SHIN = 12.6;                             // = rig.svg
    var HIPN = [0.9, -26.3], HIPF = [-0.9, -25.85];            // far hip sits level with the near one at LEAN
    var XTD = 5.5, SWEEP = 14.3;                               // lands XTD ahead of its hip, pushes SWEEP back
    t = t - Math.floor(t);
    time = time || 0;
    idle = Math.max(0, Math.min(1, idle || 0));
    var k = idle * idle * (3 - 2 * idle);
    var lean = LEAN * (1 - k), lc = Math.cos(lean * D), ls = Math.sin(lean * D);
    var Lc = Math.cos(LEAN * D), Ls = Math.sin(LEAN * D);
    function ss(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    function mix(a, b) { return a + (b - a) * k; }

    // running foot path (ankle) in the ground frame, origin-relative; p = 0 at touchdown
    function runFoot(hip, p) {
      var hx = hip[0] * Lc - hip[1] * Ls, hy = hip[0] * Ls + hip[1] * Lc;
      var vx = -SWEEP / DUTY;
      p = p - Math.floor(p);
      if (p < DUTY) {                                          // stance: planted, heel peels up before toe-off
        var q = Math.max(0, p / DUTY - 0.55) / 0.45;
        return [hx + XTD - SWEEP * p / DUTY, -1.1 - 0.9 * q * q];
      }
      var s = (p - DUTY) / (1 - DUTY), sw = 1 - DUTY;          // swing: heel kick, knee drive, reach, land
      var K = [[0, hx + XTD - SWEEP, -2.0, vx * sw, -34],      // peels off the line fast: a clear flight
               [0.30, hx - 9.3, hy + 14.9],
               [0.58, hx + 1.5, hy + 13.2],
               [0.74, hx + 9.4, hy + 16.8],
               [1, hx + XTD, -1.1, vx * sw * 0.45, 20]];
      var i = 0; while (i < K.length - 2 && s > K[i + 1][0]) i++;
      function tan(j, c) { return K[j].length > 3 ? K[j][c + 2] : (K[j + 1][c] - K[j - 1][c]) / (K[j + 1][0] - K[j - 1][0]); }
      var a = K[i], b = K[i + 1], h = b[0] - a[0], u = (s - a[0]) / h, u2 = u * u, u3 = u2 * u;
      var h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = 3 * u2 - 2 * u3, h11 = u3 - u2;
      return [h00 * a[1] + h10 * h * tan(i, 1) + h01 * b[1] + h11 * h * tan(i + 1, 1),
              h00 * a[2] + h10 * h * tan(i, 2) + h01 * b[2] + h11 * h * tan(i + 1, 2)];
    }
    // two-bone IK at the current lean, knee forward -> [thigh, shin] rig angles
    function ik(hip, f) {
      var Hx = hip[0] * lc - hip[1] * ls, Hy = hip[0] * ls + hip[1] * lc;
      var vx = f[0] - Hx, vy = f[1] - Hy, r = Math.sqrt(vx * vx + vy * vy);
      var d = Math.min(r, THIGH + SHIN - 0.01), av = Math.atan2(-vx, vy);
      var b = Math.acos(Math.max(-1, Math.min(1, (THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d))));
      var at = av - b, kx = Hx - THIGH * Math.sin(at), ky = Hy + THIGH * Math.cos(at);
      var as = d < r ? av : Math.atan2(-(f[0] - kx), f[1] - ky);
      return [at / D - lean, (as - at) / D];
    }
    function leg(hip, p, stand) {                              // blend the foot, not the angles: feet stay on the line
      var f = runFoot(hip, p);
      return ik(hip, [mix(f[0], stand[0]), mix(f[1], stand[1])]);
    }
    var ln = leg(HIPN, t, [2.6, -1.1]), lf = leg(HIPF, t + 0.5, [-2.2, -1.1]);

    // arms pump against the legs, elbows bent: forward swing folds the hand up toward the chin
    function arm(p) {
      var c = Math.cos(2 * Math.PI * (p - 0.47));      // near arm fully back as the near foot lands
      return [-6 - 56 * c, -(62 + 38 * c)];
    }
    var an = arm(t), af = arm(t + 0.5);
    var u = (2 * t) % 1;                                       // step phase, 0 = a foot lands
    var bob = 0.9 * Math.cos(2 * Math.PI * (u - DUTY));        // + = down: sinks at mid-stance, rises in flight
    var nod = -6 + 1.6 * Math.cos(2 * Math.PI * (u - DUTY - 0.12)); // head lags the bob, so the curl bounces

    // idle (stopped at the button): stand, and every ~4s lift the near hand and wave three times
    var w = (time % 4200) / 4200;
    var up = ss(0, 0.08, w) * (1 - ss(0.44, 0.56, w));
    var wave = Math.sin(2 * Math.PI * time / 470);
    var breath = 0.25 * Math.sin(2 * Math.PI * time / 2600);

    return {
      nearLeg: ln[0], nearShin: ln[1], farLeg: lf[0], farShin: lf[1],
      nearArm: mix(an[0], -12 - 76 * up),                     // wave: elbow out level in front
      nearForearm: mix(an[1], -24 - 28 * up + 17 * wave * up), // hand flaps 23..57 deg ahead of upright, clear of the face
      farArm: mix(af[0], 5), farForearm: mix(af[1], -12),
      head: mix(nod, -2 - 5 * up + 0.6 * breath),
      bodyY: mix(bob, breath),
      lean: lean
    };
  }
  poseRun.stride = 42.06;  // rig units per stride = SWEEP / DUTY = 14.3 / .34 (planted feet do not slide)
  poseRun.neutral = 0.17;  // near foot at mid-stance, far knee driven up: the engine eases t here, then idle stands

  // Steep stretches (upright stages): an upright child at the tip of a near-vertical line would walk on air with the
  // line running through its body. Past POLE_IN degrees (out again below POLE_OUT) the line becomes a playground
  // pole instead: going down, the child hugs it and slides (line above, feet at the tip); going up, it climbs
  // (line below, hands at the tip); the sitting baby leans its back on it. desc/asc = rig-unit offset of the figure
  // from the origin (x forward), pose(time) = the hold, with a little life; the engine blends in and out over 250ms
  // and turns the child's long axis to the line. Angles from scratchpad/intv/poleik.cjs (2-bone IK on the rigs).
  var POLE_IN = 52, POLE_OUT = 42;
  // grab the pole only where the line stays steep ahead: >= POLE_OUT over the next POLE_AHEAD px at least, and for as
  // long as the child would hold it POLE_HOLD seconds at its current pace (a short steep kink is run over upright),
  // never in the last POLE_END px of the route (the runner arrives on its feet, no grab-and-let-go at the button)
  var POLE_AHEAD = 54, POLE_HOLD = 0.45, POLE_END = 60;
  // w = how far the hold reaches out from the line (rig units), for the room check in a side lane
  var POLE = {
    sit: { desc: [11.5, 0], asc: [11.5, 0], pose: null },
    walk: { desc: [-14.6, 11.5], asc: [-14.6, 33], w: 35, pose: function (time) {
      var a = Math.sin(2 * Math.PI * time / 2600), b = Math.sin(2 * Math.PI * time / 1900 + 1);
      return { nearArm: 1.3, farArm: 105.9, nearLeg: -87 + 2 * a, nearShin: 59.9 - 3 * a, farLeg: -90.1 + 3 * b, farShin: 40 - 4 * b,
        head: -9 + 1.5 * a, lean: 0, bodyY: 0 };
    } },
    run: { desc: [-13.6, 8.5], asc: [-13.6, 44.5], w: 33, pose: function (time) {
      var a = Math.sin(2 * Math.PI * time / 2600), b = Math.sin(2 * Math.PI * time / 1900 + 1);
      return { nearArm: -78.6, nearForearm: -72.7, farArm: -49.1, farForearm: -65.1, nearLeg: -66.3 + 2 * a, nearShin: 89.8 - 3 * a,
        farLeg: -84 + 3 * b, farShin: 96.1 - 4 * b, head: -8 + 1.5 * a, lean: 0, bodyY: 0 };
    } }
  };

  // ---- the engine ----
  // One px-per-unit for every stage, so the head is the same size on screen and the body visibly grows around it.
  function pxu() { return mqMobile.matches ? 0.53125 : 0.625; }
  // per stage: cadence cap (strides/s: fast scrolling slides the child instead of strobing its limbs),
  // neutral period (the idle settle eases t forward to the next neutral), dotted-trail gap (rig units ahead
  // of the origin), slope dead band (upright stages turn only by the slope beyond what their feet absorb inside
  // the 3px line; the crawl follows the tangent), hold (rig units into a new section during which the child is
  // still drawn by the previous one, so its colours match the ground it stands over), tall / wide (rig units: feet
  // to the top of the head, its reach to either side; they keep a leaning child inside the page)
  var STAGE = {
    sit:   { pose: poseSit,   cap: 1.0, period: 1,   gap: 24, band: 6,  hold: 40, tall: 40, wide: 18 },
    crawl: { pose: poseCrawl, cap: 2.5, period: 0.5, gap: 16, band: -1, hold: 24 },
    walk:  { pose: poseWalk,  cap: 1.5, period: 0.5, gap: 12, band: 20, hold: 52, tall: 52, wide: 22 },
    run:   { pose: poseRun,   cap: 2.2, period: 0.5, gap: 16, band: 8,  hold: 60, tall: 60, wide: 30 }
  };
  var crawler = null;
  (function () {
    if (reduce) return;
    var stages = {};
    Object.keys(STAGE).forEach(function (name) {
      var tpl = document.getElementById('crawler-' + name);
      var src = tpl && tpl.content && tpl.content.querySelector('svg');
      if (!src) return;
      var g = mk('g', { 'class': 'baby-stage', 'data-stage': name }), inner = mk('g', {}, g);
      g.style.opacity = 0;
      Array.prototype.forEach.call(src.childNodes, function (n) { inner.appendChild(document.importNode(n, true)); });
      // strokes keep their px width through the turn-around fold (the width is set in px on .baby)
      Array.prototype.forEach.call(inner.querySelectorAll('path,circle'), function (n) { n.setAttribute('vector-effect', 'non-scaling-stroke'); });
      var parts = Array.prototype.map.call(inner.querySelectorAll('[data-part]'), function (p) {
        var id = p.getAttribute('data-part'), pv = (p.getAttribute('data-pivot') || '0 0').trim().split(/\s+/);
        return { el: p, body: id === 'body', pv: ' ' + pv[0] + ' ' + pv[1],
          key: id.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }) };
      });
      stages[name] = { name: name, g: g, inner: inner, parts: parts, cfg: STAGE[name], pole: POLE[name], op: 0 };
    });
    if (!stages.crawl) return;
    var g = mk('g', { 'class': 'baby' });
    Object.keys(stages).forEach(function (k) { g.appendChild(stages[k].g); });
    crawler = { g: g, stages: stages, stage: null, on: null, host: null, trail: null, k: 0, D: -1,
      t: 0, dir: 1, v: 0, poleT: -1e9, still: 0, idle: 0, settle: null, face: 0, fold: 1, R: 0, pole: 0, poleOn: false, poleDir: 1 };
    root.classList.add('has-crawler');
    document.addEventListener('visibilitychange', function () { if (!document.hidden) schedule(); });
  })();

  function locate(D) {
    var rem = D, prev = null;
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      if (!s || !s.len) continue;
      if (rem <= s.len) return { s: s, dr: Math.max(0, rem), prev: prev };
      rem -= s.len; prev = s;
    }
    return prev ? { s: prev, dr: prev.len, prev: null } : null;
  }
  function stageOf(s) { var n = s.sec.dataset.crawler; return crawler.stages[n] ? n : 'crawl'; }
  // a point `d` px along a segment, interpolated between the cached samples (no layout reads)
  function along(s, d) {
    d = Math.max(0, Math.min(s.len, d));
    var i = Math.min(s.n - 2, Math.floor(d / STEP)), a = i * STEP, b = Math.min(s.len, a + STEP);
    var u = b > a ? (d - a) / (b - a) : 0;
    return [s.xs[i] + (s.xs[i + 1] - s.xs[i]) * u, s.ys[i] + (s.ys[i + 1] - s.ys[i]) * u];
  }
  // +1/-1: which way the line last ran sideways before d (looking back up to 600px), for a vertical arrival
  function sideways(s, d, tx) {
    for (var back = 0; back < 600; back += 12) {
      var a = along(s, d - back - 12), b = along(s, d - back), dx = b[0] - a[0], dy = b[1] - a[1];
      if (Math.abs(dx) > 0.5 * Math.abs(dy) && Math.abs(dx) > 0.5) return dx > 0 ? 1 : -1;
      if (d - back <= 0) break;
    }
    return tx < 0 ? -1 : 1;
  }
  // a point D along the whole route, in page coordinates (x as in every section, y from the top of the page)
  function pageAt(D) {
    var l = locate(Math.max(0, Math.min(total, D))), q = along(l.s, l.dr);
    return [q[0], q[1] + l.s.top];
  }
  // the line's angle from horizontal (0..90°) at D, across section seams (flat past either end of the route)
  function steepAt(D) {
    var a = pageAt(D - 12), b = pageAt(D + 12);
    return Math.atan2(Math.abs(b[1] - a[1]), Math.abs(b[0] - a[0]) + 1e-9) * 180 / Math.PI;
  }
  function wrap180(a) { return a - 360 * Math.floor((a + 180) / 360); }
  function smooth01(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  // the dotted trail starts a little ahead of the child: a hole in the trail's clip around the head
  function trailGap(s, x, y, r) {
    if (!s.gap) {
      var cp = mk('clipPath', { id: s.path.id + '-gap', clipPathUnits: 'userSpaceOnUse' }, mk('defs', {}, s.svg));
      s.gap = mk('path', { 'clip-rule': 'evenodd' }, cp);
    }
    var R = r.toFixed(1), D2 = (2 * r).toFixed(1);
    s.gap.setAttribute('d', 'M-99 -99H' + (s.w + 99) + 'V' + (s.h + 99) + 'H-99Z' +
      'M' + (x - r).toFixed(1) + ' ' + y.toFixed(1) + 'a' + R + ' ' + R + ' 0 1 0 ' + D2 + ' 0a' + R + ' ' + R + ' 0 1 0 -' + D2 + ' 0Z');
  }
  // crossfade between stages in JS (a CSS transition would restart whenever the child changes sections)
  function fade(dt) {
    var busy = false;
    for (var k in crawler.stages) {
      var st = crawler.stages[k], to = k === crawler.on ? 1 : 0;
      if (st.op === to) continue;
      st.op = to ? Math.min(1, st.op + dt / 0.35) : Math.max(0, st.op - dt / 0.35);
      st.g.style.opacity = st.op.toFixed(3);
      st.g.classList.toggle('on', to === 1);
      busy = true;
    }
    return busy;
  }

  // returns true while the child needs more frames (moving, easing, or alive on screen)
  function crawl(D, now, dt, sy) {
    var C = crawler;
    if (!C) return false;
    var loc = locate(D);
    // the child appears once the opening has finished drawing: no sliding along the hero while it draws
    if (!loc || D < 2 || (introStart && now - introStart < introDur)) { C.on = null; C.D = -1; return fade(dt); }
    var s = loc.s, dr = loc.dr, done = D >= total - 1, k = pxu();
    // the stage follows the section under the head; within 16px of a seam the current child holds,
    // so scrolling to and fro over a section boundary never flickers between two children
    var own = stageOf(s), name = own;
    // (at rest the section's own child always returns, and the head parked at the end of the hero's segment, where it
    // stops once the page is back at the top, is the sitting baby's straight away: no crawl lingering at the hero)
    var park = s.intro ? dr >= s.len - 1 : loc.prev && loc.prev.intro && dr <= 1;
    if (park) own = name = stageOf(s.intro ? s : loc.prev);
    else if (C.stage && name !== C.stage && C.still < 0.6) {
      var a = locate(Math.max(0, D - 16)), b = locate(D + 16);
      if ((a && stageOf(a.s) === C.stage) || (b && stageOf(b.s) === C.stage)) name = C.stage;
    }
    var st = C.stages[name], cfg = st.cfg, fresh = !C.on, switched = C.stage !== name;
    if (switched) { C.stage = name; C.t = cfg.pose.neutral || 0; C.settle = null; C.fold = 1; }
    if (C.k !== k) { C.k = k; C.g.style.strokeWidth = (2.2 * k).toFixed(3) + 'px'; }

    // ---- travel -> gait phase: no-slip (one cycle per pose.stride of line), capped cadence, backward on the way up ----
    var dD = C.D < 0 ? 0 : D - C.D;
    C.D = D;
    C.v += (Math.abs(dD) / Math.max(dt, 0.004) - C.v) * Math.min(1, dt * 6);
    if (Math.abs(dD) > 0.05) {
      var dp = Math.min(Math.abs(dD) / k / cfg.pose.stride, cfg.cap * dt);
      C.t += dD > 0 ? dp : -dp; C.t -= Math.floor(C.t);
      C.dir = dD > 0 ? 1 : -1; C.still = 0; C.settle = null;
      C.idle = Math.max(0, C.idle - dt / 0.2);
    } else if ((C.still += dt) > 0.15) {
      // idle: ramp idle 0 -> 1 (the stage's idle life) and ease t forward to the next neutral, never faster than the cap
      C.idle = Math.min(1, C.idle + dt / 0.4);
      if (!C.settle) {
        var n0 = cfg.pose.neutral || 0, q = (C.t - n0) / cfg.period;
        var to = n0 + cfg.period * (C.dir > 0 ? Math.ceil(q - 1e-6) : Math.floor(q + 1e-6));
        C.settle = { from: C.t, to: to, k: 0, dur: Math.max(0.3, 1.5 * Math.abs(to - C.t) / cfg.cap) };
      }
      C.settle.k = Math.min(1, C.settle.k + dt / C.settle.dur);
      C.t = C.settle.from + (C.settle.to - C.settle.from) * smooth01(C.settle.k);
    } else C.idle = Math.max(0, C.idle - dt / 0.2);

    // ---- where, and which way ----
    var p = along(s, dr), p0 = along(s, dr - 12), p1 = along(s, dr + 12);
    var tx = p1[0] - p0[0], ty = p1[1] - p0[1];
    var th = tx || ty ? Math.atan2(ty, tx) * 180 / Math.PI : (C.face < 0 ? 180 : 0);
    var upright = cfg.band >= 0;
    // steep stretches (upright stages): the line becomes a pole (see POLE). Steepness is the line's angle from
    // horizontal whichever way the child faces, so the pole always lets go once the line flattens out
    var steep = Math.atan2(Math.abs(ty), Math.abs(tx) + 1e-9) * 180 / Math.PI;
    var pole = false;
    if (st.pole && !done) {
      if (C.poleOn) pole = steep > POLE_OUT || steepAt(D + C.dir * 24) >= POLE_IN;   // a brief dip does not let go
      else if (steep >= POLE_IN && D < total - POLE_END && now - C.poleT >= POLE_HOLD * 1000) {
        var reach = Math.min(1200, Math.max(POLE_AHEAD, C.v * POLE_HOLD));
        pole = true;
        for (var ah = 30; pole && ah <= reach + 11; ah += 12) if (steepAt(D + C.dir * Math.min(ah, reach)) < POLE_OUT) pole = false;
      }
    }
    var lane = p[0] < 0.22 * s.w ? 1 : p[0] > 0.78 * s.w ? -1 : 0, inLoop = s.loop[Math.min(s.n - 1, Math.round(dr / STEP))];
    // the crawl down (or up) a side lane keeps its back to the page: on a near-vertical line its body stands out
    // sideways, so as it goes round into the lane it turns over (quickly, see fold) to stand out over the page instead
    // of past the screen edge. laneFace = the face that does that
    var laneFace = !upright && !inLoop && lane && steep >= POLE_OUT ? (ty < 0 ? -lane : lane) : 0;
    if (fresh || switched || !C.face) {
      // first appearance: face the way the line last ran sideways (it often arrives on a vertical lead)
      if (!C.face) C.face = sideways(s, dr, tx);
    } else if (laneFace) {
      if (C.face !== laneFace && C.fold >= 1) { C.face = -C.face; C.fold = -1; C.R += 180; }
    } else if (!pole && !(!upright && inLoop) &&
        (C.face > 0 ? Math.abs(th) > 110 : Math.abs(th) < 70)) {
      // turn around once the line runs more than 110° from the way the child faces (no flicker on near-vertical
      // stretches; never while holding the pole; the crawl rides tight loops round instead): a 220ms fold, across
      // the line for the crawl (turning over like a card), about the vertical for the upright stages (on the spot)
      C.face = -C.face; C.fold = -1;
      if (!upright) C.R += 180;
    }
    if (pole && (C.pole < 0.05 || switched || fresh)) {
      C.poleDir = ty >= 0 ? 1 : -1;
      // in a side lane the child faces the page: walk/run take the pole from the outside (body toward the page
      // edge, away from the text; on the mobile snakes that is also the way the next sweep runs, so it rarely turns
      // twice), and the sitting baby leans on it with room in front of it instead of past the screen edge.
      // Where the lane is narrower than the hold (phones), walk/run hug the pole tighter (it runs through their arms)
      // rather than poke out past the screen edge; the room is measured where the lane settles, over the stretch
      // ahead, and only a lane too narrow even for that, with more room on the text side, makes them take the inside
      C.squeeze = 0;
      if (lane && st.pole.w) {
        var lx = p[0];
        for (var la = 24; la <= 144; la += 24) {
          var lq = locate(Math.max(0, Math.min(total, D + C.dir * la)));
          lx = lane > 0 ? Math.min(lx, along(lq.s, lq.dr)[0]) : Math.max(lx, along(lq.s, lq.dr)[0]);
        }
        var out = lane > 0 ? lx : s.w - lx, inn = lane > 0 ? s.cl - lx : lx - s.cr, need = st.pole.w * k + 2;
        var side = need - out > 0.6 * -st.pole.desc[0] * k && inn > out ? -1 : 1;
        C.squeeze = Math.max(0, need - (side > 0 ? out : inn)) / k;
        lane *= side;
      }
      if (lane && lane !== C.face) { C.face = lane; if (!(switched || fresh)) C.fold = -1; }
    }
    if (done && upright && s.goal !== undefined && s.goal !== null) {
      // arrived: turn to face the goal (the final WhatsApp button) instead of the way the line's tail runs
      var gf = s.goal > p[0] ? 1 : -1;
      if (gf !== C.face) { C.face = gf; C.fold = -1; }
    }
    C.fold = Math.min(1, C.fold + dt / 0.11 + Math.abs(dD) / 12);   // (within ~24px of line when the head moves fast)
    var want = wrap180(C.face > 0 ? th : th - 180);   // the line's angle in the facing frame
    if (pole !== C.poleOn) C.poleT = now;
    C.poleOn = pole;
    // the hold blends in or out over 250ms, or over 80px of line where the head moves faster (it never lies along a flat)
    var pr = dt / 0.25 + Math.abs(dD) / 80;
    if (switched || fresh) C.pole = pole ? 1 : 0;
    else C.pole = pole ? Math.min(1, C.pole + pr) : Math.max(0, C.pole - pr);
    var ep = smooth01(C.pole);

    // rotation: crawl = the tangent; upright = rot = sign(s)·max(0, |s| − band) (upright at the very end);
    // on the pole the child's long axis lies along the line
    var T = want;
    if (upright) {
      T = done ? 0 : (want < 0 ? -1 : 1) * Math.max(0, Math.abs(want) - cfg.band);
      if (ep > 0) T += wrap180(wrap180(th + (C.poleDir > 0 ? -90 : 90)) - T) * ep;
    }
    if (switched || fresh) C.R = T;
    else C.R = wrap180(C.R + wrap180(T - C.R) * (1 - Math.pow(0.65, dt * 60)));
    if (upright && ep < 0.5) {
      // inside the page: where the line bends steeply along the screen edge (a phone's side lane, passed too fast for
      // the pole) the upright child leans out over the edge only as far as the room allows
      var sr = Math.sin(C.R * Math.PI / 180), hk = cfg.tall * k, lo = (cfg.wide * k + 1 - p[0]) / hk, hi = (s.w - 1 - cfg.wide * k - p[0]) / hk;
      if (sr < lo || sr > hi) {
        var R2 = Math.asin(Math.max(-1, Math.min(1, sr < lo ? lo : hi))) * 180 / Math.PI;
        C.R = Math.cos(C.R * Math.PI / 180) < 0 ? (R2 >= 0 ? 180 : -180) - R2 : R2;
      }
    }
    var fv = Math.sin(C.fold * Math.PI / 2);
    if (Math.abs(fv) < 0.02) fv = fv < 0 ? -0.02 : 0.02;
    var sx = (upright ? C.face * fv : C.face) * k, sy2 = (upright ? 1 : fv) * k;

    // ---- pose ----
    var P = cfg.pose(C.t, now, C.idle), ox = 0, oy = 0;
    if (ep > 0) {
      var off = C.poleDir > 0 ? st.pole.desc : st.pole.asc;
      ox = Math.min(0, off[0] + (C.squeeze || 0)) * ep; oy = off[1] * ep;
      if (st.pole.pose) {
        var Q = st.pole.pose(now, C.poleDir);
        for (var key in Q) P[key] = (P[key] || 0) + (Q[key] - (P[key] || 0)) * ep;
      }
    }

    // ---- write ----
    // drawn by the previous section for the first `hold` units of a new one (unless that section clips)
    var host = s, hx = p[0], hy = p[1];
    if (loc.prev && dr < cfg.hold * k) {
      if (loc.prev.clipY === undefined) loc.prev.clipY = getComputedStyle(loc.prev.sec).overflowY !== 'visible';
      if (!loc.prev.clipY) { host = loc.prev; hy += s.top - loc.prev.top; }
    }
    if (C.host !== host) { host.svg.appendChild(C.g); C.host = host; }
    C.g.setAttribute('transform', 'translate(' + hx.toFixed(2) + ' ' + hy.toFixed(2) + ')');
    st.g.setAttribute('transform', 'rotate(' + C.R.toFixed(2) + ') scale(' + sx.toFixed(4) + ' ' + sy2.toFixed(4) + ')');
    st.inner.setAttribute('transform', 'translate(' + ox.toFixed(2) + ' ' + oy.toFixed(2) + ') rotate(' + (P.lean || 0).toFixed(2) + ')');
    for (var i = 0; i < st.parts.length; i++) {
      var q2 = st.parts[i];
      if (q2.body) q2.el.setAttribute('transform', 'translate(0 ' + (P.bodyY || 0).toFixed(2) + ')');
      else if (P[q2.key] !== undefined) q2.el.setAttribute('transform', 'rotate(' + P[q2.key].toFixed(2) + q2.pv + ')');
    }
    trailGap(s, p[0], p[1], (ep > 0.5 && C.poleDir < 0 ? Math.max(cfg.gap, 26) : cfg.gap) * k);
    if (C.trail !== s) {
      if (C.trail) C.trail.trail.removeAttribute('clip-path');
      s.trail.setAttribute('clip-path', 'url(#' + s.path.id + '-gap)');
      C.trail = s;
    }
    C.on = name; C.sec = s.sec.id;
    var fading = fade(dt);

    // frames: while easing anything, and while an upright child is on screen (its idle life plays in time);
    // never for a child off screen (and the browser pauses frames in a hidden tab)
    var y = host.top + hy - sy, onScreen = y > -150 && y < vh + 150;
    var easing = fading || C.fold < 1 || (C.pole > 0 && C.pole < 1) || (C.idle > 0 && C.idle < 1) ||
      (C.settle && C.settle.k < 1) || Math.abs(wrap180(T - C.R)) > 0.05 || C.still <= 0.15 || own !== name;
    return onScreen && (easing || name !== 'crawl');
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
    var kid = crawl(curD, now, dt / 1000, sy);
    filmWrite();
    // the child keeps frames coming while it eases, and while it is on screen with idle life to play
    if (busy || kid) schedule(); else last = 0;
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
