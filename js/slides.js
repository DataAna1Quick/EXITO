/* slides.js – Operación Éxito Antioquia */
(function () {
  "use strict";

  // ── 1. Inject zona-slide maps into existing slides 18-26 ──────────────────
  const maps = {
    "slide-18": "assets/charts/map_slide-18.jpg",
    "slide-19": "assets/charts/map_slide-19.jpg",
    "slide-20": "assets/charts/map_slide-20.jpg",
    "slide-21": "assets/charts/map_slide-21.jpg",
    "slide-22": "assets/charts/map_slide-22.jpg",
    "slide-23": "assets/charts/map_slide-23.jpg",
    "slide-24": "assets/charts/map_slide-24.jpg",
    "slide-25": "assets/charts/map_slide-25.jpg",
    "slide-26": "assets/charts/map_slide-26.jpg",
  };

  for (const [slideId, imgSrc] of Object.entries(maps)) {
    const slide = document.getElementById(slideId);
    if (!slide) continue;
    const body = slide.querySelector(".zona-body");
    if (!body) continue;
    body.style.gridTemplateColumns = "280px 1fr 1fr 1fr";
    const mapDiv = document.createElement("div");
    mapDiv.className = "zona-map-cell";
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Mapa " + slideId;
    mapDiv.appendChild(img);
    body.insertBefore(mapDiv, body.firstChild);
  }

  // ── 3. Navigation ─────────────────────────────────────────────────────────
  const slideshow = document.getElementById("slideshow");
  const slides = document.querySelectorAll(".slide");
  const counter = document.getElementById("slide-counter");
  const dotNav = document.getElementById("dot-nav");
  let current = 0;
  const total = slides.length;

  counter.textContent = "1 / " + total;

  // Build dot nav
  slides.forEach(function (_, i) {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.onclick = function () { goTo(i); };
    dotNav.appendChild(d);
  });

  function goTo(n) {
    slides[current].classList.remove("active");
    dotNav.children[current].classList.remove("active");
    current = (n + total) % total;
    slides[current].classList.add("active");
    dotNav.children[current].classList.add("active");
    counter.textContent = (current + 1) + " / " + total;
  }

  window.nextSlide = function () { goTo(current + 1); };
  window.prevSlide = function () { goTo(current - 1); };

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
})();
