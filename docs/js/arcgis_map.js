/* arcgis_map.js — Mapa interactivo de regiones país (slide-G7, sección GENERAL)
 * Carga ArcGIS Maps SDK for JS 4.x + WebMap del item-id del usuario,
 * agrega 6 markers (regiones país Surtimax) y muestra popup custom con KPIs mock.
 *
 * NOTA: las coordenadas son centroides aproximados de cada región (capital).
 * Ajustar con shapefile oficial cuando esté disponible.
 */
(function () {
  "use strict";

  // 1. 5 regiones país con datos reales (data/db_real_clean_v1.csv · ene-abr 2026)
  // Generado por scripts/clean_db_real.py — re-correr al actualizar la base.
  // Santanderes: sin servicios en este período → no se incluye.
  const REGIONES = [
    {
      nombre: "Bogotá-Sabana", lat: 4.71, lng: -74.07, capital: "Bogotá",
      servicios: 7543, recaudo: "$10.259M", sinRiesgo: "74,2%",
      topClientes: [
        { name: "INVERSIONES GRUPO ROAL SAS", val: "$314,2M" },
        { name: "GUTIERREZ GIL JOSE JAIRO",   val: "$95,6M" },
        { name: "BARBOSA GUERRA YOLANDA",     val: "$90,5M" },
      ],
    },
    {
      nombre: "Antioquia", lat: 6.25, lng: -75.57, capital: "Medellín",
      servicios: 3563, recaudo: "$5.497M", sinRiesgo: "68,2%",
      topClientes: [
        { name: "CARDENAS VALENCIA SERGIO ANTONIO", val: "$86,7M" },
        { name: "CIRO NORENA MARTIN ANDRES",        val: "$76,9M" },
        { name: "SEGURA MARMOL JUAN DAVID",         val: "$63,7M" },
      ],
    },
    {
      nombre: "Costa Atlántica", lat: 10.97, lng: -74.81, capital: "Barranquilla",
      servicios: 3166, recaudo: "$4.454M", sinRiesgo: "72,9%",
      topClientes: [
        { name: "INVERSIONES LA CENTRAL DE CLEMENCIA", val: "$132,1M" },
        { name: "URREA GARCIA JUAN CAMILO",            val: "$90,7M" },
        { name: "MERCADOS LA OCTAVA S.A.S.",           val: "$77,5M" },
      ],
    },
    {
      nombre: "Eje Cafetero", lat: 4.81, lng: -75.69, capital: "Pereira",
      servicios: 1567, recaudo: "$2.135M", sinRiesgo: "54,4%",
      topClientes: [
        { name: "NARANJO DULFARY DEL SOCORRO", val: "$85,0M" },
        { name: "RESTREPO ESCOBAR LUZ AMPARO", val: "$62,3M" },
        { name: "ARIAS ARIAS NORBEY",          val: "$49,3M" },
      ],
    },
    {
      nombre: "Valle del Cauca", lat: 3.45, lng: -76.53, capital: "Cali",
      servicios: 1337, recaudo: "$1.573M", sinRiesgo: "65,0%",
      topClientes: [
        { name: "ALYAN UNIDOS S.A.S",          val: "$93,2M" },
        { name: "LOPEZ HERRERA CESAR ARMANDO", val: "$61,3M" },
        { name: "VANEGAS PARRA DIEGO ALEXANDER", val: "$57,4M" },
      ],
    },
  ];

  const ITEM_ID = "781f76fd8f9b402a82c0b1672cff38c4";

  // 2. HTML del popup
  function construirPopup(zona) {
    const top3 = zona.topClientes.length
      ? "<ol>" + zona.topClientes.map((i) =>
          `<li><span>${i.name}</span><strong>${i.val}</strong></li>`
        ).join("") + "</ol>"
      : "<em>Sin datos</em>";

    return `
      <div class="exito-popup">
        <div class="exito-popup__subtitle">Surtimax · ${zona.capital} · ene–abr 2026</div>
        <div class="exito-popup__kpis">
          <div class="exito-popup__kpi">
            <div class="exito-popup__kpi-label">Servicios</div>
            <div class="exito-popup__kpi-value">${zona.servicios.toLocaleString("es-CO")}</div>
            <div class="exito-popup__kpi-sub">acumulado 4 meses</div>
          </div>
          <div class="exito-popup__kpi">
            <div class="exito-popup__kpi-label">Recaudo efectivo</div>
            <div class="exito-popup__kpi-value">${zona.recaudo}</div>
            <div class="exito-popup__kpi-sub">% Sin riesgo: ${zona.sinRiesgo}</div>
          </div>
        </div>
        <div class="exito-popup__top3-title">Top clientes · recaudo</div>
        <div class="exito-popup__top3">${top3}</div>
        <div style="font-size:9px;color:var(--exito-muted);margin-top:8px">Fuente: <code>data/db_real_clean_v1.csv</code></div>
      </div>
    `;
  }

  // 3. Init lazy: arranca cuando slide-G7 entra en viewport o se activa
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
        center: [-73.5, 5.5],   // Colombia entera
        zoom: 6,
        ui: { components: ["zoom", "attribution"] },
      });

      view.when(() => {
        const fallback = document.querySelector(".arcgis-map-fallback");
        if (fallback) fallback.classList.add("loaded");

        const layer = new GraphicsLayer({ title: "Regiones país Surtimax" });
        view.map.add(layer);

        REGIONES.forEach((zona) => {
          layer.add(new Graphic({
            geometry: { type: "point", longitude: zona.lng, latitude: zona.lat },
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: [46, 134, 193, 0.9],
              size: 18,
              outline: { color: [255, 255, 255, 1], width: 3 },
            },
            attributes: { nombre: zona.nombre, capital: zona.capital },
            popupTemplate: {
              title: zona.nombre + " · " + zona.capital,
              content: construirPopup(zona),
              outFields: ["*"],
            },
          }));
        });
      }).catch((err) => {
        console.error("[arcgis] error inicializando mapa:", err);
      });
    });
  }

  function observe() {
    const target = document.getElementById("slide-G7");
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
