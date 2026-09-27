"""Watch-storage pilot pages (wristhomage#26): three static pages from data/watch-storage.json.

gen.py wraps each page in the site's head and foot and lists it in sitemap.xml and llms.txt;
this file owns the data rules and the page bodies.

The rules the data has to pass before anything renders:
- EXACT LINKS ONLY, ONE TAG. A linked row carries a verified ASIN and links to /dp/<ASIN> with
  wriststoredp-20, the cohort's own ID. Never wristhomagedp-20 or a search.
- SELLER. A row is linked only while its buy box is sold by Amazon.com or by the brand's own
  store, and the brand stores are an explicit allowlist of storefront name AND seller ID
  (the beautyevidence#28 rule; affiliate architect decision on wristhomage#26, 2026-09-27).
  A reseller gets no link and the page says why.
- NO PRICES (moondog-portfolio#134). No price field of any kind in the data.
- FIT IS WHAT THE MAKER PUBLISHES ABOUT THE INSIDE. A slot width, a clearance height or a
  pillow circumference with its wrist range is fit data. A size stated only as a case diameter
  ("dials up to 48 mm") is a maker claim: it ignores lugs, crown, thickness and the bracelet
  clasp, so it is shown and labelled, never used to say a watch fits.
"""
import html, json, os, re
from decimal import Decimal, ROUND_HALF_UP

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "watch-storage.json")
SITE = "https://wristhomage.com"
BASE = "/watch-storage/"
TAG = "wriststoredp-20"                 # moondog-portfolio: wristhomage-watch-storage, verified 2026-09-24
PLACEMENT = "cohort-watch-storage"       # click path out/cohort-watch-storage/amazon/dp/<ASIN>
AMAZON = ("Amazon.com",)
BRAND_STORES = {"ROTHWELL": ("ROTHWELL", "ANHULIOIDR3VG"),      # ROTHWELL LLC
                "TAWBURY": ("TAWBURY", "A3UUUOQIKX3ZFB")}       # EARLWOOD DESIGNS PTY LTD, Tawbury's maker
FORMS = ("roll", "travel case", "box")
MAX_CONFIGS = 6
PRICE_KEYS = ("price", "maker_price", "price_source", "list_price")

PAGES = [
    {"slug": "wolf-watch-roll-alternatives", "nav": "alternatives to the WOLF Blake roll",
     "title": "WOLF Blake watch roll alternatives (2026)",
     "h1": "Alternatives to the WOLF Blake watch roll",
     "desc": "Two travel rolls and cases to set against the WOLF Blake roll, compared on what their makers "
             "publish about the inside: slots, cushions and closures. No prices, no hands-on claims."},
    {"slug": "watch-box-for-large-watches", "nav": "watch boxes for large watches",
     "title": "Watch box for large watches: what fits, by the makers' own numbers (2026)",
     "h1": "Watch boxes for large watches",
     "desc": "Which watch boxes publish a slot width, a clearance height or a pillow size, and which only "
             "state a case diameter. Six named boxes and cases, checked 2026-09-27."},
    {"slug": "watch-box-vs-watch-roll", "nav": "watch box vs watch roll",
     "title": "Watch box vs watch roll: named boxes and rolls compared (2026)",
     "h1": "Watch box vs watch roll",
     "desc": "A watch box and a watch roll solve different problems. Named boxes, rolls and a travel case "
             "compared on compartments, inside dimensions, cushions and closures."},
]


def esc(s):
    return html.escape(str(s), quote=True)


def _one_place(v):
    """Round half up to one decimal (Python's round() gives 184.1 for 7.25 in = 184.15 mm)."""
    return float(Decimal(str(v)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def in_to_mm(x):
    return _one_place(Decimal(str(x)) * Decimal("25.4"))


def cm_to_in(x):
    return _one_place(Decimal(str(x)) / Decimal("2.54"))


def seller_ok(x):
    """True when the recorded buy-box seller is Amazon.com or the brand's own allowlisted store."""
    if x.get("seller") in AMAZON:
        return True
    store = BRAND_STORES.get(x.get("brand"))
    return bool(store) and (x.get("seller"), x.get("seller_id")) == store


def load(path=None):
    with open(path or DATA, encoding="utf-8") as f:
        d = json.load(f)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d.get("checked") or ""):
        raise SystemExit("storage: the data needs its check date")
    cs = d["configs"]
    if not 2 <= len(cs) <= MAX_CONFIGS:
        raise SystemExit(f"storage: two to {MAX_CONFIGS} exact configurations (#26)")
    if len({x["id"] for x in cs}) != len(cs) or len({x.get("asin") for x in cs}) != len(cs):
        raise SystemExit("storage: each configuration and each ASIN once")
    for x in cs + [d["reference"]]:
        if any(k in x for k in PRICE_KEYS):
            raise SystemExit(f"storage: {x['id']} stores a price; these pages show none (#134)")
        if x.get("form") not in FORMS:
            raise SystemExit(f"storage: {x['id']} needs a form, one of {FORMS}")
        if not (x.get("source") or {}).get("url", "").startswith("https://"):
            raise SystemExit(f"storage: {x['id']} has no maker source")
    for x in cs:
        if not re.fullmatch(r"[A-Z0-9]{10}", x.get("asin") or ""):
            raise SystemExit(f"storage: {x['id']} has no valid ASIN; exact links only")
        if not seller_ok(x) and not x.get("no_route_reason"):
            raise SystemExit(f"storage: {x['id']} is not sold by its brand store or Amazon.com; a reseller "
                             f"offer is not linked, so record no_route_reason")
        lim = x.get("case_limit_mm") or []
        if len(lim) > 1 and len(set(lim)) > 1 and not x.get("case_limit_note"):
            raise SystemExit(f"storage: {x['id']} states conflicting case limits without saying so")
        for p in x.get("pillows", []):
            lo, hi = p["wrist_cm"]
            if not 0 < lo < hi:
                raise SystemExit(f"storage: {x['id']} {p['size']} pillow has an empty wrist range")
    ref = d["reference"]
    if ref.get("asin") or not ref.get("no_route_reason"):
        raise SystemExit("storage: the WOLF reference is shown unlinked and says why")
    return d


def link(x, label="Amazon"):
    """An exact /dp/ link with the cohort's tag and placement, or no link and the reason."""
    if not seller_ok(x):
        return f'<span class="muted">No Amazon link: {esc(x.get("no_route_reason") or "not sold by the maker or by Amazon.com")}</span>'
    return (f'<a class="buy" href="https://www.amazon.com/dp/{x["asin"]}?tag={TAG}" '
            f'rel="sponsored nofollow noopener" target="_blank" data-placement="{PLACEMENT}">'
            f'{esc(label)}&nbsp;&rsaquo;</a>')


def seller_text(x):
    return "Amazon.com" if x["seller"] in AMAZON else f"{x['seller']}, the maker's own store"


# --- fit -----------------------------------------------------------------------------------

def case_fit(x, case_mm):
    """What the maker's own numbers say about a watch case of case_mm across.

    'within slot'  the maker publishes the slot width and the case is not wider (equality is
                   within: the maker's own words are "up to").
    'wider than slot'
    'within claim' / 'over claim'  only a case-diameter limit is published. It is a claim, not
                   fit data, and the label says so either way.
    'conflict'     the maker states two different limits.
    'unknown'      nothing published."""
    if x.get("slot_width_mm"):
        return "within slot" if case_mm <= x["slot_width_mm"] else "wider than slot"
    lim = sorted(set(x.get("case_limit_mm") or []))
    if len(lim) > 1:
        return "conflict"
    if not lim:
        return "unknown"
    return "within claim" if case_mm <= lim[0] else "over claim"


def pillow_for_wrist(x, wrist_cm):
    """The maker's pillow size for a wrist, or None. Where two ranges meet, the smaller pillow:
    the maker's own advice is to size down between sizes."""
    for p in sorted(x.get("pillows", []), key=lambda p: p["circumference_cm"]):
        lo, hi = p["wrist_cm"]
        if lo <= wrist_cm <= hi:
            return p["size"]
    return None


CASE_LABEL = {"within slot": "within the published slot", "wider than slot": "wider than the slot",
              "within claim": "within the maker’s claim", "over claim": "over the maker’s claim",
              "conflict": "conflicting claims", "unknown": "no width published"}


def fit_cell(x):
    parts = []
    if x.get("slot_width_mm"):
        parts.append(f'slot {x["slot_width_mm"]}&nbsp;mm ({cm_to_in(x["slot_width_mm"] / 10)}&nbsp;in) wide')
    if x.get("clearance_height_mm"):
        parts.append(f'{x["clearance_height_mm"]}&nbsp;mm ({cm_to_in(x["clearance_height_mm"] / 10)}&nbsp;in) high')
    if x.get("pillow_circumference_in"):
        c = x["pillow_circumference_in"]
        s = f'pillow {c}&nbsp;in ({in_to_mm(c)}&nbsp;mm) round'
        if x.get("pillow_compressed_in"):
            s += f', compressible to {x["pillow_compressed_in"]}&nbsp;in ({in_to_mm(x["pillow_compressed_in"])}&nbsp;mm)'
        parts.append(s)
    if x.get("pillows"):
        parts.append("pillows by wrist size (table below)")
    fit = "; ".join(parts) + (" <em>(maker fit data)</em>" if parts else "")
    lim = sorted(set(x.get("case_limit_mm") or []))
    if lim:
        claim = " or ".join(f"{m}&nbsp;mm" for m in lim)
        claim = f'case up to {claim} <em>(maker claim: a case diameter, not fit)</em>'
        if x.get("case_limit_note"):
            claim += f' <span class="muted">{esc(x["case_limit_note"])}</span>'
        fit = f"{fit}<br>{claim}" if fit else claim
    return fit or '<span class="muted">fit unverified: the maker publishes no inside dimension</span>'


def outside(x):
    if x.get("outside_cm"):
        a, b, c = x["outside_cm"]
        return f"{a} &times; {b} &times; {c}&nbsp;cm"
    if x.get("outside_in"):
        a, b, c = x["outside_in"]
        return f"{a:g} &times; {b:g} &times; {c:g}&nbsp;in"
    return '<span class="muted">not published</span>'


def source(x):
    """The maker's publication. An Amazon listing is named, not linked: the row's own tagged link
    already goes there, and a second, untagged Amazon link would count as a paid click."""
    s = x["source"]
    if "amazon." in s["url"]:
        return esc(s["label"]) + " (the Amazon link in this row)"
    return f'<a href="{esc(s["url"])}" rel="nofollow noopener" target="_blank">{esc(s["label"])}</a>'


# --- page parts ----------------------------------------------------------------------------

DISC = ('<div class="disc-bar"><strong>As an Amazon Associate we earn from qualifying purchases</strong>, '
        'at no extra cost to you. The Amazon links on this page are affiliate links; a product is linked only '
        'while Amazon.com or the maker’s own store sells it. <a href="/disclosure">Affiliate disclosure</a>.</div>')


def crumbs(title):
    return f'<div class="crumbs"><a href="/">Home</a> › <a href="/watches/">Watches</a> › {esc(title)}</div>'


def checked_line(d):
    return (f'<p class="muted">Last checked {d["checked"]}: sellers read from each Amazon US buy box, dimensions '
            f'from each maker’s own publication; we handled none of these, and there are no prices here.</p>')


def related(slug):
    items = [f'<a href="{BASE}{p["slug"]}">{esc(p["h1"])}</a>' for p in PAGES if p["slug"] != slug]
    return ('<p class="crumbs" style="padding-top:24px">Also on watch storage: ' + " · ".join(items)
            + ' · <a href="/watches/">← All watches</a></p>')


def table(rows, heads):
    head = "".join(f"<th>{h}</th>" for h in heads)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<div class="tablewrap"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def config_rows(xs):
    return [[f'<strong>{esc(x["name"])}</strong><div class="note">{esc(x["form"])}, holds {x["watches"]}; '
             f'sold by {esc(seller_text(x))}</div>', fit_cell(x), esc(x["cushion"]), esc(x["closure"]),
             outside(x), source(x), link(x)] for x in xs]


HEADS = ["Configuration", "Inside: what the maker publishes", "Cushion", "Closure", "Outside", "Source", "Buy"]


def pillow_table(x):
    rows = [[esc(p["size"]), f'{p["circumference_cm"]}&nbsp;cm ({cm_to_in(p["circumference_cm"])}&nbsp;in)',
             f'{p["wrist_cm"][0]}&ndash;{p["wrist_cm"][1]}&nbsp;cm ({cm_to_in(p["wrist_cm"][0])}&ndash;{cm_to_in(p["wrist_cm"][1])}&nbsp;in)',
             {True: "included", False: "sold separately", None: '<span class="muted">not stated on the listing</span>'}[p["included"]]]
            for p in x["pillows"]]
    return (f'<h3>{esc(x["short"])}: pillow sizes</h3>'
            + table(rows, ["Pillow", "Circumference", "Wrist size the maker gives", "With this listing"])
            + f'<p class="muted">{esc(x["above_range"][0].upper() + x["above_range"][1:])}. Source: {source(x)}.</p>')


def faq(qas):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qas]}


def faq_html(qas):
    return "<h2>Questions</h2>" + "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in qas)


def by_id(d):
    return {x["id"]: x for x in d["configs"]}


# --- the three pages ----------------------------------------------------------------------

def page_wolf(d):
    c, w = by_id(d), d["reference"]
    alts = [c["rothwell-3-watch-roll"], c["tawbury-fraser-2"]]
    qas = [("Is the WOLF Blake watch roll sold on Amazon?",
            f"On {d['checked']} the WOLF Blake listings we found on Amazon US were sold by a reseller, not by WOLF "
            "or Amazon.com, so this page does not link them. WOLF sells the roll on its own site."),
           ("What is a like-for-like alternative to the WOLF Blake roll?",
            "The Rothwell 3-watch roll is the same shape: a roll for three watches. Rothwell publishes its pillow "
            "size (7.25 in round, compressible to 6.75 in); its stated case limit conflicts (50 mm in the title, "
            "60 mm in the description), so it is not a fit guarantee."),
           ("Is a two-watch travel case a better alternative?",
            "If you carry two watches, the Tawbury Fraser 2 case is the one here whose maker publishes pillow sizes "
            "by wrist: Standard 19.5 cm round for 16.5-19.5 cm wrists, X-Small 17.5 cm for 14-17.5 cm.")]
    body = f"""{crumbs("WOLF Blake roll alternatives")}
    <h1>{PAGES[0]['h1']}</h1>
    {DISC}
    {checked_line(d)}
    <p class="lede">The WOLF Blake is a three-watch roll. Its maker publishes a {w['roll_length_mm']}&nbsp;mm (6.5&nbsp;in) roll for about {w['watches']} watches, with {esc(w['cushion'])}; it closes with an {esc(w['closure'])} (source: {source(w)}). It is not linked here: {esc(w['no_route_reason'])}.</p>
    <h2>Two alternatives, on their makers' own numbers</h2>
    {table(config_rows(alts), HEADS)}
    <p>The Rothwell is the closer shape: a roll for three watches. Its maker's two size statements disagree, so the only inside figure to rely on is the pillow circumference. The Tawbury is a zipped hard case for two, and the only one of the pair whose maker publishes a pillow size for each wrist range.</p>
    {pillow_table(c['tawbury-fraser-2'])}
    <p>If you are choosing between a roll and a box rather than between rolls, the <a href="{BASE}watch-box-vs-watch-roll">box vs roll comparison</a> sets the boxes against these.</p>
    {faq_html(qas)}
    {related(PAGES[0]['slug'])}"""
    return body, [faq(qas)]


def page_large(d):
    c = by_id(d)
    boxes = [c["tawbury-bayswater-8"], c["rothwell-12-slot-box"], c["songmics-8-slot"], c["songmics-6-slot"], c["tawbury-fraser-2"]]
    probe = [44, 48, 55, 56]
    rows = [[f'<strong>{esc(x["short"])}</strong>'] + [CASE_LABEL[case_fit(x, mm)] for mm in probe] for x in boxes]
    qas = [("Which watch box here publishes a slot size?",
            "Of the boxes compared here, only the Tawbury Bayswater 8 publishes an inside slot size: 5.5 cm (2.2 in) wide "
            "with 3 cm (1.2 in) of height clearance."),
           ("Is 'fits dials up to 48 mm' enough to know a watch fits?",
            "No. A dial or case diameter leaves out the lugs, the crown, the case thickness and how the bracelet closes. "
            "This page labels such figures as maker claims and does not use them to say a watch fits."),
           ("What if my wrist is larger than the pillows?",
            "Tawbury says that above a 19 cm wrist (19.5 cm for the Fraser case) it has no larger pillow, and the bracelet "
            "then sits loosely around the pillow or is held by the lid.")]
    body = f"""{crumbs("Watch box for large watches")}
    <h1>{PAGES[1]['h1']}</h1>
    {DISC}
    {checked_line(d)}
    <p class="lede">A large watch is a fit question, and fit is about the inside of the box. Of the boxes here, only the Tawbury Bayswater 8 publishes a slot size: 55&nbsp;mm wide with 30&nbsp;mm of height. Rothwell publishes a pillow circumference; SONGMICS publishes only a case diameter, which leaves out the lugs, the crown, the thickness and the clasp.</p>
    <h2>What each maker publishes</h2>
    {table(config_rows(boxes), HEADS)}
    <h2>A case of a given width, by the makers' own numbers</h2>
    <p>"Within the slot" appears only where the maker publishes the slot width, and it is about width alone: the Bayswater's maker also gives 30&nbsp;mm of height. "Within/over the maker's claim" means the maker states a case diameter and nothing about the inside; treat it as a hint, not a fit.</p>
    {table(rows, ["Box or case"] + [f"{mm}&nbsp;mm case" for mm in probe])}
    {pillow_table(c['tawbury-bayswater-8'])}
    {pillow_table(c['tawbury-fraser-2'])}
    <p>The Rothwell 12-slot box publishes one pillow: {c['rothwell-12-slot-box']['pillow_circumference_in']}&nbsp;in ({in_to_mm(c['rothwell-12-slot-box']['pillow_circumference_in'])}&nbsp;mm) round, compressible to {c['rothwell-12-slot-box']['pillow_compressed_in']}&nbsp;in. Rothwell says it takes a watch sized {c['rothwell-12-slot-box']['pillow_compressed_in']}&nbsp;in round or more; below that, leave the clasp open. Source: {source(c['rothwell-12-slot-box'])}.</p>
    {faq_html(qas)}
    {related(PAGES[1]['slug'])}"""
    return body, [faq(qas)]


def page_vs(d):
    c = by_id(d)
    rolls = [x for x in d["configs"] if x["form"] in ("roll", "travel case")]
    boxes = [x for x in d["configs"] if x["form"] == "box"]
    qas = [("Should I buy a watch box or a watch roll?",
            "A box stores and displays watches at home and holds more of them (six to twelve here); a roll or travel "
            "case carries two or three watches and closes around them for a bag."),
           ("Which of these publish inside dimensions?",
            "Tawbury publishes a slot width and height for the Bayswater 8 and pillow sizes by wrist for both of its "
            "products; Rothwell publishes a pillow circumference. SONGMICS publishes only a case diameter."),
           ("Is a roll safe for a large watch?",
            "Only the maker's inside figures can say. The Rothwell roll's two case limits disagree (50 mm and 60 mm), "
            "so on its own numbers the question is open; its pillow is 7.25 in round.")]
    body = f"""{crumbs("Watch box vs watch roll")}
    <h1>{PAGES[2]['h1']}</h1>
    {DISC}
    {checked_line(d)}
    <p class="lede">Compared on what each maker publishes about the inside, a watch box and a watch roll solve different problems. A box keeps a collection at home: more slots, a glass lid, often a drawer. A roll or travel case carries a few watches in a bag and closes around them. What matters is the compartments, the cushion each watch wraps around, and the closure.</p>
    <h2>Rolls and travel cases</h2>
    {table(config_rows(rolls), HEADS)}
    <p>The WOLF Blake roll is the best-known roll in this shape; it is <a href="{BASE}wolf-watch-roll-alternatives">covered on its own page</a> and not linked, because the Amazon US listings we found were sold by a reseller.</p>
    <h2>Boxes</h2>
    {table(config_rows(boxes), HEADS)}
    <p>For a large watch, the <a href="{BASE}watch-box-for-large-watches">large-watch page</a> sets these boxes against a given case width, keeping the makers' inside figures apart from their case-diameter claims.</p>
    {faq_html(qas)}
    {related(PAGES[2]['slug'])}"""
    return body, [faq(qas)]


RENDER = {"wolf-watch-roll-alternatives": page_wolf, "watch-box-for-large-watches": page_large,
          "watch-box-vs-watch-roll": page_vs}


def pages():
    """[(path, title, desc, schema_list, body)] for gen.py to wrap and write."""
    d = load()
    out = []
    for p in PAGES:
        body, schema = RENDER[p["slug"]](d)
        out.append((BASE + p["slug"], p["title"], p["desc"], schema, body))
    return out
