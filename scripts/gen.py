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
# Houses genuinely sold on Amazon get tagged links. Everything else stays an honest
# non-affiliate search. `amazon:true` in the data is the source of truth per-homage;
# this set is the fallback / cross-check.
AMAZON_HOUSES = {"Pagani Design", "Invicta", "Casio", "Timex", "Bulova", "Seiko",
                 "Orient", "Citizen", "Steeldive", "Cadisen", "Berny", "Addies",
                 "San Martin", "Baltany", "Sugess", "Watchdives"}

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
    "/guides/pagani-design",
    "/guides/san-martin",
    "/guides/steeldive",
    "/guides/baltany",
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
<script>document.addEventListener("click",function(e){{var a=e.target.closest&&e.target.closest("a[href*=amazon]");if(!a||!window.goatcounter||!goatcounter.count)return;try{{var k=new URL(a.href).searchParams.get("k")||"link";goatcounter.count({{path:"out/amazon/"+k.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80),title:(a.textContent||"").trim().slice(0,80),event:true}});}}catch(_){{}}}},true);</script>
</body>
</html>
"""

DISC = ('<div class="disc-bar">“Shop” links for brands sold on Amazon are affiliate links — we may earn '
        'a commission at no extra cost to you; other brands link to a plain, non-affiliate search, and many '
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


def shop_link(homage):
    """Buy link for one homage row. Tagged Amazon search for Amazon houses; honest
    non-affiliate search otherwise. Never a fake tag."""
    house, name = homage.get("house", ""), homage.get("name", "")
    q = search_query(house, name)
    on_amazon = homage.get("amazon") or house in AMAZON_HOUSES
    if homage.get("amazon") is False:
        on_amazon = False
    if on_amazon:
        href = "https://www.amazon.com/s?k=" + urllib.parse.quote(q) + "&tag=" + AMAZON_TAG
        rel, title = "sponsored nofollow noopener", ""
    else:
        href = "https://www.google.com/search?q=" + urllib.parse.quote(q)
        rel = "nofollow noopener"
        title = ' title="No affiliate program for this brand — plain search, and often cheaper bought direct"'
    return f'<a class="shop" href="{esc(href)}" rel="{rel}" target="_blank"{title}>Shop&nbsp;&rsaquo;</a>'


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
    b.append(f'<p class="lede">{n} spec-checked homages of the {esc(full)} ({esc(cues)}), ranked by how '
             f'closely they follow the original by our <a href="/rubric">published rubric</a> — with prices, '
             f'movements and honest notes so you can get the look without the {money(o.get("priceUSD"))} entry price.</p>')
    b.append('</div></div>')
    b.append(DISC)

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
                 f'<td>~{money(c.get("priceUSD"))}<span class="muted"> / {esc(c.get("wr_m","?"))}m</span></td>'
                 f'<td>{esc(c.get("movement",""))}</td>'
                 f'<td>{esc(c.get("size_mm","?"))}mm</td>'
                 f'<td>{shop_link(c)}</td>'
                 '</tr>')
    b.append('</tbody></table></div>')

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
             '<a href="/guides/steeldive">Steeldive</a> and '
             '<a href="/guides/baltany">Baltany</a>, each reviewed model by model.</p>')
    b.append('<p>Ranked by icon: <a href="/articles/best-submariner-homage-under-200">Submariner '
             'under $200</a>, <a href="/articles/best-gmt-homage">Rolex GMT</a>, '
             '<a href="/articles/best-speedmaster-homage">Speedmaster</a>, '
             '<a href="/articles/best-datejust-homage">Datejust</a>, '
             '<a href="/articles/best-daytona-homage">Daytona</a>, '
             '<a href="/articles/best-royal-oak-homage">Royal Oak</a> and '
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
    lines += ["", "## Guides",
              f"- [Are San Martin watches any good?]({SITE}/guides/san-martin): honest brand review of the mid-tier homage maker, model by model",
              f"- [Pagani Design, model by model]({SITE}/guides/pagani-design): the budget homage brand and the right model for each icon",
              f"- [Are Steeldive watches any good?]({SITE}/guides/steeldive): honest brand review of the budget dive-watch specialist, model by model",
              f"- [Baltany watches review]({SITE}/guides/baltany): honest brand review of the vintage-proportions homage maker, model by model",
              f"- [The best Rolex GMT homage]({SITE}/articles/best-gmt-homage): affordable GMT-Master II homages, ranked",
              f"- [The best Datejust homage]({SITE}/articles/best-datejust-homage): why 36mm decides it, and the three worth knowing",
              f"- [The best Daytona homage]({SITE}/articles/best-daytona-homage): meca-quartz explained, and the three worth knowing",
              f"- [The best AP Royal Oak homage]({SITE}/articles/best-royal-oak-homage): stamped vs machined tapisserie, and the two worth knowing",
              f"- [The best Seamaster homage]({SITE}/articles/best-seamaster-homage): the budget pick that keeps the original's 300m rating",
              "", "## About", f"- [Scoring rubric]({SITE}/rubric)", f"- [Homage vs replica]({SITE}/articles/homage-vs-replica)", ""]
    write("llms.txt", "\n".join(lines))


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
    print(f"generated {len(originals)} watch pages + hub + sitemap ({n} urls) + llms.txt")


if __name__ == "__main__":
    main()
