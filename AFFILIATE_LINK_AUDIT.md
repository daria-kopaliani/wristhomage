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

| query | clicks | resolves? | what the search actually returns |
|---|---|---|---|
| San Martin SN0058-G-X watch | 11 | ✗ | SN0017G-E, and **SN058G** (36.5 mm dress) — the real code is likely `SN058G`, not `SN0058-G-X` |
| San Martin SN013-G watch | 10 | ✗ | SN0129GC2/C3, SN0017G-E, SN0136 — none is SN013-G. The model IS real (ASIN **B09PYXWYDZ**, verified 08-12); the SEARCH just cannot find it |
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
