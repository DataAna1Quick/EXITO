/* general_map.js · Operacion Surtimax NACIONAL
 * Mapa interactivo full SDK (4.x) en slide-G7 (seccion GENERAL).
 * 5 markers (uno por region operativa Surtimax). Click sobre un marker
 * actualiza el panel de cards de la derecha con los datos de esa region.
 *
 * Datos extraidos de data/db_real/RECAUDO_NACIONAL_LIMPIO.xlsx
 * (periodo 2026-01-02 -> 2026-04-27, agregado por columna REGIONAL).
 *
 * No toca slide-13 (mapa Medellin) ni nada fuera de slide-G7.
 */
(function () {
  "use strict";

  // ── 1. Datos por region (extraidos del Excel RECAUDO_NACIONAL_LIMPIO.xlsx) ─
  // Periodo: 2 ene - 27 abr 2026 (~4 meses calendario, dias operativos por region).
  // CLIENTES_ALTA_CONCENTRACION = lista de clientes con recaudo total > $5.000.000
  // en la region. Riesgo Quick: efectivo concentrado en pocos clientes -> robo/incidente.
  const REGIONES = [
    {
      id: "FUNZA",
      nombre: "Bogotá – Sabana",
      capital: "Bogotá / Funza",
      centroide: { lat: 4.71, lng: -74.07 },
      servicios_totales: 7558,
      recaudo_total: 10280703582,
      dias_operativos: 92,
      top3_recaudo: [
        { name: "INVERSIONES GRUPO ROAL SAS", val: 314207655 },
        { name: "GUTIERREZ GIL JOSE JAIRO", val: 95571727 },
        { name: "BARBOSA GUERRA YOLANDA", val: 90475293 },
      ],
      alta_concentracion_count: 542,
      alta_concentracion_total: 8731025631,
      alta_concentracion_top: [
        { name: "INVERSIONES GRUPO ROAL SAS", val: 314207655 },
        { name: "GUTIERREZ GIL JOSE JAIRO", val: 95571727 },
        { name: "BARBOSA GUERRA YOLANDA", val: 90475293 },
        { name: "RODRIGUEZ FORERO FRANCISCO", val: 86303877 },
        { name: "SUPERMERCADOS LOS PAISAS J J SAS", val: 84210349 },
        { name: "RUIZ FRANCO HENRY", val: 80650036 },
        { name: "VELASQUEZ PEDRO ADRIANO", val: 75251512 },
        { name: "PINZON GONZALEZ WILLIAM", val: 72768832 },
      ],
    },
    {
      id: "MEDELLIN",
      nombre: "Antioquia",
      capital: "Medellín",
      centroide: { lat: 6.25, lng: -75.57 },
      servicios_totales: 3600,
      recaudo_total: 5586446728,
      dias_operativos: 95,
      top3_recaudo: [
        { name: "CARDENAS VALENCIA SERGIO ANTONIO", val: 86651392 },
        { name: "CIRO NOREÑA MARTIN ANDRES", val: 76915962 },
        { name: "SEGURA MARMOL JUAN DAVID", val: 63743933 },
      ],
      alta_concentracion_count: 341,
      alta_concentracion_total: 4883771537,
      alta_concentracion_top: [
        { name: "CARDENAS VALENCIA SERGIO ANTONIO", val: 86651392 },
        { name: "CIRO NOREÑA MARTIN ANDRES", val: 76915962 },
        { name: "SEGURA MARMOL JUAN DAVID", val: 63743933 },
        { name: "INVERSIONES DIYANVIMA SAS", val: 62863769 },
        { name: "GONZALEZ LOPEZ JULIAN JAHIR", val: 58337019 },
        { name: "SUPERMERCADO MERCA AHORRO S.A.S.", val: 57228649 },
        { name: "GIRALDO MARIN LILIANA MARIA", val: 54123447 },
        { name: "SANCHEZ SALAZAR LUCERO DEL SOCORRO", val: 53103048 },
      ],
    },
    {
      id: "COSTA",
      nombre: "Costa Atlántica",
      capital: "Barranquilla",
      centroide: { lat: 10.97, lng: -74.81 },
      servicios_totales: 3206,
      recaudo_total: 4535497046,
      dias_operativos: 96,
      top3_recaudo: [
        { name: "INVERSIONES LA CENTRAL DE CLEMENCIA", val: 134024512 },
        { name: "URREA GARCIA JUAN CAMILO", val: 90724479 },
        { name: "MERCADOS LA OCTAVA S.A.S.", val: 77488912 },
      ],
      alta_concentracion_count: 255,
      alta_concentracion_total: 3634714727,
      alta_concentracion_top: [
        { name: "INVERSIONES LA CENTRAL DE CLEMENCIA", val: 134024512 },
        { name: "URREA GARCIA JUAN CAMILO", val: 90724479 },
        { name: "MERCADOS LA OCTAVA S.A.S.", val: 77488912 },
        { name: "CARREÑO PLATA MERCEDES", val: 75937281 },
        { name: "PEDROZO VILLALOBOS JUAN LUIS", val: 62685154 },
        { name: "AUTOSERVICIO EL GANGAZO DE PASACABA", val: 61607119 },
        { name: "AISALEZ AISALEZ YEISON", val: 61454885 },
        { name: "FIGUEROA BALLESTEROS YASENYS ESTHER", val: 55026220 },
      ],
    },
    {
      id: "EJE",
      nombre: "Eje Cafetero",
      capital: "Pereira",
      centroide: { lat: 4.81, lng: -75.69 },
      servicios_totales: 1567,
      recaudo_total: 2135368507,
      dias_operativos: 86,
      top3_recaudo: [
        { name: "NARANJO DULFARY DEL SOCORRO", val: 85025516 },
        { name: "RESTREPO ESCOBAR LUZ AMPARO", val: 62312446 },
        { name: "ARIAS ARIAS NORBEY", val: 49293299 },
      ],
      alta_concentracion_count: 122,
      alta_concentracion_total: 1826495139,
      alta_concentracion_top: [
        { name: "NARANJO DULFARY DEL SOCORRO", val: 85025516 },
        { name: "RESTREPO ESCOBAR LUZ AMPARO", val: 62312446 },
        { name: "ARIAS ARIAS NORBEY", val: 49293299 },
        { name: "CARMONA MEJIA MARIBEL", val: 46867782 },
        { name: "GARCIA HOLGUIN JHONATAN ANDRES", val: 43764232 },
        { name: "SUPERMERCADO GLOBAL SAS", val: 43475043 },
        { name: "LOAIZA LOAIZA NELSON", val: 42234274 },
        { name: "GRUPO BINGO SAS", val: 39503352 },
      ],
    },
    {
      id: "CALI",
      nombre: "Valle del Cauca",
      capital: "Cali",
      centroide: { lat: 3.45, lng: -76.53 },
      servicios_totales: 1393,
      recaudo_total: 1651126595,
      dias_operativos: 80,
      top3_recaudo: [
        { name: "ALYAN UNIDOS S.A.S", val: 93188371 },
        { name: "LOPEZ HERRERA CESAR ARMANDO", val: 66111745 },
        { name: "BOLAÑOS MARTINEZ BRAYAN ALEJANDRO", val: 63836634 },
      ],
      alta_concentracion_count: 83,
      alta_concentracion_total: 1366586324,
      alta_concentracion_top: [
        { name: "ALYAN UNIDOS S.A.S", val: 93188371 },
        { name: "LOPEZ HERRERA CESAR ARMANDO", val: 66111745 },
        { name: "BOLAÑOS MARTINEZ BRAYAN ALEJANDRO", val: 63836634 },
        { name: "AUTOSERVICIO LA PAZ SAS", val: 62486271 },
        { name: "VANEGAS PARRA DIEGO ALEXANDER", val: 57438964 },
        { name: "TORRES BERRIO WILMAN", val: 51259140 },
        { name: "ROJAS HOLGUIN CECILIA", val: 43033368 },
        { name: "GARCIA NARANJO DIEGO MAURICIO", val: 40753891 },
      ],
    },
  ];

  const ITEM_ID = "781f76fd8f9b402a82c0b1672cff38c4";
  const MESES_PERIODO = 4; // ene-feb-mar-abr 2026

  // ── 2. Estado interno ────────────────────────────────────────────────────
  let view = null;
  let layer = null;
  let highlightLayer = null;
  let initStarted = false;
  let currentRegion = null;

  // ── 3. Helpers DOM (panel derecho slide-G7) ──────────────────────────────
  function $(sel) {
    const slide = document.getElementById("slide-G7");
    return slide ? slide.querySelector(sel) : null;
  }

  function setText(sel, text) {
    const el = $(sel);
    if (el) el.textContent = text;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtCOP(val) {
    // formato pesos sin decimales con separador de miles "."
    return "$" + Math.round(val).toLocaleString("es-CO").replace(/,/g, ".");
  }

  function fmtCOPshort(val) {
    if (val >= 1_000_000_000) {
      return "$" + (val / 1_000_000_000).toFixed(2).replace(".", ",") + " B";
    }
    if (val >= 1_000_000) {
      return "$" + (val / 1_000_000).toFixed(1).replace(".", ",") + " M";
    }
    return fmtCOP(val);
  }

  function fmtNum(val) {
    return Math.round(val).toLocaleString("es-CO").replace(/,/g, ".");
  }

  function renderTop3(sel, items) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach(function (it, idx) {
      const li = document.createElement("li");
      li.className = "top3-item";
      li.innerHTML =
        '<span class="top3-rank">' + (idx + 1) + "</span>" +
        '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
        '<span class="top3-val" style="color:#F59E0B">' + escapeHtml(fmtCOPshort(it.val)) + "</span>";
      ul.appendChild(li);
    });
  }

  function renderAlerta(sel, region) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    region.alta_concentracion_top.forEach(function (it, idx) {
      const li = document.createElement("li");
      li.className = "gen-alert-item";
      li.innerHTML =
        '<span class="gen-alert-rank">' + (idx + 1) + "</span>" +
        '<span class="gen-alert-name">' + escapeHtml(it.name) + "</span>" +
        '<span class="gen-alert-val">' + escapeHtml(fmtCOPshort(it.val)) + "</span>";
      ul.appendChild(li);
    });
  }

  // ── 4. Update cards al click ─────────────────────────────────────────────
  function updateCards(region) {
    if (!region) return;
    currentRegion = region;
    setText(".gen-region-name", region.nombre);
    setText(".gen-region-capital", "Capital: " + region.capital);

    setText(".gen-servicios-totales", fmtNum(region.servicios_totales));
    setText(
      ".gen-servicios-sub",
      region.dias_operativos + " días operativos · ene–abr 2026"
    );

    setText(".gen-recaudo-valor", fmtCOPshort(region.recaudo_total));
    setText(".gen-recaudo-sub", "Total efectivo recaudado · 4 meses");

    const promMensual = region.recaudo_total / MESES_PERIODO;
    const promDiario = region.dias_operativos > 0
      ? region.recaudo_total / region.dias_operativos
      : 0;

    setText(".gen-prom-mensual", fmtCOPshort(promMensual));
    setText(".gen-prom-diario", fmtCOPshort(promDiario));

    renderTop3(".gen-top3-recaudo", region.top3_recaudo);

    setText(".gen-alert-count", String(region.alta_concentracion_count));
    setText(".gen-alert-sum", fmtCOPshort(region.alta_concentracion_total));
    const pctConcentracion = region.recaudo_total > 0
      ? Math.round((region.alta_concentracion_total / region.recaudo_total) * 100)
      : 0;
    setText(".gen-alert-pct", pctConcentracion + "% del recaudo total");
    renderAlerta(".gen-alert-list", region);
  }

  // ── 5. Init Maps SDK ─────────────────────────────────────────────────────
  function init() {
    if (initStarted) return;
    const container = document.getElementById("general-map");
    if (!container) return;
    if (typeof window.require !== "function") {
      // SDK aun no cargado; reintenta
      setTimeout(init, 250);
      return;
    }
    initStarted = true;

    window.require(
      [
        "esri/WebMap",
        "esri/views/MapView",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
      ],
      function (WebMap, MapView, GraphicsLayer, Graphic) {
        const webmap = new WebMap({
          portalItem: { id: ITEM_ID },
        });

        view = new MapView({
          container: "general-map",
          map: webmap,
          center: [-74.5, 5.5],
          zoom: 5,
          ui: { components: ["zoom", "attribution"] },
        });

        view.when(
          function () {
            layer = new GraphicsLayer();
            highlightLayer = new GraphicsLayer();
            view.map.add(layer);
            view.map.add(highlightLayer);

            REGIONES.forEach(function (region, idx) {
              const g = new Graphic({
                geometry: {
                  type: "point",
                  longitude: region.centroide.lng,
                  latitude: region.centroide.lat,
                },
                symbol: {
                  type: "simple-marker",
                  style: "circle",
                  color: [46, 134, 193, 0.95],
                  size: 22,
                  outline: { color: [255, 255, 255, 1], width: 3 },
                },
                attributes: { id: region.id, nombre: region.nombre },
              });
              layer.add(g);

              const label = new Graphic({
                geometry: {
                  type: "point",
                  longitude: region.centroide.lng,
                  latitude: region.centroide.lat,
                },
                symbol: {
                  type: "text",
                  color: [255, 255, 255, 1],
                  haloColor: [26, 82, 118, 1],
                  haloSize: 1,
                  text: String(idx + 1),
                  xoffset: 0,
                  yoffset: -4,
                  font: {
                    size: 11,
                    family: "Barlow Condensed, sans-serif",
                    weight: "bold",
                  },
                },
                attributes: { id: region.id, _isLabel: true },
              });
              layer.add(label);
            });

            view.on("click", function (e) {
              view.hitTest(e).then(function (res) {
                const hit = res.results.find(function (r) {
                  return (
                    r.graphic &&
                    r.graphic.layer === layer &&
                    r.graphic.attributes &&
                    typeof r.graphic.attributes.id !== "undefined"
                  );
                });
                if (!hit) return;
                const id = hit.graphic.attributes.id;
                const region = REGIONES.find(function (r) {
                  return r.id === id;
                });
                if (region) {
                  updateCards(region);
                  highlightRegion(Graphic, region);
                }
              });
            });

            // Estado inicial: Bogota-Sabana (region con mayor recaudo)
            updateCards(REGIONES[0]);
            highlightRegion(Graphic, REGIONES[0]);
          },
          function (err) {
            console.warn("[general_map] view.when error:", err);
          }
        );
      }
    );
  }

  function highlightRegion(Graphic, region) {
    if (!highlightLayer) return;
    highlightLayer.removeAll();
    const halo = new Graphic({
      geometry: {
        type: "point",
        longitude: region.centroide.lng,
        latitude: region.centroide.lat,
      },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [93, 173, 226, 0.25],
        size: 44,
        outline: { color: [46, 134, 193, 0.9], width: 2 },
      },
    });
    highlightLayer.add(halo);
  }

  // ── 6. Lazy init: cuando slide-G7 este visible/activo ────────────────────
  function tryInit() {
    const slide = document.getElementById("slide-G7");
    if (!slide) return;
    const container = document.getElementById("general-map");
    if (!container) return;
    const section = slide.closest(".section-block");
    if (!section || !section.classList.contains("active")) return;
    init();
  }

  function observe() {
    document
      .querySelectorAll(".section-block[data-section='general']")
      .forEach(function (sec) {
        const mo = new MutationObserver(function () {
          if (sec.classList.contains("active")) tryInit();
        });
        mo.observe(sec, { attributes: true, attributeFilter: ["class", "hidden"] });
      });

    const slideG7 = document.getElementById("slide-G7");
    if (slideG7) {
      const mo2 = new MutationObserver(function () {
        if (slideG7.classList.contains("active")) tryInit();
      });
      mo2.observe(slideG7, { attributes: true, attributeFilter: ["class"] });
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) tryInit();
        });
      });
      const target = document.getElementById("general-map");
      if (target) io.observe(target);
    }

    tryInit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe);
  } else {
    observe();
  }
})();
