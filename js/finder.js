/* wristhomage finder — editorial homepage (redesign 2026-07). Flat grid of every
 * homage, ranked by fidelity, filtered by icon / budget / movement.
 *
 * Shop-link policy is NOT decided here. Every routing question - Amazon eligibility,
 * /dp/ versus search, merchant-outranks-Amazon, the price-parity rule, sold-out
 * handling, whether a link is disclosed as paid - is answered by data/routing-policy.js,
 * which scripts/gen.py consumes through node for the server-rendered pages. This file
 * renders the decision; it does not make it. That file used to be two files, and they
 * drifted - see its header.
 *
 * Shop clicks fire cookieless GoatCounter events shop/<kind>/<slug> to reveal demand
 * split (drives the add-more-programs decision), same as dupenote. */
(function () {
  "use strict";
  var DATA = (window.HOMAGE_DATA || { originals: [] });
  // The single source of truth for every routing decision. Loaded by index.html
  // immediately before this file. Without it there is no honest link to draw, so
  // the finder leaves the server-rendered markup alone rather than guessing.
  var R = window.WH_ROUTING;
  if (!R) return;

  var els = {
    icon: document.getElementById("icon-filters"),
    budget: document.getElementById("budget-filters"),
    move: document.getElementById("move-filters"),
    sort: document.getElementById("sort-filters"),
    count: document.getElementById("count"),
    cards: document.getElementById("cards"),
    icons: document.getElementById("icons-list"),
  };
  if (!els.cards) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { n = Number(n); return isFinite(n) ? "$" + n.toLocaleString() : "—"; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  // Click ids come from the policy so a row reports as one product on both surfaces.
  function rowSlug(h) { return R.clickSlug(h.house, h.name); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function roman(n) {
    var M = [[10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]], out = "";
    M.forEach(function (m) { while (n >= m[0]) { out += m[1]; n -= m[0]; } });
    return out;
  }
  function moveClass(m) {
    m = String(m || "");
    if (m.indexOf("Meca-quartz") === 0) return "Meca-quartz";
    if (m.indexOf("Automatic") === 0) return "Automatic";
    if (m.indexOf("Mechanical") === 0 || m.indexOf("Manual") === 0) return "Mechanical";
    if (m.indexOf("Quartz") === 0 || m.indexOf("Solar") === 0) return "Quartz";
    return "Other";
  }

  /* Flatten: one row per homage, carrying its original */
  var ROWS = [];
  DATA.originals.forEach(function (o) {
    (o.homages || []).forEach(function (h) { ROWS.push({ h: h, o: o }); });
  });

  var state = { icon: "all", budget: "all", move: "all", sort: "fidelity" };

  var ICONS = [["all", "All"]].concat(DATA.originals.map(function (o) { return [o.id, o.name]; }));
  var BUDGETS = [["all", "Any"], ["lt", "Under $150"], ["mid", "$150–350"], ["gt", "Over $350"]];
  var MOVES = [["all", "All"]];
  ["Automatic", "Mechanical", "Meca-quartz", "Quartz"].forEach(function (cls) {
    if (ROWS.some(function (r) { return moveClass(r.h.movement) === cls; })) MOVES.push([cls, cls]);
  });
  var SORTS = [["fidelity", "Fidelity"], ["price", "Price low→high"]];

  /* Render the two-seller set the policy hands back. Cheapest FIRST - the ordering
   * is the policy's, not this file's, precisely so that the day cheapest and
   * highest-commission disagree, no surface can quietly prefer the paid one. */
  function pairHtml(h, pair) {
    var html = "";
    pair.forEach(function (x) {
      html += '<a class="shop' + (x.kind === "amazon" ? " secondary" : "") +
        '" data-shop="' + esc(x.kind) +
        '" data-slug="' + esc(rowSlug(h)) + '" href="' + esc(x.href) +
        '" rel="' + x.rel + '" target="_blank">' + esc(x.label) + " $" +
        Math.round(x.price) + ' &rsaquo;</a>';
    });
    return '<span class="shopset">' + html + "</span>";
  }

  function titleAttr(d) {
    return d.title ? ' title="' + esc(d.title) + '"' : "";
  }

  function shopLink(h) {
    var d = R.resolve(h);
    if (d.pair) return pairHtml(h, d.pair);
    return '<a class="shop" data-shop="' + esc(d.kind) + '" data-slug="' + esc(rowSlug(h)) +
      '" href="' + esc(d.href) + '" rel="' + d.rel + '" target="_blank"' + titleAttr(d) +
      '>' + esc(d.label) + ' &rsaquo;</a>';
  }

  function titleShop(h, text) {
    var d = R.resolve(h);
    return '<a class="shop" data-shop="' + esc(d.kind) + '" data-slug="' + esc(rowSlug(h)) +
      '" href="' + esc(d.href) + '" rel="' + d.rel + '" target="_blank"' + titleAttr(d) +
      '>' + text + '</a>';
  }

  function pass(r) {
    if (state.icon !== "all" && r.o.id !== state.icon) return false;
    var p = Number(r.h.priceUSD);
    if (state.budget === "lt" && !(p < 150)) return false;
    if (state.budget === "mid" && !(p >= 150 && p <= 350)) return false;
    if (state.budget === "gt" && !(p > 350)) return false;
    if (state.move !== "all" && moveClass(r.h.movement) !== state.move) return false;
    return true;
  }

  function cardHtml(r, i) {
    var h = r.h, o = r.o;
    var fid = h.fidelity != null ? h.fidelity : null;
    return '<article class="eh-card">' +
      '<div class="eh-band">' +
        '<span class="no">N° ' + pad2(i + 1) + '</span>' +
        '<span class="tagpill">Homage</span>' +
      '</div>' +
      '<div class="eh-body">' +
        '<div class="toprow"><div>' +
          '<div class="eh-name">' + titleShop(h, esc(h.house) + ' ' + esc(h.name)) + '</div>' +
          '<div class="eh-homageto">Homage to ' + esc(o.name) + '</div>' +
        '</div>' +
        '<div class="eh-fid"><div class="n">' + (fid != null ? fid : "–") + '</div><div class="t">Fidelity</div></div></div>' +
        '<div class="eh-spec">' + esc(h.size_mm) + 'mm · ' + esc(h.movement || "") +
          (h.direct ? ' <span class="muted">· often cheaper direct</span>' : '') + '</div>' +
        '<div class="eh-cardfoot">' +
          '<span class="eh-price">' + money(h.priceUSD) + '</span>' +
          '<span class="eh-cardlinks">' +
            '<a href="/watches/' + esc(o.id) + '">Specs →</a>' + shopLink(h) +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="eh-fidbar"><i style="width:' + (fid != null ? fid : 0) + '%"></i></div>' +
      '</article>';
  }

  function render() {
    var list = ROWS.filter(pass);
    list.sort(function (a, b) {
      if (state.sort === "price") return (a.h.priceUSD || 0) - (b.h.priceUSD || 0);
      return (b.h.fidelity || 0) - (a.h.fidelity || 0);
    });
    els.cards.innerHTML = list.length ? list.map(cardHtml).join("") :
      '<div class="eh-empty">No homages match those filters. Try widening the budget or movement.</div>';
    els.count.innerHTML = "<strong>" + list.length + "</strong> watch" + (list.length === 1 ? "" : "es") + " shown" +
      (state.icon !== "all" || state.budget !== "all" || state.move !== "all" ? " · filtered" : "");
  }

  function chips(el, opts, cur) {
    el.innerHTML = opts.map(function (o) {
      return '<button class="eh-chip' + (String(cur) === String(o[0]) ? " on" : "") +
        '" data-k="' + esc(o[0]) + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + esc(o[1]) + "</button>";
    }).join("");
  }
  function wire(el, opts, key) {
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-k]"); if (!b) return;
      state[key] = b.getAttribute("data-k");
      chips(el, opts, state[key]);
      render();
    });
    chips(el, opts, state[key]);
  }

  wire(els.icon, ICONS, "icon");
  wire(els.budget, BUDGETS, "budget");
  wire(els.move, MOVES, "move");
  wire(els.sort, SORTS, "sort");

  /* Shop-click events (delegated — cards re-render) */
  els.cards.addEventListener("click", function (e) {
    var a = e.target.closest("a.shop"); if (!a || !window.goatcounter || !window.goatcounter.count) return;
    // The homepage is the ONLY page carrying both trackers: index.html has the inline
    // a[href*=amazon] handler AND loads this file, so an Amazon shop click used to log
    // twice — once as out/amazon/<query>-watch and once as shop/amazon/<slug>. That put
    // the same product on two rows of every click report and made any earns-vs-dead
    // total unreliable. Amazon clicks belong to the inline tracker; this one now owns
    // only the non-Amazon links, which is the data nothing else records.
    if (a.getAttribute("data-shop") === "amazon") return;
    window.goatcounter.count({ path: "shop/" + a.getAttribute("data-shop") + "/" + a.getAttribute("data-slug"), title: "shop click", event: true });
  });

  /* The Icons — editorial index of every original */
  if (els.icons) {
    els.icons.innerHTML = DATA.originals.map(function (o, i) {
      var note = [o.house + (o.ref ? " " + o.ref : ""), o.type, o.size_mm + "mm"].join(" · ");
      return '<a class="eh-irow" href="/watches/' + esc(o.id) + '">' +
        '<span class="eh-inum">' + roman(i + 1) + '</span>' +
        '<span class="eh-imain"><span class="eh-iname">' + esc(o.name) + '</span>' +
        '<div class="eh-inote">' + esc(note) + '</div></span>' +
        '<span class="eh-iprice"><div class="t">Retail from</div><div class="n">' + money(o.priceUSD) + '</div></span>' +
        '</a>';
    }).join("");
  }

  /* Hero stats from the live dataset */
  var sh = document.getElementById("stat-homages"), so = document.getElementById("stat-originals");
  if (sh) sh.textContent = String(ROWS.length);
  if (so) so.textContent = String(DATA.originals.length);

  render();

  /* Scroll reveal — progressive enhancement with a hard safety net: elements in
   * view reveal immediately, and EVERYTHING force-reveals after 1.2s no matter
   * what, so content can never be left invisible. */
  var revealables = document.querySelectorAll("[data-reveal]");
  function revealAll() {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("revealed"); });
  }
  if ("IntersectionObserver" in window &&
      !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
    setTimeout(revealAll, 1200);
  } else {
    revealAll();
  }
})();
