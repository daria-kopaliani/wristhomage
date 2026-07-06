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

## Monetization

Amazon Associates tracking ID `wristhomage-20` (domain added to the account's website list). Amazon houses → tagged search; off-Amazon → honest untagged search. Fidelity scores set before any link.
