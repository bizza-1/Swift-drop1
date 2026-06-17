
function initHeroAnimation() {
  const statusEl   = document.getElementById("js-status");
  const progressEl = document.getElementById("js-progress");
  const stepEls    = document.querySelectorAll(".step");
  if (!statusEl || !progressEl) return;

  const statuses       = ["PENDING", "ACCEPTED", "PICKED UP", "IN TRANSIT", "DELIVERED"];
  const statusColors   = ["#94a3b8", "#facc15", "#60a5fa", "#FF6B2B", "#22c55e"];
  const progressWidths = ["5%", "25%", "50%", "75%", "100%"];
  let currentStep = 0;

  function updateStatus() {
    statusEl.textContent        = statuses[currentStep];
    statusEl.style.background   = statusColors[currentStep] + "22";
    statusEl.style.color        = statusColors[currentStep];
    statusEl.style.borderColor  = statusColors[currentStep];
    progressEl.style.width      = progressWidths[currentStep];
    progressEl.style.background = statusColors[currentStep];

    stepEls.forEach((el, i) => {
      el.classList.toggle("step--active", i === currentStep);
      el.classList.toggle("step--done",   i < currentStep);
    });

    currentStep = (currentStep + 1) % statuses.length;
  }

  updateStatus();
  setInterval(updateStatus, 2000);
}

/* ----------------------------------------------------------
   SMOOTH SCROLL for nav anchor links
   ---------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initHeroAnimation();
  initSmoothScroll();
});