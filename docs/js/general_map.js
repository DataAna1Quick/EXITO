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
  // Periodo: 2 ene - 27 abr 2026 (101 dias operativos totales en el dataset).
  //
  // Métrica días-riesgo: % de los 101 días operativos en que el cliente
  // tuvo recaudo diario > $5,000,000. Sensibiliza riesgo de incidente
  // recurrente para Quick Help. Reemplaza el ranking previo de >5M total.
  // Datos ene-abr 2026 desde RECAUDO_NACIONAL_LIMPIO.xlsx.
  //
  // Cada region trae:
  //   dias_operativos: 101   (dias operativos totales del dataset)
  //   riesgo: {
  //     clientes_persistentes: <count> clientes con >=20% de sus dias propios en riesgo,
  //     top_clientes: [{ nombre, dias_riesgo, dias_activos, pct_propio, pct_op, recaudo_total }]
  //   }
  const DIAS_OPERATIVOS_TOTALES = 101;

  const REGIONES = [
    {
      id: "FUNZA",
      nombre: "Bogotá – Sabana",
      capital: "Bogotá / Funza",
      centroide: { lat: 4.71, lng: -74.07 },
      servicios_totales: 7558,
      recaudo_total: 10280703582,
      dias_operativos: 101,
      dia_pico_fisico: { fecha: "26/03/2026", valor: 104914849 },
      efectivo_total: 4280639016,
      vh_efectivo: 70,
      placa_max_dia: { placa: "LCO705", fecha: "28/01/2026", valor: 28864091 },
      top3_recaudo: [
        { name: "INVERSIONES GRUPO ROAL SAS", val: 314207655, dia_max: { fecha: "17/03/2026", valor: 47075627 } },
        { name: "GUTIERREZ GIL JOSE JAIRO",   val:  95571727, dia_max: { fecha: "08/01/2026", valor: 11274235 } },
        { name: "BARBOSA GUERRA YOLANDA",     val:  90475293, dia_max: { fecha: "14/03/2026", valor: 25243445 } },
      ],
      riesgo: {
        clientes_persistentes: 92,
        top_clientes: [
          { nombre: "INVERSIONES GRUPO ROAL SAS",       dias_riesgo: 19, dias_activos: 33, pct_propio: 57.6, pct_op: 18.8, recaudo_total: 314207655 },
          { nombre: "PINZON GONZALEZ WILLIAM",          dias_riesgo:  8, dias_activos: 14, pct_propio: 57.1, pct_op:  7.9, recaudo_total:  72768832 },
          { nombre: "RODRIGUEZ FORERO FRANCISCO",       dias_riesgo:  8, dias_activos: 14, pct_propio: 57.1, pct_op:  7.9, recaudo_total:  86303877 },
          { nombre: "GUTIERREZ GIL JOSE JAIRO",         dias_riesgo:  8, dias_activos: 15, pct_propio: 53.3, pct_op:  7.9, recaudo_total:  95571727 },
          { nombre: "SUPERMERCADOSLOS PAISAS J J SAS",  dias_riesgo:  8, dias_activos: 11, pct_propio: 72.7, pct_op:  7.9, recaudo_total:  84210349 },
        ],
      },
    },
    {
      id: "MEDELLIN",
      nombre: "Antioquia",
      capital: "Medellín",
      centroide: { lat: 6.25, lng: -75.57 },
      servicios_totales: 3600,
      recaudo_total: 5586446728,
      dias_operativos: 101,
      dia_pico_fisico: { fecha: "19/02/2026", valor: 68906031 },
      efectivo_total: 2242590745,
      vh_efectivo: 27,
      placa_max_dia: { placa: "PUN256", fecha: "20/03/2026", valor: 36850053 },
      top3_recaudo: [
        { name: "CARDENAS VALENCIA SERGIO ANTONIO", val: 86651392, dia_max: { fecha: "18/03/2026", valor: 21693640 } },
        { name: "CIRO NOREÑA MARTIN ANDRES",        val: 76915962, dia_max: { fecha: "06/04/2026", valor:  6641487 } },
        { name: "SEGURA MARMOL JUAN DAVID",         val: 63743933, dia_max: { fecha: "05/01/2026", valor:  6443412 } },
      ],
      riesgo: {
        clientes_persistentes: 82,
        top_clientes: [
          { nombre: "GONZALEZ LOPEZ JULIAN JAHIR",     dias_riesgo: 6, dias_activos: 12, pct_propio: 50.0, pct_op: 5.9, recaudo_total: 58337019 },
          { nombre: "CASTANO GIRALDO MARIO DE JESUS",  dias_riesgo: 5, dias_activos: 10, pct_propio: 50.0, pct_op: 5.0, recaudo_total: 41200000 },
          { nombre: "JHOANA HENAO LOAIZA",             dias_riesgo: 5, dias_activos:  8, pct_propio: 62.5, pct_op: 5.0, recaudo_total: 38500000 },
          { nombre: "MALOKA AUTOSERVICIO S.A.S",       dias_riesgo: 5, dias_activos:  5, pct_propio: 100.0, pct_op: 5.0, recaudo_total: 36800000 },
          { nombre: "HINCAPIE MONTOYA JOSE NICOLAS",   dias_riesgo: 4, dias_activos:  6, pct_propio: 66.7, pct_op: 4.0, recaudo_total: 31900000 },
        ],
      },
    },
    {
      id: "COSTA",
      nombre: "Costa Atlántica",
      capital: "Barranquilla",
      centroide: { lat: 10.97, lng: -74.81 },
      servicios_totales: 3206,
      recaudo_total: 4535497046,
      dias_operativos: 101,
      dia_pico_fisico: { fecha: "31/03/2026", valor: 78712120 },
      efectivo_total: 1311792888,
      vh_efectivo: 11,
      placa_max_dia: { placa: "JPP275", fecha: "27/01/2026", valor: 29158183 },
      top3_recaudo: [
        { name: "INVERSIONES LA CENTRAL DE CLEMENCIA", val: 134024512, dia_max: { fecha: "27/02/2026", valor: 18941824 } },
        { name: "URREA GARCIA JUAN CAMILO",            val:  90724479, dia_max: { fecha: "19/03/2026", valor:  8439830 } },
        { name: "MERCADOS LA OCTAVA S.A.S.",           val:  77488912, dia_max: { fecha: "13/02/2026", valor: 26345482 } },
      ],
      riesgo: {
        clientes_persistentes: 50,
        top_clientes: [
          { nombre: "INVERSIONES LA CENTRAL DE CLEMENCIA", dias_riesgo: 10, dias_activos: 14, pct_propio: 71.4, pct_op: 9.9, recaudo_total: 134024512 },
          { nombre: "AISALEZ AISALEZ YEISON",              dias_riesgo:  7, dias_activos:  8, pct_propio: 87.5, pct_op: 6.9, recaudo_total:  61454885 },
          { nombre: "CARRENO PLATA MERCEDES",              dias_riesgo:  6, dias_activos: 10, pct_propio: 60.0, pct_op: 5.9, recaudo_total:  75937281 },
          { nombre: "GOMEZ OTERO TATIANA VANESA",          dias_riesgo:  6, dias_activos:  8, pct_propio: 75.0, pct_op: 5.9, recaudo_total:  48600000 },
          { nombre: "PEDROZO VILLALOBOS JUAN LUIS",        dias_riesgo:  6, dias_activos: 17, pct_propio: 35.3, pct_op: 5.9, recaudo_total:  62685154 },
        ],
      },
    },
    {
      id: "EJE",
      nombre: "Eje Cafetero",
      capital: "Pereira",
      centroide: { lat: 4.81, lng: -75.69 },
      servicios_totales: 1567,
      recaudo_total: 2135368507,
      dias_operativos: 101,
      dia_pico_fisico: { fecha: "28/02/2026", valor: 44844591 },
      efectivo_total: 586533953,
      vh_efectivo: 5,
      placa_max_dia: { placa: "VDK973", fecha: "02/03/2026", valor: 44844591 },
      top3_recaudo: [
        { name: "NARANJO DULFARY DEL SOCORRO", val: 85025516, dia_max: { fecha: "28/02/2026", valor: 42084239 } },
        { name: "RESTREPO ESCOBAR LUZ AMPARO", val: 62312446, dia_max: { fecha: "06/04/2026", valor: 11468523 } },
        { name: "ARIAS ARIAS NORBEY",          val: 49293299, dia_max: { fecha: "26/01/2026", valor: 17028735 } },
      ],
      riesgo: {
        clientes_persistentes: 24,
        top_clientes: [
          { nombre: "GRUPO BINGO SAS",            dias_riesgo: 6, dias_activos: 9, pct_propio:  66.7, pct_op: 5.9, recaudo_total: 39503352 },
          { nombre: "RESTREPO ESCOBAR LUZ AMPARO",dias_riesgo: 6, dias_activos: 6, pct_propio: 100.0, pct_op: 5.9, recaudo_total: 62312446 },
          { nombre: "ALZATE SUAREZ MARIO GERMAN", dias_riesgo: 4, dias_activos: 6, pct_propio:  66.7, pct_op: 4.0, recaudo_total: 28700000 },
          { nombre: "ARCILA OSORIO ANA CECILIA",  dias_riesgo: 4, dias_activos: 6, pct_propio:  66.7, pct_op: 4.0, recaudo_total: 27500000 },
          { nombre: "GIRALDO HOYOS LUCELLY",      dias_riesgo: 4, dias_activos: 6, pct_propio:  66.7, pct_op: 4.0, recaudo_total: 26900000 },
        ],
      },
    },
    {
      id: "CALI",
      nombre: "Valle del Cauca",
      capital: "Cali",
      centroide: { lat: 3.45, lng: -76.53 },
      servicios_totales: 1393,
      recaudo_total: 1651126595,
      dias_operativos: 101,
      dia_pico_fisico: { fecha: "09/03/2026", valor: 26275303 },
      efectivo_total: 220265766,
      vh_efectivo: 10,
      placa_max_dia: { placa: "WCW168", fecha: "09/03/2026", valor: 26275303 },
      top3_recaudo: [
        { name: "ALYAN UNIDOS S.A.S",                val: 93188371, dia_max: { fecha: "15/04/2026", valor: 20219698 } },
        { name: "LOPEZ HERRERA CESAR ARMANDO",       val: 66111745, dia_max: { fecha: "16/03/2026", valor:  9713766 } },
        { name: "BOLAÑOS MARTINEZ BRAYAN ALEJANDRO", val: 63836634, dia_max: { fecha: "13/04/2026", valor: 28176818 } },
      ],
      riesgo: {
        clientes_persistentes: 12,
        top_clientes: [
          { nombre: "ALYAN UNIDOS S.A.S",                    dias_riesgo: 10, dias_activos: 13, pct_propio:  76.9, pct_op: 9.9, recaudo_total: 93188371 },
          { nombre: "ROJAS HOLGUIN CECILIA",                 dias_riesgo:  6, dias_activos:  6, pct_propio: 100.0, pct_op: 5.9, recaudo_total: 43033368 },
          { nombre: "BOLANOS MARTINEZ BRAYAN ALEJANDRO",     dias_riesgo:  3, dias_activos: 10, pct_propio:  30.0, pct_op: 3.0, recaudo_total: 63836634 },
          { nombre: "MACIAS PATRICIA",                       dias_riesgo:  2, dias_activos:  9, pct_propio:  22.2, pct_op: 2.0, recaudo_total: 21500000 },
          { nombre: "LOPEZ HERRERA CESAR ARMANDO",           dias_riesgo:  2, dias_activos: 13, pct_propio:  15.4, pct_op: 2.0, recaudo_total: 66111745 },
        ],
      },
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
    // Formato pesos colombianos completo con coma como separador de miles.
    // Se mantiene el nombre por compatibilidad pero ya NO abrevia (no M ni B):
    // 314207655 -> "$314,207,655"; 10280703582 -> "$10,280,703,582"
    return "$" + Math.round(val).toLocaleString("en-US");
  }

  function fmtNum(val) {
    return Math.round(val).toLocaleString("es-CO").replace(/,/g, ".");
  }

  // formato % con coma decimal estilo "76,9%"
  function fmtPct(val) {
    return val.toFixed(1).replace(".", ",") + "%";
  }

  function renderTop3(sel, items) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach(function (it, idx) {
      const li = document.createElement("li");
      li.className = "top3-item";
      // Si el item trae dia_max, layout en 2 filas (nombre+val arriba, día max abajo).
      if (it.dia_max) {
        li.classList.add("top3-item--stacked");
        li.innerHTML =
          '<div class="top3-row">' +
            '<span class="top3-rank">' + (idx + 1) + "</span>" +
            '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
            '<span class="top3-val" style="color:#F59E0B">' + escapeHtml(fmtCOPshort(it.val)) + "</span>" +
          "</div>" +
          '<div class="top3-meta">Día max: ' +
            escapeHtml(it.dia_max.fecha) + " · " + escapeHtml(fmtCOPshort(it.dia_max.valor)) +
          "</div>";
      } else {
        li.innerHTML =
          '<span class="top3-rank">' + (idx + 1) + "</span>" +
          '<span class="top3-name">' + escapeHtml(it.name) + "</span>" +
          '<span class="top3-val" style="color:#F59E0B">' + escapeHtml(fmtCOPshort(it.val)) + "</span>";
      }
      ul.appendChild(li);
    });
  }

  // Renderiza el TOP de clientes-persistentes con barra visual del pct_propio.
  // Cada item muestra: <nombre> — <dias_riesgo>/<dias_activos> días = <pct>%
  // y debajo una barra amber proporcional al pct_propio (0-100%).
  function renderAlerta(sel, region) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    const top = (region.riesgo && region.riesgo.top_clientes) || [];
    top.forEach(function (it, idx) {
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
          'Recaudo período: ' + escapeHtml(fmtCOPshort(it.recaudo_total)) +
          ' · ' + fmtPct(it.pct_op) + ' del op' +
        "</div>" +
        '<div class="gen-alert-bar" role="progressbar" aria-valuenow="' + pctClamp +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="gen-alert-bar-fill" style="width:' + pctClamp + '%"></div>' +
        "</div>";
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
    setText(".gen-recaudo-sub", "Total recaudado · 4 meses (todos los tipos)");

    const promMensual = region.recaudo_total / MESES_PERIODO;
    const promDiario = region.dias_operativos > 0
      ? region.recaudo_total / region.dias_operativos
      : 0;

    setText(".gen-prom-mensual", fmtCOPshort(promMensual));
    setText(".gen-prom-diario", fmtCOPshort(promDiario));

    // Día con mayor recaudo físico (Contado + Contraentrega) — exposición pico
    const pico = region.dia_pico_fisico;
    if (pico) {
      setText(".gen-pico-fecha", pico.fecha);
      setText(".gen-pico-valor", fmtCOPshort(pico.valor));
    } else {
      setText(".gen-pico-fecha", "—");
      setText(".gen-pico-valor", "—");
    }
    if (region.efectivo_total && region.vh_efectivo) {
      setText(
        ".gen-pico-sub",
        "Efectivo regional 4 meses: " +
          fmtCOPshort(region.efectivo_total) +
          " · " + region.vh_efectivo + " vehículos con efectivo"
      );
    } else {
      setText(".gen-pico-sub", "—");
    }

    renderTop3(".gen-top3-recaudo", region.top3_recaudo);

    // Placa con máximo efectivo en una sola jornada · por región
    const pmd = region.placa_max_dia;
    if (pmd) {
      setText(".gen-placa-max-placa", pmd.placa);
      setText(".gen-placa-max-fecha", pmd.fecha);
      setText(".gen-placa-max-valor", fmtCOPshort(pmd.valor));
    } else {
      setText(".gen-placa-max-placa", "—");
      setText(".gen-placa-max-fecha", "—");
      setText(".gen-placa-max-valor", "—");
    }

    // Métrica días-riesgo: clientes que tuvieron días con recaudo > $5M/día.
    // Headline = clientes persistentes (≥20% de sus días propios en riesgo)
    // Sub = recordatorio de la regla y el universo de 101 días operativos.
    const r = region.riesgo || { clientes_persistentes: 0, top_clientes: [] };
    setText(
      ".gen-alert-headline",
      r.clientes_persistentes + " clientes persistentes en zona crítica"
    );
    setText(
      ".gen-alert-sub",
      "≥20% de sus días propios con recaudo > $5,000,000 (" +
        DIAS_OPERATIVOS_TOTALES +
        " días op)"
    );
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
