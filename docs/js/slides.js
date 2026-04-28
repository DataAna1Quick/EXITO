/* slides.js – Operación Éxito Antioquia
 * Soporta dos secciones (GENERAL país / MEDELLÍN) con tab-nav.
 * Cada sección mantiene su propia navegación de slides.
 */
(function () {
  "use strict";

  // ── 1. Inject zona-slide maps into existing slides 18-26 ──────────────────
  const maps = {
    "slide-18": "../images/charts/map_slide-18.jpg",
    "slide-19": "../images/charts/map_slide-19.jpg",
    "slide-20": "../images/charts/map_slide-20.jpg",
    "slide-21": "../images/charts/map_slide-21.jpg",
    "slide-22": "../images/charts/map_slide-22.jpg",
    "slide-23": "../images/charts/map_slide-23.jpg",
    "slide-24": "../images/charts/map_slide-24.jpg",
    "slide-25": "../images/charts/map_slide-25.jpg",
    "slide-26": "../images/charts/map_slide-26.jpg",
  };

  for (const [slideId, imgSrc] of Object.entries(maps)) {
    const slide = document.getElementById(slideId);
    if (!slide) continue;
    const mapFill = document.createElement("div");
    mapFill.className = "zona-map-fill";
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Mapa " + slideId;
    mapFill.appendChild(img);
    slide.insertBefore(mapFill, slide.firstChild);
  }

  // ── 2. Section tabs (GENERAL ↔ MEDELLÍN) ──────────────────────────────────
  const sectionBlocks = document.querySelectorAll(".section-block");
  const tabButtons = document.querySelectorAll(".section-tab");
  const counter = document.getElementById("slide-counter");
  const dotNav = document.getElementById("dot-nav");

  // Estado por sección
  const state = { current: 0, slides: [], section: "general" };

  function activeBlock() {
    return document.querySelector(`.section-block[data-section="${state.section}"]`);
  }

  function rebuild() {
    // Show/hide section blocks
    sectionBlocks.forEach((b) => {
      const isActive = b.dataset.section === state.section;
      b.hidden = !isActive;
      b.classList.toggle("active", isActive);
    });
    tabButtons.forEach((t) => {
      const isActive = t.dataset.section === state.section;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Slides de la sección activa
    state.slides = Array.from(activeBlock().querySelectorAll(".slide"));
    state.current = 0;
    state.slides.forEach((s, i) => s.classList.toggle("active", i === 0));

    // Dot-nav rebuild
    dotNav.innerHTML = "";
    state.slides.forEach((_, i) => {
      const d = document.createElement("div");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.onclick = () => goTo(i);
      dotNav.appendChild(d);
    });

    counter.textContent = "1 / " + state.slides.length;
  }

  function goTo(n) {
    if (!state.slides.length) return;
    state.slides[state.current].classList.remove("active");
    dotNav.children[state.current].classList.remove("active");
    state.current = (n + state.slides.length) % state.slides.length;
    state.slides[state.current].classList.add("active");
    dotNav.children[state.current].classList.add("active");
    counter.textContent = (state.current + 1) + " / " + state.slides.length;
  }

  function switchSection(name) {
    if (state.section === name) return;
    state.section = name;
    rebuild();
  }

  tabButtons.forEach((t) => {
    t.addEventListener("click", () => switchSection(t.dataset.section));
  });

  // Inicializar con la sección por defecto (la del tab .active en el HTML)
  const defaultTab = document.querySelector(".section-tab.active");
  if (defaultTab) state.section = defaultTab.dataset.section;
  rebuild();

  // ── 3. Navigation ─────────────────────────────────────────────────────────
  window.nextSlide = function () { goTo(state.current + 1); };
  window.prevSlide = function () { goTo(state.current - 1); };

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") window.nextSlide();
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   window.prevSlide();
  });

  // Touch swipe
  var touchStart = 0;
  document.addEventListener("touchstart", function (e) {
    touchStart = e.touches[0].clientX;
  });
  document.addEventListener("touchend", function (e) {
    var diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? window.nextSlide() : window.prevSlide();
    }
  });

  // Expone API mínima por si arcgis_map.js u otro script la necesita
  window.QuickSlides = {
    switchSection,
    goTo,
    getSection: () => state.section,
    getCurrent: () => state.current,
  };
})();
