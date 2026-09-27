"""wristhomage#26: the watch-storage pilot pages, their data rules and the site wiring.

Run from the repo root: python3 -m unittest discover -s tests"""
import copy, importlib.util, json, os, re, subprocess, tempfile, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def module(name, rel):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, rel))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


st = module("storage_t", "scripts/storage.py")
gen = module("gen_t", "scripts/gen.py")
DATA = st.load()
BY = {x["id"]: x for x in DATA["configs"]}
FILES = {p["slug"]: os.path.join(ROOT, "watch-storage", p["slug"] + ".html") for p in st.PAGES}
WOLF_ASINS = ("B00QNZG71M", "B084BSLGJW", "B0D2PDNSBT")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def with_data(d):
    p = os.path.join(tempfile.mkdtemp(), "watch-storage.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(d, f)
    return p


class Sellers(unittest.TestCase):
    def test_allowlisted_brand_stores_and_amazon_are_linked(self):
        for x in DATA["configs"]:
            self.assertTrue(st.seller_ok(x), x["id"])
            self.assertIn(f'/dp/{x["asin"]}?tag=wriststoredp-20', st.link(x))

    def test_a_brand_store_name_without_its_seller_id_is_not_trusted(self):
        x = dict(BY["rothwell-3-watch-roll"], seller_id="A00000000000")
        self.assertFalse(st.seller_ok(x))
        self.assertNotIn("amazon.com", st.link(x))

    def test_a_reseller_gets_no_link_and_the_reason_is_shown(self):
        x = dict(BY["tawbury-bayswater-8"], seller="recommerce", seller_id="A32GOXAC8X4KTS",
                 no_route_reason="sold by a reseller")
        h = st.link(x)
        self.assertNotIn("amazon.com/dp/", h)
        self.assertIn("No Amazon link: sold by a reseller", h)

    def test_a_reseller_without_a_reason_stops_the_build(self):
        d = copy.deepcopy(DATA)
        d["configs"][0]["seller"] = "Some Reseller"
        with self.assertRaises(SystemExit):
            st.load(with_data(d))

    def test_brand_allowlist_is_exact(self):
        self.assertEqual(st.BRAND_STORES, {"ROTHWELL": ("ROTHWELL", "ANHULIOIDR3VG"),
                                           "TAWBURY": ("TAWBURY", "A3UUUOQIKX3ZFB")})


class DataRules(unittest.TestCase):
    def refuse(self, change):
        d = copy.deepcopy(DATA)
        change(d)
        with self.assertRaises(SystemExit):
            st.load(with_data(d))

    def test_a_price_stops_the_build(self):
        self.refuse(lambda d: d["configs"][0].update(price=29.99))

    def test_an_invalid_asin_stops_the_build(self):
        self.refuse(lambda d: d["configs"][0].update(asin="B0SHORT"))

    def test_more_than_six_configurations_stop_the_build(self):
        def add(d):
            extra = copy.deepcopy(d["configs"][0])
            extra.update(id="extra", asin="B000000001")
            d["configs"].append(extra)
        self.refuse(add)

    def test_conflicting_case_limits_must_say_so(self):
        self.refuse(lambda d: d["configs"][0].pop("case_limit_note"))

    def test_the_wolf_reference_is_never_linked(self):
        self.refuse(lambda d: d["reference"].update(asin="B084BSLGJW"))

    def test_a_row_without_a_maker_source_stops_the_build(self):
        self.refuse(lambda d: d["configs"][1].update(source={"label": "x", "url": ""}))


class Conversions(unittest.TestCase):
    def test_inches_to_mm_round_half_up(self):
        self.assertEqual(st.in_to_mm(7.25), 184.2)
        self.assertEqual(st.in_to_mm(6.75), 171.5)
        self.assertEqual(st.in_to_mm(1), 25.4)

    def test_cm_to_inches(self):
        self.assertEqual(st.cm_to_in(5.5), 2.2)
        self.assertEqual(st.cm_to_in(19.5), 7.7)
        self.assertEqual(st.cm_to_in(16.5), 6.5)


class Fit(unittest.TestCase):
    def test_published_slot_width_boundary(self):
        b = BY["tawbury-bayswater-8"]
        self.assertEqual(st.case_fit(b, 55), "within slot")      # the maker's words are "up to"
        self.assertEqual(st.case_fit(b, 55.1), "wider than slot")

    def test_a_case_diameter_claim_is_never_fit(self):
        s = BY["songmics-8-slot"]
        self.assertEqual(st.case_fit(s, 48), "within claim")
        self.assertEqual(st.case_fit(s, 48.5), "over claim")
        for mm in (30, 48, 60):
            self.assertNotIn(st.case_fit(s, mm), ("within slot",))

    def test_conflicting_claims_and_missing_data(self):
        self.assertEqual(st.case_fit(BY["rothwell-3-watch-roll"], 45), "conflict")
        self.assertEqual(st.case_fit(BY["tawbury-fraser-2"], 45), "unknown")

    def test_pillow_by_wrist_sizes_down_where_ranges_meet(self):
        b = BY["tawbury-bayswater-8"]
        self.assertEqual(st.pillow_for_wrist(b, 16.5), "X-Small")
        self.assertEqual(st.pillow_for_wrist(b, 18.0), "Small")
        self.assertEqual(st.pillow_for_wrist(b, 19.0), "Standard")
        self.assertIsNone(st.pillow_for_wrist(b, 19.1))            # above the maker's range
        self.assertIsNone(st.pillow_for_wrist(b, 13.9))
        self.assertIsNone(st.pillow_for_wrist(BY["songmics-8-slot"], 17))   # nothing published


class Pages(unittest.TestCase):
    def test_links_are_exact_tagged_placed_and_disclosed_first(self):
        linked = set()
        for slug, f in FILES.items():
            h = read(f)
            links = re.findall(r'<a [^>]*href="(https://www\.amazon\.com/[^"]*)"[^>]*>', h)
            self.assertTrue(links, slug)
            for tag in re.findall(r'<a [^>]*href="https://www\.amazon\.com/[^"]*"[^>]*>', h):
                self.assertRegex(tag, r'href="https://www\.amazon\.com/dp/[A-Z0-9]{10}\?tag=wriststoredp-20"')
                self.assertIn('data-placement="cohort-watch-storage"', tag)
                self.assertIn('rel="sponsored nofollow noopener"', tag)
                linked.add(re.search(r"/dp/([A-Z0-9]{10})", tag).group(1))
            self.assertLess(h.index("As an Amazon Associate"), h.index("tag=wriststoredp-20"), slug)
            self.assertNotIn("wristhomagedp-20", h)
            self.assertNotIn("wristhomage-20", h)
            for a in WOLF_ASINS:
                self.assertNotIn(a, h)
            self.assertEqual(re.findall(r"\$\s?\d", h), [], slug)
        self.assertEqual(linked, {x["asin"] for x in DATA["configs"]})

    def test_the_cohort_tag_is_on_these_pages_only(self):
        for dp, dirs, files in os.walk(ROOT):
            dirs[:] = [d for d in dirs if d not in (".git", "tests", "scripts", "data")]
            for fn in files:
                if fn.endswith((".html", ".js", ".txt", ".xml")):
                    p = os.path.join(dp, fn)
                    if p not in FILES.values():
                        self.assertNotIn("wriststoredp-20", read(p), p)

    def test_the_wolf_page_says_why_wolf_is_unlinked(self):
        h = read(FILES["wolf-watch-roll-alternatives"])
        self.assertIn("sold by recommerce, a reseller", h)
        self.assertIn("wolf1834.com", h)

    def test_case_diameter_limits_are_labelled_as_claims(self):
        h = read(FILES["watch-box-for-large-watches"])
        self.assertIn("maker claim: a case diameter, not fit", h)
        self.assertNotIn("SONGMICS 8-slot box</strong></td><td>within the published slot", h)

    def test_one_valid_faq_block_per_page_and_content_without_js(self):
        for slug, f in FILES.items():
            h = read(f)
            blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
            self.assertEqual(len(blocks), 1, slug)
            self.assertEqual(json.loads(blocks[0])["@type"], "FAQPage")
            body = re.sub(r"<script.*?</script>", "", h, flags=re.S)
            self.assertIn("<table>", body)
            self.assertIn("Checked " + DATA["checked"], body)


class Wiring(unittest.TestCase):
    def test_every_page_is_in_the_sitemap_llms_and_linked_from_the_hub(self):
        sm, lt, hub = read(os.path.join(ROOT, "sitemap.xml")), read(os.path.join(ROOT, "llms.txt")), \
            read(os.path.join(ROOT, "watches", "index.html"))
        for p in st.PAGES:
            u = f"https://wristhomage.com/watch-storage/{p['slug']}"
            self.assertIn(f"<loc>{u}</loc>", sm)
            self.assertIn(f"({u})", lt)
            self.assertIn(f'href="/watch-storage/{p["slug"]}"', hub)

    def test_the_hub_links_carry_no_product_link(self):
        hub = read(os.path.join(ROOT, "watches", "index.html"))
        block = hub[hub.index("Storing your watches"):hub.index("Common questions")]
        self.assertNotIn("amazon.com", block)

    def test_a_storage_click_is_one_paid_event_with_the_placement(self):
        js = re.search(r"<script>(.*?)</script>", gen.CLICK_JS, re.S).group(1)
        prog = """
var handler, hits = [];
var document = {addEventListener: function (t, f) { handler = f; }};
var window = {goatcounter: {count: function (o) { hits.push(o.path); }}};
var goatcounter = window.goatcounter;
""" + js + """
function click(href, placement) {
  var a = {href: href, textContent: "Amazon", dataset: {placement: placement}};
  handler({target: {closest: function () { return a; }}});
}
click("https://www.amazon.com/dp/B0DRBV8NX4?tag=wriststoredp-20", "cohort-watch-storage");
process.stdout.write(JSON.stringify(hits));
"""
        out = subprocess.run(["node", "-e", prog], capture_output=True, text=True, check=True).stdout
        self.assertEqual(json.loads(out), ["out/cohort-watch-storage/amazon/dp/b0drbv8nx4"])


if __name__ == "__main__":
    unittest.main()
