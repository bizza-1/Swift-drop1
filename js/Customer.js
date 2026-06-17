/* ============================================================
   SWIFTDROP — js/customer.js
   Handles all customer page logic:
   - customer/dashboard.html
   - customer/create-delivery.html
   - customer/deliveries.html
   ============================================================ */

/* ----------------------------------------------------------
   DASHBOARD (customer/dashboard.html)
   ---------------------------------------------------------- */
function initCustomerDashboard() {
  if (!document.getElementById("js-status")) return; // not on this page

  const statuses      = ["PENDING", "ACCEPTED", "PICKED UP", "IN TRANSIT", "DELIVERED"];
  const statusColors  = ["#94a3b8", "#facc15", "#60a5fa", "#FF6B2B", "#22c55e"];
  const progressWidths = ["5%", "25%", "50%", "75%", "100%"];

  let currentStep   = 0;
  const statusEl    = document.getElementById("js-status");
  const progressEl  = document.getElementById("js-progress");
  const stepEls     = document.querySelectorAll(".step");

  function updateStatus() {
    statusEl.textContent    = statuses[currentStep];
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
   CREATE DELIVERY (customer/create-delivery.html)
   ---------------------------------------------------------- */
function initCreateDelivery() {
  const form = document.getElementById("delivery-form");
  if (!form) return;

  const steps      = [
    document.getElementById("step-1"),
    document.getElementById("step-2"),
    document.getElementById("step-3"),
  ];
  const indicators = document.querySelectorAll(".step-indicator__item");

  function showStep(n) {
    steps.forEach((s, i) => s?.classList.toggle("form-step--hidden", i !== n));
    indicators.forEach((el, i) => {
      el.classList.toggle("step-indicator__item--active", i === n);
      el.classList.toggle("step-indicator__item--done",   i < n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Step 1 → 2 ----
  document.getElementById("next-1")?.addEventListener("click", () => {
    const desc  = document.getElementById("package-desc");
    const size  = document.getElementById("package-size");
    const descE = document.getElementById("package-desc-error");
    const sizeE = document.getElementById("package-size-error");
    let valid   = true;
    clearError(descE); clearError(sizeE);

    if (!desc.value.trim()) { showError(descE, "Package description is required."); valid = false; }
    if (!size.value)        { showError(sizeE, "Please select a package size.");    valid = false; }
    if (!valid) return;
    updateSummary();
    showStep(1);
  });

  // ---- Step 2 → 3 ----
  document.getElementById("next-2")?.addEventListener("click", () => {
    const fieldDefs = [
      { id: "pickup-address",  errId: "pickup-error",         msg: "Pickup address is required." },
      { id: "pickup-name",     errId: "pickup-name-error",    msg: "Sender name is required." },
      { id: "pickup-phone",    errId: "pickup-phone-error",   msg: "Valid Nigerian phone required.", phone: true },
      { id: "dest-address",    errId: "dest-error",           msg: "Destination address is required." },
      { id: "recipient-name",  errId: "recipient-name-error", msg: "Recipient name is required." },
      { id: "recipient-phone", errId: "recipient-phone-error",msg: "Valid Nigerian phone required.", phone: true },
    ];

    let valid = true;
    fieldDefs.forEach(({ id, errId, msg, phone }) => {
      const el    = document.getElementById(id);
      const errEl = document.getElementById(errId);
      clearError(errEl);
      const val = el?.value.trim().replace(/\s/g, "") || "";
      if (!el?.value.trim()) {
        showError(errEl, msg); valid = false;
      } else if (phone && !PHONE_REGEX.test(val)) {
        showError(errEl, "Enter a valid Nigerian phone number."); valid = false;
      }
    });

    if (!valid) return;
    updateSummary();
    buildReview();
    showStep(2);
  });

  // ---- Back buttons ----
  document.getElementById("back-2")?.addEventListener("click", () => showStep(0));
  document.getElementById("back-3")?.addEventListener("click", () => showStep(1));

  // ---- Live summary ----
  function updateSummary() {
    const desc    = document.getElementById("package-desc")?.value.trim();
    const size    = document.getElementById("package-size");
    const pickup  = document.getElementById("pickup-address")?.value.trim();
    const dest    = document.getElementById("dest-address")?.value.trim();
    const prices  = { SMALL: 800, MEDIUM: 1500, LARGE: 2500, EXTRA_LARGE: 4000 };
    const price   = prices[size?.value];
    const sizeText = size?.options[size.selectedIndex]?.text || "—";

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || "—"; };
    set("sum-package", desc);
    set("sum-size",    sizeText !== "Select size" ? sizeText : null);
    set("sum-pickup",  pickup);
    set("sum-dest",    dest);
    set("sum-price",   price ? `₦ ${price.toLocaleString()}` : "₦ —");
  }

  ["package-desc", "package-size", "pickup-address", "dest-address"].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("input",  updateSummary);
    el?.addEventListener("change", updateSummary);
  });

  // ---- Build review block ----
  function buildReview() {
    const get     = (id) => document.getElementById(id)?.value.trim() || "";
    const size    = document.getElementById("package-size");
    const sizeText = size?.options[size.selectedIndex]?.text || "—";
    const fragile  = document.querySelector('input[name="fragile"]:checked')?.value === "true";
    const prices   = { SMALL: 800, MEDIUM: 1500, LARGE: 2500, EXTRA_LARGE: 4000 };
    const price    = prices[size?.value];

    const block = document.getElementById("review-block");
    if (!block) return;

    block.innerHTML = `
      <div class="review-section">
        <h4 class="review-section__title">📦 Package</h4>
        <div class="review-row"><span>Description</span><span>${get("package-desc")}</span></div>
        <div class="review-row"><span>Size</span><span>${sizeText}</span></div>
        <div class="review-row"><span>Weight</span><span>${get("package-weight") ? get("package-weight") + " kg" : "Not specified"}</span></div>
        <div class="review-row"><span>Fragile</span><span>${fragile ? "⚠️ Yes" : "No"}</span></div>
        ${get("special-instructions") ? `<div class="review-row"><span>Instructions</span><span>${get("special-instructions")}</span></div>` : ""}
      </div>
      <div class="review-section">
        <h4 class="review-section__title">📍 Pickup</h4>
        <div class="review-row"><span>Address</span><span>${get("pickup-address")}</span></div>
        <div class="review-row"><span>Sender</span><span>${get("pickup-name")}</span></div>
        <div class="review-row"><span>Phone</span><span>${get("pickup-phone")}</span></div>
      </div>
      <div class="review-section">
        <h4 class="review-section__title">🏁 Destination</h4>
        <div class="review-row"><span>Address</span><span>${get("dest-address")}</span></div>
        <div class="review-row"><span>Recipient</span><span>${get("recipient-name")}</span></div>
        <div class="review-row"><span>Phone</span><span>${get("recipient-phone")}</span></div>
      </div>
      <div class="review-section review-section--price">
        <div class="review-row review-row--total">
          <span>Estimated Cost</span>
          <span class="review-price">${price ? `₦ ${price.toLocaleString()}` : "To be confirmed"}</span>
        </div>
      </div>
    `;
  }

  // ---- Form submit ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");
    btn.disabled    = true;
    btn.textContent = "Placing request…";

    // Simulate POST /api/deliveries — replace in Phase 4
    setTimeout(() => {
      steps.forEach((s) => s?.classList.add("form-step--hidden"));
      const successState = document.getElementById("success-state");
      if (successState) successState.classList.remove("form-step--hidden");
      const fakeId = "DEL-00" + Math.floor(480 + Math.random() * 20);
      const idEl   = document.getElementById("success-id");
      if (idEl) idEl.textContent = fakeId;
    }, 1600);
  });
}

/* ----------------------------------------------------------
   DELIVERIES LIST (customer/deliveries.html)
   ---------------------------------------------------------- */
function initDeliveriesPage() {
  const list = document.getElementById("deliveries-list");
  if (!list) return;

  const tabs   = document.querySelectorAll(".filter-tab");
  const items  = document.querySelectorAll(".delivery-item");
  const empty  = document.getElementById("empty-state");
  const search = document.getElementById("search-input");

  let activeFilter = "ALL";
  let searchTerm   = "";

  function applyFilters() {
    let visible = 0;
    items.forEach((item) => {
      const statusMatch = activeFilter === "ALL" || item.dataset.status === activeFilter;
      const query       = searchTerm.toLowerCase();
      const textMatch   =
        !query ||
        item.dataset.id?.toLowerCase().includes(query) ||
        item.dataset.addr?.toLowerCase().includes(query);

      const show = statusMatch && textMatch;
      item.style.display = show ? "block" : "none";
      if (show) visible++;
    });
    if (empty) empty.style.display = visible === 0 ? "flex" : "none";
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("filter-tab--active"));
      tab.classList.add("filter-tab--active");
      activeFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  search?.addEventListener("input", () => {
    searchTerm = search.value.trim();
    applyFilters();
  });

  // ---- Tracking modal ----
  const { open: openModal, close: closeModal } = createModal("modal-overlay");

  const statusOrder = ["PENDING", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  const tlIds       = ["tl-pending", "tl-accepted", "tl-pickedup", "tl-transit", "tl-delivered"];

  // Expose globally so inline onclick attributes in HTML can call it
  window.openTracking = function (id, status, pickup, dest, driver, eta) {
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    set("modal-title",       id);
    set("modal-pickup",      pickup);
    set("modal-dest",        dest);
    set("modal-driver-name", driver);
    set("modal-eta",         eta);
    set("tl-accepted-desc",  `Driver assigned: ${driver}`);
    set("tl-eta-desc",       `ETA: ${eta}`);

    const currentIdx = statusOrder.indexOf(status);
    tlIds.forEach((tlId, i) => {
      const el = document.getElementById(tlId);
      if (!el) return;
      el.classList.remove("timeline-step--done", "timeline-step--active");
      if (i < currentIdx)  el.classList.add("timeline-step--done");
      if (i === currentIdx) el.classList.add("timeline-step--active");
    });

    openModal();
  };

  document.getElementById("modal-close")?.addEventListener("click", closeModal);
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setTodayDate("topbar-date");
  initSidebar();
  initCustomerDashboard();
  initCreateDelivery();
  initDeliveriesPage();
});