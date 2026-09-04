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

Money facts, so priorities are legible: across all tags to date, 312 clicks →
28 items → ~$27 commission. The highest earner per click is `ledmaskscore`
($0.33) because its AOV is $192, *despite* a 1.26% commission rate. Volume is
not the constraint; verifiability and average order value are.

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
