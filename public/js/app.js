// Delete blog confirmation
document.addEventListener("DOMContentLoaded", () => {
  const deleteForms = document.querySelectorAll(".delete-blog-form");

  deleteForms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const confirmed = confirm("Are you sure you want to delete this blog?");
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });
});

// Password toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleIcons = document.querySelectorAll('[id^="toggle"]');

  toggleIcons.forEach(icon => {
    const inputId = icon.id.replace(/^toggle/, "");
    const formattedId = inputId.charAt(0).toLowerCase() + inputId.slice(1);
    const input = document.getElementById(formattedId);

    if (input) {
      icon.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        icon.classList.toggle("bi-eye");
        icon.classList.toggle("bi-eye-slash");
      });
    }
  });
});

// Reset Password Page OTP countdown + resend cooldown
document.addEventListener("DOMContentLoaded", () => {
  const countdownDisplay = document.getElementById("countdown");
  const otpInput = document.getElementById("otp");
  const resendBtn = document.getElementById("resendBtn");

  if (countdownDisplay && otpInput && resendBtn) {
    const OTP_VALIDITY_MINUTES = 5;
    let otpStartTime = localStorage.getItem("otpStartTime");

    if (!otpStartTime) {
      otpStartTime = Date.now();
      localStorage.setItem("otpStartTime", otpStartTime);
    } else {
      otpStartTime = parseInt(otpStartTime, 10);
    }

    const countdownTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - otpStartTime) / 1000);
      const remaining = OTP_VALIDITY_MINUTES * 60 - elapsed;

      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownDisplay.textContent = "Expired";
        localStorage.removeItem("otpStartTime");
        otpInput.disabled = true;
      } else {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        countdownDisplay.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
      }
    }, 1000);

    let cooldown = 60;
    const cooldownTimer = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) {
        clearInterval(cooldownTimer);
        resendBtn.classList.remove("disabled");
        resendBtn.disabled = false;
      }
    }, 1000);

    resendBtn.addEventListener("click", () => {
      localStorage.removeItem("otpStartTime");
    });
  }

  // Password match validation on reset-password page
  const resetForm = document.querySelector('form[action="/user/reset-password"]');
  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      const newPassword = document.getElementById("newPassword")?.value;
      const confirmPassword = document.getElementById("confirmPassword")?.value;
      const clientErrorDiv = document.getElementById("clientError");
      const otpText = document.getElementById("countdown")?.textContent;

      if (otpText === "Expired") {
        e.preventDefault();
        clientErrorDiv.textContent = "❗OTP has expired. Please resend and try again.";
        clientErrorDiv.classList.remove("d-none");
        return;
      }

      if (newPassword !== confirmPassword) {
        e.preventDefault();
        clientErrorDiv.textContent = "❗Passwords do not match. Please try again.";
        clientErrorDiv.classList.remove("d-none");
        return;
      }

      clientErrorDiv.classList.add("d-none");
    });
  }

  // ✅ Signup OTP countdown
  const signupCountdown = document.getElementById("signupCountdown");
  const signupOtpInput = document.getElementById("otp");
  const signupResendBtn = document.getElementById("signupResendBtn");

  if (signupCountdown && signupOtpInput && signupResendBtn) {
    const OTP_VALIDITY_MINUTES = 5;
    let signupOtpStartTime = localStorage.getItem("signupOtpStartTime");

    if (!signupOtpStartTime) {
      signupOtpStartTime = Date.now();
      localStorage.setItem("signupOtpStartTime", signupOtpStartTime);
    } else {
      signupOtpStartTime = parseInt(signupOtpStartTime, 10);
    }

    const signupTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - signupOtpStartTime) / 1000);
      const remaining = OTP_VALIDITY_MINUTES * 60 - elapsed;

      if (remaining <= 0) {
        clearInterval(signupTimer);
        signupCountdown.textContent = "Expired";
        localStorage.removeItem("signupOtpStartTime");
        signupOtpInput.disabled = true;
      } else {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        signupCountdown.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
      }
    }, 1000);

    let signupCooldown = 60;
    const signupCooldownTimer = setInterval(() => {
      signupCooldown--;
      if (signupCooldown <= 0) {
        clearInterval(signupCooldownTimer);
        signupResendBtn.classList.remove("disabled");
        signupResendBtn.disabled = false;
      }
    }, 1000);

    signupResendBtn.addEventListener("click", () => {
      localStorage.removeItem("signupOtpStartTime");
    });
  }
});

// Auto dismiss toasts
document.addEventListener("DOMContentLoaded", () => {
  function autoDismissToast(id) {
    setTimeout(() => {
      const toast = document.getElementById(id);
      if (toast) {
        toast.style.transition = "opacity 0.5s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }
    }, 5000);
  }

  const toastIds = [
    "toast-blog",
    "toast-comment",
    "toast-blog-deleted",
    "toast-logout",
    "toast-account-deleted",
    "welcome-alert"
  ];

  toastIds.forEach(id => autoDismissToast(id));
});

// Confirm before deleting account
document.addEventListener("DOMContentLoaded", () => {
  const deleteForm = document.getElementById("delete-account-form");
  if (deleteForm) {
    deleteForm.addEventListener("submit", (e) => {
      const isConfirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
      if (!isConfirmed) {
        e.preventDefault();
      }
    });
  }
});

// Add blog validation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('addBlogForm');
  const titleInput = document.getElementById('title');
  const titleError = document.getElementById('titleError');
  const bodyInput = document.getElementById('body');
  const bodyError = document.getElementById('bodyError');

  if (form) {
    form.addEventListener('submit', function (e) {
      let isValid = true;

      const title = titleInput.value.trim();
      if (!title || title.length > 60) {
        titleInput.classList.add('is-invalid');
        titleError.classList.remove('d-none');
        isValid = false;
      } else {
        titleInput.classList.remove('is-invalid');
        titleError.classList.add('d-none');
      }

      const body = bodyInput.value.trim();
      if (!body || body.length > 25000) {
        bodyInput.classList.add('is-invalid');
        bodyError.classList.remove('d-none');
        isValid = false;
      } else {
        bodyInput.classList.remove('is-invalid');
        bodyError.classList.add('d-none');
      }

      if (!isValid) e.preventDefault();
    });
  }
});
