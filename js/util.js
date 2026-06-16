function safeQuery(selector, root = document) {
  return root.querySelector(selector);
}

function safeQueryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function formatDateNg() {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function initStatusCard() {
  const statusEl = safeQuery("#js-status");
  const progressEl = safeQuery("#js-progress");
  const stepEls = safeQueryAll(".step");
  if (!statusEl || !progressEl || !stepEls.length) return;

  const statuses = ["PENDING", "ACCEPTED", "PICKED UP", "IN TRANSIT", "DELIVERED"];
  const statusColors = ["#94a3b8", "#facc15", "#60a5fa", "#FF6B2B", "#22c55e"];
  const progressWidths = ["5%", "25%", "50%", "75%", "100%"];

  let currentStep = 0;

  function updateStatus() {
    statusEl.textContent = statuses[currentStep];
    statusEl.style.background = statusColors[currentStep] + "22";
    statusEl.style.color = statusColors[currentStep];
    statusEl.style.borderColor = statusColors[currentStep];
    progressEl.style.width = progressWidths[currentStep];
    progressEl.style.background = statusColors[currentStep];

    stepEls.forEach((el, i) => {
      el.classList.toggle("step--active", i === currentStep);
      el.classList.toggle("step--done", i < currentStep);
    });

    currentStep = (currentStep + 1) % statuses.length;
  }

  updateStatus();
  setInterval(updateStatus, 2000);
}

function initSmoothScroll() {
  safeQueryAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = safeQuery(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function setupSidebar() {
  const sidebar = safeQuery("#sidebar");
  const overlay = safeQuery("#sidebar-overlay");
  const menuBtn = safeQuery("#menu-btn");
  const closeBtn = safeQuery("#sidebar-close");
  if (!sidebar || !overlay || !menuBtn || !closeBtn) return;

  function openSidebar() {
    sidebar.classList.add("sidebar--open");
    overlay.classList.add("overlay--visible");
  }

  function closeSidebar() {
    sidebar.classList.remove("sidebar--open");
    overlay.classList.remove("overlay--visible");
  }

  menuBtn.addEventListener("click", openSidebar);
  closeBtn.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);
}

function setTopbarDate() {
  const dateEl = safeQuery("#topbar-date");
  if (!dateEl) return;
  dateEl.textContent = formatDateNg();
}

function initAuthPage() {
  const toggleButtons = safeQueryAll(".toggle-password");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = safeQuery(`#${btn.dataset.target}`);
      if (!input) return;
      const isText = input.type === "text";
      input.type = isText ? "password" : "text";
      btn.textContent = isText ? "👁" : "🙈";
      btn.setAttribute("aria-label", isText ? "Show password" : "Hide password");
    });
  });

  const loginForm = safeQuery("#login-form");
  if (loginForm) {
    const emailInput = safeQuery("#email", loginForm);
    const passwordInput = safeQuery("#password", loginForm);
    const emailError = safeQuery("#email-error", loginForm);
    const passwordError = safeQuery("#password-error", loginForm);
    const formError = safeQuery("#form-error", loginForm);
    const submitBtn = safeQuery("#submit-btn", loginForm);
    if (!emailInput || !passwordInput || !emailError || !passwordError || !formError || !submitBtn) return;

    function showError(el, msg) {
      el.textContent = msg;
      el.style.display = "block";
    }

    function clearError(el) {
      el.textContent = "";
      el.style.display = "none";
    }

    emailInput.addEventListener("input", () => clearError(emailError));
    passwordInput.addEventListener("input", () => clearError(passwordError));

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      clearError(emailError);
      clearError(passwordError);
      clearError(formError);

      const emailVal = emailInput.value.trim();
      const passwordVal = passwordInput.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailVal) {
        showError(emailError, "Email is required.");
        valid = false;
      } else if (!emailRegex.test(emailVal)) {
        showError(emailError, "Enter a valid email address.");
        valid = false;
      }

      if (!passwordVal) {
        showError(passwordError, "Password is required.");
        valid = false;
      } else if (passwordVal.length < 6) {
        showError(passwordError, "Password must be at least 6 characters.");
        valid = false;
      }

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in…";

      setTimeout(() => {
        formError.style.color = "#22c55e";
        formError.textContent = "✓ Login successful! Redirecting…";
        formError.style.display = "block";
        setTimeout(() => {
          window.location.href = "customer/dashboard.html";
        }, 1200);
      }, 1200);
    });
  }

  const registerForm = safeQuery("#register-form");
  if (registerForm) {
    const roleInputs = safeQueryAll('input[name="role"]', registerForm);
    const vehicleGroup = safeQuery("#vehicle-group", registerForm);
    const passwordInput = safeQuery("#password", registerForm);
    const strengthFill = safeQuery("#strength-fill", registerForm);
    const strengthLabel = safeQuery("#strength-label", registerForm);
    const submitBtn = safeQuery("#submit-btn", registerForm);
    const fields = {
      fullname: safeQuery("#fullname", registerForm),
      email: safeQuery("#email", registerForm),
      phone: safeQuery("#phone", registerForm),
      password: safeQuery("#password", registerForm),
      confirmPassword: safeQuery("#confirm-password", registerForm),
      terms: safeQuery("#terms", registerForm),
      vehicle: safeQuery("#vehicle", registerForm),
    };
    const errors = {
      fullname: safeQuery("#fullname-error", registerForm),
      email: safeQuery("#email-error", registerForm),
      phone: safeQuery("#phone-error", registerForm),
      password: safeQuery("#password-error", registerForm),
      confirm: safeQuery("#confirm-error", registerForm),
      terms: safeQuery("#terms-error", registerForm),
      vehicle: safeQuery("#vehicle-error", registerForm),
      form: safeQuery("#form-error", registerForm),
    };

    function setRole(role) {
      roleInputs.forEach((input) => {
        input.checked = input.value === role;
      });
      if (vehicleGroup) {
        vehicleGroup.style.display = role === "DRIVER" ? "flex" : "none";
      }
    }

    function getQueryParam(name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    }

    const initialRole = getQueryParam("role");
    if (initialRole === "driver") {
      setRole("DRIVER");
    }

    roleInputs.forEach((input) => {
      input.addEventListener("change", () => setRole(input.value));
    });

    if (passwordInput && strengthFill && strengthLabel) {
      const strengthLevels = [
        { label: "", color: "transparent", width: "0%" },
        { label: "Weak", color: "#ef4444", width: "25%" },
        { label: "Fair", color: "#f97316", width: "50%" },
        { label: "Good", color: "#facc15", width: "75%" },
        { label: "Strong", color: "#22c55e", width: "100%" },
      ];

      function getStrength(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
      }

      passwordInput.addEventListener("input", () => {
        const score = passwordInput.value ? getStrength(passwordInput.value) : 0;
        const level = strengthLevels[score];
        strengthFill.style.width = level.width;
        strengthFill.style.background = level.color;
        strengthLabel.textContent = level.label;
        strengthLabel.style.color = level.color;
      });
    }

    function showError(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.style.display = "block";
    }

    function clearError(el) {
      if (!el) return;
      el.textContent = "";
      el.style.display = "none";
    }

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        const errorKey = field.id === "confirm-password" ? "confirm" : field.id;
        const errorEl = errors[errorKey] || errors.form;
        clearError(errorEl);
      });
    });

    function getSelectedRole() {
      const checked = safeQuery('input[name="role"]:checked', registerForm);
      return checked ? checked.value : null;
    }

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      Object.values(errors).forEach(clearError);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;

      if (!fields.fullname.value.trim()) {
        showError(errors.fullname, "Full name is required.");
        valid = false;
      } else if (fields.fullname.value.trim().length < 3) {
        showError(errors.fullname, "Enter your full name.");
        valid = false;
      }

      if (!fields.email.value.trim()) {
        showError(errors.email, "Email is required.");
        valid = false;
      } else if (!emailRegex.test(fields.email.value.trim())) {
        showError(errors.email, "Enter a valid email address.");
        valid = false;
      }

      if (!fields.phone.value.trim()) {
        showError(errors.phone, "Phone number is required.");
        valid = false;
      } else if (!phoneRegex.test(fields.phone.value.replace(/\s/g, ""))) {
        showError(errors.phone, "Enter a valid Nigerian phone number.");
        valid = false;
      }

      const role = getSelectedRole();
      if (role === "DRIVER" && !fields.vehicle.value) {
        showError(errors.vehicle, "Please select your vehicle type.");
        valid = false;
      }

      if (!fields.password.value) {
        showError(errors.password, "Password is required.");
        valid = false;
      } else if (fields.password.value.length < 8) {
        showError(errors.password, "Password must be at least 8 characters.");
        valid = false;
      }

      if (fields.password.value && !errors.password?.textContent && fields.password.value.length >= 8) {
        const strength = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce(
          (count, re) => count + (re.test(fields.password.value) ? 1 : 0),
          0
        );
        if (strength < 2) {
          showError(errors.password, "Password is too weak. Add numbers or symbols.");
          valid = false;
        }
      }

      if (!fields.confirmPassword.value) {
        showError(errors.confirm, "Please confirm your password.");
        valid = false;
      } else if (fields.password.value !== fields.confirmPassword.value) {
        showError(errors.confirm, "Passwords do not match.");
        valid = false;
      }

      if (!fields.terms.checked) {
        showError(errors.terms, "You must accept the terms to continue.");
        valid = false;
      }

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account…";

      setTimeout(() => {
        if (errors.form) {
          errors.form.style.color = "#22c55e";
          errors.form.textContent = "✓ Account created! Redirecting to login…";
          errors.form.style.display = "block";
        }
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1400);
      }, 1400);
    });
  }
}

function initCreateDeliveryPage() {
  const deliveryForm = safeQuery("#delivery-form");
  if (!deliveryForm) return;

  setTopbarDate();
  setupSidebar();

  const steps = [
    safeQuery("#step-1"),
    safeQuery("#step-2"),
    safeQuery("#step-3"),
  ].filter(Boolean);
  const indicators = safeQueryAll(".step-indicator__item");
  const packageDesc = safeQuery("#package-desc");
  const packageSize = safeQuery("#package-size");
  const pickupAddress = safeQuery("#pickup-address");
  const pickupName = safeQuery("#pickup-name");
  const pickupPhone = safeQuery("#pickup-phone");
  const destAddress = safeQuery("#dest-address");
  const recipientName = safeQuery("#recipient-name");
  const recipientPhone = safeQuery("#recipient-phone");
  const summaryIds = ["sum-package", "sum-size", "sum-pickup", "sum-dest", "sum-price"];

  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;

  function showStep(index) {
    steps.forEach((step, i) => {
      if (!step) return;
      step.classList.toggle("form-step--hidden", i !== index);
    });
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("step-indicator__item--active", i === index);
      indicator.classList.toggle("step-indicator__item--done", i < index);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function clearError(el) {
    if (!el) return;
    el.textContent = "";
    el.style.display = "none";
  }

  function updateSummary() {
    const desc = packageDesc?.value.trim() || "";
    const size = packageSize;
    const pickup = pickupAddress?.value.trim() || "";
    const dest = destAddress?.value.trim() || "";
    const sizeText = size?.options[size.selectedIndex]?.text || "—";
    const prices = { SMALL: 800, MEDIUM: 1500, LARGE: 2500, EXTRA_LARGE: 4000 };
    const price = size?.value ? prices[size.value] : undefined;
    safeQuery("#sum-package").textContent = desc || "—";
    safeQuery("#sum-size").textContent = sizeText !== "Select size" ? sizeText : "—";
    safeQuery("#sum-pickup").textContent = pickup || "—";
    safeQuery("#sum-dest").textContent = dest || "—";
    safeQuery("#sum-price").textContent = price ? `₦ ${price.toLocaleString()}` : "₦ —";
  }

  function buildReview() {
    const get = (id) => safeQuery(`#${id}`)?.value.trim() || "";
    const sizeEl = safeQuery("#package-size");
    const sizeText = sizeEl?.options[sizeEl.selectedIndex]?.text || "—";
    const fragile = safeQuery("input[name='fragile']:checked")?.value === "true";
    const prices = { SMALL: 800, MEDIUM: 1500, LARGE: 2500, EXTRA_LARGE: 4000 };
    const price = prices[sizeEl?.value] || "—";
    const reviewBlock = safeQuery("#review-block");
    if (!reviewBlock) return;

    reviewBlock.innerHTML = `
      <div class="review-section">
        <h4 class="review-section__title">📦 Package</h4>
        <div class="review-row"><span>Description</span><span>${get("package-desc") || "—"}</span></div>
        <div class="review-row"><span>Size</span><span>${sizeText}</span></div>
        <div class="review-row"><span>Weight</span><span>${get("package-weight") || "Not specified"} ${get("package-weight") ? "kg" : ""}</span></div>
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
          <span class="review-price">${price !== "—" ? `₦ ${price.toLocaleString()}` : "To be confirmed"}</span>
        </div>
      </div>
    `;
  }

  safeQueryAll("#package-desc, #package-size, #pickup-address, #dest-address").forEach((el) => {
    el?.addEventListener("input", updateSummary);
    el?.addEventListener("change", updateSummary);
  });

  safeQuery("#next-1")?.addEventListener("click", () => {
    const desc = packageDesc;
    const size = packageSize;
    const descE = safeQuery("#package-desc-error");
    const sizeE = safeQuery("#package-size-error");
    let valid = true;
    clearError(descE);
    clearError(sizeE);
    if (!desc?.value.trim()) {
      showError(descE, "Package description is required.");
      valid = false;
    }
    if (!size?.value) {
      showError(sizeE, "Please select a package size.");
      valid = false;
    }
    if (!valid) return;
    updateSummary();
    showStep(1);
  });

  safeQuery("#next-2")?.addEventListener("click", () => {
    const validationFields = [
      { el: pickupAddress, err: safeQuery("#pickup-error"), msg: "Pickup address is required.", phone: false },
      { el: pickupName, err: safeQuery("#pickup-name-error"), msg: "Sender name is required.", phone: false },
      { el: pickupPhone, err: safeQuery("#pickup-phone-error"), msg: "Valid Nigerian phone required.", phone: true },
      { el: destAddress, err: safeQuery("#dest-error"), msg: "Destination address is required.", phone: false },
      { el: recipientName, err: safeQuery("#recipient-name-error"), msg: "Recipient name is required.", phone: false },
      { el: recipientPhone, err: safeQuery("#recipient-phone-error"), msg: "Valid Nigerian phone required.", phone: true },
    ];

    let valid = true;
    validationFields.forEach(({ el, err, msg, phone }) => {
      clearError(err);
      if (!el?.value.trim()) {
        showError(err, msg);
        valid = false;
      } else if (phone && !phoneRegex.test(el.value.replace(/\s/g, ""))) {
        showError(err, "Enter a valid Nigerian phone number.");
        valid = false;
      }
    });
    if (!valid) return;
    updateSummary();
    buildReview();
    showStep(2);
  });

  safeQuery("#back-2")?.addEventListener("click", () => showStep(0));
  safeQuery("#back-3")?.addEventListener("click", () => showStep(1));

  deliveryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = safeQuery("#submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Placing request…";
    }
    setTimeout(() => {
      steps.forEach((step) => step?.classList.add("form-step--hidden"));
      const successState = safeQuery("#success-state");
      successState?.classList.remove("form-step--hidden");
      const fakeId = "DEL-00" + Math.floor(480 + Math.random() * 20);
      const successId = safeQuery("#success-id");
      if (successId) successId.textContent = fakeId;
    }, 1600);
  });
}

function initDeliveriesPage() {
  const deliveryPage = safeQuery("#search-input");
  const modalOverlay = safeQuery("#modal-overlay");
  if (!deliveryPage || !modalOverlay) return;

  setTopbarDate();
  setupSidebar();

  const sidebar = safeQuery("#sidebar");
  const overlay = safeQuery("#sidebar-overlay");
  const menuBtn = safeQuery("#menu-btn");
  const closeBtn = safeQuery("#sidebar-close");
  if (menuBtn && closeBtn && overlay && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("sidebar--open");
      overlay.classList.add("overlay--visible");
    });
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("sidebar--open");
      overlay.classList.remove("overlay--visible");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar--open");
      overlay.classList.remove("overlay--visible");
    });
  }

  const tabs = safeQueryAll(".filter-tab");
  const items = safeQueryAll(".delivery-item");
  const empty = safeQuery("#empty-state");
  const searchInput = safeQuery("#search-input");
  const modalClose = safeQuery("#modal-close");
  const trackButtons = safeQueryAll(".track-button");

  if (trackButtons.length) {
    trackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openTracking(
          button.dataset.trackId || "",
          button.dataset.trackStatus || "",
          button.dataset.trackPickup || "",
          button.dataset.trackDest || "",
          button.dataset.trackDriver || "",
          button.dataset.trackEta || ""
        );
      });
    });
  }

  const statusOrder = ["PENDING", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  const tlIds = ["tl-pending", "tl-accepted", "tl-pickedup", "tl-transit", "tl-delivered"];

  let activeFilter = "ALL";
  let searchTerm = "";

  function applyFilters() {
    let visible = 0;
    items.forEach((item) => {
      const statusMatch = activeFilter === "ALL" || item.dataset.status === activeFilter;
      const query = searchTerm.toLowerCase();
      const textMatch = !query || item.dataset.id.toLowerCase().includes(query) || item.dataset.addr.toLowerCase().includes(query);
      const show = statusMatch && textMatch;
      item.style.display = show ? "block" : "none";
      if (show) visible++;
    });
    if (empty) {
      empty.style.display = visible === 0 ? "flex" : "none";
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("filter-tab--active"));
      tab.classList.add("filter-tab--active");
      activeFilter = tab.dataset.filter || "ALL";
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    applyFilters();
  });

  function openTracking(id, status, pickup, dest, driver, eta) {
    safeQuery("#modal-title").textContent = id;
    safeQuery("#modal-pickup").textContent = pickup;
    safeQuery("#modal-dest").textContent = dest;
    safeQuery("#modal-driver-name").textContent = driver;
    safeQuery("#modal-eta").textContent = eta;
    safeQuery("#tl-accepted-desc").textContent = `Driver assigned: ${driver}`;
    safeQuery("#tl-eta-desc").textContent = `ETA: ${eta}`;

    const currentIdx = statusOrder.indexOf(status);
    tlIds.forEach((tlId, i) => {
      const el = safeQuery(`#${tlId}`);
      if (!el) return;
      el.classList.remove("timeline-step--done", "timeline-step--active");
      if (i < currentIdx) el.classList.add("timeline-step--done");
      if (i === currentIdx) el.classList.add("timeline-step--active");
    });
    modalOverlay.classList.add("modal--open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("modal--open");
    document.body.style.overflow = "";
  }

  modalClose?.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function initDashboardPages() {
  const dashboard = safeQuery(".dashboard-page");
  if (!dashboard) return;
  setTopbarDate();
  setupSidebar();
}

function initAllPages() {
  initStatusCard();
  initSmoothScroll();
  initAuthPage();
  initDashboardPages();
  initCreateDeliveryPage();
  initDeliveriesPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllPages);
} else {
  initAllPages();
}
