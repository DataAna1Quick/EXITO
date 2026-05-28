/* dashboard_dynamic.js · Sección GENERAL país (Surtimax)
 * Lee window.DASHBOARD_DATA (generado por scripts/build_dashboard_data.py)
 * y re-dibuja los slides G2 (KPIs + tendencia), G3 (top 10) y G5 (efectividad)
 * según el periodo elegido en el selector mes/semana.
 *
 * Selector:
 *   - Mes: Todos · cada mes.
 *   - Semana: Todas · semanas (filtradas por el mes elegido). 1..N, no dependen del mes.
 *   - Periodo activo = semana (si hay) → mes (si hay) → "todos".
 */
(function () {
  "use strict";
  var DATA = window.DASHBOARD_DATA;
  if (!DATA || !DATA.periodos) {
    console.warn("[dashboard_dynamic] window.DASHBOARD_DATA no disponible.");
    return;
  }

  var state = { mes: "todos", semana: "todas" };

  function activeKey() {
    if (state.semana && state.semana !== "todas") return state.semana;
    if (state.mes && state.mes !== "todos") return state.mes;
    return "todos";
  }
  function payload() { return DATA.periodos[activeKey()] || DATA.periodos.todos; }

  // ── helpers ────────────────────────────────────────────────────────────────
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function setHTML(id, html) { var n = document.getElementById(id); if (n) n.innerHTML = html; }
  function setText(id, txt) { var n = document.getElementById(id); if (n) n.textContent = txt; }

  // ── Selector UI ──────────────────────────────────────────────────────────
  var bar, selMes, selSem;
  function buildSelector() {
    bar = el("div", { id: "gen-period-selector" });
    bar.style.cssText =
      "position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:1200;" +
      "display:none;gap:10px;align-items:center;background:#fff;border:1px solid #d6dee6;" +
      "box-shadow:0 4px 14px rgba(0,0,0,.12);border-radius:30px;padding:6px 14px;font-size:12px;" +
      "font-family:'Barlow',sans-serif;";
    var lab = el("span", null, "📅 Periodo:");
    lab.style.cssText = "font-weight:700;color:#1a5276;";
    selMes = el("select", { id: "gen-sel-mes" });
    selSem = el("select", { id: "gen-sel-sem" });
    [selMes, selSem].forEach(function (s) {
      s.style.cssText = "font-family:inherit;font-size:12px;padding:4px 8px;border-radius:6px;" +
        "border:1px solid #c3ced9;background:#f7fafc;color:#1f2937;cursor:pointer;";
    });
    bar.appendChild(lab);
    bar.appendChild(selMes);
    bar.appendChild(selSem);
    document.body.appendChild(bar);

    // Opciones de mes
    selMes.appendChild(el("option", { value: "todos" }, "Todos los meses"));
    DATA.index.meses.forEach(function (m) {
      selMes.appendChild(el("option", { value: m.key }, m.label));
    });
    refreshWeeks();

    selMes.addEventListener("change", function () {
      state.mes = selMes.value; state.semana = "todas";
      refreshWeeks(); render();
    });
    selSem.addEventListener("change", function () {
      state.semana = selSem.value; render();
    });
  }

  function refreshWeeks() {
    selSem.innerHTML = "";
    selSem.appendChild(el("option", { value: "todas" }, "Todas las semanas"));
    var keys = (state.mes === "todos")
      ? DATA.index.semanas.map(function (s) { return s.key; })
      : (DATA.index.semanas_por_mes[state.mes] || []);
    keys.forEach(function (k) {
      var s = DATA.index.semanas.find(function (x) { return x.key === k; });
      selSem.appendChild(el("option", { value: k }, s ? s.label : k));
    });
  }

  // Mostrar/ocultar selector según sección activa (sin tocar slides.js)
  function showBar(v) { if (bar) bar.style.display = v ? "flex" : "none"; }
  function wireVisibility() {
    document.querySelectorAll('.section-tab[data-section],.landing-btn[data-section]').forEach(function (b) {
      b.addEventListener("click", function () { showBar(b.dataset.section === "general"); });
    });
    var back = document.getElementById("back-to-menu");
    if (back) back.addEventListener("click", function () { showBar(false); });
  }

  // ── Renderers ──────────────────────────────────────────────────────────────
  function render() {
    var p = payload();
    renderG2(p);
    renderG3(p);
    renderG5(p);
    if (typeof window.GeneralMapUpdate === "function") {
      try { window.GeneralMapUpdate(p); } catch (e) { console.warn(e); }
    }
  }

  function card(cls, label, value, sub) {
    return '<div class="zona-card ' + cls + '" style="padding:10px 14px">' +
      '<div class="zona-card-label" style="font-size:10px">' + label + '</div>' +
      '<div class="zona-card-value" style="font-size:22px">' + value + '</div>' +
      '<div class="zona-card-sub" style="font-size:10px">' + (sub || "") + '</div></div>';
  }

  function renderG2(p) {
    var k = p.kpis;
    setHTML("gen-g2-sub",
      'Recaudo total país: <strong>' + k.recaudo_total_fmt + '</strong> · ' +
      p.label + ' · datos reales · barras en millones ($M)');
    setHTML("gen-kpi-band",
      card("zona-card-red", "Servicios totales", k.servicios.toLocaleString("es-CO"),
        DATA.index.meses.length + " meses · 5 regiones") +
      card("zona-card-yellow", "Recaudo total país", k.recaudo_total_fmt,
        "Efectivo " + String(k.pct_efectivo).replace(".", ",") + "% · " + k.recaudo_efectivo_fmt) +
      card("", "Clientes activos", k.clientes.toLocaleString("es-CO"), "clientes únicos") +
      card("", "Vehículos en operación", k.vh, k.prom_diario_fmt + " / día"));

    // Tendencia (adaptativa)
    var t = p.tendencia;
    var maxByRegion = t.regiones.map(function (r) { return Math.max.apply(null, r.valores_M.concat([1])); });
    var leaderIdx = 0, leaderTot = -1;
    t.regiones.forEach(function (r, i) { if (r.total_M > leaderTot) { leaderTot = r.total_M; leaderIdx = i; } });
    var totalPais = t.regiones.reduce(function (a, r) { return a + r.total_M; }, 0) || 1;

    var grid = t.regiones.map(function (r, i) {
      var mx = maxByRegion[i];
      var bars = r.valores_M.map(function (v, j) {
        var h = Math.max(3, Math.round(v / mx * 100));
        var down = j > 0 && v < r.valores_M[j - 1];
        return '<div class="trend-bar"><span>' + t.buckets[j] + '</span>' +
          '<div class="trend-bar-fill' + (down ? " trend-bar-fill--down" : "") + '" style="height:' + h + '%"></div>' +
          '<b>$' + v.toLocaleString("es-CO") + 'M</b></div>';
      }).join("");
      return '<div class="trend-card' + (i === leaderIdx ? " trend-card--leader" : "") + '">' +
        '<div class="trend-card-label">' + r.region + '</div>' +
        '<div class="trend-card-total">$' + r.total_M.toLocaleString("es-CO") + 'M</div>' +
        '<div class="trend-card-share">' + (r.total_M / totalPais * 100).toFixed(1).replace(".", ",") + '% del país</div>' +
        '<div class="trend-bars">' + bars + '</div></div>';
    }).join("");
    var gridNode = document.getElementById("gen-trend-grid");
    if (gridNode) { gridNode.style.gridTemplateColumns = "repeat(" + t.regiones.length + ",1fr)"; gridNode.innerHTML = grid; }

    // Total país por bucket
    var vals = t.total_por_bucket_M, mx = Math.max.apply(null, vals.concat([0])), mn = Math.min.apply(null, vals.concat([Infinity]));
    var label = (t.granularidad === "mes") ? "Total país por mes"
      : (t.granularidad === "semana") ? "Total país por semana" : "Total país por día";
    var months = vals.map(function (v, j) {
      var cls = "trend-country-month" + (v === mx ? " trend-country-month--peak" : (v === mn ? " trend-country-month--low" : ""));
      var tag = (v === mx ? " · pico" : (v === mn ? " · bajo" : ""));
      return '<div class="' + cls + '"><span class="m-label">' + t.buckets[j] + tag + '</span><strong>$' + v.toLocaleString("es-CO") + 'M</strong></div>';
    }).join("");
    setHTML("gen-trend-country", '<div class="trend-country-label">' + label + '</div><div class="trend-country-bars">' + months + '</div>');
  }

  function renderG3(p) {
    setHTML("gen-g3-sub",
      "Top 10 clientes nacional · recaudo total + evolución por mes + día pico + ticket promedio · " + p.label);
    var meses = DATA.index.meses;
    var head =
      '<thead><tr>' +
      '<th rowspan="2" style="width:32px">#</th><th rowspan="2">Cliente</th><th rowspan="2">Región</th>' +
      '<th rowspan="2" style="text-align:right">Svc</th>' +
      '<th rowspan="2" style="text-align:right">Recaudo total</th>' +
      '<th colspan="' + meses.length + '" style="text-align:center;background:var(--exito-yellow-soft)">Total mes ($M)</th>' +
      '<th rowspan="2" style="text-align:center">Día mayor recaudo</th>' +
      '<th rowspan="2" style="text-align:right">Rec. día ($M)</th>' +
      '<th rowspan="2" style="text-align:right">Ticket prom día ($M)</th></tr><tr>' +
      meses.map(function (m) { return '<th style="text-align:right;background:var(--exito-yellow-soft)">' + m.abbr + '</th>'; }).join("") +
      '</tr></thead>';

    var rows = p.top_clientes.map(function (c, i) {
      var celdasMes = meses.map(function (m) {
        var v = c.por_mes_M ? c.por_mes_M[m.key] : null;
        return '<td style="text-align:right;background:var(--exito-yellow-soft)">' + (v == null ? "·" : "$" + v.toFixed(1).replace(".", ",")) + '</td>';
      }).join("");
      return '<tr><td>' + (i + 1) + '</td><td>' + c.nombre + '</td><td>' + c.region + '</td>' +
        '<td style="text-align:right">' + c.servicios + '</td>' +
        '<td style="text-align:right"><strong>' + c.recaudo_fmt + '</strong></td>' +
        celdasMes +
        '<td style="text-align:center">' + c.dia_max.fecha + '</td>' +
        '<td style="text-align:right">$' + (c.dia_max.valor / 1e6).toFixed(1).replace(".", ",") + '</td>' +
        '<td style="text-align:right">$' + (c.dia_max.ticket / 1e6).toFixed(2).replace(".", ",") + '</td></tr>';
    }).join("");

    setHTML("gen-top10-table", head + "<tbody>" + rows + "</tbody>");
  }

  function renderG5(p) {
    var ef = p.efectividad.slice().sort(function (a, b) { return b.pct_sin_riesgo - a.pct_sin_riesgo; });
    var totSR = ef.reduce(function (a, e) { return a + e.sin_riesgo; }, 0);
    var totT = ef.reduce(function (a, e) { return a + e.total; }, 0) || 1;
    setText("gen-g5-prom", (totSR / totT * 100).toFixed(1).replace(".", ",") + "%");
    setText("gen-g5-prom-sub", totSR.toLocaleString("es-CO") + " sin riesgo / " + totT.toLocaleString("es-CO"));

    var rows = ef.map(function (e) {
      var cls = e.pct_sin_riesgo >= 70 ? "risk-row--good" : (e.pct_sin_riesgo >= 60 ? "risk-row--mid" : "risk-row--bad");
      var nota = e.pct_sin_riesgo < 55 ? " · crítica" : "";
      return '<div class="risk-row ' + cls + '"><div class="risk-region">' + e.region + '</div>' +
        '<div class="risk-bar-track"><div class="risk-bar-fill" style="width:' + e.pct_sin_riesgo + '%">' +
        e.pct_sin_riesgo.toFixed(1).replace(".", ",") + '%</div></div>' +
        '<div class="risk-counts"><strong>' + e.sin_riesgo.toLocaleString("es-CO") + '</strong> / ' + e.total.toLocaleString("es-CO") + nota + '</div></div>';
    }).join("");
    setHTML("gen-risk-rank", rows);
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    buildSelector();
    wireVisibility();
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DashboardDynamic = { render: render, getPayload: payload, getKey: activeKey };
})();
