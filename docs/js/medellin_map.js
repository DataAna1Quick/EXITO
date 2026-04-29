/* medellin_map.js · Operacion Exito Antioquia
 * Mapa interactivo full SDK (4.x) en slide-13 (seccion MEDELLIN).
 * 9 markers (uno por macrozona). Click sobre un marker actualiza
 * el panel de cards de la derecha con los datos de esa zona.
 *
 * No toca slide-G7 (mapa de regionales en seccion GENERAL, que usa
 * el componente embeddable independiente).
 */
(function () {
  "use strict";

  // ── 1. Datos por zona (extraidos de los antiguos slides 18-26) ───────────
  const ZONAS_MEDELLIN = [
    {
      ficha: 1,
      nombre: "Aburrá Sur",
      centroide: { lat: 6.180, lng: -75.605 },
      servicios_totales: 636,
      riesgo_pct: 92,
      riesgo_count: 585, // 92% de 636
      recaudo_efectivo: "$364.000.000",
      recaudo_servicios: 379,
      pico_fisico: "Día pico físico: 05/02/2026 · $20.453.657",
      contado_pct: 46,
      contado_svc: 174,
      contraentrega_pct: 54,
      contraentrega_svc: 205,
      top3_servicios: [
        { name: "Rojas Agudelo Fernando", val: "20 svc" },
        { name: "Morales Marco", val: "15 svc" },
        { name: "Ramirez Jhon", val: "15 svc" },
      ],
      top3_recaudo: [
        { name: "Rojas Agudelo Fernando", val: "$31.900.000" },
        { name: "Perez Gonzalez Diana Girlesa", val: "$25.500.000" },
        { name: "Perez Taborda Albeiro de Jesus", val: "$20.300.000" },
      ],
    },
    {
      ficha: 2,
      nombre: "Aburrá Norte",
      centroide: { lat: 6.337, lng: -75.555 },
      servicios_totales: 538,
      riesgo_pct: 88,
      riesgo_count: 474,
      recaudo_efectivo: "$275.000.000",
      recaudo_servicios: 296,
      pico_fisico: "Día pico físico: 19/03/2026 · $16.583.727",
      contado_pct: 49,
      contado_svc: 145,
      contraentrega_pct: 51,
      contraentrega_svc: 151,
      top3_servicios: [
        { name: "Ciro Noreña Martin Andres", val: "22 svc" },
        { name: "Ruiz Wiliam", val: "16 svc" },
        { name: "Hernandez Toro Ana Lucia", val: "13 svc" },
      ],
      top3_recaudo: [
        { name: "Ciro Noreña Martin Andres", val: "$30.500.000" },
        { name: "Supermercado Comercial SAS", val: "$17.300.000" },
        { name: "Herrera Ortiz Albeiro", val: "$16.000.000" },
      ],
    },
    {
      ficha: 3,
      nombre: "Medellín – Noroccidente (C5-7)",
      centroide: { lat: 6.290, lng: -75.600 }, // TODO: ajustar centroide exacto a comunas Castilla / Doce de Octubre / Robledo
      servicios_totales: 608,
      riesgo_pct: 75,
      riesgo_count: 456, // 75% de 608
      recaudo_efectivo: "$282.000.000",
      recaudo_servicios: 270,
      pico_fisico: "Día pico físico: 18/02/2026 · $20.092.846",
      contado_pct: 51,
      contado_svc: 139,
      contraentrega_pct: 49,
      contraentrega_svc: 131,
      top3_servicios: [
        { name: "Segura Marmol Juan David", val: "29 svc" },
        { name: "Arango Montoya Alirio", val: "17 svc" },
        { name: "Loaiza Arango Sorani", val: "16 svc" },
      ],
      top3_recaudo: [
        { name: "Posada Ricardo", val: "$27.500.000" },
        { name: "Ciro Noreña Nancy Carolina", val: "$18.600.000" },
        { name: "Lopez Noreña Lina Marcela", val: "$14.200.000" },
      ],
    },
    {
      ficha: 4,
      nombre: "Medellín – Nororiente (C1-4)",
      centroide: { lat: 6.290, lng: -75.555 }, // TODO: ajustar centroide a comunas Popular / Santa Cruz / Manrique / Aranjuez
      servicios_totales: 459,
      riesgo_pct: 96,
      riesgo_count: 441, // 96% de 459
      recaudo_efectivo: "$167.000.000",
      recaudo_servicios: 237,
      pico_fisico: "Día pico físico: 23/02/2026 · $14.882.893",
      contado_pct: 58,
      contado_svc: 137,
      contraentrega_pct: 42,
      contraentrega_svc: 100,
      top3_servicios: [
        { name: "Supermercado Merca Ahorro S.A.S.", val: "16 svc" },
        { name: "Villegas Vargas Juan David", val: "16 svc" },
        { name: "Yineth Polania", val: "13 svc" },
      ],
      top3_recaudo: [
        { name: "Castaño Wilson de Jesús", val: "$13.100.000" },
        { name: "Thejais SAS", val: "$8.500.000" },
        { name: "Arias Holguin Claudia Yaned", val: "$7.100.000" },
      ],
    },
    {
      ficha: 5,
      nombre: "Medellín – Centroriente (C8-10)",
      centroide: { lat: 6.250, lng: -75.555 }, // TODO: ajustar a Villa Hermosa / Buenos Aires / Candelaria
      servicios_totales: 264,
      riesgo_pct: 77,
      riesgo_count: 203, // 77% de 264
      recaudo_efectivo: "$255.000.000",
      recaudo_servicios: 112,
      pico_fisico: "Día pico físico: 09/03/2026 · $9.930.336",
      contado_pct: 51,
      contado_svc: 57,
      contraentrega_pct: 49,
      contraentrega_svc: 55,
      top3_servicios: [
        { name: "Henao Loaiza Manuela", val: "10 svc" },
        { name: "Gomez Mejia Ana Lucia", val: "8 svc" },
        { name: "Montoya Edgar Alberto", val: "8 svc" },
      ],
      top3_recaudo: [
        { name: "Lescano Juan Pablo", val: "$29.400.000" },
        { name: "Jhоana Henao Loaiza", val: "$17.700.000" },
        { name: "Inversiones Diyanvima SAS", val: "$15.900.000" },
      ],
    },
    {
      ficha: 6,
      nombre: "Medellín – Centroccidente (C11-13)",
      centroide: { lat: 6.250, lng: -75.595 }, // TODO: ajustar a Laureles / La America / San Javier
      servicios_totales: 172,
      riesgo_pct: 65,
      riesgo_count: 112, // 65% de 172
      recaudo_efectivo: "$83.800.000",
      recaudo_servicios: 79,
      pico_fisico: "Día pico físico: 12/03/2026 · $13.540.839",
      contado_pct: 56,
      contado_svc: 44,
      contraentrega_pct: 44,
      contraentrega_svc: 35,
      top3_servicios: [
        { name: "Torres Martinez Jesus Eduardo", val: "9 svc" },
        { name: "Jimenez Janneth", val: "8 svc" },
        { name: "Castaño Giraldo Mario de Jesus", val: "8 svc" },
      ],
      top3_recaudo: [
        { name: "Gomez Julian", val: "$8.500.000" },
        { name: "Salazar Alzate Efrain Onesimo", val: "$8.000.000" },
        { name: "Lopez Velasquez Maria Jose", val: "$7.200.000" },
      ],
    },
    {
      ficha: 7,
      nombre: "Medellín – Suroccidente (C15-16)",
      centroide: { lat: 6.205, lng: -75.600 }, // TODO: ajustar a Guayabal / Belen
      servicios_totales: 218,
      riesgo_pct: 83,
      riesgo_count: 181, // 83% de 218
      recaudo_efectivo: "$141.000.000",
      recaudo_servicios: 92,
      pico_fisico: "Día pico físico: 05/02/2026 · $6.682.620",
      contado_pct: 51,
      contado_svc: 47,
      contraentrega_pct: 49,
      contraentrega_svc: 45,
      top3_servicios: [
        { name: "Merka Rey SAS", val: "9 svc" },
        { name: "Garcia Daniel", val: "8 svc" },
        { name: "Duque Damian", val: "8 svc" },
      ],
      top3_recaudo: [
        { name: "Garcia Daniel", val: "$17.100.000" },
        { name: "Ramirez Quintero Juan David", val: "$12.900.000" },
        { name: "Maloka Autoservicio S.A.S", val: "$12.600.000" },
      ],
    },
    {
      ficha: 8,
      nombre: "Medellín – Corregimientos",
      centroide: { lat: 6.210, lng: -75.700 }, // TODO: ajustar a corregimientos rurales periferia Medellin
      servicios_totales: 185,
      riesgo_pct: 100,
      riesgo_count: 185,
      recaudo_efectivo: "$139.000.000",
      recaudo_servicios: 112,
      pico_fisico: "Día pico físico: 04/02/2026 · $10.345.869",
      contado_pct: 50,
      contado_svc: 56,
      contraentrega_pct: 50,
      contraentrega_svc: 56,
      top3_servicios: [
        { name: "Cardona Alex", val: "13 svc" },
        { name: "Zuluaga Martinez Maria Alejandra", val: "11 svc" },
        { name: "Cardona Orozco Henry", val: "10 svc" },
      ],
      top3_recaudo: [
        { name: "Giraldo Marin Liliana Maria", val: "$44.500.000" },
        { name: "Vélez Zapata Miguel Ángel", val: "$10.800.000" },
        { name: "Ceballos Giraldo de Jesus", val: "$10.000.000" },
      ],
    },
    {
      ficha: 9,
      nombre: "Otros Municipios y Medellín No Clasificado",
      centroide: { lat: 6.488, lng: -74.405 }, // TODO: zona dispersa, usado punto Magdalena Medio como referencia
      servicios_totales: 101,
      riesgo_pct: 61,
      riesgo_count: 62, // 61% de 101
      recaudo_efectivo: "$105.000.000",
      recaudo_servicios: 50,
      pico_fisico: "Día pico físico: 20/03/2026 · $49.014.921",
      contado_pct: 26,
      contado_svc: 13,
      contraentrega_pct: 74,
      contraentrega_svc: 37,
      top3_servicios: [
        { name: "Jesus Alberto Usuga Sanchez", val: "11 svc" },
        { name: "Maximax Supermercados Asociados ZOM", val: "8 svc" },
        { name: "Valderrama Ramirez Juan Diego", val: "6 svc" },
      ],
      top3_recaudo: [
        { name: "Valderrama Ramirez Juan Diego", val: "$26.200.000" },
        { name: "Jesus Alberto Usuga Sanchez", val: "$12.300.000" },
        { name: "Velasquez Atehortua Dannover de Jesús", val: "$10.400.000" },
      ],
    },
  ];

  const ITEM_ID = "1f2cbd3463654b97ae1f597431261a62";

  // ── 1b. Alerta cash-only · Antioquia (Medellín-wide) ─────────────────────
  // Top clientes Medellín con persistencia de días con recaudo CASH > $5M
  // (Contado + MISURTII + Contraentrega) sobre 95 días operativos Medellín.
  // Filtros: pct_propio ≥ 20% · días_riesgo ≥ 2 · días_activos ≥ 3.
  // Total persistentes en Medellín = 12 clientes.
  // Calculado de RECAUDO_NACIONAL_LIMPIO.xlsx (REGIONAL = MEDELLIN, TIPO ∈ {Contado, Misurti, Contraentrega}).
  const RIESGO_CASH = {
    dias_operativos: 95,
    persistentes_total: 12,
    top_clientes: [
      { nombre: "PEREZ GONZALEZ DIANA GIRLESA",   dias_riesgo: 4, dias_activos: 4, pct_propio: 100.0, pct_op: 4.2, recaudo_cash: 25529954, pico_fecha: "05/02/2026", pico_valor:  7306782 },
      { nombre: "GIRALDO MARIN LILIANA MARIA",    dias_riesgo: 4, dias_activos: 5, pct_propio:  80.0, pct_op: 4.2, recaudo_cash: 47691803, pico_fecha: "04/03/2026", pico_valor: 15056004 },
      { nombre: "JHOANA HENAO LOAIZA",            dias_riesgo: 4, dias_activos: 6, pct_propio:  66.7, pct_op: 4.2, recaudo_cash: 27254950, pico_fecha: "09/03/2026", pico_valor:  7042838 },
      { nombre: "MALOKA AUTOSERVICIO S.A.S",      dias_riesgo: 3, dias_activos: 3, pct_propio: 100.0, pct_op: 3.2, recaudo_cash: 24702093, pico_fecha: "18/02/2026", pico_valor: 12572972 },
      { nombre: "VALDERRAMA RAMIREZ JUAN DIEGO",  dias_riesgo: 3, dias_activos: 5, pct_propio:  60.0, pct_op: 3.2, recaudo_cash: 31808947, pico_fecha: "05/02/2026", pico_valor: 11104498 },
    ],
  };

  // ── 2. Estado interno ────────────────────────────────────────────────────
  let view = null;
  let layer = null;
  let highlightLayer = null;
  let activeGraphic = null;
  let initStarted = false;
  let currentZona = null;

  // ── 3. Helpers DOM (panel derecho de slide-13) ───────────────────────────
  function $(sel) {
    const slide = document.getElementById("slide-13");
    return slide ? slide.querySelector(sel) : null;
  }

  function setText(sel, text) {
    const el = $(sel);
    if (el) el.textContent = text;
  }

  function setWidth(sel, pct) {
    const el = $(sel);
    if (el) el.style.width = pct + "%";
  }

  function renderTop3(sel, items, isMoney) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach((it, idx) => {
      const li = document.createElement("li");
      li.className = "top3-item";
      const valStyle = isMoney ? ' style="color: #F59E0B"' : "";
      li.innerHTML =
        '<span class="top3-rank">' + (idx + 1) + "</span>" +
        '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
        '<span class="top3-val"' + valStyle + ">" + escapeHtml(it.val) + "</span>";
      ul.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // formato pesos colombianos: 25529954 -> "$25,529,954"
  function fmtCOPshort(val) {
    return "$" + Math.round(val).toLocaleString("en-US");
  }

  // formato % con coma decimal estilo "76,9%"
  function fmtPct(val) {
    return val.toFixed(1).replace(".", ",") + "%";
  }

  // Render del listado de clientes persistentes en zona crítica (cash-only).
  // Mismo patrón visual que gen-alert-card del mapa General. Cada item:
  //   <nombre> — <dias_riesgo>/<dias_activos> días = <pct_propio>%
  //   Recaudo cash período + día pico físico (fecha y valor).
  function renderAlertaMedellin() {
    const ul = $(".med-alert-list");
    if (!ul) return;
    ul.innerHTML = "";
    RIESGO_CASH.top_clientes.forEach(function (it, idx) {
      const li = document.createElement("li");
      li.className = "gen-alert-item";
      const pctClamp = Math.max(0, Math.min(100, it.pct_propio));
      li.innerHTML =
        '<div class="gen-alert-row">' +
          '<span class="gen-alert-rank">' + (idx + 1) + "</span>" +
          '<span class="gen-alert-name">' + escapeHtml(it.nombre) + "</span>" +
          '<span class="gen-alert-days">' + it.dias_riesgo + "/" + it.dias_activos + " días</span>" +
          '<span class="gen-alert-val">' + fmtPct(it.pct_propio) + "</span>" +
        "</div>" +
        '<div class="gen-alert-meta">' +
          'Recaudo efectivo: ' + escapeHtml(fmtCOPshort(it.recaudo_cash)) +
          ' · pico ' + escapeHtml(it.pico_fecha) + ' = ' + escapeHtml(fmtCOPshort(it.pico_valor)) +
        "</div>" +
        '<div class="gen-alert-bar" role="progressbar" aria-valuenow="' + pctClamp +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="gen-alert-bar-fill" style="width:' + pctClamp + '%"></div>' +
        "</div>";
      ul.appendChild(li);
    });
    setText(
      ".med-alert-headline",
      RIESGO_CASH.persistentes_total + " clientes persistentes en zona crítica"
    );
    setText(
      ".med-alert-sub",
      "≥20% de sus días con recaudo cash > $5,000,000 (" +
        RIESGO_CASH.dias_operativos +
        " días op Medellín · solo Contado + Contraentrega)"
    );
  }

  // ── 4. Update cards al click ─────────────────────────────────────────────
  function updateCards(zona) {
    if (!zona) return;
    currentZona = zona;
    setText(".med-zona-name", zona.nombre);
    setText(".med-zona-ficha", "Ficha " + zona.ficha + " de 9");
    setText(".med-servicios-totales", String(zona.servicios_totales));
    setText(
      ".med-servicios-sub",
      zona.riesgo_pct + "% en zona de riesgo (" + zona.riesgo_count + ")"
    );
    setText(".med-recaudo-valor", zona.recaudo_efectivo);
    setText(
      ".med-recaudo-sub",
      zona.recaudo_servicios + " servicios · Contado + Contraentrega"
    );
    setText(
      ".med-pico-fisico",
      zona.pico_fisico || "Día pico físico: pendiente de cargar desde Excel"
    );
    setWidth(".med-bar-contado", zona.contado_pct);
    setWidth(".med-bar-contraentrega", zona.contraentrega_pct);
    setText(
      ".med-leg-contado",
      "Contado: " + zona.contado_svc + " svc (" + zona.contado_pct + "%)"
    );
    setText(
      ".med-leg-contraentrega",
      "Contraentrega: " +
        zona.contraentrega_svc +
        " svc (" +
        zona.contraentrega_pct +
        "%)"
    );
    renderTop3(".med-top3-servicios", zona.top3_servicios, false);
    renderTop3(".med-top3-recaudo", zona.top3_recaudo, true);
  }

  // ── 5. Init Maps SDK ─────────────────────────────────────────────────────
  function init() {
    if (initStarted) return;
    const container = document.getElementById("medellin-map");
    if (!container) return;
    if (typeof window.require !== "function") {
      // SDK aún no cargado; reintenta
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
          container: "medellin-map",
          map: webmap,
          center: [-75.535, 6.205],
          zoom: 9,
          ui: { components: ["zoom", "attribution"] },
        });

        view.when(
          function () {
            layer = new GraphicsLayer();
            highlightLayer = new GraphicsLayer();
            view.map.add(layer);
            view.map.add(highlightLayer);

            ZONAS_MEDELLIN.forEach(function (zona) {
              const g = new Graphic({
                geometry: {
                  type: "point",
                  longitude: zona.centroide.lng,
                  latitude: zona.centroide.lat,
                },
                symbol: {
                  type: "simple-marker",
                  style: "circle",
                  color: [46, 134, 193, 0.95],
                  size: 18,
                  outline: { color: [255, 255, 255, 1], width: 3 },
                },
                attributes: { id: zona.ficha, nombre: zona.nombre },
              });
              layer.add(g);

              // etiqueta con número de ficha encima del marker
              const label = new Graphic({
                geometry: {
                  type: "point",
                  longitude: zona.centroide.lng,
                  latitude: zona.centroide.lat,
                },
                symbol: {
                  type: "text",
                  color: [255, 255, 255, 1],
                  haloColor: [26, 82, 118, 1],
                  haloSize: 1,
                  text: String(zona.ficha),
                  xoffset: 0,
                  yoffset: -4,
                  font: {
                    size: 10,
                    family: "Barlow Condensed, sans-serif",
                    weight: "bold",
                  },
                },
                attributes: { id: zona.ficha, nombre: zona.nombre, _isLabel: true },
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
                const zona = ZONAS_MEDELLIN.find(function (z) {
                  return z.ficha === id;
                });
                if (zona) {
                  updateCards(zona);
                  highlightZona(Graphic, zona);
                }
              });
            });

            // Estado inicial
            updateCards(ZONAS_MEDELLIN[0]);
            highlightZona(Graphic, ZONAS_MEDELLIN[0]);

            // Alerta cash-only (Medellín-wide, una sola vez en init)
            renderAlertaMedellin();
          },
          function (err) {
            console.warn("[medellin_map] view.when error:", err);
          }
        );
      }
    );
  }

  function highlightZona(Graphic, zona) {
    if (!highlightLayer) return;
    highlightLayer.removeAll();
    const halo = new Graphic({
      geometry: {
        type: "point",
        longitude: zona.centroide.lng,
        latitude: zona.centroide.lat,
      },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [93, 173, 226, 0.25],
        size: 36,
        outline: { color: [46, 134, 193, 0.9], width: 2 },
      },
    });
    highlightLayer.add(halo);
  }

  // ── 6. Lazy init: cuando slide-13 esté visible/activo ────────────────────
  function tryInit() {
    const slide = document.getElementById("slide-13");
    if (!slide) return;
    const container = document.getElementById("medellin-map");
    if (!container) return;
    // Solo init si el slide está visible (ancestro section-block tiene .active)
    const section = slide.closest(".section-block");
    if (!section || !section.classList.contains("active")) return;
    init();
  }

  function observe() {
    // 1. Observe class changes en .section-block (cuando se cambia a Medellín)
    document
      .querySelectorAll(".section-block[data-section='medellin']")
      .forEach(function (sec) {
        const mo = new MutationObserver(function () {
          if (sec.classList.contains("active")) tryInit();
        });
        mo.observe(sec, { attributes: true, attributeFilter: ["class", "hidden"] });
      });

    // 2. Observe class changes en slide-13 (cuando entra como activo)
    const slide13 = document.getElementById("slide-13");
    if (slide13) {
      const mo2 = new MutationObserver(function () {
        if (slide13.classList.contains("active")) tryInit();
      });
      mo2.observe(slide13, { attributes: true, attributeFilter: ["class"] });
    }

    // 3. IntersectionObserver como respaldo
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) tryInit();
        });
      });
      const target = document.getElementById("medellin-map");
      if (target) io.observe(target);
    }

    // 4. Intento inmediato (por si ya está activo al cargar)
    tryInit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe);
  } else {
    observe();
  }
})();
