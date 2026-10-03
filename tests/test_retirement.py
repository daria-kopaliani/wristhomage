"""wristhomage#47: the 60-day sold-out retirement rule and the SSK023 search link.

Run from the repo root: python3 -m unittest discover -s tests"""
import importlib.util, os, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def module(name, rel):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, rel))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


gen = module("gen_r", "scripts/gen.py")


def row(name, since, state, days=None):
    return {"house": "San Martin", "name": name, "availability": "sold-out",
            "_routing": {"slug": "san-martin-" + name.lower(),
                         "retirement": {"state": state, "since": since, "days": days,
                                        "retireOn": None}}}


def names(data, oid):
    return [h["name"] for o in data["originals"] if o["id"] == oid for h in o["homages"]]


class LiveData(unittest.TestCase):
    """The real rows, through the real policy, on fixed dates."""

    def test_nothing_retires_on_the_day_of_the_decision(self):
        data = gen.load_data("2026-10-03")
        retired, unknown, counting = gen.apply_retirement(data)
        self.assertEqual(retired, [])
        self.assertEqual(unknown, [])
        self.assertEqual(len(counting), 10)

    def test_first_retirement_is_wd16570_at_sixty_days(self):
        # soldOutSince 2026-08-18: day 59 keeps it, day 60 retires it.
        before = gen.load_data("2026-10-16")
        self.assertEqual(gen.apply_retirement(before)[0], [])
        self.assertIn("WD16570 V2 Pioneer", names(before, "rolex-explorer-ii"))
        data = gen.load_data("2026-10-17")
        retired, _, _ = gen.apply_retirement(data)
        self.assertEqual([h["name"] for _, h in retired], ["WD16570 V2 Pioneer"])
        self.assertNotIn("WD16570 V2 Pioneer", names(data, "rolex-explorer-ii"))
        self.assertIn("PD-1693", names(data, "rolex-explorer-ii"))

    def test_every_sold_out_row_retires_eventually_without_emptying_a_page(self):
        data = gen.load_data("2026-12-31")
        retired, unknown, counting = gen.apply_retirement(data)
        self.assertEqual(len(retired), 10)
        self.assertEqual((unknown, counting), ([], []))
        for o in data["originals"]:
            self.assertTrue(o["homages"], o["id"])

    def test_retired_rows_change_the_page_month_only_through_rows_still_shown(self):
        data = gen.load_data("2026-12-31")
        gen.apply_retirement(data)
        o = next(o for o in data["originals"] if o["id"] == "rolex-explorer-ii")
        self.assertNotIn("SN0054-G-C2", [h["name"] for h in o["homages"]])
        gen.review_month(o)  # still well-formed over the remaining rows

    def test_ssk023_is_a_tagged_search_on_the_search_tag(self):
        data = gen.load_data("2026-10-03")
        h = next(h for o in data["originals"] for h in o["homages"]
                 if h["name"].startswith("SSK023"))
        d = h["_routing"]
        self.assertFalse(str(h.get("asin") or "").strip())
        self.assertEqual(d["kind"], "amazon")
        self.assertEqual(d["href"],
                         "https://www.amazon.com/s?k=Seiko%20SSK023%20watch&tag=wristhomage-20")
        self.assertNotIn("wristhomagedp-20", d["href"])
        self.assertEqual(d["cta"]["href"], d["href"])

    def test_generated_page_links_the_search_not_the_dead_asin(self):
        with open(os.path.join(ROOT, "watches", "rolex-explorer-ii.html"), encoding="utf-8") as f:
            page = f.read()
        self.assertIn("https://www.amazon.com/s?k=Seiko%20SSK023%20watch&amp;tag=wristhomage-20", page)
        self.assertNotIn("/dp/B0D3WBXVP9", page)


class Synthetic(unittest.TestCase):
    """apply_retirement() acting on the policy's answers, including the refusals."""

    def test_retired_dropped_unknown_kept_and_listed(self):
        data = {"originals": [{"id": "x", "homages": [
            row("A", "2026-01-01", "retired", 90),
            row("B", None, "unknown"),
            row("C", "2026-09-01", "counting", 30),
            {"house": "Seiko", "name": "D", "_routing": {"retirement": {"state": "listed"}}}]}]}
        retired, unknown, counting = gen.apply_retirement(data)
        self.assertEqual(names(data, "x"), ["B", "C", "D"])
        self.assertEqual([h["name"] for _, h in retired], ["A"])
        self.assertEqual([h["name"] for _, h in unknown], ["B"])
        report = "\n".join(gen.retirement_report(retired, unknown, counting))
        self.assertIn("retired (sold out 90 days, since 2026-01-01): San Martin A on /watches/x", report)
        self.assertIn("no usable soldOutSince - kept, NOT retired: San Martin B", report)

    def test_refuses_to_empty_a_page(self):
        data = {"originals": [{"id": "x", "homages": [row("A", "2026-01-01", "retired", 90)]}]}
        with self.assertRaises(SystemExit) as e:
            gen.apply_retirement(data)
        self.assertIn("301", str(e.exception))

    def test_refuses_a_row_without_a_decision(self):
        data = {"originals": [{"id": "x", "homages": [
            {"house": "Seiko", "name": "D", "_routing": {"slug": "seiko-d"}}]}]}
        with self.assertRaises(SystemExit):
            gen.apply_retirement(data)


if __name__ == "__main__":
    unittest.main()
