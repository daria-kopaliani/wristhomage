# wristhomage

Independent, spec-rich database of **watch homages** — affordable watches that pay homage to iconic designs (Submariner, Speedmaster, Datejust…), each ranked by a published fidelity rubric. Finder-first: the filterable database is the wedge, not another listicle. Static site on Cloudflare Pages, deploy-on-push to `main`.

Architecture cloned from the dupenote precedent (dark editorial finder). Not affiliated with Moon Dog or dupenote; separate venture, own domain/identity, excluded from portfolio audits.

## Vocabulary style guide (non-negotiable)

- Use **"homage"** only. **Never** "replica", "clone", "super clone", "knockoff", or "fake" to describe a product we cover — that is counterfeit-market vocabulary and Rolex et al. are litigious.
- Nominative comparison is fine: "an homage to the Rolex Submariner", "Submariner homages".
- The words "replica" / "counterfeit" appear **only** in the educational `homage-vs-replica` explainer and disclosures, to draw the legal line and disclaim them.
- No trademarked brand name or logo in our domain, logo, or page titles beyond nominative reference.
- Never link a counterfeit seller. Off-Amazon homage brands (Steinhart, San Martin, Sugess…) get honest non-affiliate links plus "often cheaper direct" notes where true.

## Build

```
python3 scripts/gen.py     # regenerate watch pages + hub + sitemap + llms.txt from data/homages.js
```

- `data/homages.js` — `HOMAGE_DATA`: originals → real homages (brand, price, movement, size, WR, fidelity, note). Every homage real + priced. `amazon:true` drives affiliate tagging.
- `js/finder.js` — the homepage finder (filter by budget/movement, tagged shop links, GoatCounter shop-click events). Mirrors `gen.py`'s shop-link policy — keep `AMAZON_HOUSES` in sync between the two.
- `rubric.html` — the published fidelity rubric. Must stay ahead of any scoring changes.

## Catalogue integrity (read before adding a row)

Two audits have checked 64 rows against the brands' own stores. **None was fully correct.** The
rows had been written from what homages *ought* to exist and their specs seeded from resellers,
so the rules below are not bureaucracy — they are the fix for a proven failure.

- **A row's model number and specs come from the brand's own store, never a listicle or a
  reseller.** Two listicles gave two *different* wrong model numbers for one watch; our Steeldive
  water resistance traced to a reseller that contradicts Steeldive's own page.
- **Crawl the whole catalogue before concluding a model doesn't exist**, so "not found" is a fact
  rather than a search miss. San Martin has no Fifty Fathoms, Portugieser, Milgauss or Panerai
  homage; Baltany has no Big Pilot, compressor or Milgauss. Famous pairings are not evidence.
- **If a page loses every row, retire it with a 301** (`_redirects`). Do not source a replacement
  to keep the page alive — that is the habit that produced the ghosts.

### Why the thin pages are thin — crawled 2026-08-21, don't redo this

Twelve `/watches/` pages carry ≤2 rows, and Google has crawled **none** of them (`Last crawl: N/A`).
"Discovered - currently not indexed" on a page headed *"the N best X homages, ranked by fidelity"*
that ranks one or two items is a quality verdict, not a plumbing fault — the links are
server-rendered and the sitemap is clean, so there is nothing technical left to fix. The pages are
thin because **the rows do not exist**, and the reason is the same in both directions:

- **The five brands that publish `/products.json`** — Pagani Design (171 products), Watchdives
  (387), Sugess (393), Addiesdive (373), Specht & Söhne (331), 1,655 in total — were searched by
  every thin original's model name. They yielded exactly **one** addition (Addiesdive AD2106, the
  Seamaster). For Fifty Fathoms, Oyster Perpetual, Speedmaster, Tank, Santos, Big Pilot, Pelagos,
  Yacht-Master and Aqua Terra they have **no homage at all**. That is now a checked fact.
- **San Martin's full 320-page catalogue was crawled via its sitemap** (`products.json` 404s but
  `sitemap.xml` is open, `/shop/<range>/<model>/`). Across all 320 pages the only trademarked
  original it ever names is **62MAS** — already row 1 on that page. San Martin does not reference
  Tank, Santos, Pelagos, Yacht-Master, Aqua Terra or Oyster Perpetual anywhere in its own copy.
- **Addiesdive re-read end to end 2026-08-30** (379 products, 298 watches). Two things came out
  of it, both now in the repo, so don't redo the read for either. First, our Explorer row's
  reference was wrong: AD2035 is a 39mm Ronda 515 quartz GMT at $89, and the 36mm ST2130
  bubble-crystal Explorer style we recommend is **AD2556**. Second, Addiesdive names only two
  trademarked originals in its own titles — *Seamaster* once, *Explorer* four times, plus the
  abbreviations *Sub* and *BB58*. It never says Daytona, Datejust, Nautilus, Royal Oak,
  Speedmaster, Santos, Tank, Pelagos, Yacht-Master, Aqua Terra or Milgauss, so none of its ~30
  VK-series meca-quartz chronographs may be filed against an original here. Brand page:
  `guides/addiesdive.html`.
- **Baltany (HTTP 406) and Steeldive (403) block everything** — `products.json`, `sitemap.xml` and
  the HTML collections. Neither is machine-crawlable at all.

**So the remaining depth cannot be added by any automated pass without breaking the first-party
rule.** San Martin and Steeldive certainly make some of these homages; they simply never say which
original a model follows, and matching one by eye from photographs is precisely the "famous pairings
are not evidence" trap. Adding them needs a human to look and decide. Do not let a future sweep
"solve" this by sourcing from listicles or by cue-matching — a cue search for Big Pilot / Santos /
Fifty Fathoms across the open catalogues returns only other brands sold *through* Watchdives (Thorn,
Militado, Rdunae), generic "pilot watch" hits and tourbillon dress watches. None of them is a homage
of anything, and all of them would be ghosts.

### Three pages currently earn nothing

`blancpain-fifty-fathoms` (1 row), `iwc-big-pilot` (2) and `cartier-santos` (2) have **no
Amazon-buyable row at all** — every row is San Martin or Steeldive, which link to a plain
non-affiliate search because neither is on US Amazon. Traffic to these three is worth $0. They are
the strongest candidates for the 301-retire rule above, but that is a product call, not a cleanup.
- Two guards, run from the `/moondog` repo:
  - `scripts/moondog-catalog-audit.py` — has a human verified each row, and how long ago.
    Exit 0 means every row carries a fresh `verified: "YYYY-MM-DD"`.
  - `scripts/moondog-catalog-drift.py` — re-reads the five brand stores that publish a catalogue
    and flags models that vanished, prices that no longer match, and rows that are sold out.
    Weekly via launchd. It cannot tell you a model number points at the *wrong watch*; only a
    human reading the brand's page can.

## Monetization

Amazon Associates tracking ID `wristhomage-20` (domain added to the account's website list). Amazon houses → tagged search; off-Amazon → honest untagged search. Fidelity scores set before any link.
