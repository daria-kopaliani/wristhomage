"""moondog-portfolio#215: middle-click opens of affiliate links are counted, once.

A middle-click (or a mouse's "open in new tab" button) fires `auxclick`, never `click`. The
inline handler is now one function bound to both; these tests run every built page's OWN
handler (through node, no network) against every anchor on that page and check:
  - a middle-click (auxclick, button 1) sends exactly the event a click sends;
  - a right-button auxclick, a contextmenu and a middle-button `click` send nothing;
  - no page is left on the click-only wrapper, and nothing listens for contextmenu.
And the homepage finder's shop tracker (js/finder.js) does the same for its own links.

Run from the repo root: python3 -m unittest discover -s tests"""
import importlib.util, json, os, re, subprocess, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("gen_mc", os.path.join(ROOT, "scripts", "gen.py"))
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

NODE = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[1], SITE = 'https://wristhomage.com/';
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['design', 'scripts', 'tests', 'node_modules'].includes(e.name)) continue;
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) walk(rel); else if (e.name.endsWith('.html')) pages.push(rel);
  }
})('');
const out = { pages: 0, anchors: 0, paid: 0, placed: 0, merchant: 0, clickOnly: [], bad: [] };
const OLD = /<script>document\.addEventListener\("click",function\(e\)\{var a=e\.target\.closest&&e\.target\.closest\("a\[href\*=amazon/;
for (const f of pages) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (OLD.test(html)) out.clickOnly.push(f);
  const m = html.match(/<script>([^<]*closest\("a\[href\*=amazon[^<]*)<\/script>/);
  if (!m) continue;
  out.pages++;
  const L = {}, ev = [];
  const box = { URL, window: { onauxclick: null }, goatcounter: { count: (e) => ev.push(e.path) },
                document: { addEventListener: (t, fn) => { L[t] = fn; } } };
  box.window.goatcounter = box.goatcounter;
  vm.createContext(box); vm.runInContext(m[1], box);
  if (!L.click || L.auxclick !== L.click || L.contextmenu) { out.bad.push(f + ': listeners ' + Object.keys(L)); continue; }
  const sel = /closest\("([^"]+)"\)/.exec(m[1])[1].split(',');
  for (const t of html.matchAll(/<a\b([^>]*)>/g)) {
    const at = t[1], href = (at.match(/href=(["'])(.*?)\1/) || [])[2];
    if (!href) continue;
    const ds = {};
    for (const d of at.matchAll(/data-([a-z-]+)=(["'])(.*?)\2/g)) ds[d[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = d[3];
    const abs = new URL(href.replace(/&amp;/g, '&'), SITE).href;
    const hit = sel.some((s) => (s === 'a[href*=amazon]' && /amazon/.test(abs)) ||
      (s === 'a[data-merchant]' && 'merchant' in ds) || (s === 'a[data-placement]' && 'placement' in ds));
    const el = { href: abs, dataset: ds, textContent: 'x', closest: () => (hit ? el : null) };
    const fire = (type, button) => { ev.length = 0; if (L[type]) L[type]({ target: el, type, button }); return ev.slice(); };
    const click = fire('click', 0), mid = fire('auxclick', 1);
    out.anchors++;
    if (JSON.stringify(click) !== JSON.stringify(mid) || mid.length > 1) out.bad.push(f + ': ' + abs + ' click ' + click + ' middle ' + mid);
    for (const [type, b] of [['auxclick', 2], ['contextmenu', 2], ['click', 1]])
      if (fire(type, b).length) out.bad.push(f + ': ' + abs + ' ' + type + '/' + b + ' counted');
    if (click.length && /amazon\//.test(click[0])) out.paid++;
    if (click.length && 'placement' in ds) out.placed++;
    if (click.length && 'merchant' in ds) out.merchant++;
  }
}
process.stdout.write(JSON.stringify(out));
"""

FINDER = r"""
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[1] + '/js/finder.js', 'utf8');
const fn = src.match(/function trackShop\(e\) \{[\s\S]*?\n  \}\n/)[0];
const ev = [];
const box = { window: { onauxclick: null, goatcounter: { count: (e) => ev.push(e.path) } } };
vm.createContext(box);
const track = vm.runInContext('(' + fn.replace(/^function trackShop/, 'function') + ')', box);
const res = {};
for (const shop of ['amazon', 'direct']) for (const [type, b] of [['click', 0], ['auxclick', 1], ['auxclick', 2], ['click', 1]]) {
  ev.length = 0;
  const a = { getAttribute: (n) => ({ 'data-shop': shop, 'data-slug': 's' })[n] };
  track({ type, button: b, target: { closest: () => a } });
  res[shop + ' ' + type + '/' + b] = ev.slice();
}
res.bound = /els\.cards\.addEventListener\("click", trackShop\)/.test(src) && /els\.cards\.addEventListener\("auxclick", trackShop\)/.test(src);
res.contextmenu = /contextmenu/.test(src);
process.stdout.write(JSON.stringify(res));
"""


def node(script):
    return json.loads(subprocess.run(["node", "-e", script, ROOT], capture_output=True, text=True,
                                     check=True).stdout)


class Wrapper(unittest.TestCase):
    BODY = 'var a=e.target.closest&&e.target.closest("a[href*=amazon]");X;try{Y}catch(_){}'
    OLD = '<script>document.addEventListener("click",function(e){' + BODY + '},true);</script>'

    def test_upgrade_wraps_without_touching_the_body(self):
        new = gen.upgrade_click_handler(self.OLD)
        self.assertEqual(new, "<script>" + gen.CLICK_OPEN + self.BODY + gen.CLICK_CLOSE + "</script>")
        self.assertEqual(gen.upgrade_click_handler(new), new)

    def test_generated_handler_is_on_the_wrapper(self):
        self.assertTrue(gen.CLICK_JS.startswith("<script>" + gen.CLICK_OPEN))
        self.assertTrue(gen.CLICK_JS.endswith(gen.CLICK_CLOSE + "</script>\n"))
        self.assertEqual(gen.upgrade_click_handler(gen.CLICK_JS), gen.CLICK_JS)


class BuiltPages(unittest.TestCase):
    def test_every_page_counts_a_middle_click_once(self):
        r = node(NODE)
        self.assertEqual(r["clickOnly"], [])
        self.assertEqual(r["bad"], [])
        self.assertGreaterEqual(r["pages"], 54, r)
        self.assertGreaterEqual(r["paid"], 180, r)          # tagged Amazon anchors exercised
        self.assertGreater(r["placed"], 0, r)               # alt-compare placement paths
        print(f"\n      middle-click parity: {r['pages']} pages, {r['anchors']} anchors, "
              f"{r['paid']} Amazon, {r['placed']} placed, {r['merchant']} merchant")

    def test_finder_shop_tracker(self):
        r = node(FINDER)
        self.assertTrue(r["bound"])
        self.assertFalse(r["contextmenu"])
        for b in ("click/0", "auxclick/1"):
            self.assertEqual(r["direct " + b], ["shop/direct/s"])
            self.assertEqual(r["amazon " + b], [])          # Amazon belongs to the inline handler
        for b in ("auxclick/2", "click/1"):
            self.assertEqual(r["direct " + b], [])

    def test_finder_cache_key_bumped(self):
        self.assertIn('<script src="/js/finder.js?v=10"></script>',
                      open(os.path.join(ROOT, "index.html"), encoding="utf-8").read())


if __name__ == "__main__":
    unittest.main()
