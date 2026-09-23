#!/usr/bin/env node
/* Parity fixtures for data/routing-policy.js.
 *
 *   node scripts/routing-parity.js
 *
 * The policy is consumed by two surfaces — js/finder.js in the browser and
 * scripts/gen.py through node — and the whole point of the file is that they cannot
 * disagree. Sharing one module makes disagreement impossible by construction, so what
 * these fixtures guard is the other half: that the shared module still answers each
 * branch the way the site's rules say it should, and that every real row resolves to
 * something coherent.
 *
 * Every FIXTURE below is a branch of the policy, with the case that motivated it.
 * The live-data section then checks all 68 real rows for self-consistency — a tagged
 * link whose tag does not match its shape is the failure AGENTS.md 1.6 exists to stop,
 * and it is the one that still passes a naive check.
 */
"use strict";

global.window = {};
var R = require("../data/routing-policy.js");
var path = require("path");

var failures = [];
var checks = 0;

function eq(label, actual, expected) {
  checks++;
  if (actual !== expected) {
    failures.push(label + "\n      expected: " + JSON.stringify(expected) +
                  "\n      actual:   " + JSON.stringify(actual));
  }
}

function ok(label, cond) {
  checks++;
  if (!cond) failures.push(label);
}

/* ------------------------------------------------------------------ fixtures -- */

var FIXTURES = [
  {
    why: "Amazon house with a verified ASIN -> exact /dp/ link on the dp tag",
    row: { house: "Pagani Design", name: "PD-1651", asin: "B0B3TFV9T9", priceUSD: 122 },
    expect: {
      kind: "amazon",
      href: "https://www.amazon.com/dp/B0B3TFV9T9?tag=wristhomagedp-20",
      rel: "sponsored nofollow noopener", label: "Shop"
    }
  },
  {
    why: "Amazon house with no ASIN -> keyword search on the search tag",
    row: { house: "Invicta", name: "8926OB", priceUSD: 180 },
    expect: {
      kind: "amazon",
      href: "https://www.amazon.com/s?k=Invicta%208926OB%20watch&tag=wristhomage-20",
      rel: "sponsored nofollow noopener", label: "Shop"
    }
  },
  {
    why: "editorial parenthetical must NOT reach the query — the divergence that " +
         "motivated this module: gen.py stripped it from 2026-08-12, finder.js never did",
    row: { house: "Timex", name: "TW2Y88200 (1976 Lexington Reissue)", priceUSD: 149 },
    expect: {
      kind: "amazon",
      href: "https://www.amazon.com/s?k=Timex%20TW2Y88200%20watch&tag=wristhomage-20",
      query: "Timex TW2Y88200 watch"
    }
  },
  {
    why: "name repeating the house is de-duplicated, and 'control' is our word, not a shopper's",
    row: { house: "Baltany", name: "Baltany Field 36 control", priceUSD: 200 },
    expect: { query: "Baltany Field 36 watch" }
  },
  {
    why: "merchant page with a referral outranks Amazon and is disclosed as paid",
    row: { house: "Watchdives", name: "EXD-40", merchant: "watchdives",
           merchantUrl: "https://watchdives.com/products/x?ref=yupgbgih", priceUSD: 139 },
    expect: {
      kind: "watchdives", href: "https://watchdives.com/products/x?ref=yupgbgih",
      rel: "sponsored nofollow noopener", label: "Shop",
      title: R.TITLES.merchantPaid
    }
  },
  {
    why: "merchant page with NO referral must not claim sponsorship — San Martin has no " +
         "programme, and a false disclosure is one a reader cannot check",
    row: { house: "San Martin", name: "SN095-G-DA", merchant: "sanmartin",
           merchantUrl: "https://sanmartinwatches.com/shop/sn095/", priceUSD: 218 },
    expect: {
      kind: "sanmartin", rel: "nofollow noopener", title: R.TITLES.merchantFree
    }
  },
  {
    why: "sold-out merchant row still links, but says so instead of claiming a buy",
    row: { house: "San Martin", name: "SN0103-G-JS", merchant: "sanmartin",
           merchantUrl: "https://sanmartinwatches.com/shop/sn0103/",
           availability: "sold-out", priceUSD: 349 },
    expect: { kind: "sanmartin", label: "Check availability", soldOut: true }
  },
  {
    why: "first-party direct page, no programme -> plain rel and its own label",
    row: { house: "Cadisen", name: "C8053", amazon: false,
           directUrl: "https://www.cadisenwatch.com/cadisen-c8053", priceUSD: 80 },
    expect: {
      kind: "direct", href: "https://www.cadisenwatch.com/cadisen-c8053",
      rel: "nofollow noopener", label: "View product", title: R.TITLES.direct
    }
  },
  {
    why: "sold-out direct row changes its label, not its honesty",
    row: { house: "Pagani Design", name: "PD-1690", amazon: false,
           directUrl: "https://paganidesign.com/x", availability: "sold-out", priceUSD: 152 },
    expect: { kind: "direct", label: "Check availability", rel: "nofollow noopener" }
  },
  {
    why: "house with no programme at all -> honest unpaid search, never a fake tag",
    row: { house: "Steinhart", name: "Ocean One 39", priceUSD: 718 },
    expect: {
      kind: "search",
      href: "https://www.google.com/search?q=Steinhart%20Ocean%20One%2039%20watch",
      rel: "nofollow noopener", title: R.TITLES.search
    }
  },
  {
    why: "amazon:false overrides house membership — an explicit no beats the list",
    row: { house: "Pagani Design", name: "PD-X", amazon: false, priceUSD: 100 },
    expect: { kind: "search" }
  },
  {
    why: "amazon:true admits a house that is not on the list",
    row: { house: "Steinhart", name: "Ocean One 39", amazon: true, asin: "B00TESTTST", priceUSD: 718 },
    expect: { kind: "amazon", href: "https://www.amazon.com/dp/B00TESTTST?tag=wristhomagedp-20" }
  }
];

FIXTURES.forEach(function (f) {
  var d = R.resolve(f.row);
  Object.keys(f.expect).forEach(function (k) {
    eq("[" + f.row.house + " " + f.row.name + "] ." + k + "\n    why: " + f.why,
       d[k], f.expect[k]);
  });
});

/* ------------------------------------------------------------ the CTA surface -- */
/* top_cta() promises it uses exactly the link the table row would use. It used to test
 * Amazon eligibility first and break that promise for merchant rows — the sold-out
 * Watchdives WD16570 V2 Pioneer shipped a CTA to an Amazon search while its own table
 * row pointed at the exact Watchdives page. These pin the contract. */

var wdSoldOut = {
  house: "Watchdives", name: "WD16570 V2 Pioneer", merchant: "watchdives",
  merchantUrl: "https://watchdives.com/products/wd16570?ref=yupgbgih",
  amazon: true, availability: "sold-out", priceUSD: 229
};
eq("CTA for a sold-out merchant row points at the merchant page, not Amazon",
   R.cta(wdSoldOut).href, "https://watchdives.com/products/wd16570?ref=yupgbgih");
ok("that row is still flagged sold-out to the caller", R.cta(wdSoldOut).soldOut === true);
ok("and still counts as first-party, so the CTA discloses the referral",
   R.cta(wdSoldOut).firstParty === true && R.cta(wdSoldOut).paid === true);
ok("as an ALTERNATIVE, a sold-out merchant row falls back to Amazon rather than " +
   "advertising a dead product", R.alternative(wdSoldOut).viaMerchant === false);
ok("and that fallback is an Amazon link", R.alternative(wdSoldOut).href.indexOf("amazon.com") !== -1);

var wdLive = Object.assign({}, wdSoldOut, { availability: undefined });
ok("a LIVE merchant row is offered as itself, not as Amazon",
   R.alternative(wdLive).viaMerchant === true);
eq("and at its own merchant URL", R.alternative(wdLive).href, wdLive.merchantUrl);

eq("CTA for an Amazon row with an ASIN is the exact product",
   R.cta({ house: "Pagani Design", name: "PD-1651", asin: "B0B3TFV9T9" }).href,
   "https://www.amazon.com/dp/B0B3TFV9T9?tag=wristhomagedp-20");
ok("a no-programme row may not be offered as the buyable alternative",
   R.canBeAlternative({ house: "Steinhart", name: "Ocean One 39" }) === false);
ok("an Amazon row may", R.canBeAlternative({ house: "Casio", name: "MTP-B190D-1BV" }) === true);

/* ------------------------------------------------------- the both-sellers rule -- */

var pairRow = {
  house: "Watchdives", name: "EXD-40", merchant: "watchdives",
  merchantUrl: "https://watchdives.com/products/x?ref=yupgbgih",
  asin: "B0TESTPAIR", priceUSD: 100, amazonPriceUSD: 110
};
var paired = R.resolve(pairRow);
ok("both sellers render when the row has an ASIN, a merchant page and Amazon within 15%",
   paired.pair && paired.pair.length === 2);
eq("cheapest seller is FIRST, never the highest-commission one",
   paired.pair[0].price, 100);

var wide = R.resolve(Object.assign({}, pairRow, { amazonPriceUSD: 130 }));
ok("Amazon outside the 15% parity rule is not offered as a second seller", wide.pair === null);

var soldOutPair = R.resolve(Object.assign({}, pairRow, { availability: "sold-out" }));
ok("a sold-out row never offers two sellers", soldOutPair.pair === null);

var noAsinPair = R.resolve(Object.assign({}, pairRow, { asin: "" }));
ok("no verified ASIN means no Amazon half of the pair", noAsinPair.pair === null);

var cheaperAmazon = R.resolve(Object.assign({}, pairRow, { amazonPriceUSD: 95 }));
eq("when Amazon is cheaper it sorts first", cheaperAmazon.pair[0].kind, "amazon");

/* ------------------------------------------------------------- the live rows --- */

require(path.join(__dirname, "..", "data", "homages.js"));
var rows = [];
(window.HOMAGE_DATA.originals || []).forEach(function (o) {
  (o.homages || []).forEach(function (h) { rows.push(h); });
});

ok("live data loaded", rows.length > 0);

rows.forEach(function (h) {
  var d = R.resolve(h);
  var who = h.house + " " + h.name;

  // AGENTS.md 1.6 — the tag must match the link shape. A /dp/ link wearing the search
  // tag still earns and still passes a naive tag check, and quietly destroys the
  // comparison the two IDs exist to make.
  var links = [d.href].concat((d.pair || []).map(function (x) { return x.href; }));
  links.forEach(function (u) {
    if (u.indexOf("amazon.com/dp/") !== -1) {
      ok(who + ": /dp/ link must carry the dp tag", u.indexOf("tag=" + R.AMAZON_TAG_DP) !== -1);
    }
    if (u.indexOf("amazon.com/s?k=") !== -1) {
      ok(who + ": search link must carry the search tag",
         u.indexOf("tag=" + R.AMAZON_TAG) !== -1 && u.indexOf(R.AMAZON_TAG_DP) === -1);
    }
  });

  // Never claim payment where there is none, and never hide it where there is.
  if (d.kind !== "amazon" && d.href.indexOf("amazon.com") === -1) {
    var paid = R.isAffiliateLink(d.href);
    eq(who + ": rel must match whether the destination carries our referral",
       d.rel, paid ? R.SPONSORED : R.PLAIN);
  }

  // THE CONTRACT THAT BROKE. The CTA must be the same link as the table row.
  eq(who + ": CTA destination is the row's own destination", R.cta(h).href, d.href);

  ok(who + ": every row resolves to a destination", Boolean(d.href));
  ok(who + ": every row gets a button label", Boolean(d.label));
  ok(who + ": sold-out rows say so", !d.soldOut || d.label === "Check availability");

  // The query must never carry our editorial asides to a retailer.
  ok(who + ": query carries no parenthetical", d.query.indexOf("(") === -1);
  ok(who + ": query carries no internal 'control' marker", !/\bcontrol\b/i.test(d.query));
});

/* --------------------------------------------------- stock, and what it gates --- */
/* Three states, and the rules that keep "available" from being asserted. These are
 * fixtures, not live rows: the live rows carry whatever was last checked, and a test
 * that reads them would go green the day someone deletes a date. */
var TODAY_FIX = "2026-09-23";

[
  { why: "a dated check today is available",
    row: { availability: "in-stock", availabilityDate: "2026-09-22",
           availabilitySource: "amazon.com" },
    expect: { state: "in-stock", stale: false } },
  { why: "an in-stock check older than the window is NOT available any more — stock is " +
         "the fastest-rotting fact on these pages",
    row: { availability: "in-stock", availabilityDate: "2026-08-01" },
    expect: { state: "unknown", stale: true } },
  { why: "in-stock with no date is not a check, it is a claim",
    row: { availability: "in-stock" },
    expect: { state: "unknown", stale: false } },
  { why: "the five rows that carried availability before dates existed keep their state — " +
         "withdrawing 'you cannot buy this' would put a Shop button back on a dead product",
    row: { availability: "sold-out" },
    expect: { state: "sold-out", stale: false } },
  { why: "an old sold-out check does not expire into 'unknown' the way in-stock does",
    row: { availability: "sold-out", availabilityDate: "2026-01-01" },
    expect: { state: "sold-out", stale: false } },
  { why: "a row nobody has checked is unknown, which is not the same as sold out",
    row: {},
    expect: { state: "unknown", stale: false } },
  { why: "shape before calendar: Date.parse accepts 20260922, this must not",
    row: { availability: "in-stock", availabilityDate: "20260922" },
    expect: { state: "unknown", stale: false } },
  { why: "an impossible month and day passes the shape test and must still fail — this is " +
         "the one that returned in-stock, because _days gave null and the age check was skipped",
    row: { availability: "in-stock", availabilityDate: "2026-99-99" },
    expect: { state: "unknown", stale: false } },
  { why: "Date.parse normalises February 30 into March 1; round-tripping the parts catches it",
    row: { availability: "in-stock", availabilityDate: "2026-02-30" },
    expect: { state: "unknown", stale: false } },
  { why: "a check dated in the future has not happened yet",
    row: { availability: "in-stock", availabilityDate: "2027-09-22" },
    expect: { state: "unknown", stale: false } },
  { why: "the window boundary is inclusive: exactly STOCK_MAX_AGE_DAYS old still counts",
    row: { availability: "in-stock", availabilityDate: "2026-08-24" },
    expect: { state: "in-stock", stale: false } },
  { why: "one day past the window does not",
    row: { availability: "in-stock", availabilityDate: "2026-08-23" },
    expect: { state: "unknown", stale: true } },
  { why: "an impossible date on a sold-out row keeps the state and drops the date",
    row: { availability: "sold-out", availabilityDate: "2026-02-30" },
    expect: { state: "sold-out", stale: false } }
].forEach(function (f) {
  var st = R.stock(f.row, TODAY_FIX);
  eq("stock: " + f.why + " [state]", st.state, f.expect.state);
  eq("stock: " + f.why + " [stale]", st.stale, f.expect.stale);
});

/* availableAlternative() is the STRICTER gate, and it must stay stricter. canBeAlternative()
 * still answers the old question — is there a paid destination — for the CTA line on every
 * untreated page; if these two ever collapse into each other, that line disappears sitewide
 * on rows nobody has stock-checked yet. */
var amazonNoCheck = { house: "Pagani Design", name: "PD-1651", asin: "B0B3TFV9T9", priceUSD: 122 };
var amazonChecked = Object.assign({}, amazonNoCheck,
  { availability: "in-stock", availabilityDate: TODAY_FIX, availabilitySource: "amazon.com" });
var amazonSoldOut = Object.assign({}, amazonNoCheck,
  { availability: "sold-out", availabilityDate: TODAY_FIX });
var offAmazonChecked = { house: "Steinhart", name: "Ocean One 39", priceUSD: 430,
  availability: "in-stock", availabilityDate: TODAY_FIX, availabilitySource: "steinhartwatches.de" };

ok("alternative: an unchecked Amazon row may still carry the old CTA line",
   R.canBeAlternative(amazonNoCheck));
ok("alternative: but it may NOT be offered as verified available",
   !R.availableAlternative(amazonNoCheck, TODAY_FIX));
ok("alternative: a checked in-stock Amazon row may", R.availableAlternative(amazonChecked, TODAY_FIX));
ok("alternative: a sold-out row may not", !R.availableAlternative(amazonSoldOut, TODAY_FIX));
ok("alternative: in stock but nothing to link is not an alternative",
   !R.availableAlternative(offAmazonChecked, TODAY_FIX));
["2026-99-99", "2026-02-30", "2027-09-22", "20260923", ""].forEach(function (d) {
  ok("alternative: " + JSON.stringify(d) + " is not a verified availability date",
     !R.availableAlternative(Object.assign({}, amazonNoCheck,
       { availability: "in-stock", availabilityDate: d }), TODAY_FIX));
});

/* Stock must not move a destination. The block reads stock; routing does not. */
[amazonNoCheck, amazonChecked, amazonSoldOut].forEach(function (row, i) {
  eq("stock does not change where a row points [" + i + "]",
     R.resolve(row).href, R.resolve(amazonNoCheck).href);
});

/* ------------------------------------------- the generated pages, both ways --- */
/* The fixtures above prove the policy answers each branch correctly. This proves the
 * server-rendered pages actually carry those answers — closing the loop between the
 * two surfaces. js/finder.js needs no equivalent check because it calls resolve()
 * directly and renders whatever comes back; there is no second decision to compare. */

var fs = require("fs");
var dir = path.join(__dirname, "..", "watches");
var html = fs.readdirSync(dir)
  .filter(function (f) { return f.slice(-5) === ".html"; })
  .map(function (f) { return fs.readFileSync(path.join(dir, f), "utf8"); })
  .join("\n");

ok("generated watch pages were read", html.length > 10000);

// 1. every destination the policy produces is present in the generated output
var expected = {};
rows.forEach(function (h) {
  var d = R.resolve(h);
  (d.pair ? d.pair.map(function (x) { return x.href; }) : [d.href])
    .forEach(function (u) { expected[u] = (expected[u] || 0) + 1; });
});
Object.keys(expected).forEach(function (u) {
  ok("generated pages carry the policy's destination: " + u.slice(0, 78),
     html.indexOf(u.replace(/&/g, "&amp;")) !== -1 || html.indexOf(u) !== -1);
});

// 2. and nothing else. A shop link the policy did not produce is a hand-built link,
//    which is the failure mode this whole module exists to remove.
var seen = html.match(/<a class="shop[^"]*" href="([^"]+)"/g) || [];
ok("generated pages contain shop links at all", seen.length > 0);
var stray = 0;
seen.forEach(function (tag) {
  var u = tag.match(/href="([^"]+)"/)[1].replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
  if (!expected[u]) { stray++; failures.push("shop link the policy never produced: " + u); }
});
checks += seen.length;
ok("no hand-built shop links in generated output (" + seen.length + " checked)", stray === 0);

// 3. the CTA surface, same treatment. Every class="buy" link in the generated pages must
//    be a destination the policy produced — as a row's own CTA, or as the alternative
//    offered beneath an unbuyable winner. This is the check whose absence let top_cta()
//    keep its own routing while the suite still reported clean.
var ctaExpected = {};
rows.forEach(function (h) {
  ctaExpected[R.cta(h).href] = true;
  ctaExpected[R.alternative(h).href] = true;
});
var buys = html.match(/<a class="buy"[^>]*href="([^"]+)"/g) || [];
ok("generated pages contain CTA links at all", buys.length > 0);
var strayCta = 0;
buys.forEach(function (tag) {
  var u = tag.match(/href="([^"]+)"/)[1].replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
  if (!ctaExpected[u]) { strayCta++; failures.push("CTA the policy never produced: " + u); }
});
checks += buys.length;
ok("no hand-built CTA destinations in generated output (" + buys.length + " checked)",
   strayCta === 0);

// 4. and the specific regression: no page may offer the same watch from two sellers by
//    having a CTA on Amazon while that row's shop link goes to a merchant page.
var merchantRows = rows.filter(function (h) {
  var k = R.resolve(h).kind;
  return k !== "amazon" && k !== "search" && k !== "direct";
});
merchantRows.forEach(function (h) {
  var amzn = R.resolve(h).amazonHref.replace(/&/g, "&amp;");
  ok(h.house + " " + h.name + ": no CTA sends this merchant row to Amazon",
     html.indexOf('class="buy" href="' + amzn + '"') === -1);
});

// 5. the compared-alternative block, on every page that carries it. Four properties,
//    each of which has a way of going quietly wrong:
//      * it says "in stock" only with a date, a place and — where the row records one —
//        the configuration that was actually available. A reference is not an offer;
//      * every one of its buttons emits exactly ONE click event, the unpaid direct ones
//        included. data-placement alone installs no listener, and for a while the two
//        San Martin buttons emitted nothing at all;
//      * paid stays paid and unpaid stays unpaid in the shapes the portfolio ledger reads;
//      * nothing outside the block claims the placement, or the bucket stops meaning
//        "clicks from the compared pair".
var treated = ["watches/patek-nautilus.html", "watches/ap-royal-oak.html",
               "articles/best-datejust-homage.html"];
var root = path.join(__dirname, "..");

// The ledger's own classifiers, copied from moondogapps/scripts/
// moondog-affiliate-clicks-ledger.py. If a path this site emits matches neither, that
// click is reported as unclassified and silently leaves the earnings column.
var LEDGER_PAID = /^\/?(out|shop)\/(?:[a-z0-9-]+\/)?amazon\/|(^|\/)aff-/i;
var LEDGER_UNPAID = /^\/?out\/(iherb-research|brand|search)\/|^\/?shop\/(?!amazon\/)/i;

/* Run the page's OWN handler, not a copy of its logic. Reimplementing it here is how a
 * suite ends up proving that the reimplementation works. */
function replay(page, anchorTag) {
  var script = /<script>(document\.addEventListener\("click"[\s\S]*?)<\/script>/.exec(page);
  if (!script) return null;
  var ds = {};
  (anchorTag.match(/data-([a-z-]+)="([^"]*)"/g) || []).forEach(function (d) {
    var m = /data-([a-z-]+)="([^"]*)"/.exec(d);
    ds[m[1].replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] = m[2];
  });
  var href = /href="([^"]+)"/.exec(anchorTag)[1].replace(/&amp;/g, "&");
  var hits = [];
  var anchor = {
    href: href, dataset: ds, textContent: "button",
    closest: function (sel) {
      if (href.indexOf("amazon") !== -1 && sel.indexOf("a[href*=amazon]") !== -1) return this;
      if (ds.merchant && sel.indexOf("a[data-merchant]") !== -1) return this;
      if (ds.placement && sel.indexOf("a[data-placement]") !== -1) return this;
      return null;
    }
  };
  var cb = null;
  var savedDoc = global.document, savedWin = global.window, savedGc = global.goatcounter;
  global.document = { addEventListener: function (t, f) { cb = f; } };
  global.window = { goatcounter: { count: function (o) { hits.push(o.path); } } };
  global.goatcounter = global.window.goatcounter;
  try {
    new Function(script[1])();
    if (cb) cb({ target: anchor });
  } finally {
    global.document = savedDoc; global.window = savedWin; global.goatcounter = savedGc;
  }
  return hits;
}

treated.forEach(function (rel) {
  var page = fs.readFileSync(path.join(root, rel), "utf8");
  var m = page.match(/<div class="altcompare">[\s\S]*?<p class="ac-foot[\s\S]*?<\/div>/);
  ok(rel + ": carries the compared-alternative block", Boolean(m));
  if (!m) return;
  var blk = m[0];

  var lines = blk.match(/<p class="ac-stock">[\s\S]*?<\/p>/g) || [];
  ok(rel + ": every pick has its own stock sentence", lines.length > 0);
  var claimed = 0;
  lines.forEach(function (f) {
    if (f.indexOf(">In stock<") === -1) return;
    claimed++;
    ok(rel + ": every in-stock claim carries the day it was checked",
       /checked \d{4}-\d{2}-\d{2}/.test(f));
    ok(rel + ": every in-stock claim names where it was checked", / at \S/.test(f));
    // A configuration-scoped claim must say which configuration, and the other way round.
    var scoped = /in \d+ of \d+ configurations/.test(f);
    if (scoped) {
      ok(rel + ": a 1-of-N availability claim names the configuration it applies to",
         f.indexOf("\u2014") !== -1);
    }
  });
  ok(rel + ": the block claims availability at all", claimed > 0);

  // Every button: exactly one event, and the right side of the ledger.
  var anchors = blk.match(/<a class="buy"[^>]*>/g) || [];
  ok(rel + ": the block has buttons", anchors.length > 0);
  anchors.forEach(function (a) {
    var href = /href="([^"]+)"/.exec(a)[1];
    ok(rel + ": every button in the block declares the placement",
       a.indexOf('data-placement="alt-compare"') !== -1);
    var hits = replay(page, a);
    ok(rel + ": the page's own handler fires exactly once for " + href.slice(0, 52) +
       " (got " + (hits ? hits.length : "no handler") + ")",
       Boolean(hits) && hits.length === 1);
    if (!hits || hits.length !== 1) return;
    var p = hits[0];
    ok(rel + ": " + p + " carries the placement", p.indexOf("alt-compare/") !== -1);
    var paid = LEDGER_PAID.test(p), unpaid = LEDGER_UNPAID.test(p);
    ok(rel + ": " + p + " is classified by the portfolio ledger", paid || unpaid);
    // A link that earns nothing must not report itself as a paid click: that inflates
    // exactly the number this block is being measured on.
    var tagged = href.indexOf("tag=") !== -1;
    eq(rel + ": " + p + " is paid only if the destination carries our tag", paid, tagged);
  });

  var outside = page.replace(blk, "");
  ok(rel + ": nothing outside the block claims that placement",
     outside.indexOf('data-placement="alt-compare"') === -1);
});

// And the same ASIN's link in the table keeps the path it has always had, so the before
// and after of the experiment are comparable per ASIN.
var nautilus = fs.readFileSync(path.join(root, "watches/patek-nautilus.html"), "utf8");
var tableRow = (nautilus.match(/<a class="shop"[^>]*href="[^"]*\/dp\/[^"]*"[^>]*>/) || [])[0];
ok("a table row's Amazon link still exists to compare against", Boolean(tableRow));
if (tableRow) {
  var hits = replay(nautilus, tableRow.replace('class="shop"', 'class="buy"'));
  ok("the table's Amazon link emits one unplaced event (" + (hits || []).join(",") + ")",
     Boolean(hits) && hits.length === 1 && hits[0].indexOf("alt-compare") === -1 &&
     LEDGER_PAID.test(hits[0]));
}

/* ------------------------------------------------------------------- report --- */

console.log("routing-parity: " + checks + " assertions over " +
            FIXTURES.length + " branch fixtures and " + rows.length + " live rows");
if (failures.length) {
  console.error("\nFAILED (" + failures.length + "):");
  failures.forEach(function (f) { console.error("  - " + f); });
  process.exit(1);
}
console.log("routing-parity: clean");
