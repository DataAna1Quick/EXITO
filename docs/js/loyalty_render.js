/* loyalty_render.js · Fidelización de Flota (slide-8, sección MEDELLÍN)
 * Lee window.LOYALTY_DATA (generado por scripts/build_loyalty_data.py) y arma
 * la vista de fidelización por regional. Dinámico: re-correr el pipeline con
 * nueva data actualiza el slide. Mensual (la data no trae fecha diaria).
 */
(function () {
  "use strict";
  var D = window.LOYALTY_DATA;
  if (!D || !D.regionales) { console.warn("[loyalty_render] LOYALTY_DATA no disponible."); return; }

  function pctColor(p) { return p >= 80 ? "#1e8449" : (p >= 60 ? "#b9770e" : "#c0392b"); }
  function pctBg(p) { return p >= 80 ? "#e8f5e9" : (p >= 60 ? "#fef3c7" : "#fdecea"); }
  function fmtPct(p) { return p.toFixed(1).replace(".", ",") + "%"; }
  function set(id, html) { var n = document.getElementById(id); if (n) n.innerHTML = html; }

  function render() {
    var meses = D.meses, nac = D.nacional;
    var ultimo = nac[nac.length - 1];

    set("loy-sub",
      "Fuente: <code>Data_Exto_Loyalti.csv</code> · " + D.meta.rango +
      " · % Loyalty = vehículos fieles / vehículos activos · " + D.regionales.length + " regionales");

    // ── Banda nacional: KPI promedio + último + mini-barras por mes ──
    var maxN = Math.max.apply(null, nac.map(function (n) { return n.pct_loyalty; }).concat([1]));
    var bars = nac.map(function (n) {
      var h = Math.max(4, Math.round(n.pct_loyalty / maxN * 100));
      return '<div class="trend-bar"><span>' + n.abbr + '</span>' +
        '<div class="trend-bar-fill" style="height:' + h + '%;background:' + pctColor(n.pct_loyalty) + '"></div>' +
        '<b>' + fmtPct(n.pct_loyalty) + '</b></div>';
    }).join("");
    set("loy-national",
      '<div style="display:grid;grid-template-columns:200px 1fr;gap:14px;align-items:stretch">' +
        '<div class="kpi-card" style="text-align:center;border-left:4px solid #1e8449;padding:14px 18px">' +
          '<div class="kpi-label">Loyalty nacional · promedio</div>' +
          '<div class="kpi-value" style="font-size:40px;color:#1e8449">' + fmtPct(D.nacional_loy_prom) + '</div>' +
          '<div class="kpi-sub">' + ultimo.abbr + ': <strong>' + fmtPct(ultimo.pct_loyalty) + '</strong> · ' +
            ultimo.loyalty + '/' + ultimo.veh + ' VH</div>' +
        '</div>' +
        '<div class="trend-card" style="margin:0">' +
          '<div class="trend-card-label">Evolución mensual · loyalty nacional</div>' +
          '<div class="trend-bars" style="margin-top:8px">' + bars + '</div>' +
        '</div>' +
      '</div>');

    // ── Tabla por regional × mes ──
    var head = '<thead><tr><th>Regional</th>' +
      meses.map(function (m) { return '<th style="text-align:center">' + m.abbr + '</th>'; }).join("") +
      '<th style="text-align:right">Servicios</th><th style="text-align:right">VH prom</th>' +
      '<th style="text-align:right">Loyalty prom</th></tr></thead>';
    var rows = D.regionales.map(function (r) {
      var byMes = {};
      r.por_mes.forEach(function (p) { byMes[p.mes] = p; });
      var celdas = meses.map(function (m) {
        var p = byMes[m.key];
        if (!p) return '<td style="text-align:center">·</td>';
        return '<td style="text-align:center"><span style="background:' + pctBg(p.pct_loyalty) +
          ';color:' + pctColor(p.pct_loyalty) + ';padding:2px 7px;border-radius:10px;font-weight:700;font-size:11px">' +
          fmtPct(p.pct_loyalty) + '</span></td>';
      }).join("");
      return '<tr><td><strong>' + r.nombre + '</strong></td>' + celdas +
        '<td style="text-align:right">' + r.servicios_total.toLocaleString("es-CO") + '</td>' +
        '<td style="text-align:right">' + String(r.veh_prom).replace(".", ",") + '</td>' +
        '<td style="text-align:right;font-weight:700;color:' + pctColor(r.loy_prom) + '">' + fmtPct(r.loy_prom) + '</td></tr>';
    }).join("");
    set("loy-regionales", '<table class="general-table" style="font-size:11px">' + head + '<tbody>' + rows + '</tbody></table>');

    set("loy-nota",
      "<strong>Fidelización de flota:</strong> % Loyalty = vehículos que repiten servicio (fieles) sobre el total de vehículos activos del mes, por regional. " +
      "⚠️ La data llega <strong>agregada por mes</strong>, por eso loyalty se traza por mes (no por semana, a diferencia de recaudo y colocación).");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  window.LoyaltyRender = render;
})();
