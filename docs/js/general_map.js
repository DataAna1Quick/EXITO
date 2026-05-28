/* general_map.js · Operacion Surtimax NACIONAL
 * Mapa interactivo full SDK (4.x) en slide-G7 (seccion GENERAL).
 * 5 markers (uno por region operativa Surtimax). Click sobre un marker
 * actualiza el panel de cards de la derecha con los datos de esa region.
 *
 * DINÁMICO: la geo (lat/lng/capital) es estática; los datos numéricos vienen
 * del periodo activo (window.DASHBOARD_DATA, generado por
 * scripts/build_dashboard_data.py) a través de window.GeneralMapUpdate(payload),
 * que llama dashboard_dynamic.js cuando cambia el selector mes/semana.
 *
 * No toca slide-13 (mapa Medellin) ni nada fuera de slide-G7.
 */
(function () {
  "use strict";

  // ── 1. Geo-metadata estática por región (no cambia con el periodo) ─────────
  const GEO = [
    { id: "FUNZA",    nombre: "Bogotá-Sabana",   capital: "Bogotá / Funza", centroide: { lat: 4.71,  lng: -74.07 } },
    { id: "MEDELLIN", nombre: "Antioquia",       capital: "Medellín",       centroide: { lat: 6.25,  lng: -75.57 } },
    { id: "COSTA",    nombre: "Costa Atlántica", capital: "Barranquilla",   centroide: { lat: 10.97, lng: -74.81 } },
    { id: "EJE",      nombre: "Eje Cafetero",    capital: "Pereira",        centroide: { lat: 4.81,  lng: -75.69 } },
    { id: "CALI",     nombre: "Valle del Cauca", capital: "Cali",           centroide: { lat: 3.45,  lng: -76.53 } },
  ];

  const ITEM_ID = "781f76fd8f9b402a82c0b1672cff38c4";

  // ── 2. Estado interno ────────────────────────────────────────────────────
  let view = null;
  let layer = null;
  let highlightLayer = null;
  let initStarted = false;
  let currentRegionId = null;
  let currentLabel = "";
  let activeRegions = [];

  // Fusiona GEO + datos del periodo activo → objetos-región que consume updateCards.
  function buildRegions(payload) {
    const porRegion = (payload && payload.por_region) || [];
    return GEO.map(function (geo) {
      const pr = porRegion.find(function (r) { return r.region === geo.nombre; }) || {};
      const alerta = pr.alerta || { clientes_persistentes: 0, top_clientes: [] };
      return {
        id: geo.id,
        nombre: geo.nombre,
        capital: geo.capital,
        centroide: geo.centroide,
        servicios_totales: pr.servicios || 0,
        recaudo_total: pr.recaudo || 0,
        dias_operativos: pr.dias_operativos || 0,
        prom_mensual: pr.prom_mensual || 0,
        prom_diario: pr.prom_diario || 0,
        dia_pico_fisico: pr.dia_pico_fisico || null,
        efectivo_total: pr.recaudo_efectivo || 0,
        vh_efectivo: pr.vh_efectivo || 0,
        placa_max_dia: pr.placa_max_dia || null,
        top3_recaudo: (pr.top3_recaudo || []).map(function (t) {
          return { name: t.nombre, val: t.recaudo, dia_max: t.dia_max };
        }),
        riesgo: {
          clientes_persistentes: alerta.clientes_persistentes || 0,
          top_clientes: (alerta.top_clientes || []).map(function (c) {
            return {
              nombre: c.nombre, dias_riesgo: c.dias_riesgo, dias_activos: c.dias_activos,
              pct_propio: c.pct_propio, pct_op: c.pct_op, recaudo_total: c.recaudo,
            };
          }),
        },
      };
    });
  }

  function defaultPayload() {
    return (window.DASHBOARD_DATA && window.DASHBOARD_DATA.periodos &&
            window.DASHBOARD_DATA.periodos.todos) || null;
  }

  // Inicializa con "todos" hasta que el selector envíe un periodo concreto.
  (function seed() {
    const p = defaultPayload();
    activeRegions = buildRegions(p);
    currentLabel = (p && p.label) || "";
  })();

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

  function fmtCOPshort(val) {
    // Pesos completos con separador de miles "." (convención Surtimax): 314207655 -> "$314.207.655"
    return "$" + Math.round(val).toLocaleString("en-US").replace(/,/g, ".");
  }

  function fmtNum(val) {
    return Math.round(val).toLocaleString("es-CO").replace(/,/g, ".");
  }

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

  // ── 4. Update cards (al click o al cambiar de periodo) ────────────────────
  function updateCards(region) {
    if (!region) return;
    currentRegionId = region.id;
    setText(".gen-region-name", region.nombre);
    setText(".gen-region-capital", "Capital: " + region.capital);

    setText(".gen-servicios-totales", fmtNum(region.servicios_totales));
    setText(".gen-servicios-sub", region.dias_operativos + " días operativos · " + currentLabel);

    setText(".gen-recaudo-valor", fmtCOPshort(region.recaudo_total));
    setText(".gen-recaudo-sub", "Total recaudado · " + currentLabel + " (todos los tipos)");

    setText(".gen-prom-mensual", fmtCOPshort(region.prom_mensual));
    setText(".gen-prom-diario", fmtCOPshort(region.prom_diario));

    // Día con mayor recaudo físico (efectivo) — exposición pico
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
        "Efectivo " + currentLabel + ": " +
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

    // Alerta días-riesgo: clientes con días de recaudo diario > $5M
    const r = region.riesgo || { clientes_persistentes: 0, top_clientes: [] };
    setText(
      ".gen-alert-headline",
      r.clientes_persistentes + " clientes persistentes en zona crítica"
    );
    setText(
      ".gen-alert-sub",
      "≥20% de sus días propios con recaudo > $5.000.000 (" +
        region.dias_operativos + " días op · " + currentLabel + ")"
    );
    renderAlerta(".gen-alert-list", region);
  }

  // API pública: dashboard_dynamic.js la llama al cambiar el periodo.
  window.GeneralMapUpdate = function (payload) {
    if (!payload) return;
    activeRegions = buildRegions(payload);
    currentLabel = payload.label || "";
    if (view) {
      const r = activeRegions.find(function (x) { return x.id === currentRegionId; }) || activeRegions[0];
      updateCards(r);
    }
  };

  // ── 5. Init Maps SDK ─────────────────────────────────────────────────────
  function init() {
    if (initStarted) return;
    const container = document.getElementById("general-map");
    if (!container) return;
    if (typeof window.require !== "function") {
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
        const webmap = new WebMap({ portalItem: { id: ITEM_ID } });

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

            GEO.forEach(function (geo, idx) {
              const g = new Graphic({
                geometry: { type: "point", longitude: geo.centroide.lng, latitude: geo.centroide.lat },
                symbol: {
                  type: "simple-marker", style: "circle",
                  color: [46, 134, 193, 0.95], size: 22,
                  outline: { color: [255, 255, 255, 1], width: 3 },
                },
                attributes: { id: geo.id, nombre: geo.nombre },
              });
              layer.add(g);

              const label = new Graphic({
                geometry: { type: "point", longitude: geo.centroide.lng, latitude: geo.centroide.lat },
                symbol: {
                  type: "text", color: [255, 255, 255, 1],
                  haloColor: [26, 82, 118, 1], haloSize: 1,
                  text: String(idx + 1), xoffset: 0, yoffset: -4,
                  font: { size: 11, family: "Barlow Condensed, sans-serif", weight: "bold" },
                },
                attributes: { id: geo.id, _isLabel: true },
              });
              layer.add(label);
            });

            view.on("click", function (e) {
              view.hitTest(e).then(function (res) {
                const hit = res.results.find(function (r) {
                  return r.graphic && r.graphic.layer === layer &&
                    r.graphic.attributes && typeof r.graphic.attributes.id !== "undefined";
                });
                if (!hit) return;
                const id = hit.graphic.attributes.id;
                const region = activeRegions.find(function (r) { return r.id === id; });
                if (region) {
                  updateCards(region);
                  highlightRegion(Graphic, region);
                }
              });
            });

            // Estado inicial: primera región (Bogotá-Sabana, mayor recaudo)
            updateCards(activeRegions[0]);
            highlightRegion(Graphic, activeRegions[0]);
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
      geometry: { type: "point", longitude: region.centroide.lng, latitude: region.centroide.lat },
      symbol: {
        type: "simple-marker", style: "circle",
        color: [93, 173, 226, 0.25], size: 44,
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
