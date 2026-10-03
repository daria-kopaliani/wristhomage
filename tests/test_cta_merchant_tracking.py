"""wristhomage#54: a paid merchant CTA above the table sends exactly one paid event.

The Explorer II page's "Check official availability for the WD16570 V2 Pioneer" button is
a tagged Watchdives link, but top_cta() drew it without data-merchant/data-slug, so it
matched none of the page handler's selectors (a[href*=amazon], a[data-merchant],
a[data-placement]) and a click on it sent nothing. These tests check the generator emits
the table row's tracking attributes on that CTA, that only PAID merchant CTAs gained them,
and that the built page's OWN handler (run through node, no network) sends exactly one
shop/watchdives/<slug> event for a click and for a middle-click, and nothing otherwise.

Run from the repo root: python3 -m unittest discover -s tests"""
import importlib.util, json, os, re, subprocess, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("gen_cta54", os.path.join(ROOT, "scripts", "gen.py"))
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

PAGE = "watches/rolex-explorer-ii.html"
SLUG = "watchdives-wd16570-v2-pioneer"
EVENT = "shop/watchdives/" + SLUG

NODE = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(process.argv[1], process.argv[2]), 'utf8');
const m = html.match(/<script>([^<]*closest\("a\[href\*=amazon[^<]*)<\/script>/);
const L = {}, ev = [];
const box = { URL, window: { onauxclick: null }, goatcounter: { count: (e) => ev.push(e.path) },
              document: { addEventListener: (t, fn) => { L[t] = fn; } } };
box.window.goatcounter = box.goatcounter;
vm.createContext(box); vm.runInContext(m[1], box);
const sel = /closest\("([^"]+)"\)/.exec(m[1])[1].split(',');
const res = [];
for (const t of html.matchAll(/<a\b([^>]*)>/g)) {
  const at = t[1], href = (at.match(/href=(["'])(.*?)\1/) || [])[2];
  if (!href || !/watchdives\.com/.test(href)) continue;
  const ds = {};
  for (const d of at.matchAll(/data-([a-z-]+)=(["'])(.*?)\2/g)) ds[d[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = d[3];
  const abs = new URL(href.replace(/&amp;/g, '&'), 'https://wristhomage.com/').href;
  const hit = sel.some((s) => (s === 'a[href*=amazon]' && /amazon/.test(abs)) ||
    (s === 'a[data-merchant]' && 'merchant' in ds) || (s === 'a[data-placement]' && 'placement' in ds));
  const el = { href: abs, dataset: ds, textContent: 'x', closest: () => (hit ? el : null) };
  const fire = (type, button) => { ev.length = 0; if (L[type]) L[type]({ target: el, type, button }); return ev.slice(); };
  res.push({ cls: (at.match(/class="([^"]*)"/) || [])[1], events: {
    'click/0': fire('click', 0), 'auxclick/1': fire('auxclick', 1),
    'auxclick/2': fire('auxclick', 2), 'click/1': fire('click', 1), 'contextmenu/2': fire('contextmenu', 2) } });
}
process.stdout.write(JSON.stringify(res));
"""


def explorer_ii_winner(data):
    o = next(o for o in data["originals"] if o["id"] == "rolex-explorer-ii")
    return o, next(h for h in o["homages"] if h["_routing"]["slug"] == SLUG)


class Generator(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = gen.load_data()

    def test_paid_merchant_cta_carries_the_table_rows_attributes(self):
        o, h = explorer_ii_winner(self.data)
        html = gen.top_cta(h, o["homages"])
        self.assertRegex(html, r'<p class="cta"><a class="buy" href="https://watchdives\.com/[^"]*" '
                               r'data-merchant="watchdives" data-slug="' + SLUG + '" rel="sponsored ')
        # Same attributes the table row's shop link carries for the same watch.
        self.assertIn(f'data-merchant="watchdives" data-slug="{SLUG}"', gen.shop_link(h))

    def test_only_paid_merchant_ctas_gain_tracking(self):
        for o in self.data["originals"]:
            for h in o.get("homages") or []:
                c = h["_routing"]["cta"]
                if not c["firstParty"]:
                    continue
                first = gen.top_cta(h, ()).split("</a>", 1)[0]
                with self.subTest(row=h.get("name"), kind=c["kind"], paid=c["paid"]):
                    if c["paid"] and c["kind"] not in ("amazon", "direct", "search"):
                        self.assertIn(f'data-merchant="{c["kind"]}"', first)
                    else:
                        self.assertNotIn("data-merchant", first)


class BuiltPage(unittest.TestCase):
    def test_every_paid_merchant_anchor_on_watch_pages_is_tracked(self):
        bad = []
        wdir = os.path.join(ROOT, "watches")
        for fn in sorted(os.listdir(wdir)):
            if not fn.endswith(".html"):
                continue
            with open(os.path.join(wdir, fn), encoding="utf-8") as f:
                html = f.read()
            for at in re.findall(r"<a\b([^>]*)>", html):
                if 'rel="sponsored' in at and "amazon." not in at and "data-merchant=" not in at \
                        and "data-placement=" not in at:
                    bad.append(f"{fn}: {at[:120]}")
        self.assertEqual(bad, [])

    def test_explorer_ii_watchdives_cta_sends_exactly_one_paid_event(self):
        res = json.loads(subprocess.run(["node", "-e", NODE, ROOT, PAGE], capture_output=True,
                                        text=True, check=True).stdout)
        buy = [r for r in res if r["cls"] == "buy"]
        self.assertEqual(len(buy), 1, res)
        ev = buy[0]["events"]
        self.assertEqual(ev["click/0"], [EVENT])
        self.assertEqual(ev["auxclick/1"], [EVENT])        # middle-click (moondog-portfolio#215)
        self.assertEqual(ev["auxclick/2"], [])
        self.assertEqual(ev["click/1"], [])
        self.assertEqual(ev["contextmenu/2"], [])
        # Every Watchdives anchor on the page now sends the one event, the table row included.
        for r in res:
            self.assertEqual(r["events"]["click/0"], [EVENT], r)


if __name__ == "__main__":
    unittest.main()
