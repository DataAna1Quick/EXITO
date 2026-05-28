/* colocacion_render.js · Colocación / Posicionamiento (slides 2-4, MEDELLÍN)
 * Lee window.COLOCACION_DATA (scripts/build_colocacion_data.py) y rellena los
 * slides de colocación. Dinámico: re-correr el pipeline con nueva data los
 * actualiza. Muestra evolución completa (mes y semana ISO), sin selector.
 */
(function () {
  "use strict";
  var D = window.COLOCACION_DATA;
  if (!D || !D.medellin) { console.warn("[colocacion_render] COLOCACION_DATA no disponible."); return; }

  var T = D.meta.target;
  function pc(p) { return String(p).replace(".", ",") + "%"; }
  function set(id, html) { var n = document.getElementById(id); if (n) n.innerHTML = html; }
  function txt(id, t) { var n = document.getElementById(id); if (n) n.textContent = t; }
  function pctColor(p) { return p >= T ? "#27ae60" : (p >= 70 ? "#e67e22" : "#8e44ad"); }

  function renderS2() {
    var m = D.medellin;
    txt("coloc-sol", m.total.sol);
    txt("coloc-pos", m.total.pos);
    txt("coloc-prom-pct", pc(m.total.pct));
    set("coloc-prom-sub", "Brecha de " + pc(m.total.brecha_pp) + " vs. target " + T + "%");
    // Cards efectividad mensual
    var cards = m.por_mes.map(function (x) {
      var col = pctColor(x.pct);
      return '<div style="background:var(--exito-light);border:1px solid var(--exito-border);border-radius:8px;padding:12px 14px;text-align:center">' +
        '<div style="font-size:9px;color:var(--exito-muted);margin-bottom:4px">' + x.abbr + '</div>' +
        '<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:28px;font-weight:900;color:' + col + ';line-height:1">' + pc(x.pct) + '</div>' +
        '<div style="font-size:8px;color:var(--exito-muted);margin-top:3px">' + x.sol + ' sol · ' + x.pos + ' pos</div>' +
        '<div style="margin-top:6px;height:5px;background:#fef3c7;border-radius:3px;overflow:hidden">' +
        '<div style="width:' + Math.min(100, x.pct) + '%;height:100%;background:' + col + ';border-radius:3px"></div></div></div>';
    }).join("");
    var n = document.getElementById("coloc-efect-grid");
    if (n) { n.style.gridTemplateColumns = "repeat(" + m.por_mes.length + ",1fr)"; n.innerHTML = cards; }
  }

  function renderS3() {
    var m = D.medellin;
    txt("coloc-total-pct", pc(m.total.pct));
    txt("coloc-total-sub", pc(m.total.brecha_pp) + " vs. target " + T + "%");
    var rows = m.por_mes.map(function (x) {
      var cc = x.sin_cubrir < 0 ? "#c0392b" : "#27ae60";
      return '<tr><td><strong>' + x.abbr + '</strong></td><td>' + x.sol + '</td><td>' + x.pos + '</td>' +
        '<td style="color:' + cc + ';font-weight:700">' + x.sin_cubrir + '</td>' +
        '<td><span style="background:#fef3c7;color:#0f172a;padding:2px 8px;border-radius:10px;font-weight:700;font-size:11px">' + pc(x.pct) + '</span></td>' +
        '<td style="color:var(--exito-slate);font-size:10px">' + x.lectura + '</td></tr>';
    }).join("");
    var t = m.total;
    rows += '<tr style="background:#1f2937"><td style="color:#fff;font-weight:700;border:none">TOTAL</td>' +
      '<td style="color:#fff;border:none;font-weight:800">' + t.sol + '</td>' +
      '<td style="color:#fff;border:none;font-weight:800">' + t.pos + '</td>' +
      '<td style="color:#fbbf24;border:none;font-weight:700">' + t.sin_cubrir + '</td>' +
      '<td style="border:none"><span style="background:#f59e0b;color:#fff;padding:2px 10px;border-radius:10px;font-weight:800;font-size:12px">' + pc(t.pct) + '</span></td>' +
      '<td style="color:rgba(255,255,255,.6);border:none;font-size:10px">Brecha ' + pc(t.brecha_pp) + ' vs. target ' + T + '%</td></tr>';
    set("coloc-mensual-tbody", rows);

    // Comparativo regional
    var chips = D.regiones.map(function (r) {
      var crit = r.raw === "MEDELLIN";
      var bg = crit ? "#fef3c7" : (r.pct >= 85 ? "#d5f5e3" : "#fef3c7");
      var fg = crit ? "#1f2937" : (r.pct >= 85 ? "#1e8449" : "#1f2937");
      return '<span style="display:inline-flex;align-items:center;gap:4px;background:' + bg + ';color:' + fg +
        ';border-radius:12px;padding:3px 10px;font-size:10px;font-weight:700' +
        (crit ? ';border:1px solid rgba(245,158,11,.4)' : '') + '">' + r.zona + ' ' + pc(r.pct) + (crit ? ' ⚠' : '') + '</span>';
    }).join("");
    chips += '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--exito-light);color:var(--exito-slate);border:1px solid var(--exito-border);border-radius:12px;padding:3px 10px;font-size:10px;font-weight:700">Red total ' + pc(D.red_total.pct) + '</span>';
    set("coloc-regional-chips", chips);
    set("coloc-regional-nota", "Target " + T + "% · Medellín es la única regional crítica · brecha −" +
      String((D.red_sin_medellin - D.medellin.total.pct).toFixed(1)).replace(".", ",") + "pp vs. red excluyendo Medellín (~" + pc(D.red_sin_medellin) + ")");
  }

  function renderS4() {
    var sem = D.medellin.por_semana;
    var bars = sem.map(function (w) {
      var crit = w.pct < 70;
      return '<div class="bar-group"><div class="bar-value">' + (w.sol ? w.pct + "%" : "—") + '</div>' +
        '<div class="bar" style="height:' + Math.max(2, w.pct) + '%;background:' + w.color + '"></div>' +
        '<div class="bar-label"' + (crit ? ' style="color:' + w.color + ';font-weight:700"' : '') + '>' + w.key + '</div></div>';
    }).join("");
    set("coloc-semanal-bars", '<div class="target-line-label">TARGET ' + T + '%</div>' + bars);
  }

  function renderSparkline() {
    var sem = D.medellin.por_semana, N = sem.length;
    var card = document.getElementById("coloc-sparkline-card");
    if (!card || !N) return;
    function X(i) { return 20 + (N > 1 ? i * (768 / (N - 1)) : 0); }
    function Y(p) { return Math.min(66, Math.max(2, 70.6 - 0.686 * p)); }
    function col(p) { return p >= 95 ? "#27ae60" : (p >= 70 ? "#e67e22" : "#e74c3c"); }
    var bIdx = -1, maxDrop = 0;
    for (var i = 1; i < N; i++) { var d = sem[i - 1].pct - sem[i].pct; if (d > maxDrop) { maxDrop = d; bIdx = i - 1; } }
    var minI = 0;
    sem.forEach(function (w, i) { if (w.pct < sem[minI].pct) minI = i; });

    var pts = sem.map(function (w, i) { return X(i).toFixed(1) + "," + Y(w.pct).toFixed(1); }).join(" ");
    var dots = sem.map(function (w, i) {
      return '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(w.pct).toFixed(1) + '" r="' + (i === bIdx ? 5 : 3.5) +
        '" fill="' + col(w.pct) + '"' + (i === bIdx ? ' stroke="#fff" stroke-width="1.5"' : '') + '/>';
    }).join("");
    var labels = sem.map(function (w, i) {
      return '<text x="' + X(i).toFixed(1) + '" y="64" font-size="7" fill="#888" text-anchor="middle">' + w.key + '</text>';
    }).join("");
    var key = {}; [0, bIdx, minI, N - 1].forEach(function (i) { if (i >= 0) key[i] = 1; });
    var vlabels = Object.keys(key).map(function (k) {
      var i = +k, w = sem[i], yy = Y(w.pct);
      return '<text x="' + X(i).toFixed(1) + '" y="' + (yy > 40 ? yy + 10 : yy - 6).toFixed(1) +
        '" font-size="8" font-weight="700" fill="' + col(w.pct) + '" text-anchor="middle">' + w.pct + '%</text>';
    }).join("");
    var bline = bIdx >= 0 ? '<line x1="' + X(bIdx).toFixed(1) + '" y1="2" x2="' + X(bIdx).toFixed(1) +
      '" y2="67" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.7"/>' : "";
    var svg =
      '<svg viewBox="0 0 800 72" width="100%" height="140" preserveAspectRatio="none" style="overflow:visible;display:block">' +
        '<rect x="20" y="23" width="768" height="44" fill="rgba(231,76,60,0.07)" rx="2"/>' +
        '<rect x="20" y="5" width="768" height="18" fill="rgba(230,126,34,0.07)" rx="2"/>' +
        '<line x1="20" y1="5" x2="788" y2="5" stroke="#27ae60" stroke-width="1" stroke-dasharray="4,3" opacity="0.55"/>' +
        '<line x1="20" y1="23" x2="788" y2="23" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.45"/>' +
        bline +
        '<polyline points="' + pts + '" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        dots + labels + vlabels +
      '</svg>';
    var title = '<div style="font-size:11px;font-weight:800;letter-spacing:0.08em;color:#1f2937;text-transform:uppercase;margin-bottom:18px">' +
      'Tendencia semanal · Medellín (S01–' + sem[N - 1].key + ')' + (bIdx >= 0 ? ' · quiebre ' + sem[bIdx].key : '') + ' · target ' + T + '%</div>';
    card.innerHTML = title + svg;
  }

  function render() { renderS2(); renderS3(); renderS4(); renderSparkline(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  window.ColocacionRender = render;
})();
