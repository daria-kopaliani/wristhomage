/* wristhomage finder — filterable homage database (DOM only). Mirrors gen.py's
 * shop-link policy exactly: Amazon houses get a tagged affiliate search
 * (wristhomage-20); off-Amazon houses get an honest, marked non-affiliate search.
 * Shop clicks fire cookieless GoatCounter events shop/<kind>/<slug> to reveal
 * demand split (drives the add-more-programs decision), same as dupenote. */
(function () {
  "use strict";
  var DATA = (window.HOMAGE_DATA || { originals: [] });
  var AMAZON_TAG = "wristhomage-20";
  var AMAZON_HOUSES = { "Pagani Design": 1, "Invicta": 1, "Casio": 1, "Timex": 1, "Bulova": 1,
    "Seiko": 1, "Orient": 1, "Citizen": 1, "Steeldive": 1, "Cadisen": 1, "Berny": 1, "Addies": 1 };

  var els = {
    q: document.getElementById("q"),
    budget: document.getElementById("budget-filters"),
    move: document.getElementById("move-filters"),
    count: document.getElementById("count"),
    cards: document.getElementById("cards"),
  };
  if (!els.cards) return;

  var state = { q: "", budget: 0, move: "all" };
  var BUDGETS = [[0, "Any price"], [150, "Under $150"], [300, "Under $300"], [600, "Under $600"]];
  var MOVES = [["all", "Any movement"], ["Automatic", "Automatic"], ["Meca-quartz", "Meca-quartz"],
    ["Mechanical", "Mechanical chrono"], ["Quartz", "Quartz"]];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { n = Number(n); return isFinite(n) ? "$" + n.toLocaleString() : "—"; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

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

  function passHomage(h) {
    if (state.budget && Number(h.priceUSD) > state.budget) return false;
    if (state.move !== "all" && String(h.movement || "").indexOf(state.move) === -1) return false;
    return true;
  }

  function matchOriginal(o) {
    if (!state.q) return true;
    var hay = (o.name + " " + o.house + " " + (o.cues || []).join(" ") + " " + o.type).toLowerCase();
    return hay.indexOf(state.q.toLowerCase()) !== -1;
  }

  function homageRow(h) {
    return '<div class="hrow">' +
      '<div class="fid">' + esc(h.fidelity != null ? h.fidelity : "–") + '<s>fidelity</s></div>' +
      '<div class="hinfo"><div class="nm">' + esc(h.name) + ' <span class="meta">· ' + esc(h.house) + '</span></div>' +
      '<div class="meta">' + money(h.priceUSD) + ' · ' + esc(h.movement || "") + ' · ' + esc(h.size_mm) + 'mm · ' + esc(h.wr_m) + 'm' +
      (h.direct ? ' · <span class="muted">often cheaper direct</span>' : '') + '</div>' +
      (h.note ? '<div class="note">' + esc(h.note) + '</div>' : '') + '</div>' +
      '<div class="buy">' + shopLink(h) + '</div></div>';
  }

  function card(o) {
    var homages = (o.homages || []).filter(passHomage).sort(function (a, b) { return (b.fidelity || 0) - (a.fidelity || 0); });
    if (!homages.length) return "";
    return '<article class="card">' +
      '<div class="card-head"><svg class="wa" viewBox="0 0 48 48" aria-hidden="true"><use href="#wa-' + esc(o.type) + '"/></svg>' +
      '<div><h3><a href="/watches/' + esc(o.id) + '">' + esc(o.name) + ' homages</a></h3>' +
      '<div class="house">' + esc(o.house) + ' · ' + esc(o.type) + ' · ' + esc(o.size_mm) + 'mm · ' + money(o.priceUSD) + ' original</div></div></div>' +
      homages.map(homageRow).join("") +
      '<div class="more"><a href="/watches/' + esc(o.id) + '">Full ' + esc(o.name) + ' breakdown &rsaquo;</a></div>' +
      '</article>';
  }

  function render() {
    var list = DATA.originals.filter(matchOriginal).map(function (o) {
      return { o: o, html: card(o) };
    }).filter(function (x) { return x.html; });
    var nH = 0;
    DATA.originals.filter(matchOriginal).forEach(function (o) { nH += (o.homages || []).filter(passHomage).length; });
    els.count.textContent = nH + " homage" + (nH === 1 ? "" : "s") + " across " + list.length + " icon" + (list.length === 1 ? "" : "s") +
      (state.q || state.budget || state.move !== "all" ? " matched" : "");
    els.cards.innerHTML = list.length ? list.map(function (x) { return x.html; }).join("") :
      '<div class="empty">No homages match those filters. Try widening the budget or movement.</div>';
  }

  function chips(el, opts, key, cur) {
    el.innerHTML = opts.map(function (o) {
      return '<button class="chip" data-k="' + esc(o[0]) + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + esc(o[1]) + "</button>";
    }).join("");
  }

  els.q.addEventListener("input", function () { state.q = els.q.value; render(); });
  els.budget.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]"); if (!b) return;
    state.budget = Number(b.getAttribute("data-k")); chips(els.budget, BUDGETS, "budget", state.budget); render();
  });
  els.move.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]"); if (!b) return;
    state.move = b.getAttribute("data-k"); chips(els.move, MOVES, "move", state.move); render();
  });
  els.cards.addEventListener("click", function (e) {
    var a = e.target.closest("a.shop"); if (!a || !window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({ path: "shop/" + a.getAttribute("data-shop") + "/" + a.getAttribute("data-slug"), title: "shop click", event: true });
  });

  chips(els.budget, BUDGETS, "budget", 0);
  chips(els.move, MOVES, "move", "all");
  render();
})();
