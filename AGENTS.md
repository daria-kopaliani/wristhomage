# AGENTS.md — the affiliate score sites

Rules for any coding agent working in one of these repos: **canningscore ·
cookwarescore · dehydratorscore · drinkwarescore · dupenote · fishoilscore ·
generatorscore · ledmaskscore · waterfilterscore · wristhomage**.

Every rule below was written after something broke. None is stylistic.

---

## 0. What these sites are for

They are static, faceless buying guides that earn affiliate commission. The
traffic that matters is **not Google** — it is assistants citing the pages.
Google is roughly 1% of referrals; ChatGPT and friends are the majority. Two
consequences that drive most of the rules:

- **A page an assistant cannot read earns nothing.** No JS-rendered content.
- **A page that cannot be verified earns nothing.** Named entities, real
  numbers, cited sources, dated checks.

Money facts, so priorities are legible. Read from the Amazon Associates
dashboard 2026-09-17, window Aug 18 – Sep 16: **970 clicks → 93 items →
$72.11 commission**. Earnings per click by property:

| property | clicks | items | commission | $/click |
|---|---|---|---|---|
| fishoilscore | 115 | 11 | $18.17 | **$0.158** |
| dupenote | 105 | 17 | $12.74 | $0.121 |
| wristhomage | 440 | 21 | $14.93 | $0.034 |
| ledmaskscore | 58 | 0 | $0.00 | $0.00 |
| *untagged* | 225 | 44 | $26.27 | $0.117 |

Three things this table overturns, each verified per-tag on 2026-09-17:

- **`ledmaskscore` is no longer the best earner per click — it is zero.** The old
  $0.33/click figure came from 4 orders in the all-time window; over the last 30
  days it took 58 clicks and returned no orders at all, on Amazon *and* on
  Hyperice via Awin. Do not cite it as the AOV proof case without re-reading it.
- **23% of clicks (225) carry no tracking ID**, and they hold 36% of the
  commission. All 16 tracking IDs were isolated and checked, so this is not a
  missing tag; the most likely mechanism is cookie carry-over from a tagged
  click. It means per-property attribution is systematically incomplete —
  a property's true earnings are its row *plus* an unknown share of that 225.
- **91 of 93 items ordered were indirect** — not the product linked. The
  portfolio earns off what the visitor buys next, which is why blended
  commission is 2.2% while the named tags sit at 3–4%.

Volume is not the constraint; verifiability and average order value are.

---

## 1. Hard rules — a PR that breaks one of these does not merge

### 1.1 Every page must render without JavaScript
AI crawlers do not execute JS. If the content only exists after `app.js` runs,
the page is empty to the channel that pays. wristhomage's homepage once drew its
entire ranked index client-side; it was invisible.
**Check:** `moondog-nojs-audit.py`

### 1.2 Every live page must be listed in `llms.txt`
It is the first file an AI crawler reads. `llms.txt` used to be hand-maintained
while `sitemap.xml` was generated, and it silently drifted on 8 of 10 sites.
**Check:** `moondog-llms-audit.py` — must read `N/N`.

### 1.3 A generator may never omit a live page from `sitemap.xml`
Not "should not" — the generator must refuse. Live pages missing from the
sitemap were invisible for weeks.

### 1.4 No orphans
Every page in the sitemap needs at least one inbound internal link. A page
nothing links to can only be reached by a manual Request-Indexing click, and
those go 0-for-4 on orphans. `ledmaskscore/recovery-clearance-record` shipped in
`llms.txt` and `sitemap.xml` with zero inbound links and sat unreachable.
**Check:** `orphan-audit.py` (live) / `moondog-site-audit.py` (local).

### 1.5 Amazon Associate identification, on the page, before the first affiliate link
The prescribed sentence — "As an Amazon Associate we earn from qualifying
purchases" — must appear **on any page carrying a tagged link**, and **above**
the first one. "We may earn a commission" is not a substitute; the
identification is the part Amazon's Operating Agreement prescribes, and the FTC
wants it before the recommendation it qualifies. A policy page alone is not
enough.
**Check:** `moondog-affiliate-audit.py`

### 1.6 The tag must match the link shape
Three sites run a deliberate split so link types can be compared:

| link shape | tag |
|---|---|
| `/dp/<ASIN>` — the exact product | `<site>dp-20` |
| `/s?k=<query>` — the search | `<site>-20` |

A `/dp/` link wearing the search tag still earns, still passes a naive tag
check, and quietly destroys the comparison. Currently split:
`waterfilterscore`, `dupenote`, `wristhomage`.

### 1.7 `lastmod` and "last reviewed" are different dates. Never conflate them.

| date | claims | bump when nothing changed? |
|---|---|---|
| "Last reviewed" / `verified:` | *we checked on this date* | **yes**, after a real re-check |
| `<lastmod>` in `sitemap.xml` | *the content changed* | **never** |

Stamping today's date on every URL each run is a false freshness signal to
Google and to AI crawlers. Derive `lastmod` from the last commit touching each
file — wristhomage's generator is the pattern to copy.

A review date is only honest if a check actually happened. HTTP 200, a
successful regeneration, or a page still existing are **not** evidence a claim
was re-verified. Blocked or ambiguous source → keep the old date and report the
failure.

### 1.8 Never invent a product, price, or identifier
The correct affiliate tag on the wrong product is worse than no link. If an ASIN
or model cannot be verified, **retire the row — do not fill it**. Verdicts gate
links: never link a product the page has not vouched for.

### 1.9 Do not minify source CSS
Ship readable stylesheets — one declaration per line. A redesign once collapsed
`home.css` from 351 lines to 57 with a longest line of 1,916 characters, which
makes every later edit a whole-line diff and ends code review and `git blame` on
that file. Minify at build time if ever needed, never in source.

---

## 1.8 The shape the AI channel cites is "best <named entity>"

Measured 2026-08-20..09-19 across the four sites with traffic. **chatgpt.com is 3,722 of ~4,500
referrals (~88%)**; bing 183, duckduckgo 239, Google 86. So this is the only ranking that matters,
and it is not Google's.

What actually gets read:

| page | views |
|---|---|
| wristhomage `/articles/best-datejust-homage` | 330 |
| wristhomage `/watches/patek-nautilus` | 291 |
| wristhomage `/watches/ap-royal-oak` | 230 |
| wristhomage `/articles/best-santos-homage` | 189 |
| dupenote `/articles/best-fragrance-dupes` | 104 |
| dupenote `/articles/birkenstock-dupes` | 101 |
| fishoilscore `/guides/best-third-party-tested-fish-oil` | 57 |

Every one is **a named entity plus a comparison verb** — "best X", "X dupes", or the entity alone.
Descriptive, clever and internal-codename titles do not appear anywhere in that list.

**The diagnostic that follows from it: a page with impressions and a good Google position but no
pageviews is a NAMING problem, not a content problem.** fishoilscore's protein ranking sat at
position 4.6 with 31 impressions and **4 pageviews / 0 clicks** while titled "Third-party-tested
protein: which SKUs the certificate actually covers" at `/protein-pilot`, under an h1 scoped to a
merchant that is not an approved programme. It was never orphaned, never blocked, present in
sitemap.xml and llms.txt, rendering without JS. It was renamed to
`/guides/best-third-party-tested-protein-powder` on 2026-09-19 (301 from the old path) with no
change to its content. Judge the result by GoatCounter AI referrals from late October, against a
baseline of 4 views.

Run the scan before writing anything new — GSC page impressions against GoatCounter pageviews.
As of 2026-09-19 the biggest outstanding case is **dehydratorscore: 274 impressions across six
guides at positions 8-12, with 0-4 pageviews each and no measurable AI referrals at all.** Those
slugs are already query-shaped (`how-long-to-dehydrate-jalapenos`), so the protein diagnosis does
NOT explain it and a second failure mode is undiagnosed there. It had also never been announced to
Bing until the 2026-09-19 IndexNow backfill, which is a candidate but is not established.

## 2. Before opening a PR

Run these from the `moondogapps` repo (they read the local site repos):

```
python3 scripts/moondog-nojs-audit.py            # 1.1 — must be N/N readable
python3 scripts/moondog-llms-audit.py            # 1.2 — must be N/N listed
python3 scripts/moondog-affiliate-audit.py       # 1.5, 1.6 — must be "clean"
python3 scripts/moondog-site-audit.py            # 1.4 + broken links + schema
python3 scripts/orphan-audit.py                  # 1.4, against the live site
python3 scripts/moondog-extractability-audit.py  # §3
```

**Read the output, not the exit code.** And a failed read is not a zero: if a
script reports 0 pages or "no local repo", it found nothing to check — that is a
broken run, not a clean one. Both `moondog-site-audit.py` and
`moondog-extractability-audit.py` shipped exactly that failure after a directory
move, reporting a clean bill of health for a run that inspected nothing.

State in the PR description **which of these you ran and what they printed.**
"Validated CSS brace balance" is not one of these checks.

---

## 3. What makes a page citable

Four signals, measured by `moondog-extractability-audit.py`. Portfolio currently
sits at 98% named / 74% quantified / 83% sourced / 90% dated, 75% carrying all
four.

1. **Named** — the specific brand, model, or subject, in the text.
2. **Quantified** — a real number where the question is quantitative. Do not
   invent precision on a page that asks a categorical question.
3. **Sourced** — the authority, by name (FDA, USDA, NCHFP, NSF, a 510(k)
   number, a university extension). "Studies show" is not a source.
4. **Dated** — when it was checked.

**Prefer JSON-LD on every content page.** 60 content pages across the portfolio
currently have none, worst on dehydratorscore (19) and fishoilscore (9). The
whole citation thesis rests on machine-readable answers.

**The shape that survives is the named entity.** "How long to dehydrate
mushrooms", "is the Excalibur 3926TB hot enough for jerky", "baltany" — concrete
and specific. Generic and definitional pages died in the July collapse and did
not come back.

**Demand-check before writing.** Do not add per-entity permutations on a hunch;
~130 such pages produced 1,316 impressions and 9 clicks over 28 days. Use
`scripts/demand-check.py` first.

---

## 4. External citations rot — compare the final URL

A redirect to a different page is the dangerous case, not the 404: a retired
fact sheet that 302s to a topic hub still answers 200, and five pages spent
weeks citing an index instead of the source they quoted. Compare the **final**
URL, not the status code. `403` is usually a bot-block (CPSC, Honda, Harbor
Freight all do it), not breakage — verify those in a real browser before
"fixing" them.
**Check:** `citation-sweep.py <site> [<site>...]`

---

## 5. Publishing

- Each site is **its own repo**, deployed from `main` via Cloudflare Pages.
  `affiliate/` itself is not a repo — nothing there is tracked.
- **Every URL a page publishes must be live before it ships.** Two sites shipped
  404s to App Store listings that did not exist yet.
- **Cache keys:** when an asset version changes (`?v=...`), verify the HTML
  first and the versioned asset once afterwards. Polling the versioned URL first
  caches the old asset against the new markup at the edge.
- **Do not push or deploy without the owner's approval.** Commit freely —
  committing is not publishing. Then stop and say what changed.
- Check the branch before you commit. A `git add -A` on the wrong branch put a
  site fix inside an unrelated feature PR, where it stayed unshipped.

---

## 6. Tone

No visible practitioner, no invented persona, no first-person expertise claims.
These are faceless tools. The verdict and its evidence carry the page; nothing
else needs to.
