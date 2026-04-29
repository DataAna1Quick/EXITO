/* slides.js – Operación Éxito Antioquia
 * Soporta dos secciones (GENERAL país / MEDELLÍN) con tab-nav.
 * Cada sección mantiene su propia navegación de slides.
 */
(function () {
  "use strict";

  // ── 1. Zona-slide maps (slides 18-26) ────────────────────────────────────
  // Los mapas ahora son <arcgis-embedded-map> embebidos directamente en el
  // HTML dentro de <div class="zona-map-fill">. Ya no inyectamos <img>.

  // ── 2. Section tabs (GENERAL ↔ MEDELLÍN) + landing menu ───────────────────
  const sectionBlocks = document.querySelectorAll(".section-block");
  const tabButtons = document.querySelectorAll(".section-tab[data-section]");
  const sectionTabsBar = document.getElementById("section-tabs");
  const landingMenu = document.getElementById("landing-menu");
  const landingButtons = document.querySelectorAll(".landing-btn[data-section]");
  const backToMenuBtn = document.getElementById("back-to-menu");
  const counter = document.getElementById("slide-counter");
  const dotNav = document.getElementById("dot-nav");
  const navBar = document.getElementById("nav");

  // Estado por sección. section=null cuando el landing está visible.
  const state = { current: 0, slides: [], section: null };

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

    const block = activeBlock();
    if (!block) return;

    // Slides de la sección activa
    state.slides = Array.from(block.querySelectorAll(".slide"));
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

  function showLanding() {
    if (landingMenu) landingMenu.classList.add("visible");
    if (sectionTabsBar) sectionTabsBar.hidden = true;
    if (navBar) navBar.style.display = "none";
    state.section = null;
  }

  function hideLanding() {
    if (landingMenu) landingMenu.classList.remove("visible");
    if (sectionTabsBar) sectionTabsBar.hidden = false;
    if (navBar) navBar.style.display = "";
  }

  function switchSection(name) {
    if (state.section === name && landingMenu && !landingMenu.classList.contains("visible")) return;
    state.section = name;
    hideLanding();
    rebuild();
  }

  // Wire tabs flotantes
  tabButtons.forEach((t) => {
    t.addEventListener("click", () => switchSection(t.dataset.section));
  });

  // Wire botones del landing
  landingButtons.forEach((b) => {
    b.addEventListener("click", () => switchSection(b.dataset.section));
  });

  // Botón ☰ para volver al menú
  if (backToMenuBtn) {
    backToMenuBtn.addEventListener("click", showLanding);
  }

  // Estado inicial: landing visible, slideshow oculto, tabs ocultos.
  showLanding();

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

  // Expone API mínima por si algún script externo la necesita
  window.QuickSlides = {
    switchSection,
    goTo,
    showLanding,
    getSection: () => state.section,
    getCurrent: () => state.current,
  };
})();
