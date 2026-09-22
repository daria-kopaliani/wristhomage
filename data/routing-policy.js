/* wristhomage affiliate-routing policy — THE single source of truth.
 *
 * Where a row's shop link points, what rel it carries, whether it is disclosed as
 * paid, and what the button says. Both surfaces consume THIS file and neither
 * decides anything itself:
 *
 *   js/finder.js     loads it in the browser and calls resolve() per row
 *   scripts/gen.py   loads it through node once per run and attaches the decision
 *                    to each row before rendering
 *
 * WHY IT EXISTS. The policy used to be written twice — once in gen.py, once in
 * finder.js — with comments on both sides telling the reader they mirrored each
 * other. They did not. On 2026-08-12 search_query() was added to gen.py to stop
 * editorial parentheticals leaking into retailer searches ("Timex TW2Y88200 (1976
 * Lexington Reissue) watch"); the finder was never given the same fix, so the
 * homepage and the generated pages sent shoppers to different Amazon searches for
 * the same watch. Two rows were still diverging when this file was written. A
 * policy that has to be kept in step by hand is a policy that drifts, and the
 * drift is invisible because each side looks correct on its own.
 *
 * This module returns DECISIONS, never HTML. The two surfaces render differently —
 * different class names, different click-tracking attributes — and that is fine.
 * What must not differ is where a link goes and what it claims about itself.
 *
 * Run `node scripts/routing-parity.js` after changing anything here.
 */
(function () {
  "use strict";

  // Exact /dp/ links carry their own tracking ID so Amazon's own report separates
  // exact-product conversion from search conversion — it reports per ID and nothing
  // finer, so this split IS the measurement. moondog-affiliate-audit.py fails if the
  // tag and the link shape ever disagree.
  var AMAZON_TAG = "wristhomage-20";
  var AMAZON_TAG_DP = "wristhomagedp-20";

  var AMAZON_HOUSES = {
    "Pagani Design": 1, "Invicta": 1, "Casio": 1, "Timex": 1, "Bulova": 1,
    "Seiko": 1, "Orient": 1, "Citizen": 1, "Steeldive": 1, "Cadisen": 1,
    "Berny": 1, "Addiesdive": 1,
    // verified on US Amazon 2026-08-01 (data also flipped to amazon:true)
    "San Martin": 1, "Baltany": 1, "Sugess": 1, "Watchdives": 1
  };

  // How far Amazon's price may sit from the price we verified before it is allowed
  // to appear as the second seller. Beyond this the two are not the same offer and
  // showing both would be comparing a figure we checked with one we did not.
  var PRICE_PARITY = 0.15;

  // A merchant URL is only an affiliate link when it actually carries a referral.
  // The Watchdives rows do (?ref=); the San Martin product links do not, and San
  // Martin has no affiliate programme. Marking those rel="sponsored" put a false
  // disclosure on the page — claiming payment where there is none is still a false
  // statement about the page's own incentives, and one a reader cannot check.
  var REFERRAL_PARAM = /[?&](ref|aff|affiliate|tag|awc|aw_affid)=/i;

  var SPONSORED = "sponsored nofollow noopener";
  var PLAIN = "nofollow noopener";

  // Tooltip text, centralised because the two surfaces must make the same claim.
  // Returned as text; each surface wraps it in its own title attribute.
  var TITLES = {
    merchantPaid: "Affiliate link to the maker's own product page — the price shown is read from it",
    merchantFree: "The maker's own product page. Not an affiliate link — the price shown is read from it",
    direct: "Exact first-party product page — not an affiliate link",
    search: "No affiliate program for this brand — plain search, and often cheaper bought direct"
  };

  function isAffiliateLink(url) {
    return REFERRAL_PARAM.test(url || "");
  }

  function onAmazon(h) {
    if (h.amazon === false) return false;
    return Boolean(h.amazon || AMAZON_HOUSES[h.house]);
  }

  /* Build the retailer search string from a row.
   *
   * The naive house + " " + name + " watch" leaked editorial text straight into
   * the query: parentheticals meant for readers — "PD-1664 (Chrono)", "SRPE
   * control (Seiko 5 dive)" — and rows whose name repeats the brand, giving
   * "Baltany Baltany Field 36". "control" is our own word for a reference watch
   * that is not a homage; no shopper ever types it. Each makes the search worse
   * than the bare model number would be. */
  function searchQuery(house, name) {
    house = String(house == null ? "" : house);
    name = String(name == null ? "" : name).replace(/\s*\([^)]*\)/g, "").trim();
    if (house && name.toLowerCase().indexOf(house.toLowerCase()) === 0) {
      name = name.slice(house.length).trim();
    }
    name = name.replace(/\bcontrol\b/gi, "").trim();
    var parts = [];
    if (house) parts.push(house);
    if (name) parts.push(name);
    parts.push("watch");
    return parts.join(" ").replace(/\s{2,}/g, " ");
  }

  /* A VERIFIED asin beats a keyword search, and on this site that gap was the
   * single largest known revenue defect. Audited 2026-08-29/30 against live US
   * Amazon, ordered by actual clicks: 10 of the 13 most-clicked searches did not
   * surface the watch they named — 80% of the clicks. Some were wrong identifiers
   * (WD16570 returns WD16760, a digit transposition), others named a real watch
   * the search simply cannot find. So where an asin has been verified by hand,
   * link the product directly; everything else keeps the search.
   * Do NOT fill asin from an Amazon search title — see AFFILIATE_LINK_AUDIT.md. */
  function amazonHref(h, q) {
    var asin = String(h.asin || "").trim();
    if (asin) {
      return "https://www.amazon.com/dp/" + encodeURIComponent(asin) + "?tag=" + AMAZON_TAG_DP;
    }
    return "https://www.amazon.com/s?k=" +
      encodeURIComponent(q == null ? searchQuery(h.house, h.name) : q) + "&tag=" + AMAZON_TAG;
  }

  /* Mirrors nothing — this IS the slug. A row's click event must carry the same id
   * on the generated pages as on the homepage finder, or one watch reports as two
   * products and neither number is usable. */
  function clickSlug(house, name) {
    return String(house + "-" + name).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* BOTH SELLERS, WHERE BOTH PASS. A row with a verified ASIN *and* a checked
   * merchant page has two honest destinations and the reader should pick. Ordered
   * cheapest FIRST, never highest-commission first: today those happen to agree,
   * and the day they disagree, ordering by commission would tilt the page in a way
   * no audit here would catch. Returns null unless the row has a verified asin, a
   * checked merchant page, a known Amazon price, is not sold out, and Amazon sits
   * inside PRICE_PARITY of the price we verified. */
  function sellerPair(h, q) {
    if (!h.merchantUrl || !h.amazonPriceUSD) return null;
    if (!String(h.asin || "").trim()) return null;
    if (h.availability === "sold-out") return null;
    var ours = h.priceUSD || 0;
    if (!ours) return null;
    if (Math.abs(h.amazonPriceUSD - ours) / ours > PRICE_PARITY + 1e-9) return null;
    var merchant = h.merchant || "merchant";
    return [
      { seller: merchant, kind: merchant, price: ours, href: h.merchantUrl,
        label: merchant.charAt(0).toUpperCase() + merchant.slice(1),
        rel: isAffiliateLink(h.merchantUrl) ? SPONSORED : PLAIN },
      { seller: "amazon", kind: "amazon", price: h.amazonPriceUSD,
        label: "Amazon", href: amazonHref(h, q), rel: SPONSORED }
    ].sort(function (a, b) { return a.price - b.price; });
  }

  /* The whole policy, for one row.
   *
   * Order matters and is the policy: a checked direct-merchant programme outranks
   * Amazon (Watchdives pays 6% on its own collection against the ~3.1% this site
   * actually realises on Amazon, and the merchant link is an exact product page
   * where the Amazon fallback is a keyword search). merchantUrl is NEVER filled
   * from a search or a guessed handle. Then Amazon, then a first-party direct
   * page, then an honest unpaid search. Never a fake tag. */
  function resolve(h) {
    var q = searchQuery(h.house, h.name);
    var soldOut = h.availability === "sold-out";
    // amazonHref and onAmazon ride on every decision regardless of which branch wins.
    // scripts/gen.py's top_cta() needs "the Amazon link for this row" even where the
    // row's own destination is a merchant page - a sold-out merchant row falls back to
    // Amazon for the call to action - and recomputing it there is exactly the second
    // implementation this file exists to prevent.
    var base = {
      query: q, soldOut: soldOut, slug: clickSlug(h.house, h.name), pair: null,
      onAmazon: onAmazon(h), amazonHref: amazonHref(h, q),
      // The row's own first-party page, where it has one, and whether that page
      // carries our referral. gen.py's top_cta() asks this directly; deciding it
      // there would be a second implementation of isAffiliateLink(). merchantUrl
      // wins over directUrl exactly as it does below - no row carries both today.
      firstPartyUrl: h.merchantUrl || h.directUrl || null,
      firstPartyRel: (h.merchantUrl || h.directUrl)
        ? (isAffiliateLink(h.merchantUrl || h.directUrl) ? SPONSORED : PLAIN) : null
    };

    if (h.merchantUrl) {
      var paid = isAffiliateLink(h.merchantUrl);
      return assign(base, {
        kind: h.merchant || "merchant",
        href: h.merchantUrl,
        rel: paid ? SPONSORED : PLAIN,
        title: paid ? TITLES.merchantPaid : TITLES.merchantFree,
        label: soldOut ? "Check availability" : "Shop",
        pair: sellerPair(h, q)
      });
    }
    if (onAmazon(h)) {
      return assign(base, {
        kind: "amazon", href: amazonHref(h, q), rel: SPONSORED, title: "",
        label: soldOut ? "Check availability" : "Shop"
      });
    }
    if (h.directUrl) {
      return assign(base, {
        kind: "direct", href: h.directUrl, rel: PLAIN, title: TITLES.direct,
        label: soldOut ? "Check availability" : "View product"
      });
    }
    return assign(base, {
      kind: "search",
      href: "https://www.google.com/search?q=" + encodeURIComponent(q),
      rel: PLAIN, title: TITLES.search,
      label: soldOut ? "Check availability" : "Shop"
    });
  }

  /* THE CTA THAT NAMES ONE WATCH.
   *
   * scripts/gen.py::top_cta() promises, in its own comments, that the CTA uses exactly
   * the link the table row would use. It used to keep its own precedence and test Amazon
   * eligibility FIRST, which broke that promise for any row whose destination is a
   * merchant page: the sold-out Watchdives WD16570 V2 Pioneer shipped a CTA pointing at
   * an Amazon search while its own table row pointed at the exact Watchdives product
   * page — one page offering the same watch from two sellers without saying so.
   *
   * So the destination is simply the row's decision. What the caller still chooses is
   * WORDING, which is editorial, not routing. */
  function cta(h) {
    var d = resolve(h);
    var firstParty = d.kind !== "amazon" && d.kind !== "search";
    return {
      kind: d.kind, href: d.href, rel: d.rel, soldOut: d.soldOut,
      onAmazon: d.onAmazon, firstParty: firstParty,
      paid: d.rel === SPONSORED,
      hasAsin: Boolean(String(h.asin || "").trim())
    };
  }

  /* Whether a row may be offered as "the closest one you can actually buy" beneath a
   * winner that earns nothing. Deliberately the same test the CTA block has always
   * used — this names the rule, it does not widen it. */
  function canBeAlternative(h) {
    return resolve(h).onAmazon;
  }

  /* WHAT WE KNOW ABOUT WHETHER YOU CAN BUY IT, AND WHEN WE LOOKED.
   *
   * Three states, because two would force a lie. A row we have never stock-checked is
   * NOT available and it is not sold out either — it is unknown, and a page that prints
   * "available" for it is inventing the check. Only "sold-out" existed before this, and
   * it worked precisely because its absence meant "no claim", not "in stock".
   *
   * `availability` is the state, `availabilityDate` the day someone looked, and
   * `availabilitySource` where. A state without a date is not a check: it degrades to
   * unknown rather than being taken on trust, which is the same rule AGENTS.md 1.7 sets
   * for review dates.
   *
   * AND A CHECK GOES STALE. Stock is the fastest-rotting fact on these pages — faster
   * than price, far faster than specification — so an in-stock reading older than
   * STOCK_MAX_AGE_DAYS stops being an availability claim and becomes unknown again.
   * `sold-out` does NOT expire the same way: withdrawing a "you can buy this" claim as
   * it ages is cautious, while withdrawing a "you cannot" would put the page back to
   * recommending something it last saw gone.
   *
   * Nothing here touches resolve(). Where a link goes is not a question about stock,
   * and a row whose check has aged out must keep pointing exactly where it pointed.
   */
  var STOCK_MAX_AGE_DAYS = 30;

  function _days(fromISO, today) {
    var a = Date.parse(fromISO + "T00:00:00Z"), b = Date.parse(today + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) return null;
    return Math.round((b - a) / 86400000);
  }

  function stock(h, today) {
    var raw = h.availability, date = h.availabilityDate || null;
    var out = { state: "unknown", date: date, source: h.availabilitySource || null,
                stale: false, ageDays: null };
    if (raw !== "in-stock" && raw !== "sold-out") return out;
    // Shape before calendar: "20260922" and "2026-W38-7" both parse as dates and neither
    // is the format this file writes.
    var dated = Boolean(date) && /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!dated) out.date = null;
    if (raw === "sold-out") {
      // An undated sold-out row keeps its state. Five rows carried `availability:
      // "sold-out"` before this function existed, with no date beside it, and demanding
      // one retroactively would quietly turn "we saw this gone" back into "no idea" —
      // and put a Shop button on a watch nobody can buy. The date is printed when it is
      // there and omitted when it is not.
      out.state = "sold-out";
      out.ageDays = dated && today ? _days(date, today) : null;
      return out;
    }
    if (!dated) return out;             // "in-stock" with no date is not a check
    var age = today ? _days(date, today) : null;
    out.ageDays = age;
    if (age !== null && age > STOCK_MAX_AGE_DAYS) {
      out.stale = true;
      return out;                       // state stays "unknown" — an aged check is not a claim
    }
    out.state = raw;
    return out;
  }

  /* A row that may be offered as the alternative AND has been checked to be buyable.
   *
   * Separate from canBeAlternative() on purpose. That one gates the long-standing CTA
   * line on every page and answers "is there a paid destination for this row"; tightening
   * it to demand a stock check would silently delete that line everywhere, since almost no
   * row carries one yet. This is the stricter test the compared-alternative block uses,
   * where the page says the word "available" out loud and has to mean it. */
  function availableAlternative(h, today) {
    return canBeAlternative(h) && stock(h, today).state === "in-stock";
  }

  /* Where that alternative points. A SOLD-OUT merchant page is not a buy, so it falls
   * back to Amazon rather than advertising a dead product; anything else uses the row's
   * own destination, so the alternative and the row's table entry agree. */
  function alternative(h) {
    var d = resolve(h);
    var firstParty = d.kind !== "amazon" && d.kind !== "search";
    if (firstParty && !d.soldOut) {
      return { kind: d.kind, href: d.href, rel: d.rel, viaMerchant: true,
               seller: h.merchant || "the maker" };
    }
    return { kind: "amazon", href: d.amazonHref, rel: SPONSORED, viaMerchant: false,
             seller: null };
  }

  function assign(a, b) {
    var out = {}, k;
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
    for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) out[k] = b[k];
    return out;
  }

  var api = {
    AMAZON_TAG: AMAZON_TAG, AMAZON_TAG_DP: AMAZON_TAG_DP,
    AMAZON_HOUSES: AMAZON_HOUSES, PRICE_PARITY: PRICE_PARITY,
    SPONSORED: SPONSORED, PLAIN: PLAIN, TITLES: TITLES,
    isAffiliateLink: isAffiliateLink, onAmazon: onAmazon,
    searchQuery: searchQuery, amazonHref: amazonHref, clickSlug: clickSlug,
    sellerPair: sellerPair, resolve: resolve,
    cta: cta, canBeAlternative: canBeAlternative, alternative: alternative,
    STOCK_MAX_AGE_DAYS: STOCK_MAX_AGE_DAYS, stock: stock,
    availableAlternative: availableAlternative
  };

  if (typeof window !== "undefined" && window) window.WH_ROUTING = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
