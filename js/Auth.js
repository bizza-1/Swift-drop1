/* ============================================================
   SWIFTDROP — js/auth.js
   Handles login.html and register.html logic
   ============================================================ */

/* ----------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE
   Used on both login and register
   ---------------------------------------------------------- */
function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isText = input.type === "text";
      input.type = isText ? "password" : "text";
      btn.textContent = isText ? "👁" : "🙈";
      btn.setAttribute("aria-label", isText ? "Show password" : "Hide password");
    });
  });
}

/* ----------------------------------------------------------
   LOGIN PAGE
   ---------------------------------------------------------- */
function initLoginForm() {
  const form          = document.getElementById("login-form");
  if (!form) return;

  const emailInput    = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError    = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const formError     = document.getElementById("form-error");
  const submitBtn     = document.getElementById("submit-btn");

  // Clear errors on input
  emailInput.addEventListener("input",    () => clearError(emailError));
  passwordInput.addEventListener("input", () => clearError(passwordError));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    clearError(emailError);
    clearError(passwordError);
    clearError(formError);

    const emailVal    = emailInput.value.trim();
    const passwordVal = passwordInput.value;

    if (!emailVal) {
      showError(emailError, "Email is required.");
      valid = false;
    } else if (!EMAIL_REGEX.test(emailVal)) {
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

    // Simulate API call — replace with real fetch to POST /api/auth/login in Phase 4
    submitBtn.disabled    = true;
    submitBtn.textContent = "Logging in…";

    setTimeout(() => {
      formError.style.color   = "#22c55e";
      formError.textContent   = "✓ Login successful! Redirecting…";
      formError.style.display = "block";

      // Phase 4: decode JWT role and redirect accordingly
      // const role = parseJwt(token).role;
      // if (role === "CUSTOMER") window.location.href = "customer/dashboard.html";
      // if (role === "DRIVER")   window.location.href = "driver/dashboard.html";
      // if (role === "ADMIN")    window.location.href = "admin/dashboard.html";

      setTimeout(() => {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Log In";
        formError.style.display = "none";
      }, 2000);
    }, 1200);
  });
}

/* ----------------------------------------------------------
   REGISTER PAGE
   ---------------------------------------------------------- */

/** Password strength score (0–4) */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)         score++;
  if (/[A-Z]/.test(pw))       score++;
  if (/[0-9]/.test(pw))       score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  // ---- Role selector → show/hide vehicle field ----
  const roleInputs   = document.querySelectorAll('input[name="role"]');
  const vehicleGroup = document.getElementById("vehicle-group");

  roleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (vehicleGroup) {
        vehicleGroup.style.display = input.value === "DRIVER" ? "flex" : "none";
      }
    });
  });

  // Ensure correct visibility on load — respect `?role=driver` query param or the checked radio
  (function setInitialRoleVisibility() {
    try {
      const params = new URLSearchParams(window.location.search);
      const qRole = params.get("role");
      if (qRole && qRole.toLowerCase() === "driver") {
        const driverInput = document.querySelector('input[name="role"][value="DRIVER"]');
        if (driverInput) driverInput.checked = true;
      }
    } catch (e) {
      // ignore URL parsing errors
    }

    const checked = document.querySelector('input[name="role"]:checked');
    if (vehicleGroup) {
      vehicleGroup.style.display = checked && checked.value === "DRIVER" ? "flex" : "none";
    }
  })();

  // ---- Password strength meter ----
  const passwordInput  = document.getElementById("password");
  const strengthFill   = document.getElementById("strength-fill");
  const strengthLabel  = document.getElementById("strength-label");

  const strengthLevels = [
    { label: "",       color: "transparent", width: "0%" },
    { label: "Weak",   color: "#ef4444",     width: "25%" },
    { label: "Fair",   color: "#f97316",     width: "50%" },
    { label: "Good",   color: "#facc15",     width: "75%" },
    { label: "Strong", color: "#22c55e",     width: "100%" },
  ];

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const score = passwordInput.value ? getStrength(passwordInput.value) : 0;
      const level = strengthLevels[score];
      if (strengthFill)  { strengthFill.style.width = level.width; strengthFill.style.background = level.color; }
      if (strengthLabel) { strengthLabel.textContent = level.label; strengthLabel.style.color = level.color; }
    });
  }

  // ---- Form submission & validation ----
  const fields = {
    fullname:        document.getElementById("fullname"),
    email:           document.getElementById("email"),
    phone:           document.getElementById("phone"),
    password:        document.getElementById("password"),
    confirmPassword: document.getElementById("confirm-password"),
    terms:           document.getElementById("terms"),
    vehicle:         document.getElementById("vehicle"),
  };

  const errors = {
    fullname: document.getElementById("fullname-error"),
    email:    document.getElementById("email-error"),
    phone:    document.getElementById("phone-error"),
    password: document.getElementById("password-error"),
    confirm:  document.getElementById("confirm-error"),
    terms:    document.getElementById("terms-error"),
    vehicle:  document.getElementById("vehicle-error"),
    form:     document.getElementById("form-error"),
  };

  const submitBtn = document.getElementById("submit-btn");

  // Clear on input
  Object.entries(fields).forEach(([key, el]) => {
    if (el) el.addEventListener("input", () => { if (errors[key]) clearError(errors[key]); });
  });

  function getSelectedRole() {
    const checked = document.querySelector('input[name="role"]:checked');
    return checked ? checked.value : null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    Object.values(errors).forEach(clearError);

    // Full name
    if (!fields.fullname?.value.trim()) {
      showError(errors.fullname, "Full name is required."); valid = false;
    } else if (fields.fullname.value.trim().length < 3) {
      showError(errors.fullname, "Enter your full name."); valid = false;
    }

    // Email
    if (!fields.email?.value.trim()) {
      showError(errors.email, "Email is required."); valid = false;
    } else if (!EMAIL_REGEX.test(fields.email.value.trim())) {
      showError(errors.email, "Enter a valid email address."); valid = false;
    }

    // Phone
    const phoneVal = fields.phone?.value.replace(/\s/g, "") || "";
    if (!phoneVal) {
      showError(errors.phone, "Phone number is required."); valid = false;
    } else if (!PHONE_REGEX.test(phoneVal)) {
      showError(errors.phone, "Enter a valid Nigerian phone number."); valid = false;
    }

    // Vehicle (drivers only)
    if (getSelectedRole() === "DRIVER" && !fields.vehicle?.value) {
      showError(errors.vehicle, "Please select your vehicle type."); valid = false;
    }

    // Password
    if (!fields.password?.value) {
      showError(errors.password, "Password is required."); valid = false;
    } else if (fields.password.value.length < 8) {
      showError(errors.password, "Password must be at least 8 characters."); valid = false;
    } else if (getStrength(fields.password.value) < 2) {
      showError(errors.password, "Password is too weak. Add numbers or symbols."); valid = false;
    }

    // Confirm password
    if (!fields.confirmPassword?.value) {
      showError(errors.confirm, "Please confirm your password."); valid = false;
    } else if (fields.password?.value !== fields.confirmPassword.value) {
      showError(errors.confirm, "Passwords do not match."); valid = false;
    }

    // Terms
    if (!fields.terms?.checked) {
      showError(errors.terms, "You must accept the terms to continue."); valid = false;
    }

    if (!valid) return;

    // Simulate API call — replace with real fetch to POST /api/auth/register in Phase 4
    submitBtn.disabled    = true;
    submitBtn.textContent = "Creating account…";

    setTimeout(() => {
      errors.form.style.color   = "#22c55e";
      errors.form.textContent   = "✓ Account created! Redirecting to login…";
      errors.form.style.display = "block";

      setTimeout(() => {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Create Account";
        errors.form.style.display = "none";
        // Phase 4: window.location.href = "login.html";
      }, 2500);
    }, 1400);
  });
}

/* ----------------------------------------------------------
   INIT — runs on page load
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});