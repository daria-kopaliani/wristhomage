# Amazon link audit — wristhomage

Started 2026-08-12 (commit bcf716e, "the San Martin row was wrong too"), which fixed
two rows and noted *"the remaining 65 need the same pass"*. This is that pass, run
2026-08-29, prioritised by ACTUAL CLICKS from the GoatCounter ledger rather than by
position on the page.

## Method
Every `amazon.com/s?k=` query on the site (65 distinct) was mapped to its click count,
then the highest-clicked were run against live US Amazon and the top three results
checked for the model designator. A link "resolves" only if the search surfaces the
product it names.

## Result: 36 of the 46 clicks checked (78%) land on a search that does not surface the product

**Progress 2026-08-30: 21 of those 36 clicks now resolve** — SN013-G (10) links its verified
ASIN, SN058 (11) is corrected and pointed at the brand store. Both were the same underlying
defect in different disguises: a model identifier in our data that does not match anything
real. Remaining: Pagani PD-1690 (6), PD-1693 (5), Cadisen C8053 (4), Timex E-Line (3).

| query | clicks | resolves? | what the search actually returns |
|---|---|---|---|
| San Martin SN0058-G-X watch | 11 | ✅ FIXED 08-30 | The hypothesis was right: the real reference is **SN058**, verified against San Martin's own store (two SN058 products, the 36mm dress in stock at $326 on 08-30) — not against an Amazon title. `SN0058-G-X` does not exist, which is why the search returned nothing useful. Amazon does NOT carry SN058 either: a search for it returns unrelated 1963-branded watches, so this is direct-only and the link is now an honest unpaid one to San Martin's store. Two hand-written pages were also carrying a **tagged** Amazon search for the dead reference; both corrected. The row's "sold out" note was stale too — it is in stock. |
| San Martin SN013-G watch | 10 | ✅ FIXED 08-30 | Was: SN0129GC2/C3, SN0017G-E, SN0136 — none is SN013-G. Now links `/dp/B09PYXWYDZ` (re-verified live 08-30: in stock, exact reference in title, $459.90). San Martin has discontinued the reference — its own store returns SN0130/0133/0134/0138 and no SN013 — so the $335 direct price this row quoted was unbuyable; priceUSD/priceSource moved to Amazon to match where the link lands |
| Pagani Design PD-1728 watch | 6 | ✓ | "Pagani Design 1728" — correct |
| Pagani Design PD-1690 watch | 6 | ✗ | generic Pagani listings; 1690 not findable |
| Pagani Design PD-1693 watch | 5 | ✗ | returns PD1645 instead |
| Pagani Design PD-1645 watch | 4 | ✓ | "Pagani Design PD1645" — correct |
| Cadisen C8053 watch | 4 | ✗ | generic Cadisen listings; 8053 not findable |

Two failure modes, and they need different fixes:

1. **Wrong identifier** (SN0058-G-X). Same defect class as the SN043 one fixed on 08-12:
   a code that resolves to nothing. Needs verifying against the brand's own store before
   changing — do NOT copy a code out of an Amazon title.
2. **Right product, useless search** (SN013-G). The model exists and has a known ASIN.
   A `/dp/B09PYXWYDZ` link would land it exactly; the keyword search does not.

## Not the cause — already tested
Query FORMAT is not the problem. Dropping the `PD-` prefix and the hyphens
(`Pagani Design 1690`, `San Martin SN0058G`) returns the same unrelated results.

## The descriptive-search class is nearly closed
08-12 flagged names like "Fifty Fathoms 43" that generate category lookups rather than
product lookups. Only **one** remains: `Timex Automatic 1983 E-Line watch` (3 clicks).
The other 64 queries all carry a model designator.

## Why this matters more than it looks
wristhomage is the only site in the portfolio that has earned real money, and these are
its most-clicked links. A click on a search that returns the wrong watch is spent
traffic: the visitor arrives on Amazon, does not find the thing they read about, and
the 24-hour cookie is the only thing that can still pay.

## Next, in order
1. Verify SN0058-G-X and SN013-G against San Martin's own store/model blog (as 08-12 did),
   not against Amazon titles.
2. Where a verified ASIN exists, link `/dp/<ASIN>` instead of a keyword search.
3. Work down the remaining 58 queries by click count.

## Pass 3 — 2026-08-30: all 42 remaining search-only rows checked, 16 now link an ASIN

The "work down the remaining 58 queries by click count" step, run to the end rather than
sampled. Every row flagged `amazon: true` without an `asin` (42 of the 46 on-Amazon rows)
was searched on live US Amazon, and each candidate was then re-checked on its own
**product page** — `#productTitle`, not the search-result blob — for both the brand and
the model designator. Search-result text includes descriptions and variant lists, so a
model number can appear there without being the product on offer; the title cannot.

**Verified, now linking `/dp/<ASIN>`** (16 rows, 17 counting the duplicated Tissot row):

| row | ASIN | title evidence |
|---|---|---|
| Pagani Design PD-1664 | B0H1RHXMH1 | "Pagani Design PD-1664 Men's Quartz Watch" |
| Pagani Design PD-1651 | B0B3TFV9T9 | "Pagani Design PD-1651 Men's Automatic Watch" |
| Pagani Design PD-1662 | B0B639TSKY | model in full title, GMT 40mm |
| Pagani Design PD-1783 | B0CP5RMFN7 | "Pagani Design DD40 PD1783" |
| Timex Automatic 1983 E-Line | B0FLW6TL7J | "Automatic 1983 E Line Reissue 34mm" |
| Sugess S465 | B0FWS5BGZH | "Chrono Hertiage S465.SR.S ST1903" |
| Sugess S466 Heritage | B0GGSJRV2J | "Slim Master S466.K Black Enamel Dial" |
| Seiko SRPE74 | B08BMF5Z29 | "SEIKO 5 Sports … SRPE74K1" |
| Cadisen C8185 | B09LS4D8YL | model in full title |
| Octopus Kraken OCT-0025 BB54 | B0GL883DJC | "Octopus Kraken OCT-0025 37mm PT5004" |
| Addiesdive AD2044 BB58 GMT | B0FDWM3HRX | "H3 Quartz Dive Watch with AD2044 Black GMT" |
| Addiesdive AD2050 | B0FH2D89LW | "H3 Blue Quartz Dive Watch with AD2050 GMT" |
| Watchdives EXD-40 | B0G3X25VTP | "EXD 40mm Titanium Dive Watch" |
| Orient RA-AA0C01B | B07YRXPBFD | "RA-AA0C01B19B" — our short ref is a prefix of the full one |
| Baltany S4056 | B0G5PW11SD | "Baltany 36MM Explorer … S4056" |
| Tissot PRX 40mm | B0DCWXJM74 | "PRX Powermatic 80 40mm … T13740…" matches the row's ref |

**Deliberately NOT filled** — the rule from pass 2 is that a wrong identifier is worse
than a search, because it looks right in every report:

- **Addiesdive AD2106** → B0D4VCFRLH is titled "AD2106 Automatic Watch+Mesh Watch
  Band+20mm Waffle Band Replacement Watch Band". Right brand, right model, but the title
  cannot settle whether the watch ships or only the bands, and the feature bullets do not
  render to a plain fetch. Unresolved, so unfilled.
- **Watchdives WD1965 V2** → B0F293XFCC is titled "WD1965 62MAS Dive Watch 38mm" with no
  V2. Our row specifies V2. This is the exact shape of the WD16570/WD16760 defect already
  found on this site — a near-miss reference that reads as a match — so it stays a search.

**Still unresolved (24 rows).** The search does not surface the product and no ASIN could
be verified: Cadisen C8053, C8180, C8210; Pagani Design PD-1690, PD-1693, PD-1673,
PD-1685, PD-1752, PD-1688, PD-1701, PD-1751; Watchdives WD16570 V2; Casio MTP-B190D-1BV;
Timex TW2W53000, TW2Y88200; Baltany S6073AB; Invicta 8926OB; Seiko SRPE53, SSK023;
Addiesdive AD2078, AD2515, AD2043, AD2556.

Three of those are worth a second look by hand rather than by search — **Invicta 8926OB**,
**Seiko SRPE53** and **SSK023** are mainstream references that are almost certainly on
Amazon; a top-8 keyword window simply did not surface them. The rest match the pattern
pass 2 identified: an identifier that resolves to nothing, which needs checking against
the brand's own store before anything is changed here.

**Effect.** Exact-product links on the site go from 4 to 27 (the 16 rows appear on more
than one page); keyword searches drop from 112 to 107. That is what makes the
`wristhomage-20` / exact-vs-search split worth doing — before this there was no exact
bucket to compare.

## Pass 4 — 2026-08-30: the three highest-clicked unresolved rows no longer misroute

The current ledger put approximately 18 clicks into PD-1690, C8053 and PD-1693 searches
that did not surface the named watch. None has a verified Amazon ASIN, so inventing one
would repeat the original defect. Each row was instead checked against the brand's own
catalogue and now opens its exact first-party product page:

- **Cadisen C8053** — exact Cadisen page, in stock at $79.99. The row is now an honest,
  untagged direct link.
- **Pagani Design PD-1690** — exact Pagani page, every variant sold out. The CTA says
  “Check availability” and does not pretend there is a buyable Amazon listing.
- **Pagani Design PD-1693** — exact Pagani page, every variant sold out. The official
  specification also corrected the movement from Seiko NH34 to Pearl DG5833A.

`directUrl` is now a first-class destination in both the generator and homepage finder.
It is tracked as `shop/direct/<slug>`, separately from honest searches and Amazon, so a
future merchant programme can be evaluated without corrupting the search cohort.


## Pass 4 — 2026-09-04: the articles were the search-only half of the experiment

`gen.py` has linked a verified ASIN since 08-30, but `link_articles.py` was still hard-coded
to a keyword search — its docstring carried the pre-amendment rule, "search URLs, not ASINs."
So the two link shapes were split by PAGE TYPE: `/watches/` pages ran `/dp/`, articles and
brand guides ran `/s?k=`. That is also why the dp-vs-search result was confounded — the
comparison was measuring page type as much as link shape.

**20 article/guide links upgraded**, across 6 articles and 5 brand guides. Every ASIN was
re-verified live on 2026-09-04 before use: listing title carries the model designator, page
has a buy box. Three needed the documented Pagani/San Martin formatting allowance — Amazon
titles drop the `PD-` prefix ("Pagani Design 1728") and the `-G1` suffix ("San Martin SN0134").

Link surface after: **51 `/dp/` + 84 `/s?k=`**, both shapes now present on both page types,
each carrying its own tag per rule 1.6. Audits at time of change: affiliate-audit clean across
11 sites, click-tracking 135 tagged links / 0 untracked / 0 double, site-audit 0 orphans,
no-JS 47/47.

What this is for: the first dp-vs-search read (2026-09-03) put exact-ASIN at 16.2% conversion
and $0.19/click against search at 4.8% and $0.046, on only 37 dp clicks. **This does not
reverse the keep-search-links rule** — it grows the sample on the pages that carry the clicks
so the question can be answered instead of argued. Re-read when dp clicks pass ~150.

## Pass 5 — 2026-09-04: the three "almost certainly on Amazon" rows are not buyable there

Pass 3 set three of the unresolved 24 aside as worth a second look by hand — Invicta
8926OB, Seiko SRPE53 and Seiko SSK023 — on the grounds that they are mainstream
references a top-8 keyword window would miss. Checked properly against live US Amazon,
signed in, scanning every result rather than the first page. **All three fail**, and the
reasons differ, so they are recorded here to stop a fourth pass repeating the work.

Standard applied, unchanged from pass 4: the listing title carries the model designator,
and the page has a buy box. Plus the header's rule (b), within ~15% of the quoted price.

- **Invicta 8926OB** — not on Amazon as a watch at all. Two queries, 116 results scanned;
  every occurrence of "8926" is an ACCESSORY for it — bands (B08BZRNLKJ, B07D6PVSC6),
  friction pins (B08MWMBKK2), a bezel insert (B0GVDPJ9KG), a replacement hand (B0HH9YYQ3J).
  The nearest watches are other references: B014MN9RCM is **8932OB** (quartz, not this
  watch) and B000JQFX1G is **5053** — checked its product page directly, title reads
  "Invicta Men's 5053 Pro Diver Collection Automatic Watch" with no model-number field.
  Linking either would be the digit-transposition failure this file already documents.
- **Seiko SRPE53** — listed, but not buyable. B08BZBBTCC and B08C3ZYNKL both carry
  SRPE53K1 in the title (the K1 regional suffix is the same formatting allowance pass 4
  granted San Martin), and **neither has a buy box**: no add-to-cart, "See All Buying
  Options" only, third-party offers whose price moved between the search card and the
  product page ($345 vs $207 on one; $103.50 on the other, against a $315 quoted price).
- **Seiko SSK023** — same shape. B0CRZ685T2 carries SSK023K1 in the title, no buy box,
  "See All Buying Options", and the visible new offer is $568.47 against the $450 this
  site quotes from seikowatches.com — **+26%**, which fails rule (b) even if a buy box
  appeared tomorrow.

**Conclusion.** These three stay as honest searches. The pass-3 note that they are
"almost certainly on Amazon" was a reasonable guess and it was wrong; a mainstream
reference can be absent, or present only as marketplace offers with no buy box, which
is not the same thing as buyable. Unresolved count is unchanged at 24 rows, but three of
them are now closed questions rather than open ones.
