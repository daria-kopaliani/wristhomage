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

### Ballon Bleu and Overseas have no verifiable homage; Sea-Dweller has one lead — checked 2026-09-28

Issue #36 asked for `/watches/cartier-ballon-bleu`, `/watches/vacheron-overseas` and
`/watches/rolex-sea-dweller`. **None was built in PR #38.** The sources below were searched for the
model names, their common spellings ("balloon", "sea dweller", "deepsea"), the originals' references
(W69012/WSBB, 4500V/4520V/5500V/47040, 16600/116600/126600/126660) and design-cue words
(cabochon, helium valve, 1220m/3900m). This is the list of sources read, not a claim that every
open catalogue was read:

- `products.json`: Pagani Design (173 products), Watchdives (261), Sugess (397), Addiesdive (384),
  Heimdallr (96), Specht & Söhne (182). Zero hits for any of the three. Specht & Söhne names
  Cartier only on its Aviator line, which is the Santos, already filed. The "helium" hits at
  Watchdives and Addiesdive are Watchdives WD007/WD1968 and Addiesdive AD2526 divers that name no original.
- San Martin's `sitemap-1.xml` (337 URLs) and Cadisen's full `sitemap-pages.xml` (138 pages,
  fetched one by one): zero hits. Cadisen does name Datejust, Submariner, Nautilus, Royal Oak and
  Daytona in its own copy, so its silence on these three is a real answer and not a crawl miss.
- Amazon US, read in a US-address browser session: "ballon bleu homage watch", "sea dweller homage
  watch", "vacheron overseas homage watch" and "overseas homage automatic watch" return genuine
  Cartier listings, straps and clasps, and generic OLEVS / FANMIS / FEICE / SEA-GULL dress and dive
  watches. None of these generic searches surfaced a listing that claims one of the three designs.
- **Missed in the first pass, found at review:** `www.steeldives.com` ("Steeldive Official Store",
  Shopify) serves an open `products.json` of 108 products. `steeldive.com` itself still 403s. So
  "Steeldive blocks every machine read" is true of steeldive.com only.

**Ballon Bleu and Overseas:** no source above names either in its own copy. Anything filed against
them would have been matched by eye, which is the trap described above. A future page needs a
human to decide the pairing first, then the usual first-party and buy-box checks.

**Sea-Dweller has a first-party-style lead, not yet shipped.** steeldives.com lists
"Steeldive SD1964 Sea-Dweller Sub Dive Watch"
(<https://www.steeldives.com/products/steeldive-sd1964-45mm-sub-dive-watch>, read 2026-09-28).
Its spec block lists a Japan NH35 automatic, 1000 m, a helium ("exhause") valve, a 120-click
ceramic bezel, sapphire with AR, and 45.5 mm × 17.1 mm; 3 of its 10 variants were buyable that
day. **Whether steeldives.com is Steeldive's own store or a dealer is not settled.** Its title calls it
"Steeldive Official Store", and its About page speaks as the brand ("Steeldive registered own
brands… In 2018, Steeldive independently produced the first batch…"). But no page names the operating
company, the contact is a generic `sales@` address, and WHOIS shows only a 2020-07-17 registration
through Alibaba Cloud with a redacted Hong Kong registrant. steeldive.com cannot be read to
cross-check. Amazon US has the reference, read 2026-09-28 in `#desktop_buybox`, model number SD1964
on each:

- `B09PYYBT2S` (blue) and `B09PYWC8CM` (green): Shipper / Seller BurnsideChronoUS, In Stock.
- `B09C4FBJ68`, `B09C4DFHY5`, `B09C4DGN92`: Shipper / Seller "Jason watch", in stock,
  usually ships in 2 to 3 days.

All five are third-party sellers, and none is identified as Steeldive. It was not built in PR #38
for three reasons:
- the find came at review, after the PR's verification pass;
- the page would have a single row, against the 2–5 the issue asks for;
- the store's identity, the row's fidelity score and a choice between these sellers still need
  their own check.

It is a lead for #36. Note that the "Three pages currently earn nothing" section below says
Steeldive is not on US Amazon. The SD1964 listings above show that is no longer true for every
Steeldive reference.

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
