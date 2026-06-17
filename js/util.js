/* ============================================================
   SWIFTDROP — js/utils.js
   Shared utilities used across all pages
   ============================================================ */

/**
 * Set today's date in an element by ID
 * @param {string} elementId
 */
function setTodayDate(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Initialise mobile sidebar toggle
 * Expects: #sidebar, #sidebar-overlay, #menu-btn, #sidebar-close
 */
function initSidebar() {
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("sidebar-overlay");
  const menuBtn  = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("sidebar-close");
  if (!sidebar || !overlay) return;

  function open()  { sidebar.classList.add("sidebar--open");    overlay.classList.add("overlay--visible"); }
  function close() { sidebar.classList.remove("sidebar--open"); overlay.classList.remove("overlay--visible"); }

  if (menuBtn)  menuBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}

/**
 * Generic modal helpers
 * @param {string} overlayId  — id of the .modal-overlay element
 * @returns {{ open, close }} functions
 */
function createModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return { open: () => {}, close: () => {} };

  function open() {
    overlay.classList.add("modal--open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("modal--open");
    document.body.style.overflow = "";
  }

  // Close on background click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return { open, close };
}

/**
 * Show a field-level error message
 */
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

/**
 * Clear a field-level error message
 */
function clearError(el) {
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

/**
 * Nigerian phone number regex
 */
const PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/;

/**
 * Email regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;