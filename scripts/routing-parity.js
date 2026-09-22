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

  ok(who + ": every row resolves to a destination", Boolean(d.href));
  ok(who + ": every row gets a button label", Boolean(d.label));
  ok(who + ": sold-out rows say so", !d.soldOut || d.label === "Check availability");

  // The query must never carry our editorial asides to a retailer.
  ok(who + ": query carries no parenthetical", d.query.indexOf("(") === -1);
  ok(who + ": query carries no internal 'control' marker", !/\bcontrol\b/i.test(d.query));
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

/* ------------------------------------------------------------------- report --- */

console.log("routing-parity: " + checks + " assertions over " +
            FIXTURES.length + " branch fixtures and " + rows.length + " live rows");
if (failures.length) {
  console.error("\nFAILED (" + failures.length + "):");
  failures.forEach(function (f) { console.error("  - " + f); });
  process.exit(1);
}
console.log("routing-parity: clean");
