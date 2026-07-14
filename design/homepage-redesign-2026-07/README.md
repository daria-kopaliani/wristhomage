# Handoff: wristhomage — Watch Homage Index (Homepage + Finder)

## Overview
A hifi build of the wristhomage homepage (wristhomage.com). wristhomage is an
independent, spec-rich **watch-homage database** — affordable watches that pay
homage to icons like the Rolex Submariner, Omega Speedmaster, GMT-Master, Royal Oak
and Nautilus — ranked by a **published 100-point fidelity rubric** and filtered by
iconic original, budget, size and movement. **Homages, not replicas — the site
never links a counterfeit or a "replica" that copies brand markings.**

The live site was essentially a hero + a few links; "improve" here meant building
the actual product: a photographic-grade editorial homepage with a working finder,
an editorial index of the originals, and the scoring rubric.

## About the Design Files
`wristhomage.dc.html` is a **design reference created in HTML** — a working
prototype of look and behavior, **not production code to copy directly**. It is
authored as a "Design Component" and loads a design-system token bundle by relative
path, so it will not run standalone without those assets.

The task is to **recreate this design in the target codebase's existing
environment** (React/Next, Vue, Astro, plain HTML+CSS, etc.) using that project's
patterns and data layer — or, if none exists yet, pick the most appropriate stack.
Treat the prototype's inline React logic (filter/sort/reveal state) as a behavior
spec, not code to lift.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, and interactions are
specified with exact values. The **watch data** (models, prices, fidelity scores)
is realistic but ILLUSTRATIVE — see *Assets / Data*.

## Design direction — "expensive, stylish, editorial"
This site went through an explicit push to feel **couture, not amateur**. The final
direction is a horology-editorial look, deliberately distinct from the utilitarian
"score" sites (Water Filter / Cookware / Fish Oil Score) in the same family:

- **Editorial serif display** — **Cormorant Garamond** (Google Fonts, weights 500/600/700
  + italic 500) carries every display moment: the hero headline, watch names, prices,
  fidelity figures, section titles, roman numerals. Loaded via `<link>` in `<helmet>`
  and referenced through a template-scoped `--serif` custom property.
- **Tightly-tracked small-caps** for all UI labels/nav/eyebrows: 10.5–12px,
  `letter-spacing: 0.14em–0.3em`, `text-transform: uppercase`, weight 600.
- **Warm, not cool** — paper background `#f6f4ef`, ink `#131211`, secondary text
  `#6f6a63`, muted labels `#a49e95`. **Refined brass accent `#a8864e`** used ONLY as
  thin rules, eyebrows, roman numerals and the hairline fidelity bar. (An earlier
  version used the design system's `brand2-500 #ffd530` amber for CTA buttons — it
  read as lemon-yellow and cheap; it was explicitly removed. Do not reintroduce a
  yellow button.)
- **Hairline detailing** — 0.5px rules at `rgba(19,18,17,0.08–0.2)` separate
  everything; filter rows, index lists and the rubric are hairline-ruled lists, not
  boxed cards.
- **No photography required.** The client has no images. The design is fully
  self-sufficient without them (see *Imagery*), and must stay that way.

## Sibling sites
Same design system (Beat Player) and the same underlying page pattern as Water
Filter / Cookware / Fish Oil Score (sticky header, hero, filterable ranked data,
reference section, method/rubric, dark footer with affiliate disclosure), but a
distinct **premium editorial skin**. If sharing components across the family,
parameterize: type treatment (serif vs system), accent, background warmth, and the
data/column set — wristhomage is the "luxury" end of the spectrum.

---

## Design foundations (Beat Player Design System)
Uses the bound Beat Player tokens (neutral gray ramp + semantics) for structure, but
overrides the palette toward warm editorial as above. Apple system stack remains the
**body/text** face; Cormorant Garamond is layered on top for display only.

### Color (exact hex)
- Paper bg `#f6f4ef` · card `#fffdfa` · ink `#131211` · secondary `#6f6a63` ·
  muted-label `#a49e95` · chip-idle text `#4a463f`.
- Dark surfaces (hero, footer): base `#131211`, with warm lifts `#1c1a17` / `#201d19`
  and shadow `#0d0c0b`.
- **Accent (brass):** `#a8864e`, applied at runtime as CSS var `--wf-accent` on the
  root and referenced `var(--wf-accent, #a8864e)`. Tweakable prop (see below).
- Hairlines: `rgba(19,18,17,0.08 / 0.12 / 0.14 / 0.16 / 0.2)` on light;
  `rgba(255,255,255,0.12 / 0.14 / 0.2)` on dark.
- `::selection` `#e6dcc6`.

### Typography
- Display: `'Cormorant Garamond', Georgia, 'Times New Roman', serif` — weight 600,
  negative tracking (−0.4 to −2px depending on size). Hero H1
  `clamp(46px,7.6vw,104px)/0.98`; section H2 `clamp(34px,4.4vw,52px)/1.02`; watch
  name 22px; price 24px; card fidelity figure 32px; rubric weight 44px; roman
  numerals italic.
- Body/labels: Apple system stack (design system `--font-text`). Body 14–19px/1.5–1.55.
  Labels 10.5–12px, uppercase, `letter-spacing 0.14em–0.3em`, weight 600.
- Global body `letter-spacing: -0.2px`.

### Spacing, radius, elevation
- Max-width `1240px`, centered, 28px gutters.
- Section rhythm: 92px vertical padding between major sections.
- Radii: chips fully round (`9999px`); cards are **square-cornered** (0px) with
  0.5px borders — part of the editorial look. Pills/badges `9999px`.
- Elevation is mostly flat; the only shadow is the card **hover lift**
  `0 22px 44px -24px rgba(19,18,17,0.4)` + `translateY(-5px)`, 0.4s ease.
- Sticky header is translucent dark glass: `rgba(19,18,17,0.62)` +
  `backdrop-filter: blur(18px) saturate(140%)`.

---

## Screens / Views
Single scrolling page, max-width 1240px / 28px gutters, five regions.

### 1. Header (sticky, dark glass)
z-60, translucent `#131211` blur, 0.5px bottom hairline. Left: letterspaced
small-caps wordmark "WRISTHOMAGE". Right nav: small-caps links Finder (#finder),
The Icons (#originals), The Rubric (#rubric). White text at 72% opacity.

### 2. Hero (dark, full-bleed gradient — NO image dependency)
`min-height:90vh`, content bottom-aligned. Background is a layered CSS gradient in
the spirit of the design system's artwork-derived player backdrop: two brass
`radial-gradient`s (top-right + bottom-right) over a `linear-gradient(155deg,
#1c1a17→#131211→#0d0c0b)`, plus a faint white radial sheen. Content: brass rule +
"THE WATCH HOMAGE INDEX" eyebrow; serif H1 "Get the icon, skip the price tag.";
54ch sub-paragraph ("Homages, never replicas. We never link a fake."); a pill
"Browse the index" button (transparent, 1px white-55% border → inverts to solid
white on hover) + a brass "How fidelity is scored →" text link; then a 3-stat strip
(120+ homages / 24 originals / 5 criteria) separated by 0.5px verticals.

### 3. Finder (#finder) — the core
- **Header:** brass eyebrow rule "THE FINDER"; serif H2 "Every homage, ranked by
  fidelity."; live "**N** watches shown" count.
- **Filter bar:** four hairline-ruled rows (top+bottom 0.5px border, inter-row 0.5px),
  each = a small-caps label (92px fixed column: Icon / Budget / Movement / Sort by) +
  a wrapping row of **round toggle chips**. On = `#131211` bg / `#f6f4ef` text; off =
  transparent / 0.5px `rgba(19,18,17,0.2)` border / `#4a463f` text; 0.25s transition.
- **Results grid:** `repeat(auto-fill, minmax(272px,1fr))`, gap 26×24px. Each card
  (square corners, 0.5px border, hover-lift):
  - **Tonal plate** (aspect 4:5): dark `linear-gradient(158deg,#201d19→#131211)` +
    brass radial glow, with the model's **initial** set huge in serif at 10% white,
    an italic serif `N° 01` catalogue number (top-left), a translucent "HOMAGE" pill
    (top-right), and a small-caps "ADD YOUR PHOTOGRAPH" hint (bottom). See *Imagery*
    for the photo-optional decision.
  - Body: serif model name + small-caps "HOMAGE TO {original}"; big serif fidelity
    number (no ring — just the figure) + "FIDELITY" label, right-aligned; a
    "{size}mm · {movement}" spec line; a hairline-topped footer with serif price +
    "VIEW SPECS →" small-caps link.
  - **Fidelity bar:** 2px track along the very bottom of the card, brass fill to
    `fidelity%`.

### 4. The Icons (#originals) — editorial index list
Brass eyebrow "THE ICONS"; serif H2 "The watches worth paying tribute to."; intro.
Then a hairline-ruled list (not cards): each row = italic serif roman numeral (i–vi,
brass) + serif original name + one-line note, with "RETAIL FROM" + serif price
right-aligned. Six originals: Submariner $9,200 · Speedmaster $7,000 · GMT-Master II
$10,700 · Royal Oak $35,000 · Nautilus $35,000 · Explorer $7,300.

### 5. The Rubric (#rubric) — editorial index list
Brass eyebrow "THE RUBRIC"; serif H2 "How fidelity is scored."; intro (one published,
weighted 100-pt rubric applied identically to every watch; measures resemblance, not
build quality). Hairline-ruled list: each row = giant serif weight + "/100" + serif
criterion name + description. Five criteria (sum = 100): **Dial & handset 30**,
**Case & proportions 25**, **Movement 20**, **Bezel & crystal 15**,
**Finishing & bracelet 10**.

### 6. Footer (dark)
`#131211`, wordmark + repeated small-caps nav, 0.5px rule, then the affiliate +
homage-not-replica disclosure and a copyright/approximate-prices caption.

---

## Interactions & Behavior
- **Filters (independent):** `original` (7 options incl. All), `budget`
  (Any / Under $150 / $150–350 / Over $350), `movement` (All / Automatic /
  Mechanical / Meca-quartz / Quartz). Result count updates live.
- **Sort:** Fidelity (desc, default) or Price low→high. Cards re-number `N° 01..`
  after every sort/filter.
- **Card hover:** translateY(−5px) + soft shadow + border darken, 0.4s.
- **Scroll reveal:** sections tagged `[data-reveal]` fade+rise (0.8s) via
  IntersectionObserver. IMPORTANT — this is progressive enhancement only: elements
  already in view reveal immediately, a **1.2s safety timeout force-reveals
  everything** regardless of the observer, and it's disabled under
  `prefers-reduced-motion`. Never let reveal state leave content stuck invisible
  (matters for export/screenshot/background-tab). Preserve this safety net on port.
- **Links:** anchor nav scrolls to sections (`scroll-margin-top:72px`). Per-watch
  "View specs" and card links are placeholders (`#`) — wire to real routes /
  affiliate + spec URLs.
- **Motion:** soft 0.15–0.4s ease; reduced-motion safe.

## State Management
- `original`: string key (default `'all'`).
- `budget`: `'all' | 'lt' | 'mid' | 'gt'` (default `'all'`).
- `movement`: string key (default `'all'`).
- `sort`: `'fidelity' | 'price'` (default `'fidelity'`).
- Derived per render: filtered+sorted rows, `resultCount`, per-card `index`
  (zero-padded), `initial`, `fidPct`, formatted price/size, and the four chip arrays
  (each chip carries its own computed `style` + `onClick`).
- **Tweakable prop:** `accentColor` (default `#a8864e`).

## Data model
```
{
  model: string,        // "Steinhart Ocean One 39"
  original: string,     // which icon it homages — "Submariner"
  price: number,        // street price, USD
  size: number,         // case diameter, mm
  movement: string,     // "Automatic" | "Mechanical" | "Meca-quartz" | "Quartz"
  fidelity: number,     // 0–100 rubric total
  slot: string          // stable id (legacy image-slot key; see Imagery)
}
```
Derived: `index` = 1-based rank, zero-padded; `initial` = first letter of model;
`fidPct` = fidelity (drives the bottom bar width).

## Assets / Data
- **No image assets, and none required.** The client has **no photography**. The hero
  and card visuals are pure CSS (layered gradients + serif typography). Keep the
  design photo-optional: the tonal card plate is the default published state.
- **Photo-optional decision (unresolved — confirm with client):** cards currently
  show an "ADD YOUR PHOTOGRAPH" hint but the actual drag-and-drop `<image-slot>`
  drop-targets were removed, so the hint is presently just a label. Two clean
  resolutions when porting: (a) drop the hint for a purely typographic published look,
  or (b) re-add real photo slots layered over the tonal plate so photos remain
  optional later. The `slot` id on each row is retained to support option (b). The
  `image-slot.js` web component is included in the project for that path.
- **Fonts:** Cormorant Garamond via Google Fonts (`<link>` in helmet); body is the
  Apple system stack. License/self-host Cormorant for production if Google Fonts is
  not permitted.
- **Watch data is realistic but ILLUSTRATIVE.** Models, prices, case sizes, movements
  and fidelity scores must each be verified before publishing — prices drift, and
  every fidelity number must come from actually applying the published rubric to the
  specific watch. Do not publish a named-brand fidelity score you haven't scored.
  Retail figures for the originals are approximate.
- Design-system tokens live under
  `_ds/beat-player-design-system-ed8ef4ee-f676-47f6-98c4-729c58b1df51/` — port the
  overridden warm palette + brass accent listed above rather than the raw defaults.

## Files
- `wristhomage.dc.html` — the full hifi prototype (markup + logic). Primary reference.
- `image-slot.js` — drag-and-drop image web component (only needed if you re-add
  photo slots per the photo-optional decision).
- This `README.md` — self-sufficient implementation spec.
