#!/usr/bin/env python3
"""Add Amazon buy links to the article + brand-guide pages.

Why: the /watches/ database pages carry every affiliate link on the site (19 of 21),
and that is where the only affiliate revenue we have ever earned came from. Meanwhile
every commercial-intent page — the ten "best <icon> homage" articles and the four brand
reviews — carried ZERO. The pages that name a #1 pick and tell you to buy it had no way
to buy it. San Martin and Steeldive, the two brands that actually converted, are in that
group.

Rules this obeys:
  * Only products present in HOMAGE_DATA are linked — never a name that appears in prose
    but is not a vouched row. That is the funnel rule the score sites are built on.
  * Only rows flagged `amazon: true`. A row we have not confirmed is sold on Amazon does
    not get an Amazon link.
  * ASIN when the row has a verified one, search only as the fallback — and the two
    carry DIFFERENT tags (see TAG/TAG_DP below), because the tag must match the link
    shape (AGENTS.md 1.6).

    This reverses the original rule here, which read "search URLs, not ASINs ... it
    cannot point at the wrong product the way a stale ASIN can." The 2026-08-30 SN013-G
    case showed the opposite: the search is the WEAKER instrument. SN013-G is listed, in
    stock, exact reference in the title, under B09PYXWYDZ — and the keyword search cannot
    surface it. AFFILIATE_LINK_AUDIT.md measured 36 of 46 checked clicks (78%) landing on
    a search that does not return the product it names. A stale ASIN is a visible failure;
    a search that quietly returns the wrong watch is not.

    Every ASIN used here was re-verified live on 2026-09-04: the listing title carries the
    model designator and the page has a buy box. Pagani's listings drop the `PD-` prefix
    ("Pagani Design 1728"), which is the documented formatting, not a mismatch.
  * Idempotent: skips a heading that already carries a link.

Usage:  link_articles.py [--check]
"""
import json, os, re, subprocess, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAG = "wristhomage-20"        # keyword search
TAG_DP = "wristhomagedp-20"  # exact /dp/<ASIN>


def load():
    js = os.path.join(ROOT, "data", "homages.js")
    out = subprocess.check_output(
        ["node", "-e", f"global.window={{}};require({json.dumps(js)});"
                       f"process.stdout.write(JSON.stringify(window.HOMAGE_DATA))"])
    return json.loads(out)


def products(data):
    """(house, model) -> (search query, asin or None), for rows we can honestly link."""
    out = {}
    for o in data["originals"]:
        for h in o.get("homages", []):
            if not h.get("amazon"):
                continue
            out[(h["house"], h["name"])] = (f"{h['house']} {h['name']} watch", h.get("asin"))
    return out


def href_for(q, asin):
    """The exact product when we have a verified ASIN, the search when we do not."""
    if asin:
        return f"https://www.amazon.com/dp/{html.escape(asin)}?tag={TAG_DP}"
    return (f'https://www.amazon.com/s?k={html.escape(q).replace(" ", "%20")}'
            f'&amp;tag={TAG}')


def link_html(house, model, q, asin=None):
    return (f' <a class="buy" href="{href_for(q, asin)}" rel="nofollow sponsored" target="_blank" '
            f'data-out="amazon/{html.escape((house + "-" + model).lower().replace(" ", "-"))}"'
            f'>Amazon&nbsp;↗</a>')


def process(path, prods, check):
    src = open(path, encoding="utf-8").read()
    s = src
    added = []
    for (house, model), (q, asin) in prods.items():
        # Anchor on a heading that names the product. Headings are the page's own
        # editorial pick — linking there, not on every prose mention, keeps one
        # link per product and puts it where the recommendation is made.
        pat = re.compile(
            r"(<h([23])[^>]*>[^<]*?" + re.escape(house) + r"\s+" + re.escape(model) + r"[^<]*?</h\2>)",
            re.I)
        m = pat.search(s)
        if not m:
            continue
        head = m.group(1)
        if 'class="buy"' in head:
            continue
        # Insert inside the heading, before its closing tag.
        new_head = re.sub(r"</h([23])>$", link_html(house, model, q, asin) + r"</h\1>", head)
        s = s[:m.start()] + new_head + s[m.end():]
        added.append(f"{house} {model}")
    if not added:
        return f"  – {os.path.relpath(path, ROOT):<52} no vouched product in a heading"
    if check:
        return f"  ? {os.path.relpath(path, ROOT):<52} would add {len(added)}: {', '.join(added)}"
    open(path, "w", encoding="utf-8").write(s)
    return f"  ✓ {os.path.relpath(path, ROOT):<52} +{len(added)}: {', '.join(added)}"



# Brand guides list models bare — "<li><strong>SD1953</strong> — the Submariner
# homage" — with the brand implied by the page itself. Same rule applies: the model
# must exist in HOMAGE_DATA under that house, with amazon:true.
GUIDE_BRAND = {
    "steeldive.html": "Steeldive",
    "san-martin.html": "San Martin",
    "baltany.html": "Baltany",
    "cadisen.html": "Cadisen",
    "pagani-design.html": "Pagani Design",
}


def process_guide(path, prods, check):
    brand = GUIDE_BRAND[os.path.basename(path)]
    models = sorted((m for (h, m) in prods if h == brand), key=len, reverse=True)
    src = open(path, encoding="utf-8").read()
    s, added = src, []
    for model in models:
        # The <li> whose <strong> names this model. Link goes at the end of the item,
        # after the editorial sentence, so the recommendation reads first.
        pat = re.compile(
            r"(<li>\s*<strong>(?:<a[^>]*>)?" + re.escape(model) + r"(?:</a>)?</strong>.*?)(</li>)",
            re.S)
        m = pat.search(s)
        if not m or 'class="buy"' in m.group(1):
            continue
        q = prods[(brand, model)]
        s = s[:m.start()] + m.group(1) + link_html(brand, model, q) + m.group(2) + s[m.end():]
        added.append(f"{brand} {model}")
    if not added:
        return f"  – {os.path.relpath(path, ROOT):<52} no vouched model in a list item"
    if check:
        return f"  ? {os.path.relpath(path, ROOT):<52} would add {len(added)}: {', '.join(added)}"
    open(path, "w", encoding="utf-8").write(s)
    return f"  ✓ {os.path.relpath(path, ROOT):<52} +{len(added)}: {', '.join(added)}"


def main():
    check = "--check" in sys.argv
    prods = products(load())
    targets = sorted(
        [os.path.join(ROOT, "articles", f) for f in os.listdir(os.path.join(ROOT, "articles"))
         if f.endswith(".html")] +
        [os.path.join(ROOT, "guides", f) for f in os.listdir(os.path.join(ROOT, "guides"))
         if f.endswith(".html")])
    print(f"{len(prods)} linkable products; {len(targets)} pages")
    total = 0
    for t in targets:
        fn = os.path.basename(t)
        line = (process_guide(t, prods, check) if fn in GUIDE_BRAND
                else process(t, prods, check))
        print(line)
        if line.lstrip().startswith(("✓", "?")):
            total += 1
    print(f"\n{total} pages {'would change' if check else 'updated'}")


if __name__ == "__main__":
    main()
