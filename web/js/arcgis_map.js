/* arcgis_map.js — Mapa interactivo de regionales (slide-13)
 * Carga ArcGIS Maps SDK for JS 4.x + WebMap del item-id del usuario,
 * agrega 9 markers (regionales) y muestra popup custom con KPIs
 * extraidos del DOM de los slides 18-26.
 */
(function () {
  "use strict";

  // 1. Mapeo slide → zona + centroide aproximado (lng, lat)
  // TODO: ajustar coordenadas con datos oficiales si Quick los publica.
  const REGIONES = [
    { id: "slide-18", nombre: "Aburrá Norte",            lat: 6.337, lng: -75.555 },
    { id: "slide-19", nombre: "Aburrá Sur",              lat: 6.165, lng: -75.605 },
    { id: "slide-20", nombre: "Medellín Noroccidente",   lat: 6.290, lng: -75.590 },
    { id: "slide-21", nombre: "Medellín Nororiente",     lat: 6.295, lng: -75.555 },
    { id: "slide-22", nombre: "Medellín Centroriente",   lat: 6.245, lng: -75.560 },
    { id: "slide-23", nombre: "Medellín Centroccidente", lat: 6.250, lng: -75.595 },
    { id: "slide-24", nombre: "Medellín Suroccidente",   lat: 6.215, lng: -75.610 },
    { id: "slide-25", nombre: "Medellín Corregimientos", lat: 6.270, lng: -75.660 },
    { id: "slide-26", nombre: "Otros municipios",        lat: 6.700, lng: -75.300 },
  ];

  const ITEM_ID = "781f76fd8f9b402a82c0b1672cff38c4";

  // 2. Extrae KPIs del slide ficha correspondiente
  function extraerKpisDeSlide(slideId) {
    const slide = document.getElementById(slideId);
    if (!slide) return null;
    const txt = (sel, root) => {
      const el = (root || slide).querySelector(sel);
      return el ? el.textContent.trim() : "";
    };
    const servicios = slide.querySelector(".zona-card-red");
    const recaudo   = slide.querySelector(".zona-card-yellow");
    const top3Lists = slide.querySelectorAll(".top3-list");

    const parseTop3 = (ul) => ul
      ? Array.from(ul.querySelectorAll(".top3-item")).slice(0, 3).map((li) => ({
          name: txt(".top3-name", li),
          val:  txt(".top3-val",  li),
        }))
      : [];

    return {
      servicios:       servicios ? txt(".zona-card-value", servicios) : "—",
      serviciosSub:    servicios ? txt(".zona-card-sub",   servicios) : "",
      recaudo:         recaudo   ? txt(".zona-card-value", recaudo  ) : "—",
      recaudoSub:      recaudo   ? txt(".zona-card-sub",   recaudo  ) : "",
      topPorServicios: parseTop3(top3Lists[0]),
      topPorValor:     parseTop3(top3Lists[1]),
    };
  }

  // 3. HTML del popup
  function construirPopup(zona, kpis) {
    const list = (items) => items.length
      ? "<ol>" + items.map((i) => `<li><span>${i.name}</span><strong>${i.val}</strong></li>`).join("") + "</ol>"
      : "<em>Sin datos</em>";

    return `
      <div class="exito-popup">
        <div class="exito-popup__subtitle">Operación Éxito Antioquia · Q1 2026</div>
        <div class="exito-popup__kpis">
          <div class="exito-popup__kpi">
            <div class="exito-popup__kpi-label">Servicios totales</div>
            <div class="exito-popup__kpi-value">${kpis.servicios}</div>
            <div class="exito-popup__kpi-sub">${kpis.serviciosSub}</div>
          </div>
          <div class="exito-popup__kpi">
            <div class="exito-popup__kpi-label">Recaudo efectivo</div>
            <div class="exito-popup__kpi-value">${kpis.recaudo}</div>
            <div class="exito-popup__kpi-sub">${kpis.recaudoSub}</div>
          </div>
        </div>
        <div class="exito-popup__top3-title">Top clientes · # servicios</div>
        <div class="exito-popup__top3">${list(kpis.topPorServicios)}</div>
        <a class="exito-popup__cta" data-slide="${zona.id}">→ Ver ficha completa</a>
      </div>
    `;
  }

  // 4. CTA del popup → navegar al slide-ficha (reusa el dot-nav de slides.js)
  document.addEventListener("click", (e) => {
    const cta = e.target.closest(".exito-popup__cta");
    if (!cta) return;
    const slideId = cta.dataset.slide;
    const slides = Array.from(document.querySelectorAll(".slide"));
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx < 0) return;
    const dot = document.querySelectorAll("#dot-nav .dot")[idx];
    if (dot && typeof dot.click === "function") dot.click();
  });

  // 5. Init lazy: arranca cuando slide-13 entra en viewport o se activa
  let initialized = false;
  function init() {
    if (initialized) return;
    if (typeof window.require !== "function") {
      console.warn("[arcgis] SDK no disponible — se usa la imagen de fallback.");
      return;
    }
    initialized = true;

    window.require([
      "esri/WebMap",
      "esri/views/MapView",
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
    ], function (WebMap, MapView, GraphicsLayer, Graphic) {
      const webmap = new WebMap({ portalItem: { id: ITEM_ID } });
      const view = new MapView({
        container: "arcgis-map",
        map: webmap,
        center: [-75.55, 6.40],
        zoom: 9,
        ui: { components: ["zoom", "attribution"] },
      });

      view.when(() => {
        const fallback = document.querySelector(".arcgis-map-fallback");
        if (fallback) fallback.classList.add("loaded");

        const layer = new GraphicsLayer({ title: "Regionales Éxito" });
        view.map.add(layer);

        REGIONES.forEach((zona) => {
          const kpis = extraerKpisDeSlide(zona.id);
          if (!kpis) return;
          layer.add(new Graphic({
            geometry: { type: "point", longitude: zona.lng, latitude: zona.lat },
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: [46, 134, 193, 0.9],
              size: 16,
              outline: { color: [255, 255, 255, 1], width: 2.5 },
            },
            attributes: { id: zona.id, nombre: zona.nombre },
            popupTemplate: {
              title: zona.nombre,
              content: construirPopup(zona, kpis),
              outFields: ["*"],
            },
          }));
        });
      }).catch((err) => {
        console.error("[arcgis] error inicializando mapa:", err);
        // El fallback queda visible automáticamente (no se aplica .loaded)
      });
    });
  }

  function observe() {
    const target = document.getElementById("slide-13");
    if (!target) return;
    if (target.classList.contains("active")) { init(); return; }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { init(); io.disconnect(); break; }
        }
      });
      io.observe(target);
    }
    const mo = new MutationObserver(() => {
      if (target.classList.contains("active")) { init(); mo.disconnect(); }
    });
    mo.observe(target, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe);
  } else {
    observe();
  }
})();
