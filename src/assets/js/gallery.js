/**
 * gallery.js
 * 單篇食譜頁照片左右切換
 */

(function () {
  "use strict";

  const track   = document.getElementById("photo-track");
  const prevBtn = document.getElementById("photo-prev");
  const nextBtn = document.getElementById("photo-next");
  const dots    = document.querySelectorAll(".photo-dot");

  if (!track || !prevBtn || !nextBtn) return;

  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  // 觸控滑動支援
  let startX = 0;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
})();
