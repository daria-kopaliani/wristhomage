#!/usr/bin/env python3
"""Generate per-original homage pages + hub + sitemap + llms.txt from data/homages.js.

Each original watch (Submariner, Speedmaster, …) becomes a static page targeting
its "<watch> homage" / "watches that look like <watch>" / "affordable <watch>
alternative" queries. Content is built from the real homage dataset — brand,
price, movement, case size, water resistance, fidelity score, honest notes — so
pages are substantive, not thin doorways. The finder (index.html) is the wedge.

Vocabulary discipline (non-negotiable): "homage" ONLY. Never replica/clone/fake.

Monetization mirrors dupenote: houses sold on Amazon get a tagged affiliate search
(wristhomage-20); off-Amazon houses (Steinhart) get an honest, clearly-marked
non-affiliate search — never a fake tag. (San Martin/Baltany/Sugess/Watchdives were
verified genuinely on US Amazon 2026-08-01 and flipped to amazon:true; the honest
"often cheaper direct" note stays on any entry with direct:true.) FAQPage JSON-LD only
(Product/Offer schema deliberately omitted — it triggers GSC merchant-listing errors
on non-shop pages).

Run from repo root:  python3 scripts/gen.py
"""
import json, os, re, subprocess, html, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://wristhomage.com"
YEAR = "2026"

AMAZON_TAG = "wristhomage-20"
# SPLIT BY LINK KIND (2026-08-30). Amazon reports orders per tracking ID and nothing
# finer, so with one ID on every link this site could not answer whether pointing at the
# exact product beats pointing at a search — the question its own link audit has been
# circling since 08-12. It is answerable here now only because the 08-30 ASIN pass took
# exact links from 4 to 27 against 107 searches; before that there was no exact bucket.
# This is also the site that matters: 16 of the portfolio's 20 all-time orders are here.
AMAZON_TAG_DP = "wristhomagedp-20"
REVIEWED_HUMAN = "August 2026"   # bump when the field is re-checked
# Houses genuinely sold on Amazon get tagged links. Everything else stays an honest
# non-affiliate search. `amazon:true` in the data is the source of truth per-homage;
# this set is the fallback / cross-check.
# Houses genuinely findable on US Amazon. Re-checked by brand-level search on
# 2026-08-17 (hits in the top 10 organic results):
#   Baltany 10/10 · Cadisen 9/10 · Sugess 9/10 · Addiesdive 9/10 · Watchdives 8/10
#   San Martin 0/10 · Steeldive 1/10   <- REMOVED
#
# San Martin and Steeldive were in this set on the strength of a 2026-08-01
# brand-level check, and every row on them emitted a tagged Amazon search. Neither
# is on US Amazon now: "San Martin watch automatic" returns "1963 Watch" and Specht
# & Söhne, and "San Martin SN0113W" returns no San Martin at all. So the site's most
# clicked buy link — out/amazon/san-martin-sn043, 11 clicks in 30 days — was landing
# people on a page with none of the product on it, which is the likeliest reason 66
# affiliate clicks in August produced zero orders.
#
# Note when re-checking: these brands' Amazon titles do NOT contain model numbers,
# so a model-level search is not a valid test of presence — it returns junk even for
# houses that are stocked. Test at brand level, and beware "PAGRNE DESIGN", a
# typosquat that outranks genuine Pagani Design on its own model queries.
AMAZON_HOUSES = {"Pagani Design", "Invicta", "Casio", "Timex", "Bulova", "Seiko",
                 "Orient", "Citizen", "Cadisen", "Berny", "Addiesdive",
                 "Baltany", "Sugess", "Watchdives"}

# Only BUILT pages go in the sitemap (unbuilt URLs → GSC 404s). Add each article
# to this list as it ships.
ARTICLES = [
    "/rubric",
    "/articles/homage-vs-replica",
    "/articles/are-homage-watches-ok",
    "/articles/best-submariner-homage-under-200",
    "/articles/best-speedmaster-homage",
    "/articles/best-gmt-homage",
    "/articles/best-datejust-homage",
    "/articles/best-daytona-homage",
    "/articles/best-royal-oak-homage",
    "/articles/best-seamaster-homage",
    "/articles/best-explorer-2-homage",
    "/articles/best-nautilus-homage",
    "/articles/best-explorer-homage",
    "/articles/best-black-bay-homage",
    "/articles/best-santos-homage",
    "/guides/pagani-design",
    "/guides/san-martin",
    "/guides/steeldive",
    "/guides/baltany",
    "/guides/cadisen",
    "/guides/addiesdive",
]

# Sitemap lastmod. Derived from git: the last commit that touched the HTML file a URL
# serves IS when that page's content last changed, so lastmod stays honest without
# anyone remembering to bump a hand-maintained table. (It used to be a dict with a
# hardcoded 07-06 fallback, which silently froze 33/35 URLs at July 6 while the pages
# were edited through 08-05 — Google saw "nothing changed here" sitewide.)
# An uncommitted edit reports today, since the regenerate-then-commit flow commits next.
LASTMOD_FALLBACK = f"{YEAR}-07-06"


def url_to_file(u):
    """Map a sitemap URL to the repo-relative HTML file that serves it."""
    if u == "/":
        return "index.html"
    if u.endswith("/"):
        return u.strip("/") + "/index.html"
    return u.lstrip("/") + ".html"


def git_lastmod(u):
    rel = url_to_file(u)
    if not os.path.exists(os.path.join(ROOT, rel)):
        return LASTMOD_FALLBACK
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", rel],
                               cwd=ROOT, capture_output=True, text=True).stdout.strip()
        if dirty:
            return subprocess.run(["date", "+%Y-%m-%d"],
                                  capture_output=True, text=True).stdout.strip()
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel],
                           cwd=ROOT, capture_output=True, text=True).stdout.strip()
        return d or LASTMOD_FALLBACK
    except Exception:
        return LASTMOD_FALLBACK


def esc(s):
    return html.escape(str(s), quote=True)


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj) + '</script>'


# Inline watch-type art sprite (original line-art, no brand designs). Injected once per
# watch page so <use href="#wa-..."> resolves same-document (robust across all browsers,
# unlike external-file <use> which Safari has historically choked on).
with open(os.path.join(ROOT, "assets", "watch-art.svg")) as _f:
    SPRITE = _f.read()

# Small watch mark used in the wordmark. Inherits currentColor.
LOGO = ('<svg class="logo" viewBox="0 0 48 48" aria-hidden="true">'
        '<circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/>'
        '<path d="M20.5 7h7l-3.5 3.6z" fill="currentColor"/>'
        '<line x1="24" y1="24" x2="24" y2="14.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
        '<line x1="24" y1="24" x2="30.5" y2="27" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
        '<circle cx="24" cy="24" r="1.8" fill="currentColor"/></svg>')


def art_svg(t):
    return f'<svg class="wa" viewBox="0 0 48 48" aria-hidden="true"><use href="#wa-{esc(t)}"/></svg>'


def load_data():
    js = os.path.join(ROOT, "data", "homages.js")
    out = subprocess.check_output(
        ["node", "-e", f"global.window={{}};require({json.dumps(js)});process.stdout.write(JSON.stringify(window.HOMAGE_DATA))"])
    return json.loads(out)


HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canon}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css?v=2">
  {schema}
</head>
<body>
{sprite}
  <header class="nav"><div class="wrap">
    <a class="brand" href="/">{logo}<b>wrist</b>homage</a>
    <nav><a href="/#finder">Finder</a> <a href="/#originals">Watches</a> <a href="/rubric">How we score</a></nav>
  </div></header>
  <main class="article">
"""

FOOT = """  </main>
  <footer class="foot"><div class="wrap">
    <span>&copy; {year} wristhomage &middot; Independent watch-homage database. Not affiliated with any watch brand.</span>
    <span><a href="/disclosure">Affiliate disclosure &amp; about</a> &middot; <a href="/rubric">Scoring rubric</a> &middot; <a href="/sitemap.xml">Sitemap</a></span>
  </div></footer>
<script data-goatcounter="https://wristhomage.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
<script>document.addEventListener("click",function(e){{var a=e.target.closest&&e.target.closest("a[href*=amazon]");if(!a||!window.goatcounter||!goatcounter.count)return;try{{var u=new URL(a.href);var dp=u.pathname.match(/\/dp\/([A-Z0-9]{{10}})/);var pre="out/amazon/",k;if(dp){{pre+="dp/";k=dp[1];}}else if(u.searchParams.get("k")){{pre+="k/";k=u.searchParams.get("k");}}else{{k="link";}}goatcounter.count({{path:pre+k.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80),title:(a.textContent||"").trim().slice(0,80),event:true}});}}catch(_){{}}}},true);</script>
</body>
</html>
"""

DISC = ('<div class="disc-bar">“Shop” links for brands sold on Amazon are affiliate links: '
        '<strong>as an Amazon Associate we earn from qualifying purchases</strong>, at no extra cost '
        'to you. Other brands link to a plain, non-affiliate search, and many '
        'are cheaper bought direct. Affiliate status never affects a fidelity score. Scores follow the '
        '<a href="/rubric">published rubric</a>, not opinion. These are homages, not replicas.</div>')


def search_query(house, name):
    """Build the retailer search string from a row.

    The naive f"{house} {name} watch" leaked editorial text straight into the
    query (found 2026-08-12): parentheticals meant for readers — "PD-1664 (Chrono)",
    "SRPE control (Seiko 5 dive)" — and rows whose name repeats the brand, giving
    "Baltany Baltany Field 36". "control" is our own word for a reference watch
    that is not a homage; no shopper ever types it. Each of those makes the search
    worse than the bare model number would be.
    """
    name = re.sub(r"\s*\([^)]*\)", "", name).strip()          # drop reader-facing asides
    if house and name.lower().startswith(house.lower()):        # "Baltany Baltany Field 36"
        name = name[len(house):].strip()
    name = re.sub(r"\bcontrol\b", "", name, flags=re.I).strip()
    q = " ".join(part for part in (house, name, "watch") if part)
    return re.sub(r"\s{2,}", " ", q)


def price_cell(c):
    """Price with its provenance, where we have it.

    Until 2026-08-12 every price was an unsourced "approximate street price", and
    the audit found them understated by up to 46% against the brand's own store
    (PD-1673 listed at $110 against $157.69, PD-1685 at $130 against $189.99).
    A number nobody can check is worth little on a site whose whole claim is that
    you can check everything, so verified prices now carry where and when they
    came from. `priceFrom` marks stores that quote a range across configurations —
    the figure is the base config, hence "from".
    """
    p = money(c.get("priceUSD"))
    if not c.get("priceSource"):
        return f'~{p}'
    prefix = "from " if c.get("priceFrom") else ""
    return (f'{prefix}{p}<span class="muted src"> · {esc(c["priceSource"])} '
            f'{esc(c.get("priceDate",""))}</span>')


def shop_link(homage):
    """Buy link for one homage row. Tagged Amazon search for Amazon houses; honest
    non-affiliate search otherwise. Never a fake tag."""
    house, name = homage.get("house", ""), homage.get("name", "")
    q = search_query(house, name)
    on_amazon = homage.get("amazon") or house in AMAZON_HOUSES
    if homage.get("amazon") is False:
        on_amazon = False
    if on_amazon:
        # A VERIFIED asin beats a keyword search, and on this site that gap is the
        # single largest known revenue defect. Audited 2026-08-29/30 against live US
        # Amazon, ordered by actual clicks: 10 of the 13 most-clicked searches do not
        # surface the watch they name — 80% of the clicks. Some are wrong identifiers
        # (SN0058-G-X returns SN058G; WD16570 returns WD16760, a digit transposition),
        # but others name a real watch the SEARCH simply cannot find: SN013-G exists
        # and has ASIN B09PYXWYDZ, and the keyword query still misses it.
        # So: where an asin has been verified by hand, link the product directly and
        # skip the search entirely. Everything else keeps the search, unchanged.
        # See AFFILIATE_LINK_AUDIT.md. Do NOT fill this field from an Amazon search
        # title — an unverified asin is how one wrong identifier becomes another.
        asin = (homage.get("asin") or "").strip()
        if asin:
            href = f"https://www.amazon.com/dp/{urllib.parse.quote(asin)}?tag=" + AMAZON_TAG_DP
        else:
            href = "https://www.amazon.com/s?k=" + urllib.parse.quote(q) + "&tag=" + AMAZON_TAG
        rel, title = "sponsored nofollow noopener", ""
    elif homage.get("directUrl"):
        href = homage["directUrl"]
        rel = "nofollow noopener"
        sold_out = homage.get("availability") == "sold-out"
        label = "Check availability" if sold_out else "View product"
        title = ' title="Exact first-party product page — not an affiliate link"'
        return (f'<a class="shop" href="{esc(href)}" rel="{rel}" target="_blank"{title}>'
                f'{label}&nbsp;&rsaquo;</a>')
    else:
        href = "https://www.google.com/search?q=" + urllib.parse.quote(q)
        rel = "nofollow noopener"
        title = ' title="No affiliate program for this brand — plain search, and often cheaper bought direct"'
    return f'<a class="shop" href="{esc(href)}" rel="{rel}" target="_blank"{title}>Shop&nbsp;&rsaquo;</a>'


# --- the buying moment ----------------------------------------------------------------
# The lede names one watch — "the closest Submariner homage we rank is the Steinhart Ocean
# One 39" — and then asked the reader to go find it again in a seven-row table. The moment
# someone has been given a specific answer is the moment they will act on it, and the page
# spent it on scrolling. This puts one clear CTA for the named watch immediately under the
# verdict, using exactly the link the table row would use — a verified ASIN where one
# exists, the tagged search otherwise, and the honest non-affiliate search for houses with
# no programme, which is labelled as such rather than dressed up as a buy.
#
# DIRECT MERCHANT WOULD COME FIRST IF THERE WERE ONE. A brand's own programme pays
# multiples of Amazon's 1-4% on a 24-hour cookie. Nothing here is approved: 71 unpaid
# outbound clicks on this site are the argument for applying, and the four Awin
# applications filed 2026-08-30 are all still pending. Promoting an untagged direct link
# above the tagged Amazon one today would move clicks off the only link that earns.
def _on_amazon(h):
    if h.get("amazon") is False:
        return False
    return bool(h.get("amazon") or h.get("house", "") in AMAZON_HOUSES)


def top_cta(homage, siblings=()):
    """One CTA for the watch the lede just named, or "" when there is nothing to link.

    On 12 of the 21 original pages the highest-fidelity homage is NOT on Amazon, so the
    most prominent link on the page earns nothing. The fix is NOT to point the CTA at a
    lower-scoring watch that happens to pay — affiliate status not moving a fidelity score
    is the promise this site is built on, and the lede has already named the winner. It is
    to add a SECOND, plainly labelled line for the closest homage you can actually buy on
    Amazon, which is a question a reader in front of an unbuyable recommendation is
    already asking."""
    if not homage:
        return ""
    house, name = homage.get("house", ""), homage.get("name", "")
    on_amazon = _on_amazon(homage)
    q = search_query(house, name)
    if on_amazon:
        asin = (homage.get("asin") or "").strip()
        href = (f"https://www.amazon.com/dp/{urllib.parse.quote(asin)}?tag=" + AMAZON_TAG_DP) if asin \
            else ("https://www.amazon.com/s?k=" + urllib.parse.quote(q) + "&tag=" + AMAZON_TAG)
        label = (f"Check the exact {esc(name)} on Amazon" if asin
                 else f"See current {esc(name)} prices on Amazon")
        return (f'<p class="cta"><a class="buy" href="{esc(href)}" rel="sponsored nofollow noopener" '
                f'target="_blank">{label} &rsaquo;</a></p>')
    # No affiliate programme for this house. Say so; the click is still worth having,
    # and pretending otherwise is how a verdict starts looking bought.
    if homage.get("directUrl"):
        href = homage["directUrl"]
        sold_out = homage.get("availability") == "sold-out"
        label = (f"Check official availability for the {esc(name)}" if sold_out
                 else f"View the exact {esc(name)} at {esc(house)}")
        detail = ("Official page currently shows every variant sold out. " if sold_out else "")
        out = (f'<p class="cta"><a class="buy" href="{esc(href)}" rel="nofollow noopener" '
               f'target="_blank">{label} &rsaquo;</a> '
               f'<span class="muted">{detail}Exact first-party link; not affiliated.</span></p>')
    else:
        href = "https://www.google.com/search?q=" + urllib.parse.quote(q)
        out = (f'<p class="cta"><a class="buy" href="{esc(href)}" rel="nofollow noopener" '
               f'target="_blank">Find the {esc(name)} &rsaquo;</a> '
               f'<span class="muted">No affiliate programme for {esc(house)} — plain search, '
               f'and often cheaper bought direct.</span></p>')
    alt = max((h for h in siblings
               if h is not homage and _on_amazon(h) and h.get("fidelity") is not None),
              key=lambda h: h["fidelity"], default=None)
    if alt:
        aq = search_query(alt.get("house", ""), alt.get("name", ""))
        asin = (alt.get("asin") or "").strip()
        ahref = (f"https://www.amazon.com/dp/{urllib.parse.quote(asin)}?tag=" + AMAZON_TAG_DP) if asin \
            else ("https://www.amazon.com/s?k=" + urllib.parse.quote(aq) + "&tag=" + AMAZON_TAG)
        out += (f'<p class="cta-alt muted">Closest one you can buy on Amazon: '
                f'<a href="{esc(ahref)}" rel="sponsored nofollow noopener" target="_blank">'
                f'{esc(alt.get("house",""))} {esc(alt.get("name",""))} &rsaquo;</a> '
                f'&mdash; fidelity {esc(alt.get("fidelity"))}/100 at about {money(alt.get("priceUSD"))}.</p>')
    return out


def money(n):
    try:
        return f"${int(round(float(n))):,}"
    except Exception:
        return "—"


def original_page(o):
    house, name = o.get("house", ""), o.get("name", "")
    homages = sorted(o.get("homages", []), key=lambda c: c.get("fidelity", 0), reverse=True)
    n = len(homages)
    full = f"{house} {name}"
    title = f"{n} best {name} homages ({YEAR}) — affordable {esc(house)} {name} alternatives | wristhomage"
    desc = (f"{n} real, spec-checked homages of the {full}, ranked by fidelity — price, movement, "
            f"case size and honest notes so you can get the look without the {money(o.get('priceUSD'))} price.")
    canon = f"{SITE}/watches/{o['id']}"
    cues = ", ".join(o.get("cues", [])[:4])

    b = []
    b.append(f'<div class="crumbs"><a href="/">Home</a> › <a href="/#originals">Watches</a> › {esc(name)} homages</div>')
    b.append(f'<div class="watch-hero">{art_svg(o.get("type","dive"))}<div class="watch-hero-txt">')
    b.append(f'<h1>{esc(name)} homages — the affordable {esc(full)} alternatives</h1>')
    # ANSWER FIRST, then the description. The lede used to open by describing the
    # page — "N spec-checked homages of the X, ranked by..." — which tells a reader
    # what they are looking at but gives a model nothing to lift. An assistant asked
    # "what is the best Royal Oak homage" had to parse the table to answer.
    # ledmaskscore's best-of guide already does this properly ("the best LED face
    # mask we rank is Omnilux Contour Face — it measured 26.7 mW/cm²...") and it is
    # the most extractable page in the portfolio. AI referrals are ~70% of this
    # site's traffic against Google's 1%, so being liftable IS the distribution.
    top = max((h for h in (o.get("homages") or []) if h.get("fidelity") is not None),
              key=lambda h: h["fidelity"], default=None)
    if top:
        b.append(f'<p class="lede"><strong>The closest {esc(full)} homage we rank is the '
                 f'{esc(top.get("house",""))} {esc(top.get("name",""))}</strong> — it scores '
                 f'{top["fidelity"]}/100 on our <a href="/rubric">published fidelity rubric</a> at about '
                 f'{money(top.get("priceUSD"))}, against {money(o.get("priceUSD"))} for the original. '
                 f'Below: all {n} spec-checked homages ({esc(cues)}), closest first, with prices, '
                 f'movements and honest notes.</p>')
    else:
        b.append(f'<p class="lede">{n} spec-checked homages of the {esc(full)} ({esc(cues)}), ranked by how '
                 f'closely they follow the original by our <a href="/rubric">published rubric</a> — with prices, '
                 f'movements and honest notes so you can get the look without the {money(o.get("priceUSD"))} entry price.</p>')
    # A visible review date. Models and search indexes both weight currency, and the
    # item pages carried none while the guides did.
    b.append(f'<p class="muted" style="margin-top:-6px">Last reviewed {REVIEWED_HUMAN}.</p>')
    b.append('</div></div>')
    b.append(DISC)
    b.append(top_cta(top, homages))

    b.append(f'<p>The {esc(full)} (ref {esc(o.get("ref","—"))}) is a {esc(o.get("size_mm","?"))}mm '
             f'{esc(o.get("type",""))} watch, {esc(o.get("wr_m","?"))}m water resistant, running a '
             f'{esc(o.get("movement",""))}. At about {money(o.get("priceUSD"))} it is one of the most homaged '
             f'designs in the hobby — here is the honest field, closest first.</p>')

    b.append(f'<h2>The {n} best {esc(name)} homages, ranked by fidelity</h2>')
    b.append('<div class="tablewrap"><table>')
    b.append('<thead><tr><th>Homage</th><th>Brand</th><th>Fidelity</th><th>Price</th><th>Movement</th><th>Size</th><th>Shop</th></tr></thead><tbody>')
    for c in homages:
        note = c.get("note", "")
        direct = ' <span class="muted">· often cheaper direct</span>' if c.get("direct") else ""
        b.append('<tr>'
                 f'<td><strong>{esc(c.get("name"))}</strong><div class="note">{esc(note)}{direct}</div></td>'
                 f'<td>{esc(c.get("house",""))}</td>'
                 f'<td><b>{esc(c.get("fidelity","–"))}</b></td>'
                 f'<td>{price_cell(c)}<span class="muted"> / {esc(c.get("wr_m","?"))}m</span></td>'
                 f'<td>{esc(c.get("movement",""))}</td>'
                 f'<td>{esc(c.get("size_mm","?"))}mm</td>'
                 f'<td>{shop_link(c)}</td>'
                 '</tr>')
    b.append('</tbody></table></div>')
    b.append('<p class="muted">Prices are approximate and drift — check the listing before you buy. Where a price shows a source and date it was read from that seller on that day; \u201cfrom\u201d means the seller quotes a range across configurations and this is the base one. Amazon pricing for these brands often differs from the brand\u2019s own store, in both directions.</p>')

    # picks callout
    picks = []
    closest = homages[0] if homages else None
    budget = min(homages, key=lambda c: c.get("priceUSD", 1e9)) if homages else None
    if closest:
        picks.append(f'<strong>Closest to the original:</strong> {esc(closest["name"])} ({esc(closest["house"])}), fidelity {esc(closest.get("fidelity"))}.')
    if budget and budget is not closest:
        picks.append(f'<strong>Best on a budget:</strong> {esc(budget["name"])} at ~{money(budget.get("priceUSD"))}.')
    if picks:
        b.append('<div class="callout">' + ' '.join(picks) + '</div>')

    # how scoring works + finder
    b.append('<h2>How we scored these</h2>')
    b.append(f'<p>Fidelity is a design-closeness score, not a quality score — dial and handset, bezel, case '
             f'shape and proportions, movement class, and spec parity, per the <a href="/rubric">published '
             f'rubric</a>. Open the <a href="/#finder">homage finder</a> to filter every watch by budget, case '
             f'size, movement and original side by side.</p>')

    # FAQ (visible + JSON-LD)
    faq = [
        (f"What is the best {name} homage?",
         f"By our rubric the closest is the {closest['name']} from {closest['house']} (fidelity {closest.get('fidelity')}). "
         f"On a budget, the {budget['name']} at about {money(budget.get('priceUSD'))} gets you most of the look for the least money."
         if closest and budget else f"See the ranked table above for the current field."),
        (f"Are {name} homages legal?",
         "Yes. An homage borrows design language — proportions, dial layout, bezel style — without carrying another "
         "brand's name or logo. That is legal and openly traded; Timex, Bulova and Steinhart all sell homages. We list "
         "only homages here, never counterfeits."),
        (f"How much can you save versus a {full}?",
         f"The original is about {money(o.get('priceUSD'))}. Homages here run from roughly {money(budget.get('priceUSD')) if budget else '—'} "
         f"up, so you keep the design cues and lose most of the price."),
    ]
    b.append('<h2>FAQ</h2>')
    for q, a in faq:
        b.append(f'<p><strong>{esc(q)}</strong><br>{esc(a)}</p>')

    # further reading — inbound links so hand-written guides/articles are never crawl orphans
    further = []
    houses = {c.get("house") for c in homages}
    if o["id"] in ("rolex-gmt-master-ii", "rolex-explorer-ii"):
        further.append('<a href="/articles/best-gmt-homage">The best Rolex GMT homage, ranked</a>')
    if o["id"] == "rolex-explorer-ii":
        further.append('<a href="/articles/best-explorer-2-homage">The best Explorer II homage, ranked</a>')
    if o["id"] == "patek-nautilus":
        further.append('<a href="/articles/best-nautilus-homage">The best Nautilus homage, ranked</a>')
    if o["id"] == "rolex-explorer":
        further.append('<a href="/articles/best-explorer-homage">The best Explorer homage, ranked</a>')
    if o["id"] == "tudor-black-bay":
        further.append('<a href="/articles/best-black-bay-homage">The best Black Bay 58 homage, ranked</a>')
    if o["id"] == "cartier-santos":
        further.append('<a href="/articles/best-santos-homage">The best Santos homage, ranked</a>')
    if o["id"] == "rolex-submariner":
        further.append('<a href="/articles/best-submariner-homage-under-200">The best Submariner homage under $200</a>')
    if o["id"] == "omega-speedmaster":
        further.append('<a href="/articles/best-speedmaster-homage">The best Speedmaster homage</a>')
    if o["id"] == "rolex-datejust":
        further.append('<a href="/articles/best-datejust-homage">The best Datejust homage, ranked</a>')
    if o["id"] == "rolex-daytona":
        further.append('<a href="/articles/best-daytona-homage">The best Daytona homage, ranked</a>')
    if o["id"] == "ap-royal-oak":
        further.append('<a href="/articles/best-royal-oak-homage">The best Royal Oak homage, ranked</a>')
    if o["id"] == "omega-seamaster-300m":
        further.append('<a href="/articles/best-seamaster-homage">The best Seamaster homage, ranked</a>')
    if "San Martin" in houses:
        further.append('<a href="/guides/san-martin">Are San Martin watches any good?</a>')
    if "Pagani Design" in houses:
        further.append('<a href="/guides/pagani-design">Pagani Design, model by model</a>')
    if "Steeldive" in houses:
        further.append('<a href="/guides/steeldive">Are Steeldive watches any good?</a>')
    if "Baltany" in houses:
        further.append('<a href="/guides/baltany">Baltany watches review</a>')
    if "Cadisen" in houses:
        further.append('<a href="/guides/cadisen">Cadisen watches review</a>')
    if "Addiesdive" in houses:
        further.append('<a href="/guides/addiesdive">Addiesdive watches review</a>')
    if further:
        b.append('<p><strong>Further reading:</strong> ' + ' · '.join(further) + '</p>')

    b.append('<p class="crumbs" style="padding-top:24px"><a href="/#finder">← Find an homage</a> · <a href="/#originals">All watches →</a></p>')

    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q,
                              "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    schema = ld(faq_ld)
    return HEAD.format(title=esc(title), desc=esc(desc), canon=canon, schema=schema, sprite=SPRITE, logo=LOGO) + "\n".join(b) + "\n" + FOOT.format(year=YEAR)


ONES = ("zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve")


def _median(xs):
    s = sorted(xs)
    m = len(s) // 2
    return s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2


def hub_stats(originals):
    """Every figure quoted in the hub prose, computed from the dataset.

    The overview paragraphs and FAQ below are the section root's substance — a thin
    /watches/ suppressed crawl of the whole section once already (fixed 2026-08-05).
    Deriving the numbers instead of hardcoding them keeps that prose true as the data
    moves, so the fix can't rot into a wrong-but-confident page.
    """
    hs = [h for o in originals for h in o.get("homages", [])]
    prices = [h["priceUSD"] for h in hs]
    fids = [h["fidelity"] for h in hs]
    houses = {}
    for h in hs:
        houses[h["house"]] = houses.get(h["house"], 0) + 1
    top = sorted(houses.items(), key=lambda kv: (-kv[1], kv[0]))
    best = max(hs, key=lambda h: h["fidelity"])
    best_orig = next(o for o in originals if best in o.get("homages", []))
    sub = next((o for o in originals if o["id"] == "rolex-submariner"), None)
    sub_p = [h["priceUSD"] for h in sub["homages"]] if sub else []
    return {
        "n_orig": len(originals), "n_hom": len(hs),
        "p_min": min(prices), "p_max": max(prices), "p_med": int(_median(prices)),
        "under150": sum(1 for p in prices if p < 150),
        "over400": sum(1 for p in prices if p > 400),
        "autos": sum(1 for h in hs if re.search(r"Automatic", h["movement"], re.I)),
        "f_min": min(fids), "f_max": max(fids),
        "n_top": sum(1 for f in fids if f >= 90),
        "best": best, "best_orig": best_orig, "top_houses": top,
        "amazon": sum(1 for h in hs if h.get("amazon")),
        "orig_med_k": int(round(_median([o["priceUSD"] for o in originals]) / 1000)),
        "sub_n": len(sub_p), "sub_min": min(sub_p) if sub_p else 0,
        "sub_max": max(sub_p) if sub_p else 0,
    }


def hub_faq(s):
    """Q/A pairs shared by the visible 'Common questions' section and the FAQPage JSON-LD."""
    h3 = ", ".join(f"<strong>{esc(n)}</strong> ({c} entries)" if i == 0 else
                   (f"<strong>{esc(n)}</strong> and <strong>{esc(s['top_houses'][i+1][0])}</strong> ({c} each)"
                    if i == 2 else f"<strong>{esc(n)}</strong> ({c})")
                   for i, (n, c) in enumerate(s["top_houses"][:3]))
    return [
        ("What counts as a watch homage, and what doesn't?",
         "A homage is a watch openly sold under its own brand that borrows the design language of an "
         "icon. It is not a replica: nothing in this database carries another brand's name, logo or "
         "reference, and counterfeit product is never listed.",
         "<strong>What counts as a homage, and what doesn't?</strong> A homage is a watch openly sold "
         "under its own brand that borrows the design language of an icon — the case shape, the bezel, "
         "the dial furniture. It is not a replica: nothing in this database carries another brand's "
         "name, logo or reference, and we never list counterfeit product. The line matters legally and "
         "morally, and it's why houses like Steinhart, San Martin and Pagani Design can sell these "
         "watches in the open."),
        ("How are the fidelity scores set?",
         f"Five weighted checks from the published rubric: dial and handset, bezel, case shape and "
         f"proportions, movement class, and spec parity. Scores run {s['f_min']}–{s['f_max']} in the "
         f"current database; only {ONES[s['n_top']]} watch clears 90.",
         '<strong>How are the fidelity scores set?</strong> Five weighted checks from the '
         '<a href="/rubric">published rubric</a>: dial and handset, bezel, case shape and proportions, '
         'movement class, and spec parity (size, water resistance, crystal). Each homage is scored '
         'against its specific original, not against an abstract ideal — which is why a $95 watch can '
         'outscore a $500 one when it simply looks closer.'),
        ("How much do watch homages cost?",
         f"The {s['n_hom']} homages in the database run ${s['p_min']} to ${s['p_max']} street with a "
         f"median around ${s['p_med']}; {s['under150']} come in under $150. Most ({s['autos']} of "
         f"{s['n_hom']}) are automatics on Seiko NH35/NH34-class or Swiss Sellita/ETA movements.",
         f"<strong>Why do most entries cost $100–$400 when the originals cost five figures?</strong> "
         f"Because that's where the homage market actually lives. The median original in the database "
         f"lists around {ONES[s['orig_med_k']]} thousand dollars; the median homage is ${s['p_med']}. "
         f"The gap pays for the crown on the dial, the in-house movement and the waiting list — not, "
         f"for the most part, for timekeeping. A Seiko NH35 or Sellita SW200 in a well-machined case "
         f"keeps time within seconds a day."),
        ("Which type should a first-time homage buyer start with?",
         f"Dive watches are the deepest field — the Submariner alone has {ONES[s['sub_n']]} ranked "
         f"homages from ${s['sub_min']} to ${s['sub_max']}. Each original's page ranks its field by "
         f"fidelity, so the shortlist is already made.",
         f"<strong>Which type should a first-time buyer start with?</strong> Dive watches are the "
         f"deepest field here (the Submariner alone has {ONES[s['sub_n']]} ranked homages, from "
         f"${s['sub_min']} to ${s['sub_max']}) and the most forgiving to wear. If a dressier profile "
         f"fits better, the Tank and Santos fields cover quartz and automatic options under $300. "
         f"Every original page ranks its field by fidelity, so the shortlist is already made."),
    ], h3


def hub_page(originals):
    title = f"Watch homage database — {len(originals)} icons, ranked homages | wristhomage"
    desc = ("A spec-rich, filterable database of watch homages — Submariner, Speedmaster, Datejust and more, "
            "each with real homages ranked by fidelity, price, movement and case size.")
    canon = f"{SITE}/watches/"
    s = hub_stats(originals)
    faq, houses_txt = hub_faq(s)
    b = [f'<div class="crumbs"><a href="/">Home</a> › Watches</div>',
         '<h1>Watch homage database</h1>',
         '<p class="lede">Every iconic original and its honest field of homages, ranked by fidelity to the '
         '<a href="/rubric">published rubric</a>. Pick a watch to see prices, movements and where to buy.</p>',
         f'<p>The database currently covers <strong>{s["n_orig"]} originals and {s["n_hom"]} homages</strong>, '
         f'every one a real, currently-sold product. Street prices run from <strong>${s["p_min"]} to '
         f'${s["p_max"]}</strong> with a median around <strong>${s["p_med"]}</strong> — {s["under150"]} of the '
         f'{s["n_hom"]} come in under $150, and only {ONES[s["over400"]]} cross $400. The overwhelming majority '
         f'are proper automatics ({s["autos"]} of {s["n_hom"]}, mostly Seiko NH35/NH34-class or Swiss '
         f'Sellita/ETA), with a handful of meca-quartz chronographs and hand-wound mechanicals where that\'s '
         f'what the segment actually sells.</p>',
         f'<p>Fidelity scores range from {s["f_min"]} to {s["f_max"]}. The scale is deliberately hard to max '
         f'out: a score in the 80s means the watch reads unmistakably like its inspiration on the wrist, and '
         f'only {ONES[s["n_top"]]} watch in the database — {esc(s["best"]["house"])}\'s '
         f'{esc(s["best"]["name"])}, against the {esc(s["best_orig"]["name"])} — clears 90. The score measures '
         f'design closeness only; it says nothing about build quality, and it is never a claim that anything '
         f'is a copy. Houses that show up most: {houses_txt}. Nearly the whole field ({s["amazon"]} of '
         f'{s["n_hom"]}) is carried on Amazon; where a house sells cheaper direct, the entry says so.</p>',
         '<div class="tablewrap"><table><thead><tr><th>Original</th><th>Brand</th><th>Type</th><th>Homages</th></tr></thead><tbody>']
    for o in sorted(originals, key=lambda x: x["house"] + x["name"]):
        b.append(f'<tr><td class="row-nm"><span class="row-art">{art_svg(o.get("type","dive"))}</span>'
                 f'<strong><a href="/watches/{esc(o["id"])}">{esc(o["name"])} homages</a></strong></td>'
                 f'<td>{esc(o["house"])}</td><td>{esc(o.get("type",""))}</td><td>{len(o.get("homages",[]))}</td></tr>')
    b.append('</tbody></table></div>')
    # The hub is the natural index for the hand-written pages: without these the brand
    # reviews and rankings are only reachable from whichever watch pages happen to carry
    # the house, which leaves new guides sitting as crawl islands until those index.
    b.append('<h2>Brand reviews and rankings</h2>')
    b.append('<p>The table above scores individual watches. One level up, the houses that build '
             'them: <a href="/guides/san-martin">San Martin</a>, '
             '<a href="/guides/pagani-design">Pagani Design</a>, '
             '<a href="/guides/steeldive">Steeldive</a>, '
             '<a href="/guides/baltany">Baltany</a>, '
             '<a href="/guides/cadisen">Cadisen</a> and '
             '<a href="/guides/addiesdive">Addiesdive</a>, each reviewed model by model.</p>')
    b.append('<p>Ranked by icon: <a href="/articles/best-submariner-homage-under-200">Submariner '
             'under $200</a>, <a href="/articles/best-gmt-homage">Rolex GMT</a>, '
             '<a href="/articles/best-explorer-2-homage">Explorer II</a>, '
             '<a href="/articles/best-speedmaster-homage">Speedmaster</a>, '
             '<a href="/articles/best-datejust-homage">Datejust</a>, '
             '<a href="/articles/best-daytona-homage">Daytona</a>, '
             '<a href="/articles/best-royal-oak-homage">Royal Oak</a>, '
             '<a href="/articles/best-nautilus-homage">Nautilus</a>, '
             '<a href="/articles/best-santos-homage">Santos</a> and '
             '<a href="/articles/best-seamaster-homage">Seamaster</a>. If you are still deciding '
             'whether to buy one at all, start with '
             '<a href="/articles/are-homage-watches-ok">are homage watches OK?</a> and '
             '<a href="/articles/homage-vs-replica">homage vs replica</a>.</p>')
    b.append('<h2>Common questions</h2>')
    for _q, _a, prose in faq:
        b.append(f'<p>{prose}</p>')
    coll = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Watch homage database", "url": canon}
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q,
                              "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a, _p in faq]}
    schema = ld(coll) + "\n  " + ld(faq_ld)
    return HEAD.format(title=esc(title), desc=esc(desc), canon=canon, schema=schema, sprite=SPRITE, logo=LOGO) + "\n".join(b) + "\n" + FOOT.format(year=YEAR)


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)


def sitemap_urls(originals):
    urls = ["/", "/watches/", "/rubric", "/disclosure"]
    urls += [f"/watches/{o['id']}" for o in originals]
    urls += ARTICLES
    seen, ordered = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def sitemap(originals, lastmods):
    out = []
    for u in sitemap_urls(originals):
        out.append(f"  <url><loc>{SITE}{u}</loc><lastmod>{lastmods[u]}</lastmod></url>")
    doc = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(out) + "\n</urlset>\n")
    write("sitemap.xml", doc)
    return len(out)


def llms(originals):
    lines = ["# wristhomage", "",
             "> Independent, spec-rich database of watch homages — affordable watches that pay homage to "
             "iconic designs (Submariner, Speedmaster, Datejust and more), each ranked by a published fidelity rubric.",
             "", "## Watches"]
    for o in sorted(originals, key=lambda x: x["house"] + x["name"]):
        lines.append(f"- [{o['name']} homages]({SITE}/watches/{o['id']}): {len(o.get('homages',[]))} ranked homages of the {o['house']} {o['name']}")
    # The Guides block used to be a hardcoded list maintained separately from ARTICLES,
    # which the sitemap is built from — so it drifted. On 2026-08-28 four live pages were
    # absent from llms.txt: /disclosure, /articles/are-homage-watches-ok,
    # /articles/best-submariner-homage-under-200 and /articles/best-speedmaster-homage.
    # The last two are exactly the shape that earns here — best-datejust-homage and
    # best-royal-oak-homage are among this site's most-visited pages — and llms.txt is
    # the first thing an AI crawler reads. AI sends this site 567 visits a month against
    # Google's 5, so a page missing here is missing from the channel that pays.
    BLURBS = {
        "/guides/san-martin": "honest brand review of the mid-tier homage maker, model by model",
        "/guides/pagani-design": "the budget homage brand and the right model for each icon",
        "/guides/steeldive": "honest brand review of the budget dive-watch specialist, model by model",
        "/guides/baltany": "honest brand review of the vintage-proportions homage maker, model by model",
        "/guides/cadisen": "honest brand review of the spec-per-dollar budget brand, model by model",
        "/guides/addiesdive": "honest brand review of the $79-$150 brand: which models are quartz, and what the codes mean",
        "/articles/best-gmt-homage": "affordable GMT-Master II homages, ranked",
        "/articles/best-explorer-2-homage": "polar dials and freccione hands, ranked",
        "/articles/best-nautilus-homage": "the porthole field, verified and ranked",
        "/articles/best-santos-homage": "the square-bezel field, verified and ranked",
        "/articles/best-datejust-homage": "why 36mm decides it, and the three worth knowing",
        "/articles/best-daytona-homage": "meca-quartz explained, and the three worth knowing",
        "/articles/best-royal-oak-homage": "stamped vs machined tapisserie, and the two worth knowing",
        "/articles/best-seamaster-homage": "the budget pick that keeps the original's 300m rating",
        "/articles/best-explorer-homage": "why 36mm is the whole argument, and which picks are in stock",
        "/articles/best-black-bay-homage": "snowflake hands, and why one popular pick is actually a BB54",
    }
    ABOUT = {"/rubric", "/articles/homage-vs-replica", "/disclosure"}

    def _meta(path):
        """(title, description) from the page itself, for entries with no blurb."""
        for cand in (path.lstrip("/") + ".html", path.lstrip("/") + "/index.html"):
            f = os.path.join(ROOT, cand)
            if os.path.exists(f):
                h = open(f, encoding="utf-8").read()
                t = re.search(r"<title>(.*?)</title>", h, re.S)
                d = re.search(r'<meta\s+name="description"\s+content="(.*?)"', h, re.S)
                title = html.unescape(t.group(1)).split(" — ")[0].strip() if t else None
                desc = html.unescape(d.group(1)).strip() if d else None
                if desc and len(desc) > 150:
                    desc = desc[:147].rsplit(" ", 1)[0] + "..."
                return title, desc
        return None, None

    lines += ["", "## Guides"]
    for a in ARTICLES:
        if a in ABOUT:
            continue
        title, desc = _meta(a)
        blurb = BLURBS.get(a) or desc
        label = title or a.rsplit("/", 1)[-1].replace("-", " ")
        lines.append(f"- [{label}]({SITE}{a})" + (f": {blurb}" if blurb else ""))

    lines += ["", "## About",
              f"- [Scoring rubric]({SITE}/rubric)",
              f"- [Homage vs replica]({SITE}/articles/homage-vs-replica)",
              f"- [Methodology & affiliate disclosure]({SITE}/disclosure)", ""]

    body = "\n".join(lines)
    # Same contract the sitemap keeps: never publish a map that omits a live page.
    absent = sorted(a for a in ARTICLES + ["/disclosure"] if f"{SITE}{a})" not in body)
    if absent:
        raise SystemExit("gen.py: llms.txt would omit these live pages:\n  " + "\n  ".join(absent))
    write("llms.txt", body)


def homepage_ssr(originals):
    """Server-render the finder into index.html, and describe it as an ItemList.

    The homepage's whole substance — every homage, ranked — was drawn by finder.js
    into #cards / #icons-list, so anything that does not run JavaScript saw the
    literal string "Loading the index…" and nothing else. That is the entire value
    of the site invisible to AI crawlers, on the one property that has earned.
    Sibling score sites got this treatment on 2026-07-29; wristhomage never did.

    finder.js overwrites both containers' innerHTML on load, so this is pure
    progressive enhancement — real users see no change. Idempotent: the markers
    let it be re-run on every generate.
    """
    ranked = sorted(
        ((h, o) for o in originals for h in o.get("homages", [])),
        key=lambda t: (-(t[0].get("fidelity") or 0), t[0].get("priceUSD") or 0))

    cards = []
    for h, o in ranked:
        price = f"${h['priceUSD']:,}" if h.get("priceUSD") else "price n/a"
        cards.append(
            f'<article class="eh-card"><h3>{esc(h["house"])} {esc(h["name"])}</h3>'
            f'<p>Homage to the {esc(o["house"])} {esc(o["name"])}'
            f'{" (" + esc(o["ref"]) + ")" if o.get("ref") else ""}. '
            f'Fidelity {h.get("fidelity","—")}/100 on the published rubric. '
            f'{price}{", " + str(h["size_mm"]) + "mm" if h.get("size_mm") else ""}'
            f'{", " + str(h["wr_m"]) + "m WR" if h.get("wr_m") else ""}'
            f'{", " + esc(h["movement"]) if h.get("movement") else ""}.'
            f'{" " + esc(h["note"]) if h.get("note") else ""}</p></article>')

    icons = [f'<article class="eh-ix"><h3><a href="/watches/{esc(o["id"])}">'
             f'{esc(o["house"])} {esc(o["name"])}</a></h3>'
             f'<p>{len(o.get("homages", []))} ranked homages'
             f'{" · " + esc(o["ref"]) if o.get("ref") else ""}'
             f'{" · ~$" + format(o["priceUSD"], ",") + " retail" if o.get("priceUSD") else ""}.</p>'
             f'</article>' for o in originals]

    # ItemList: the ranked index itself, machine-readable. Position order matches
    # the rendered ranking so a citing engine can quote "ranked Nth" honestly.
    #
    # Every entry carries the URL of the page that covers it. Without a url the
    # entries are bare product names beside a price, and Google reads that as
    # Product markup missing offers/review/aggregateRating — a critical Product
    # snippets error. That is not hypothetical: it fired on canningscore and
    # generatorscore on 2026-08-17 and the URL Inspection API confirmed the same
    # ItemList shape as the cause on all eight score sites. This page had the
    # stronger version of the signal (name AND price, still no url). The site sells
    # nothing itself, so offers/aggregateRating would be a lie; pointing each entry
    # at our own analysis is the honest fix and matches what gen.py already does
    # by refusing to emit Product/Offer schema at all.
    item_list = ld({
        "@context": "https://schema.org", "@type": "ItemList",
        "name": "The Watch Homage Index",
        "description": ("Watch homages ranked by a published 100-point fidelity rubric "
                        "measuring design closeness to a specific original."),
        "numberOfItems": len(ranked),
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1,
             "name": f"{h['house']} {h['name']}",
             "url": f"{SITE}/watches/{o['id']}",
             "description": (f"Homage to the {o['house']} {o['name']}; "
                             f"fidelity {h.get('fidelity','n/a')}/100"
                             + (f"; ${h['priceUSD']:,}" if h.get("priceUSD") else ""))}
            for i, (h, o) in enumerate(ranked)],
    })

    path = os.path.join(ROOT, "index.html")
    s = open(path, encoding="utf-8").read()
    # #count is a separate node from #cards, so it kept saying "Loading the index…"
    # to anything without JS — a misleading sentence sitting right above the data,
    # and exactly the kind of line an engine might quote. finder.js rewrites it.
    s = re.sub(r'(<p class="eh-count" id="count">).*?(</p>)',
               lambda m: (m.group(1) + f"<strong>{len(ranked)}</strong> watches ranked by "
                          f"fidelity across <strong>{len(originals)}</strong> icons." + m.group(2)),
               s, count=1, flags=re.S)
    for cid, body in (("cards", "\n".join(cards)), ("icons-list", "\n".join(icons))):
        pat = re.compile(r'(<div class="[^"]*" id="' + cid + r'">).*?(</div>)', re.S)
        new, n = pat.subn(lambda m: m.group(1) + "<!--SSR-->" + body + m.group(2), s, count=1)
        if not n:
            raise SystemExit(f"homepage_ssr: no #{cid} container in index.html")
        s = new
    # Drop any ItemList block we wrote before re-adding, so repeat runs don't stack
    # them. Must tolerate json.dumps' spacing ("@type": "ItemList") — matching the
    # compact form silently never fired, and the blocks accumulated on every run.
    s = re.sub(r'<script type="application/ld\+json">(?:(?!</script>).)*?"@type":\s*"ItemList".*?</script>\s*',
               "", s, flags=re.S)
    s = s.replace("</head>", item_list + "\n</head>", 1)
    open(path, "w", encoding="utf-8").write(s)
    return len(ranked), len(icons)


def main():
    data = load_data()
    originals = data["originals"]
    # Snapshot lastmod BEFORE writing anything: the writes below would otherwise dirty
    # every generated page and make git_lastmod report today for all of them.
    lastmods = {u: git_lastmod(u) for u in sitemap_urls(originals)}
    for o in originals:
        write(f"watches/{o['id']}.html", original_page(o))
    write("watches/index.html", hub_page(originals))
    n = sitemap(originals, lastmods)
    llms(originals)
    nh, ni = homepage_ssr(originals)
    print(f"generated {len(originals)} watch pages + hub + sitemap ({n} urls) + llms.txt")
    print(f"homepage SSR: {nh} homage cards + {ni} icon rows + ItemList({nh})")


if __name__ == "__main__":
    main()
