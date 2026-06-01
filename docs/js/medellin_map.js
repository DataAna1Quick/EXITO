/* medellin_map.js · Operacion Exito Antioquia
 * Mapa interactivo (SDK 4.x) en slide-13 (seccion MEDELLIN). Un marker por
 * macrozona; click sobre un marker actualiza el panel de cards de la derecha.
 *
 * DINÁMICO (2026-05-29): geo estática (centroides) + datos del periodo desde
 * window.MEDELLIN_DATA (scripts/build_medellin_data.py, zonificado con el lookup
 * v3). Efectivo = Contado + Contraentrega + MISURTII.
 *
 * No toca slide-G7 (mapa país, general_map.js).
 */
(function () {
  "use strict";

  // ── 1. Geo-metadata estática por macrozona (no cambia con la data) ────────
  const GEO = {
    "Aburrá Norte (municipios)":  { lat: 6.337, lng: -75.555 },
    "Aburrá Sur (municipios)":    { lat: 6.180, lng: -75.605 },
    "Medellín – Nororiente":      { lat: 6.290, lng: -75.555 },
    "Medellín – Noroccidente":    { lat: 6.290, lng: -75.600 },
    "Medellín – Centroriente":    { lat: 6.250, lng: -75.555 },
    "Medellín – Centroccidente":  { lat: 6.250, lng: -75.595 },
    "Medellín – Suroccidente":    { lat: 6.205, lng: -75.600 },
    "Medellín – Corregimientos":  { lat: 6.210, lng: -75.700 },
    "Medellín – Otros barrios":   { lat: 6.250, lng: -75.570 },
    "Oriente Antioqueño":         { lat: 6.155, lng: -75.374 },
    "Otros municipios":           { lat: 6.488, lng: -74.405 },
  };
  const GEO_FALLBACK = { lat: 6.250, lng: -75.570 };
  const ITEM_ID = "1f2cbd3463654b97ae1f597431261a62";

  // ── 2. Estado ─────────────────────────────────────────────────────────────
  let view = null, layer = null, highlightLayer = null, initStarted = false, currentNombre = null;
  let zonas = [];

  function fmtCOP(v) { return "$" + Math.round(v).toLocaleString("en-US").replace(/,/g, "."); }
  function fmtNum(v) { return Math.round(v).toLocaleString("en-US").replace(/,/g, "."); }

  function buildZonas(payload) {
    const mz = (payload && payload.macrozonas) || [];
    return mz.map(function (m, i) {
      const cc = (m.contado || 0) + (m.contraentrega || 0);
      return {
        nombre: m.nombre, ficha: i + 1,
        centroide: GEO[m.nombre] || GEO_FALLBACK,
        servicios: m.servicios, pct_sin_riesgo: m.pct_sin_riesgo,
        recaudo_efectivo_fmt: m.recaudo_efectivo_fmt,
        contado: m.contado, contraentrega: m.contraentrega, misurtii: m.misurtii,
        bar_contado: cc ? Math.round(m.contado / cc * 100) : 50,
        bar_contraentrega: cc ? Math.round(m.contraentrega / cc * 100) : 50,
        dia_pico_fisico: m.dia_pico_fisico,
        top3_servicios: (m.top3_servicios || []).map(function (t) { return { name: t.name, val: t.val + " svc" }; }),
        top3_recaudo: (m.top3_recaudo || []).map(function (t) {
          return { name: t.name, val: fmtCOP(t.val),
                   dia_max: t.dia_max ? (t.dia_max.fecha + " · " + fmtCOP(t.dia_max.valor)) : null };
        }),
      };
    });
  }

  // ── 3. Helpers DOM (panel slide-13) ───────────────────────────────────────
  function $(sel) { const s = document.getElementById("slide-13"); return s ? s.querySelector(sel) : null; }
  function setText(sel, t) { const e = $(sel); if (e) e.textContent = t; }
  function setWidth(sel, p) { const e = $(sel); if (e) e.style.width = p + "%"; }
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderTop3(sel, items, isMoney) {
    const ul = $(sel); if (!ul) return; ul.innerHTML = "";
    items.forEach(function (it, idx) {
      const li = document.createElement("li"); li.className = "top3-item";
      const vs = isMoney ? ' style="color:#F59E0B"' : "";
      if (it.dia_max) {
        li.classList.add("top3-item--stacked");
        li.innerHTML = '<div class="top3-row"><span class="top3-rank">' + (idx + 1) + "</span>" +
          '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
          '<span class="top3-val"' + vs + ">" + escapeHtml(it.val) + "</span></div>" +
          '<div class="top3-meta">Día max: ' + escapeHtml(it.dia_max) + "</div>";
      } else {
        li.innerHTML = '<span class="top3-rank">' + (idx + 1) + "</span>" +
          '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
          '<span class="top3-val"' + vs + ">" + escapeHtml(it.val) + "</span>";
      }
      ul.appendChild(li);
    });
  }

  // ── 4. Update cards ────────────────────────────────────────────────────────
  function updateCards(z) {
    if (!z) return;
    currentNombre = z.nombre;
    setText(".med-zona-name", z.nombre);
    setText(".med-zona-ficha", "Ficha " + z.ficha + " de " + zonas.length);
    setText(".med-servicios-totales", fmtNum(z.servicios));
    setText(".med-servicios-sub", z.pct_sin_riesgo + "% sin riesgo · " + z.servicios + " servicios · ene–may 2026");
    setText(".med-recaudo-valor", z.recaudo_efectivo_fmt);
    setText(".med-recaudo-sub", "Efectivo físico · Contado + Contraentrega + MISURTII");
    setText(".med-pico-fisico", z.dia_pico_fisico ? (z.dia_pico_fisico.fecha + " · " + fmtCOP(z.dia_pico_fisico.valor)) : "—");
    setWidth(".med-bar-contado", z.bar_contado);
    setWidth(".med-bar-contraentrega", z.bar_contraentrega);
    setText(".med-leg-contado", "Contado: " + fmtCOP(z.contado));
    setText(".med-leg-contraentrega", "Contraentrega: " + fmtCOP(z.contraentrega));
    renderTop3(".med-top3-servicios", z.top3_servicios, false);
    renderTop3(".med-top3-recaudo", z.top3_recaudo, true);
  }

  window.MedellinMapUpdate = function (payload) {
    if (!payload) return;
    zonas = buildZonas(payload);
    if (view) {
      const z = zonas.find(function (x) { return x.nombre === currentNombre; }) || zonas[0];
      updateCards(z);
    }
  };

  (function seed() {
    zonas = buildZonas(window.MEDELLIN_DATA || null);
  })();

  // ── 5. Init Maps SDK ────────────────────────────────────────────────────────
  function init() {
    if (initStarted) return;
    const container = document.getElementById("medellin-map");
    if (!container) return;
    if (typeof window.require !== "function") { setTimeout(init, 250); return; }
    initStarted = true;

    window.require(["esri/WebMap", "esri/views/MapView", "esri/layers/GraphicsLayer", "esri/Graphic"],
      function (WebMap, MapView, GraphicsLayer, Graphic) {
        const webmap = new WebMap({ portalItem: { id: ITEM_ID } });
        view = new MapView({ container: "medellin-map", map: webmap, center: [-75.535, 6.205], zoom: 9,
          ui: { components: ["zoom", "attribution"] } });
        view.when(function () {
          layer = new GraphicsLayer(); highlightLayer = new GraphicsLayer();
          view.map.add(layer); view.map.add(highlightLayer);
          zonas.forEach(function (z) {
            layer.add(new Graphic({
              geometry: { type: "point", longitude: z.centroide.lng, latitude: z.centroide.lat },
              symbol: { type: "simple-marker", style: "circle", color: [46, 134, 193, 0.95], size: 18,
                        outline: { color: [255, 255, 255, 1], width: 3 } },
              attributes: { nombre: z.nombre },
            }));
            layer.add(new Graphic({
              geometry: { type: "point", longitude: z.centroide.lng, latitude: z.centroide.lat },
              symbol: { type: "text", color: [255, 255, 255, 1], haloColor: [26, 82, 118, 1], haloSize: 1,
                        text: String(z.ficha), xoffset: 0, yoffset: -4,
                        font: { size: 10, family: "Barlow Condensed, sans-serif", weight: "bold" } },
              attributes: { nombre: z.nombre, _isLabel: true },
            }));
          });
          view.on("click", function (e) {
            view.hitTest(e).then(function (res) {
              const hit = res.results.find(function (r) {
                return r.graphic && r.graphic.layer === layer && r.graphic.attributes && r.graphic.attributes.nombre;
              });
              if (!hit) return;
              const z = zonas.find(function (x) { return x.nombre === hit.graphic.attributes.nombre; });
              if (z) { updateCards(z); highlightZona(Graphic, z); }
            });
          });
          updateCards(zonas[0]);
          highlightZona(Graphic, zonas[0]);
        }, function (err) { console.warn("[medellin_map] view.when error:", err); });
      });
  }

  function highlightZona(Graphic, z) {
    if (!highlightLayer) return;
    highlightLayer.removeAll();
    highlightLayer.add(new Graphic({
      geometry: { type: "point", longitude: z.centroide.lng, latitude: z.centroide.lat },
      symbol: { type: "simple-marker", style: "circle", color: [93, 173, 226, 0.25], size: 38,
                outline: { color: [46, 134, 193, 0.9], width: 2 } },
    }));
  }

  // ── 6. Lazy init cuando slide-13 esté visible ─────────────────────────────
  function tryInit() {
    const slide = document.getElementById("slide-13");
    if (!slide) return;
    if (!document.getElementById("medellin-map")) return;
    const section = slide.closest(".section-block");
    if (!section || !section.classList.contains("active")) return;
    init();
  }
  function observe() {
    document.querySelectorAll(".section-block[data-section='medellin']").forEach(function (sec) {
      new MutationObserver(function () { if (sec.classList.contains("active")) tryInit(); })
        .observe(sec, { attributes: true, attributeFilter: ["class", "hidden"] });
    });
    const s13 = document.getElementById("slide-13");
    if (s13) new MutationObserver(function () { if (s13.classList.contains("active")) tryInit(); })
      .observe(s13, { attributes: true, attributeFilter: ["class"] });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) tryInit(); }); });
      const t = document.getElementById("medellin-map"); if (t) io.observe(t);
    }
    tryInit();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observe);
  else observe();
})();
