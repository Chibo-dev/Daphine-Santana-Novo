---
name: Espaço Daphine Santana
description: O Traço do Movimento. One continuous line of movement, drawn by scroll, carries a worried parent from the first viewport to a WhatsApp conversation.
colors:
  pinho: "#123F2E"
  pinho-deep: "#0C2F22"
  pinho-soft: "#1C4D39"
  folha: "#286F47"
  lima: "#C9E46A"
  nevoa: "#F1F5EF"
  branco: "#FBFCFA"
  menta: "#DDEBDD"
  ink: "#10241B"
  body: "#2C3F35"
  muted: "#4A6155"
  on-pinho: "#EEF4EC"
  on-pinho-muted: "#B7CDBE"
  line: "#CFDCCF"
  line-dark: "rgba(201,228,106,.22)"
  lima-h: "#D7EE84"
  pinho-h: "#1C4D39"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.2rem + 5vw, 5.4rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 92"
  headline:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 1.3rem + 3vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.016em"
    fontVariation: "'wdth' 92"
  title:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 1.15rem + 0.9vw, 2.05rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 92"
  statement:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 1.1rem + 1vw, 1.9rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 92"
  lead:
    fontFamily: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.08rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 700
    lineHeight: 1
  path-word:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 80"
rounded:
  focus: "8px"
  nav: "10px"
  note: "14px"
  frame: "16px"
  card: "18px"
  photo: "22px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 5vw, 48px)"
  gutter-mobile: "28px"
  section: "clamp(88px, 11vw, 168px)"
  container: "1240px"
  header: "72px"
components:
  button-action:
    backgroundColor: "{colors.pinho}"
    textColor: "{colors.on-pinho}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
    height: "54px"
  button-action-hover:
    backgroundColor: "{colors.pinho-h}"
    textColor: "{colors.on-pinho}"
  button-action-on-pinho:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.pinho}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "17px 26px"
    height: "54px"
  button-action-on-pinho-hover:
    backgroundColor: "{colors.lima-h}"
    textColor: "{colors.pinho}"
  button-action-lg:
    rounded: "{rounded.pill}"
    padding: "20px 32px"
    height: "62px"
  button-action-sm:
    rounded: "{rounded.pill}"
    padding: "12px 18px"
    height: "44px"
  button-ring:
    textColor: "{colors.on-pinho}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "20px 32px"
    height: "62px"
  button-ring-hover:
    textColor: "{colors.lima}"
  fab:
    backgroundColor: "{colors.pinho}"
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.pill}"
    padding: "16px"
  menu-toggle:
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.pill}"
    size: "46px"
  menu-link:
    textColor: "{colors.on-pinho}"
    height: "56px"
  link-strong:
    textColor: "{colors.folha}"
    padding: "10px 0"
  link-quiet:
    textColor: "{colors.on-pinho}"
    padding: "12px 4px"
  nav-link:
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.nav}"
    padding: "10px 12px"
  nav-link-hover:
    textColor: "{colors.lima}"
  step-node:
    backgroundColor: "{colors.pinho}"
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.pill}"
    size: "64px"
  step-node-reached:
    backgroundColor: "{colors.lima}"
    textColor: "{colors.pinho}"
  specialty-mark:
    textColor: "{colors.folha}"
    rounded: "{rounded.pill}"
    size: "10px"
  line-icon-sinal:
    textColor: "{colors.folha}"
    size: "38px"
  line-icon-specialty:
    textColor: "{colors.folha}"
    size: "40px"
  stop-dot:
    backgroundColor: "{colors.menta}"
    rounded: "{rounded.pill}"
    size: "16px"
  stop-dot-reached:
    backgroundColor: "{colors.folha}"
  photo-frame:
    rounded: "{rounded.frame}"
    width: "clamp(240px, 24vw, 320px)"
  clinic-map:
    backgroundColor: "{colors.menta}"
    rounded: "{rounded.photo}"
  clinic-card:
    backgroundColor: "{colors.pinho}"
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.card}"
    padding: "26px 28px 22px"
    width: "min(380px, calc(100% - 48px))"
  signature-pill:
    textColor: "{colors.on-pinho}"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
---

# Design System: Espaço Daphine Santana

## Overview

**Creative North Star: "O Traço do Movimento"**

Development is movement, so the site is drawn by one continuous line. It starts as a lima dot at the bottom of the hero, loops around a real cutout of Daphine, and then, section by section, the reader's scroll draws it down the page as a single stroke with a single head. It touches every place where something happens: each warning sign gets a tick, each specialty gets a tick, each of the three steps gets a lit node, each city stop gets a dot. It ends in a loop around the final WhatsApp button. At its head rides a small line-drawn child who grows up as the page goes on: sitting in the hero, crawling through the signs, walking from the first steps to Daphine's story, running from the reviews to the final button. The visual vocabulary borrows from chronophotography and movement notation. Fading ghost echoes trail the stroke the way Marey's plates trail a moving body, a dotted trail marks the route still ahead, milestone words (sentar, engatinhar, ficar em pé, andar, pular, equilibrar) sit on the path itself, and real photographs of the practitioner are cut out and locked onto the line as photomontage.

The world is green by brand commitment. The portrait sections (the hero, the close and /links) are a painted studio: a mottled pinho canvas with a soft light behind the sitter, a vignette and a floor shadow, so Daphine is photographed into the world rather than pasted onto a flat fill. The same studio carries the share image and the 404 page. A deep pinho field owns the opening, the three-step start, the families' reviews and the close. Light grounds in névoa, branco and menta rotate through the reading in between, and no two neighbouring sections share a ground. Type is a confident, slightly condensed grotesque with tight negative tracking, set against a body face built for legibility, because the reader is a worried parent on a phone. There is no warm accent. The WhatsApp action is marked by inversion instead: it is always the opposite of the ground it sits on, lima on pinho and pinho on light, so the one thing to press is the one thing that does not match its surroundings.

The density is calm: one idea per section, generous vertical rhythm, and long ruled lists instead of card grids. The system rejects the category default of the therapy and clinic website: cream grounds, italic serifs, eyebrow labels above headings, and grids of icon cards.

**Key Characteristics:**
- One scroll-drawn line that runs from the hero to the final button as one stroke with one head, unbroken across section edges, with a dotted trail showing the route ahead.
- A line-drawn child rides the head of the line and grows from sitting to running as the page goes on.
- Pinho at the opening, the start, the reviews and the close, with rotating light grounds between; folha line on light grounds, lima line on pinho.
- The WhatsApp action always inverts its ground (lima on pinho, pinho on light) and is never coral or any warm colour; it is the only filled button.
- Portrait sections, the share image and the 404 sit on a painted, lit studio canvas instead of flat pinho.
- Real alpha cutouts of Daphine set flush on a section edge or bled off the viewport.
- Ruled lists, ticks, nodes, stops and hand-drawn line icons instead of cards and icon tiles.
- The "O espaço" gallery pins under the header and turns vertical scroll into a sideways film.
- Content enters as the line reaches it; reduced motion and no-JS show the finished drawing at once.

## Colors

A forest-green world of one deep field and three pale reading grounds, drawn in two line greens. The action takes no colour of its own; it borrows the opposite of its ground.

### Primary
- **Pinho Field** (pinho): The deep forest ground for the hero, "Como começar", the reviews, the close, the links page and the 404. Headings on it turn on-pinho; highlights and the line turn lima. On light grounds pinho is also the fill of the WhatsApp action, with Pinho Hover (pinho-h, the same step as pinho-soft) on hover, and the fill of the address card that hangs over the map. Pinho Deep (pinho-deep) is reserved for the footer, and Pinho Soft (pinho-soft) is a tonal step that stays available for raised surfaces on the field.
- **Folha Line** (folha): The line colour on light grounds (stroke, dotted trail, path words, ticks, stop dots, FAQ toggle), the child on light grounds, the line icons of the sinais and especialidades, and the colour of highlighted words and strong links on light grounds. Default focus ring colour. On the map it is the colour wash that prints Google's tiles in the site's own ink.

### Secondary
- **Lima Line** (lima): The line colour on pinho (stroke, dotted trail, path words, ghost echoes on every ground), the child on pinho, highlighted words in headings on pinho, reached step nodes, review stars and reviewer names, the hero origin dot, text selection, the skip link, footer column heads, and the focus ring inside pinho areas. It is also the fill of the WhatsApp action on pinho grounds and in the header (hover lima-h, text and icon pinho), the WhatsApp icon on a pinho action, the 2px ring of the floating button, the link on the address card, and the line and ticks of the menu sheet.

### Neutral
- **Névoa** (nevoa): The default page and reading ground (sinais, especialidades, espaço).
- **Branco** (branco): The second light ground (psicomotricidade, dúvidas), one step brighter than névoa.
- **Menta** (menta): A tinted light ground for the person and place sections (sobre, onde); also the unreached stop-dot fill and the multiply wash on the map.
- **Ink** (ink): Headings and strong text on light grounds; also the 2px top rule on long lists.
- **Body** (body) and **Muted** (muted): Running text and secondary text on light grounds.
- **On-Pinho** (on-pinho) and **On-Pinho Muted** (on-pinho-muted): Headings and secondary text on the pinho field.
- **Rule** (line) and **Rule on Dark** (line-dark): 1px dividers between list rows on light and dark grounds; line-dark also rings the menu toggle and the footer signature pills.

### Named Rules
**The Inverted Action Rule.** The WhatsApp action always takes the opposite of its ground. On pinho grounds and in the header it is lima with pinho text and icon (hover lima-h). On light grounds it is pinho with on-pinho text and a lima icon (hover pinho-h). The floating button is pinho with a 2px lima ring and a lima icon, so it reads on both. The switch comes from the ground class, never by hand. A WhatsApp action is never coral, red or any warm colour, and no third action colour exists.

**The Two Greens Rule.** The line, its trail and the child riding it are folha on light grounds and lima on pinho, switched by the field class, never by hand. Ghost echoes are always lima, at low opacity.

**The Field Change Rule.** Adjacent sections never share a ground, so each edge the line crosses is visible. Pinho returns at four beats (the opening, the start, the reviews, the close); the light grounds névoa, branco and menta rotate in between.

**The Guest Colour Rule.** The red of the Chibo Dev stamp and the Instagram magenta live only inside the developer credit in the footer and on the 404. They are the credit's own brand marks, scoped to it, and never enter the site's palette, its actions or its line.

## Typography

**Display Font:** Bricolage Grotesque (variable: opsz 12–96, wdth 75–100, wght 400–800), with ui-sans-serif and system-ui as fallback
**Body Font:** Atkinson Hyperlegible Next (Atkinson Hyperlegible fallback), then ui-sans-serif and system-ui

**Character:** A grotesque that is lively but slightly condensed, set tight and heavy for headlines, against a body face designed for low-vision legibility. The headlines bring the playful, premium side of the brand; the body face keeps the parent reading.

### Hierarchy
- **Display** (700, clamp 2.6–5.4rem, line-height 0.98, wdth 92): Only for the hero h1, the closing h2 and the 404 h1 (.display-xl). The name heading in sobre uses the same scale at 0.95 line-height and -0.022em tracking.
- **Headline** (700, clamp 2.1–3.9rem, wdth 92): Section h2s (.display-lg). Balanced wrap.
- **Title** (700, clamp 1.35–2.05rem, wdth 92): Specialty names, step titles, card-less list heads.
- **Statement** (500–600, clamp 1.35–2.2rem, line-height 1.28–1.3, wdth 90–92): Display face at reading size for the sinais list rows, the pull quote, the review quotes (500, max 34ch) and FAQ questions (600). These lines are set as statements, not as body copy.
- **Lead** (400, clamp 1.08–1.25rem, line-height 1.55, max 56ch): The one-sentence standfirst under a heading, in muted (on-pinho-muted on dark).
- **Body** (400, 1.0625rem, line-height 1.62, max 60ch in measured columns): All running text.
- **Label** (700, 1.02rem, line-height 1): Button text. Small bold sans in folha marks the audience on specialty rows (0.9rem) and the specialty notes beside a stop ring (0.84rem).
- **Path Word** (600, 15px desktop / 13px mobile, wdth 80): Words set on the line in SVG. They fade in once the pen has passed them.

### Named Rules
**The Width Axis Rule.** Headings run the wdth axis below 100: 92 for headings, 88–90 for the brand name and small display text, 80 for words on the path. Never set display text at full width.

**The Heading Starts Cold Rule.** A section opens with its heading. There is no small uppercase label, kicker or eyebrow above an h1 or h2. Uppercase tracked text exists only as footer column heads.

**The One Highlight Rule.** A heading can colour at most one word or phrase (folha on light, lima on pinho), and that word carries the meaning of the sentence ("movimento", "hoje", "curva").

## Layout

Content sits in one centred container (container, 1240px) with a fluid side gutter (gutter; 28px under 760px). Every section uses the same vertical padding (section). The hero is a full-viewport pinho field (100svh with a 72px top offset for the fixed header), and the close drops its bottom padding so the cutout can sit on the edge.

Grids are asymmetric two-column splits, roughly 1.15 / 0.85 or 0.9 / 1.1, with copy on one side and figure or list on the other. They collapse to one column at 760px. Long content is presented as ruled lists: the sinais rows, the specialties table (three columns, then two at 960px, then one), the reviews and the FAQ accordion with a sticky heading column, and the city stops. At desktop the specialty icon hangs outside the row's flow, so the specialty name shares its baseline with the description and audience columns. The three steps are the one three-up row, connected by the line through their nodes. On mobile they become a left-aligned stack with the node in a 64px column.

"Onde" is a route and a place side by side, stacking at 1180px. The city stops snake: on desktop two rows of four and three, the second row running back right to left with every other stop a little lower; on phones a two-column snake read row by row, left to right and then right to left, with round U-turns in the margins. Every name sits under its stop, so the child running along the line never passes under a name.

### The pinned gallery
"O espaço" is a pinned film. Its stage (heading and photo strip) sticks under the header while vertical scroll slides the strip sideways, with a short hold on the first and the last frame before the page releases and scrolls on. The frames are sized so the whole stage fits the screen. On short screens the stage keeps only the strip, and the heading fades out during the opening hold and returns on the way back up. While the gallery is held, the floating WhatsApp button steps aside so it never covers a caption. Under reduced motion or without JS the pin is off and the strip is a plain horizontal scroller aligned to the container edge, bleeding to the viewport, with scroll snap on touch.

Structural breakpoints: 1080px (nav becomes the menu sheet), 960px (specialties reflow), 760px (single column, 28px gutter, the line switches to its `-m` route), 540px (full-width buttons, round icon-only floating button). Onde stacks to one column at 1180px; specialties tighten their third column between 961 and 1180px.

Repair breakpoints are narrow, targeted fixes for real device classes, layered on the structural set rather than shifting it: 374px and 420px (small phones: tighter buttons, a 2.45rem display, and an icon-only round header action), landscape phones (min-width 761px and max-height 500px: a 60px header, a compressed hero and a two-column menu sheet), portrait tablets (761–1080px portrait: the hero figure and sobre stack and bleed right), laptop heights (600–860px tall: the hero h1 scales by viewport height), FAQ (761–900px: one column, the heading unsticks) and wide screens (1700px and up: the sobre figure stops bleeding and dissolves its cut edge with a 72px mask). The principle: a breakpoint exists because a specific device class broke something, it changes only what broke, and it keeps the line's lanes and the Clear Copy Rule intact.

### The Line: authoring rules
The line is a chain of per-section SVG segments, one for each `[data-trace]` section, and they meet at the section edges.
- **One stroke.** The segments are drawn as a single stroke: one travelled distance is poured into them in order, so only one head ever moves. Scroll is measured along the route itself (vertical travel plus a share of sideways runs and loops), so flat stretches do not fire off and climbing loops do not stall. The head follows its target with a glide, longer on large screens so a long sideways run reads as one sweep, and shorter on phones and short screens. At the very bottom of the page the stroke completes.
- **Trail.** Ahead of the head the whole route is shown as a quiet dotted trail (round dots, low opacity, in the line colour of the field). The stroke fills it as the reader scrolls. Reduced motion hides the trail.
- **Lanes.** The line travels in two lanes, `L` and `R`, computed at every width from the real content edges: each lane sits at 0.45 of its side margin (the space between the viewport edge and the container's padded content edge), clamped 6px from the viewport. Lanes replace fixed width fractions; a numeric fraction is still accepted but is reserved for single-column pages (/links enters at 0.22).
- **Edge continuity.** `data-in` and `data-out` name the lane where the line crosses the top and bottom edge. One section's `data-out` must equal the next section's `data-in`, so the stroke reads as one. Phones have their own crossings (`data-in-m`, `data-out-m`), chosen per section; the hero-to-sinais handoff uses `R` at every size because the hero cutout is on the right.
- **Leads.** Each crossing is followed (and each exit preceded) by a straight vertical run in its lane, 70px by default and never more than 10% of the section's height. `data-lead` / `data-lead-m` override it where an anchor sits close to the edge; phones use short leads so a sweep can start soon after the edge.
- **Adding a section.** Give it a ground that differs from both neighbours, `data-trace`, `data-in` matching the previous `data-out`, and a `data-out` that matches whatever follows, at both sizes. Then place anchors. A section with no anchors draws a straight run between its edges in the gutter.
- **Anchors.** Any element with `data-pt="fx fy"` adds a point at that fraction of its own box; `data-pt="L fy"` or `"R fy"` pins the point's x to a lane, so a run can pass a heading in the margin. Invisible `<i class="pt">` markers placed in percent or px around a figure or block shape the route. `-m` variants (`data-pt-m`) override on mobile, `skip` drops a point at that size, and `data-skip-m` on a container drops all of its anchors on mobile. Points are measured at rest, ignoring any entrance offset, and joined by a centripetal Catmull-Rom curve (alpha 0.5, so no cusps or bulges between unevenly spaced anchors) whose control points are clamped inside the viewport, so a curve can never swing off-screen.
- **Phone choreography.** On phones the route does not hug the left edge. Mobile-only anchors (`data-pt="skip" data-pt-m="…"`) make it sweep across the full width in the gaps between blocks (above a heading, under a list, between two reviews, below the map) and change sides from section to section, so the line plays across the screen. Every sweep lives in empty space; the Clear Copy Rule holds at every width.
- **Ticks.** Add `data-tick` to an anchor and it gets `.is-reached` when the pen passes it. That drives the sinais ticks (a 22×3px folha bar that scales in), specialty ticks, step nodes (pinho to lima), stop dots and link-row dots. A reached state must mark a real item of content, never decoration.
- **Loops.** `data-loop="rx ry startDeg turns [stepDeg]"` (and `data-loop-m`) on an anchor wraps the line around that element: radii as fractions of its box, a start angle, a number of turns (negative turns reverse the direction) and an optional sample step (default 40°). The line ends by wrapping the final WhatsApp button, over it, round its far end and back under it, with explicit anchors rather than an ellipse (a pill needs the line further off its rounded ends), and stops just past its near end, where the running child stands beside the button and turns to face it. On phones the route also turns small pirouettes, under one turn, in open space: above the psicomotricidade and especialidades headings and between the two reviews.
- **Words.** `data-words="a|b|c"` with `data-words-range="start end"` (and `-m`) sets words on rightward, gently curving stretches of the path (turn under about 30° per word). Words are the developmental milestones or the four domains, never marketing copy.
- **Ghosts.** `data-ghosts="n"` (up to 3) adds lima echo strokes, offset −13px x / +9px y per step, at opacity 0.34 / 0.2 / 0.1, trailing the head a little further back each. They appear only once the head has a real stroke behind it. Only the hero, the close and /links use them.
- **Front zones.** The line is drawn behind content (z 0) by default. A front zone clips a second copy of the stroke above the content (z 3), so the line wraps in front of a cutout's lap or the armchair. Prefer an element zone (`<i class="zone" data-front-zone>`, with `data-front-zone-m` for mobile) placed in percent inside the figure, so it follows the figure's real box; `data-front` / `data-front-m` fractions of the section remain as the fallback (the close uses them). Use a front zone only over a figure; the hero and the close have one, sobre does not.
- **Pen and intro.** `data-pen` sets the viewport height where the head sits (default 0.62). A `data-intro` section (the hero, /links) draws its whole line on load at a walking pace, easing in and out, with the duration growing with the line's length; nothing draws until the opening is armed, so the line never starts, retracts and restarts.

**The Clear Copy Rule.** The line never crosses a heading, a paragraph, a list row's text or the WhatsApp action. It travels in the margins, through figures and around anchors. The final wrap circles the button without touching it, and the button is lifted above the stroke. The same rule holds for the child: wherever the line runs under copy or past a button it keeps the child's height clear above it (about 44px on desktop, 38px on phones), and the child is never cut off by the screen edge.

## Elevation & Depth

The system is flat. Depth comes from the field alternation and from photomontage: cutouts cast a soft drop shadow that follows the figure (`drop-shadow(0 30px 40px rgba(0,0,0,.28–.3))`), so the person stands in front of the field. Interface shadows are soft, long and green-tinted, and they are used only on the WhatsApp action, on the rectangular feature photos, on the address card that hangs over the map, and as a hover lift on gallery frames and the signature pills.

The portrait sections add a painted depth of their own. The studio canvas (fundo-estudio-a for the hero, /links and the share image, fundo-estudio-b for the close) is a procedural mottled pinho texture with grain, generated without photographic or generative sources. Three radial gradients sit on it, all centred on the sitter's position (`--sx`, `--sy`): a soft green-white light behind the figure (16% opacity), a vignette that darkens the far edges to 62%, and an elliptical floor shadow at the bottom edge under the figure. Each section sets `--sx`, `--sy` and `--canvas` to place the light where its portrait sits, and mobile moves the light to follow the stacked figure. The 404 uses the same canvas with the light placed behind its drawing.

### Shadow Vocabulary
- **Action rest** (`box-shadow: 0 10px 24px -14px rgba(8,30,21,.55)`): Pinho action on light grounds at rest.
- **Action lift** (`box-shadow: 0 18px 34px -16px rgba(8,30,21,.6)`): Pinho action on hover, with a 2px rise.
- **Action on pinho** (`box-shadow: 0 12px 26px -14px rgba(0,0,0,.6)`): Lima action on pinho grounds and in the header.
- **Floating action** (`box-shadow: 0 16px 34px -12px rgba(12,47,34,.55)`): The fixed WhatsApp button; on hover `0 22px 40px -14px rgba(12,47,34,.6)` with a 3px rise.
- **Photo settle** (`box-shadow: 0 30px 60px -36px rgba(16,36,27,.5–.55)`): The therapy photo in "O que é" and the room photo in "Sinais".
- **Legend card** (`box-shadow: 0 26px 48px -28px rgba(8,30,21,.65)`): The pinho address card over the map.
- **Frame lift** (`box-shadow: 0 26px 40px -26px rgba(16,36,27,.55)`): A gallery photo on hover, with a 6px rise.
- **Signature lift** (`box-shadow: 0 8px 18px -10px rgba(0,0,0,.5)`): The footer credit pills on hover, with a 2px rise.
- **Cutout** (`filter: drop-shadow(0 30px 40px rgba(0,0,0,.28))`): Alpha cutouts on pinho.
- **Header glass** (`rgba(18,63,46,.94)` + `backdrop-filter: blur(12px)` + 1px line-dark bottom rule): The header after 24px of scroll.

### Named Rules
**The Figure Carries the Depth Rule.** Lists, rows and sections never get shadows. If something needs to come forward, it is the person, the action, or the one card that hangs over the map.

## Shapes

Shapes are soft and rounded, but the layout stays rectilinear: rows are separated by hairlines, not boxes. Interactive things are full pills (pill): buttons, the floating button and the credit pills. Nodes, dots and the specialty marks are circles. Photographs are rectangles with gently curved corners: 16px for strip frames, 22px for the large feature photos and the map. The address card takes an 18px corner. Notes such as the CoopMed line use a 14px corner on a translucent white wash. Focus outlines take an 8px corner.

### Line icons
The sinais and especialidades carry their own hand-drawn line icons (the si-* and sp-* sets), drawn for this site on a 24-unit grid with round caps and joins and a fine single stroke, lighter than the 1.8 interface icons. They are folha, sit at the start of their row beside the text (38px for sinais, 40px for specialties, about 28–30px on phones), and draw small figures and objects from the work itself: a body in balance, a magnifier over a wave, a clipboard, water. Interface icons (WhatsApp, arrows, pin, home, Instagram, shield) stay a separate, plainer set.

### Cutout Photomontage
- Portraits of Daphine are alpha cutouts from the client's own photographs. The background is removed with macOS Vision (VNGenerateForegroundInstanceMaskRequest) and exported as alpha WebP at 600w and 1023w. Each raster ships with a `.json` provenance sidecar stating the source and "No generative content".
- The hero cutout keeps the leather armchair: the Vision person matte is united with a hand-traced polygon of the chair (feathered to match the photo's focus), and where the original frame cut the chair and leg at the sides the alpha dissolves over 70px instead of stopping on a hard edge.
- The studio canvas behind the portraits is a texture, not a photograph, and ships with the same `.json` provenance sidecar.
- A cutout either sits flush on a section edge (the hero figure is bottom-aligned to the hero's bottom; the close figure sits on the bottom of the final section) or bleeds off the viewport (the sobre figure runs off the right edge and below the section with a negative bottom margin). The place where the photo's frame cuts the body must never be visible.
- Cutouts sit above the line (z 2), with anchors placed around them so the line loops around the person. A front zone lets the stroke pass in front of the lap and the armchair (hero) or the lower body (close).
- On /links the cutout is cropped into a soft-bottomed frame (`border-radius: 0 0 50% 50% / 0 0 18% 18%`) because the column is too narrow for a full figure.

## Components

### Buttons
Tactile and decisive. There is exactly one filled button family, and it is the WhatsApp action, which always inverts its ground.
- **Shape:** Full pill (pill), minimum heights of 44 / 54 / 62px (sm / default / lg).
- **On light grounds:** Pinho fill, on-pinho bold sans label, lima WhatsApp icon at 1.25em, 11px gap. Hover pinho-h.
- **On pinho grounds and in the header:** Lima fill, pinho label and icon. Hover lima-h.
- **Hover / Focus:** A 2px rise and a deeper shadow (0.35s, ease); on fine pointers the WhatsApp mark sways (−12°). Active presses to 0.98. Focus is the global 3px outline, offset 3px (folha on light, lima inside pinho and the header).
- **Mobile:** Full width under 540px (except in the header). Under 375px padding and size tighten and the label may wrap, balanced and centred; under 420px the header action becomes a 44px icon-only circle with a visually hidden label.
- **On /links:** The same lima action stretched to 72px with a two-line label (title plus small 0.84rem line).
- **The way home (404 only):** When a non-WhatsApp action must sit beside the WhatsApp action on pinho, it is a ring, never a fill: transparent with a 1.5px lima ring at 55%, on-pinho label and a lima icon, turning lima with a full ring and a 2px rise on hover. The WhatsApp action stays the one lima fill on the field.

### Links
- **Link Strong** (light grounds): Folha, bold, underlined with a 35% folha underline that goes solid on hover while the underline drops and the arrow travels 4px. On the pinho address card it turns lima.
- **Link Quiet** (pinho): On-pinho, semibold, with a 50% lima underline that goes solid lima on hover. Used for the secondary hero path and the link to the Google reviews.

### Navigation
- Fixed header, transparent over the hero, turning into pinho glass after 24px of scroll. Brand mark plus name (display, wdth 88). Nav links are 0.95rem semibold on-pinho with short labels (Sinais, Como começar, Especialidades, Sobre, O espaço, Dúvidas, Onde); on hover they turn lima and a 2px lima underline draws in from the left. A small lima action sits at the end.
- **Menu sheet (1080px and below):** The inline nav is replaced by a 46px round toggle (1.5px line-dark ring, two bars that cross into an X; ring and bars turn lima on hover). It opens a full-screen pinho sheet that unclips from the top (0.7s, ease). The section links are set in display 700 (clamp 1.6–2.3rem, wdth 92, 56px rows), each with an 18×3px lima tick, and they stagger in 50ms apart. A large lima WhatsApp action and the Instagram link sit below. Escape, a link or the toggle closes it; while closed the sheet is `inert`, while open the page does not scroll and the floating button hides. Above 1080px it force-closes. In landscape phones it lays out in two columns.
- **Floating WhatsApp:** Fixed bottom-right pinho pill with a 2px lima ring and a lima icon, so it reads on light and dark grounds alike (hover pinho-h). On desktop it is icon-only at rest and its label slides out on hover or focus (0.45s). Under 540px it is a round icon-only button. It hides while the hero or the final section is in view, where a full-size action is already on screen, and while the "O espaço" gallery is held.

### Ruled Lists (signature)
- **Sinais list:** Statement-size display rows between 1px rules, each opening with its folha line icon, with room in the gutter for the line to drop a folha tick beside each row when it is reached.
- **Specialties:** A table of name / description / audience over a 2px ink top rule, with a folha line icon before each name and a tick on the row's bottom rule. A specialty that needs a note ("Mais procurado", "Diferencial na região") carries it under its name as a stop on the route: a 10px folha ring followed by a short bold folha line, aligned under the name. Specialty rows carry no pills or badges.
- **Reviews:** Real Google reviews, quoted verbatim on the pinho field: five lima stars, the quote as a statement in on-pinho, the reviewer's name in lima with "avaliação no Google" in on-pinho-muted, rows divided by line-dark rules. The heading column carries the overall rating and a quiet link to the reviews on Google, and stays sticky on desktop.
- **FAQ:** Native `details` rows over a 2px ink top rule. The question is set in display 600; the toggle is a 36px folha ring with a plus that rotates 135° and fills folha when open. Answers slide open and closed, one open at a time.

### Line Nodes
- **Step node:** A 64px pinho circle with a translucent lima ring and the display numeral. When reached it fills lima with pinho text and grows to 1.06×.
- **Stop dot:** A 16px menta circle with a 3px folha ring that fills folha and grows to 1.15× when reached.
- **Origin:** A 12px lima dot at the bottom-left of the hero where the line begins.

### The Growing Child (signature)
A small line-art child rides the head of the line in place of a pen dot and grows up as the page goes on, following the milestones written on the hero's line: sitting in the hero, crawling through "Sinais" and "Psicomotricidade", walking from "Como começar" to "Sobre", and running from the reviews to the final WhatsApp button. Each section names its stage; a new section takes the stage of the age it belongs to, and the order only ever moves forward.
- **Identity:** The same child in every stage. A round head (radius 8.6 in the rig's units) with one hooked curl on top and a single dot eye looking forward, a bean-shaped torso, and stick limbs. Head and torso are filled with the colour of the ground beneath, so the line never shows through the body. All strokes are 2.2 with round caps and joins. The far arm and far leg sit at 0.55 opacity, so the figure reads in depth without a second colour. No face beyond the eye, no clothes, no hair beyond the curl, no fill colour of its own.
- **Colour:** Lima on pinho and folha on light grounds, by the same field switch as the line (the Two Greens Rule).
- **Movement:** The child moves only while the line is being drawn, and its limbs move with the distance travelled, so feet and hands do not slide along the line; scrolling back runs the gait backward. Upright stages stand on the line and lean only a little into the motion; the crawler follows the line's slope. On long steep stretches walking and running children hug the line like a playground pole (only where they would hold it at least about half a second, never just before the button); in a narrow phone lane they hug it tighter rather than poke past the screen edge, and the crawler turns over at a side lane so its body stands out over the page. The child faces the direction of travel. The sitting child alone keeps a slow idle sway.
- **Rigs:** Each stage is an SVG template whose limbs are groups with a named part and a pivot, posed by one pose function per stage. New stages reuse the same head, torso and limb vocabulary.
- **Reduced motion:** No child. The finished line is shown without it.

### Clinic Map
The location is an embedded Google Maps place for the clinic, not a photograph, printed in the site's own inks: the tiles are greyed, multiplied into menta and washed with folha, in a 4:3 frame with the 22px photo corner and the same unclip entrance as the feature photos. On desktop Google's floating place card is cropped off the top, and the attribution always stays visible at the bottom. The address hangs over the map's top-left corner as a pinho legend card (18px corner, legend-card shadow): a pin icon in lima, the street in display 600, the building and district in on-pinho-muted, and a lima link to Google Maps. On phones the card spans the map with a 14px inset. The card never covers the attribution. The page's structured data carries the matching coordinates and map link.

### Photo Strip
A horizontal row of 4:5 photo frames (16px corner) with bold ink captions on the section ground, played as the pinned film described in Layout. On fine pointers a frame lifts 6px on hover and its caption turns folha.

### Footer and Credit
- **Footer:** Pinho-deep, a brand column and three columns (Contato, Endereço, Profissional) with lima uppercase heads on one shared 40px head row, lima icons, and a line-dark rule above the bottom bar.
- **Credit:** "Desenvolvido por" followed by two pills (1px line-dark ring, 7px 12px padding, 44px tall on touch): Chibo Dev with its red kanji stamp (a red square with white brush strokes, slightly rotated), and @chibodev with the Instagram gradient icon, separated by a 2px divider. On hover each pill wears its own brand: the Chibo pill takes a red ring and a faint red wash, its name and the label turn a light red, the divider turns red and the stamp tilts; the Instagram pill does the same in magenta. Hovering the label alone turns it and the divider lima. The same credit closes the 404.

### Share Image
The 1200×630 share image (og-daphine-santana.jpg) is a page of the same world: the pinho studio canvas with its light and vignette, the hero cutout of Daphine in the armchair on the right, one lima line with its ghost echoes starting from a dot under the name and looping around her, the monogram, "Daphine Santana" in Bricolage at display weight, and a two-tone descriptor (on-pinho over lima, "Psicomotricidade e / desenvolvimento infantil"), with the place line and a lima pin below. It ships with a provenance sidecar stating "No generative content".

### 404 Page
The 404 stays in the world: the pinho studio canvas, the brand mark, the display h1 "Este caminho fez uma curva." with "curva" in lima, a lead in the first person, and two actions side by side, the way home as a lima ring and the WhatsApp action as the lima fill. Beside the copy (above it on phones) sits a static drawing of the line: it leaves a dot, loops once with two ghost echoes and milestone words on the path, and ends in a dot from which the dotted trail runs out of the frame. Nothing animates. All addresses are absolute so it works at any URL depth. The developer credit closes the page.

### Entrance Motion
- **Grammar:** Content arrives when the reader reaches it, with one easing (ease, `cubic-bezier(.16,1,.3,1)`). Headings unveil upward from a clip (`clip-path` inset from the bottom plus a 0.35em rise, 1.1s). Copy, rows and actions fade and rise 22px (0.9s). Photos and the map unclip from an 18% top inset and settle from 1.06 scale (1.3–1.6s). Cutouts rise 64px and fade in (1.1–1.4s). Siblings stagger by 90ms in reading order, capped at 8.
- **Line motion:** One travelled distance glides toward the scroll target each frame and is poured into the segments in order. Ticks and path words switch on as the pen passes them, and the child rides the head.
- **Reduced motion:** No `js-motion` class is set, so all content is visible. The whole line is drawn complete at once with no ghosts, no trail, no intro and no child, the gallery does not pin, and every transition collapses to 0.001ms.
- **No JS / failure:** `js-motion` is added only by an inline script, which removes it again after 3.5s if the trace engine has not started. Without JS, all content renders statically with no line and the gallery is a plain scroller.

## Do's and Don'ts

### Do:
- **Do** open every section with its heading, set in Bricolage Grotesque at wdth 92 with negative tracking.
- **Do** make every WhatsApp action invert its ground: lima with pinho text on pinho and in the header, pinho with on-pinho text and a lima icon on light, and keep it the only filled button.
- **Do** give each section a ground different from its neighbours (pinho, névoa, branco, menta), and let the field switch the line, its trail and the child between folha and lima.
- **Do** match each section's `data-in` to the previous `data-out` at both sizes using the `L` / `R` lanes, and pin margin runs to a lane with `data-pt="L y"` rather than a hand-tuned fraction.
- **Do** let the phone route sweep across the screen through the gaps between blocks, with mobile-only anchors, rather than parking it on one edge.
- **Do** keep the child identical across stages (head, curl, forward eye, ground-filled bean torso, 2.2 stick limbs, far limbs at 0.55) and let it grow only forward through the page.
- **Do** set portrait sections, the share image and the 404 on the studio canvas and place its light (`--sx`, `--sy`) behind the sitter.
- **Do** add a breakpoint only for a device class that actually breaks, and change only what broke.
- **Do** tie every tick, node or dot to a real item of content the reader passes.
- **Do** set cutouts flush on a section edge or bleed them off the viewport, and ship each raster with its provenance sidecar.
- **Do** present lists as ruled rows (1px line between rows, 2px ink rule on top) rather than boxes, with the folha line icon beside the text.
- **Do** quote reviews verbatim from real, authorised sources and name where they come from.
- **Do** keep the finished line visible and all content shown at once under reduced motion and without JS.

### Don't:
- **Don't** put eyebrows, kickers or small uppercase labels above headings.
- **Don't** build grids of icon cards or put icons in tiles or pills; icons are folha line strokes beside text.
- **Don't** make a WhatsApp action coral, red or any warm colour, or introduce a third action colour; the action is marked by inversion, not by hue.
- **Don't** let the credit's red or magenta leave the developer credit.
- **Don't** let the line cross a heading, a paragraph, list text or the WhatsApp action.
- **Don't** give the child a face, clothes, a colour of its own or a different head from stage to stage, or let it slide without its limbs moving.
- **Don't** show the cut edge of a cutout photo inside the viewport, or use generated imagery in place of real photographs of Daphine and the space.
- **Don't** invent testimonials, ratings, counts or years of experience.
- **Don't** add shadows to rows, lists or sections; depth belongs to the figure, the action and the map's legend card.
- **Don't** fall back to the category default of cream grounds and italic serifs.
