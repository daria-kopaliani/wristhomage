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
- Two guards, run from the `/moondog` repo:
  - `scripts/moondog-catalog-audit.py` — has a human verified each row, and how long ago.
    Exit 0 means every row carries a fresh `verified: "YYYY-MM-DD"`.
  - `scripts/moondog-catalog-drift.py` — re-reads the five brand stores that publish a catalogue
    and flags models that vanished, prices that no longer match, and rows that are sold out.
    Weekly via launchd. It cannot tell you a model number points at the *wrong watch*; only a
    human reading the brand's page can.

## Monetization

Amazon Associates tracking ID `wristhomage-20` (domain added to the account's website list). Amazon houses → tagged search; off-Amazon → honest untagged search. Fidelity scores set before any link.
