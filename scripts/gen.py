#!/usr/bin/env python3
"""Generate per-original homage pages + hub + sitemap + llms.txt from data/homages.js.

Each original watch (Submariner, Speedmaster, …) becomes a static page targeting
its "<watch> homage" / "watches that look like <watch>" / "affordable <watch>
alternative" queries. Content is built from the real homage dataset — brand,
price, movement, case size, water resistance, fidelity score, honest notes — so
pages are substantive, not thin doorways. The finder (index.html) is the wedge.

Vocabulary discipline (non-negotiable): "homage" ONLY. Never replica/clone/fake.

Monetization mirrors dupenote: houses sold on Amazon get a tagged affiliate search
(wristhomage-20); off-Amazon houses (Steinhart, San Martin, Sugess, Baltany) get an
honest, clearly-marked non-affiliate search — never a fake tag. FAQPage JSON-LD only
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
                 "Orient", "Citizen", "Steeldive", "Cadisen", "Berny", "Addies"}

# Only BUILT pages go in the sitemap (unbuilt URLs → GSC 404s). Add each article
# to this list as it ships.
ARTICLES = [
    "/rubric",
    "/articles/homage-vs-replica",
    "/articles/are-homage-watches-ok",
]


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
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
</body>
</html>
"""

DISC = ('<div class="disc-bar">“Shop” links for brands sold on Amazon are affiliate links — we may earn '
        'a commission at no extra cost to you; other brands link to a plain, non-affiliate search, and many '
        'are cheaper bought direct. Affiliate status never affects a fidelity score. Scores follow the '
        '<a href="/rubric">published rubric</a>, not opinion. These are homages, not replicas.</div>')


def shop_link(homage):
    """Buy link for one homage row. Tagged Amazon search for Amazon houses; honest
    non-affiliate search otherwise. Never a fake tag."""
    house, name = homage.get("house", ""), homage.get("name", "")
    q = f"{house} {name} watch"
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

    b.append('<p class="crumbs" style="padding-top:24px"><a href="/#finder">← Find an homage</a> · <a href="/#originals">All watches →</a></p>')

    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q,
                              "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    schema = ld(faq_ld)
    return HEAD.format(title=esc(title), desc=esc(desc), canon=canon, schema=schema, sprite=SPRITE, logo=LOGO) + "\n".join(b) + "\n" + FOOT.format(year=YEAR)


def hub_page(originals):
    title = f"Watch homage database — {len(originals)} icons, ranked homages | wristhomage"
    desc = ("A spec-rich, filterable database of watch homages — Submariner, Speedmaster, Datejust and more, "
            "each with real homages ranked by fidelity, price, movement and case size.")
    canon = f"{SITE}/watches/"
    b = [f'<div class="crumbs"><a href="/">Home</a> › Watches</div>',
         '<h1>Watch homage database</h1>',
         '<p class="lede">Every iconic original and its honest field of homages, ranked by fidelity to the '
         '<a href="/rubric">published rubric</a>. Pick a watch to see prices, movements and where to buy.</p>',
         '<div class="tablewrap"><table><thead><tr><th>Original</th><th>Brand</th><th>Type</th><th>Homages</th></tr></thead><tbody>']
    for o in sorted(originals, key=lambda x: x["house"] + x["name"]):
        b.append(f'<tr><td class="row-nm"><span class="row-art">{art_svg(o.get("type","dive"))}</span>'
                 f'<strong><a href="/watches/{esc(o["id"])}">{esc(o["name"])} homages</a></strong></td>'
                 f'<td>{esc(o["house"])}</td><td>{esc(o.get("type",""))}</td><td>{len(o.get("homages",[]))}</td></tr>')
    b.append('</tbody></table></div>')
    coll = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Watch homage database", "url": canon}
    return HEAD.format(title=esc(title), desc=esc(desc), canon=canon, schema=ld(coll), sprite=SPRITE, logo=LOGO) + "\n".join(b) + "\n" + FOOT.format(year=YEAR)


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)


def sitemap(originals):
    urls = ["/", "/watches/", "/rubric", "/disclosure"]
    urls += [f"/watches/{o['id']}" for o in originals]
    urls += ARTICLES
    seen, out = set(), []
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        out.append(f"  <url><loc>{SITE}{u}</loc><lastmod>{YEAR}-07-06</lastmod></url>")
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
    lines += ["", "## About", f"- [Scoring rubric]({SITE}/rubric)", f"- [Homage vs replica]({SITE}/articles/homage-vs-replica)", ""]
    write("llms.txt", "\n".join(lines))


def main():
    data = load_data()
    originals = data["originals"]
    for o in originals:
        write(f"watches/{o['id']}.html", original_page(o))
    write("watches/index.html", hub_page(originals))
    n = sitemap(originals)
    llms(originals)
    print(f"generated {len(originals)} watch pages + hub + sitemap ({n} urls) + llms.txt")


if __name__ == "__main__":
    main()
