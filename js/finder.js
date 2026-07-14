/* wristhomage finder — editorial homepage (redesign 2026-07). Flat grid of every
 * homage, ranked by fidelity, filtered by icon / budget / movement.
 *
 * Mirrors gen.py's shop-link policy exactly: Amazon houses get a tagged affiliate
 * search (wristhomage-20); off-Amazon houses get an honest, marked non-affiliate
 * search. Shop clicks fire cookieless GoatCounter events shop/<kind>/<slug> to
 * reveal demand split (drives the add-more-programs decision), same as dupenote. */
(function () {
  "use strict";
  var DATA = (window.HOMAGE_DATA || { originals: [] });
  var AMAZON_TAG = "wristhomage-20";
  var AMAZON_HOUSES = { "Pagani Design": 1, "Invicta": 1, "Casio": 1, "Timex": 1, "Bulova": 1,
    "Seiko": 1, "Orient": 1, "Citizen": 1, "Steeldive": 1, "Cadisen": 1, "Berny": 1, "Addies": 1 };

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

  function onAmazon(h) { return h.amazon === true || (h.amazon !== false && AMAZON_HOUSES[h.house]); }

  function shopLink(h) {
    var q = h.house + " " + h.name + " watch";
    var kind, href, rel, title = "";
    if (onAmazon(h)) {
      kind = "amazon"; rel = "sponsored nofollow noopener";
      href = "https://www.amazon.com/s?k=" + encodeURIComponent(q) + "&tag=" + AMAZON_TAG;
    } else {
      kind = "search"; rel = "nofollow noopener";
      href = "https://www.google.com/search?q=" + encodeURIComponent(q);
      title = ' title="No affiliate program for this brand — plain search, and often cheaper bought direct"';
    }
    return '<a class="shop" data-shop="' + kind + '" data-slug="' + esc(slug(h.house + "-" + h.name)) +
      '" href="' + esc(href) + '" rel="' + rel + '" target="_blank"' + title + ">Shop &rsaquo;</a>";
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

  var TYPE_LABEL = { dive: "Diver", chronograph: "Chronograph", gmt: "GMT",
    pilot: "Pilot", dress: "Dress", integrated: "Integrated", everyday: "Everyday", field: "Field" };

  function cardHtml(r, i) {
    var h = r.h, o = r.o;
    var fid = h.fidelity != null ? h.fidelity : null;
    return '<article class="eh-card">' +
      '<div class="eh-plate">' +
        '<span class="no">N° ' + pad2(i + 1) + '</span>' +
        '<span class="tagpill">Homage</span>' +
        '<span class="eh-mark"><svg aria-hidden="true" focusable="false"><use href="#wa-' + esc(o.type) + '"/></svg>' +
        '<span class="t">' + esc(TYPE_LABEL[o.type] || o.type) + '</span></span>' +
      '</div>' +
      '<div class="eh-body">' +
        '<div class="toprow"><div>' +
          '<div class="eh-name">' + esc(h.house) + ' ' + esc(h.name) + '</div>' +
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
