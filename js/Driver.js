/* ============================================================
   SWIFTDROP — js/driver.js
   Handles all driver page logic:
   - driver/dashboard.html
   - driver/jobs.html
   ============================================================ */

/* ----------------------------------------------------------
   ONLINE / OFFLINE TOGGLE
   Shared by both driver pages
   ---------------------------------------------------------- */
function initOnlineToggle() {
  const toggle = document.getElementById("online-toggle");
  const label  = document.getElementById("toggle-label");
  if (!toggle) return;

  let isOnline = true;

  toggle.addEventListener("click", () => {
    isOnline = !isOnline;
    toggle.classList.toggle("online-toggle--offline", !isOnline);
    label.textContent = isOnline ? "Online" : "Offline";
  });
}

/* ----------------------------------------------------------
   ACCEPT JOB BUTTON — shared behaviour
   Disables button, fades card, shows "✅ Accepted"
   ---------------------------------------------------------- */
function initAcceptButtons(containerSelector) {
  const scope = containerSelector
    ? document.querySelector(containerSelector)
    : document;
  if (!scope) return;

  scope.querySelectorAll(".accept-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".job-card-full") || this.closest(".job-card");
      this.disabled    = true;
      this.textContent = "Accepting…";

      // Simulate PUT /api/drivers/{id}/accept in Phase 4
      setTimeout(() => {
        this.textContent = "✅ Accepted";
        this.classList.remove("btn--primary");
        this.classList.add("btn--ghost");
        if (card) {
          card.style.opacity        = "0.5";
          card.style.pointerEvents  = "none";
        }
      }, 900);
    });
  });
}

/* ----------------------------------------------------------
   DRIVER DASHBOARD (driver/dashboard.html)
   ---------------------------------------------------------- */
function initDriverDashboard() {
  // Only run on dashboard (check for unique element)
  if (!document.getElementById("active-job")) return;

  // Mark as Delivered button
  const markDeliveredBtn = document.querySelector(".job-status-btn");
  const jobActions       = document.getElementById("job-actions");
  const jobDelivered     = document.getElementById("job-delivered");

  markDeliveredBtn?.addEventListener("click", () => {
    if (jobActions)   jobActions.style.display   = "none";
    if (jobDelivered) jobDelivered.style.display  = "flex";

    // Update status badge on the active job card
    const badge = document.querySelector("#active-job .status-badge");
    if (badge) {
      badge.className   = "status-badge status-badge--delivered";
      badge.textContent = "Delivered";
    }

    // Phase 4: send PUT /api/deliveries/{id} with status DELIVERED
  });

  initAcceptButtons("#available-jobs");
}

/* ----------------------------------------------------------
   JOBS PAGE (driver/jobs.html)
   ---------------------------------------------------------- */
function initJobsPage() {
  const jobsGrid = document.getElementById("jobs-grid");
  if (!jobsGrid) return;

  // ---- Filter chips ----
  const chips    = document.querySelectorAll(".chip");
  const jobCards = document.querySelectorAll(".job-card-full");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("chip--active"));
      chip.classList.add("chip--active");
      const filter = chip.dataset.filter;

      jobCards.forEach((card) => {
        card.style.display =
          filter === "ALL" || card.dataset.size === filter ? "flex" : "none";
      });
    });
  });

  // ---- Sort select (wired — logic runs in Phase 2) ----
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    // Phase 2: sort jobCards array by dataset.price or posted time and re-append
    console.log("Sort by:", e.target.value);
  });

  // ---- Accept buttons ----
  initAcceptButtons("#jobs-grid");

  // ---- Job detail modal ----
  const { open: openModal, close: closeModal } = createModal("modal-overlay");
  let currentModalId = null;

  // Exposed globally for inline onclick in HTML
  window.openJobDetail = function (id, pickup, dest, price, size, notes, time) {
    currentModalId = id;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    set("modal-id",  id);
    set("md-pickup", pickup);
    set("md-dest",   dest);
    set("md-price",  price);
    set("md-size",   size);
    set("md-notes",  notes);
    set("md-time",   time);
    openModal();
  };

  document.getElementById("modal-close")?.addEventListener("click",   closeModal);
  document.getElementById("modal-close-2")?.addEventListener("click", closeModal);

  // Accept from inside the modal
  document.getElementById("modal-accept-btn")?.addEventListener("click", () => {
    if (!currentModalId) return;
    const btn = document.querySelector(`.accept-btn[data-id="${currentModalId}"]`);
    if (btn) {
      btn.click(); // triggers the accept flow above
    }
    closeModal();
  });
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setTodayDate("topbar-date");
  initSidebar();
  initOnlineToggle();
  initDriverDashboard();
  initJobsPage();
});