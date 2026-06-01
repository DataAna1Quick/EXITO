/* medellin_render.js · Slides 12 (cover Riesgo), 14 (placas) y 16 (distribución).
 * Lee window.MEDELLIN_DATA (build_medellin_data.py). Dinámico: re-correr el
 * pipeline actualiza los slides.
 */
(function () {
  "use strict";
  var D = window.MEDELLIN_DATA;
  if (!D) { console.warn("[medellin_render] MEDELLIN_DATA no disponible."); return; }

  function fmtCOP(v) { return "$" + Math.round(v).toLocaleString("en-US").replace(/,/g, "."); }
  function fmtNum(v) { return Math.round(v).toLocaleString("en-US").replace(/,/g, "."); }
  function pc(p) { return String(p).replace(".", ",") + "%"; }
  function set(id, html) { var n = document.getElementById(id); if (n) n.innerHTML = html; }
  function txt(id, t) { var n = document.getElementById(id); if (n) n.textContent = t; }

  function renderS12() {
    var k = D.kpis;
    txt("med-s12-periodo", "Ene – May 2026");
    txt("med-s12-servicios", fmtNum(k.servicios));
    txt("med-s12-efectivo", k.recaudo_efectivo_fmt);
    txt("med-s12-efectivo-sub", "COP · Contado + Contraentrega + MISURTII · " + k.vh_efectivo + " VH con efectivo");
  }

  function renderS14() {
    function tag(r) { return r === "Crítico" ? "risk-critico" : (r === "Alto" ? "risk-alto" : "risk-moderado"); }
    var rows = (D.placas || []).map(function (p) {
      var maxStyle = p.maximo >= 20e6 ? "color:#f59e0b;font-weight:700" : "";
      var d15 = p.dias_15m > 0 ? '<td style="font-weight:700">' + p.dias_15m + '</td>' : '<td>—</td>';
      return '<tr>' +
        '<td><strong>' + p.placa + '</strong></td>' +
        '<td><span class="risk-tag ' + tag(p.riesgo) + '">' + p.riesgo + '</span></td>' +
        '<td>' + fmtCOP(p.recaudo_total) + '</td>' +
        '<td>' + p.dias_op + '</td>' +
        '<td>' + fmtCOP(p.mediana) + '</td>' +
        '<td>' + fmtCOP(p.p75) + '</td>' +
        '<td>' + fmtCOP(p.p90) + '</td>' +
        '<td style="' + maxStyle + '">' + fmtCOP(p.maximo) + '</td>' +
        '<td><span style="background:#fef3c7;color:#1f2937;padding:2px 8px;border-radius:10px;font-weight:700;font-size:11px">' + p.dias_8m + '</span></td>' +
        d15 + '</tr>';
    }).join("");
    set("med-placas-tbody", rows);
  }

  function renderS16() {
    var k = D.kpis;
    txt("med-s16-sub", k.dias_operativos_placa + " placa-días · clasificación por umbrales de recaudo diario · ene–may 2026");
    var styles = {
      "BAJO":     { bg: "#e8f5e9", fg: "#2e7d32", fill: "#27ae60", row: "" },
      "BAJO+":    { bg: "#e8f5e9", fg: "#2e7d32", fill: "#52b788", row: "" },
      "MODERADO": { bg: "#fef3c7", fg: "#0f172a", fill: "#fbbf24", row: "" },
      "ALTO":     { bg: "#ffe4cc", fg: "#e67e22", fill: "#e67e22", row: "background:rgba(230,126,34,.06);border-color:rgba(230,126,34,.2)" },
      "ALTO+":    { bg: "#fde68a", fg: "#92400e", fill: "#f59e0b", row: "background:rgba(245,158,11,.06);border-color:rgba(245,158,11,.2)" },
      "CRÍTICO":  { bg: "#e8d5f5", fg: "#8e44ad", fill: "#8e44ad", row: "background:rgba(142,68,173,.06);border-color:rgba(142,68,173,.2)" },
    };
    var rows = (D.distribucion || []).map(function (d) {
      var s = styles[d.nivel] || styles.BAJO;
      return '<div class="risk-row" style="' + s.row + '">' +
        '<div class="risk-level-badge" style="background:' + s.bg + ';color:' + s.fg + '">' + d.nivel + '</div>' +
        '<div class="risk-range">' + d.rango + '</div>' +
        '<div class="risk-bar-wrap"><div class="risk-bar-fill" style="width:' + d.pct_dias + '%;background:' + s.fill + '">' + pc(d.pct_dias) + '</div></div>' +
        '<div class="risk-stats">' +
          '<div class="risk-stat"><div class="risk-stat-val">' + d.dias + ' días</div><div class="risk-stat-label">días</div></div>' +
          '<div class="risk-stat"><div class="risk-stat-val">' + pc(d.pct_dias) + '</div><div class="risk-stat-label">% días</div></div>' +
          '<div class="risk-stat"><div class="risk-stat-val">' + pc(d.pct_recaudo) + '</div><div class="risk-stat-label">% recaudo</div></div>' +
        '</div></div>';
    }).join("");
    var a = D.alerta_dias_8m;
    rows += '<div class="brecha-alert"><div class="brecha-icon">⚠️</div>' +
      '<div class="brecha-text">' + a.dias + ' días (' + pc(a.pct_dias) + ') superan $8.000.000 — representan el ' +
      '<strong>' + pc(a.pct_recaudo) + ' del recaudo total</strong> del período</div></div>';
    set("med-distrib", rows);
  }

  function render() { renderS12(); renderS14(); renderS16(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  window.MedellinRender = render;
})();
