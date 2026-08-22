/*
  contact-form.js
  ----------------
  Makes the existing #demo-form on index.html AND the #device-check-form
  on attendance.html submit to the Python backend instead of opening the
  visitor's email app / doing nothing.

  HOW TO USE:
  1. Put this file next to your other site files (e.g. assets/js/contact-form.js).
  2. Add this line in BOTH index.html and attendance.html, right before </body>:
       <script defer src="assets/js/contact-form.js"></script>
  3. Change BASE_URL below to wherever app.py is actually running.
*/

const BASE_URL = "http://localhost:5000"; // change to your live backend URL
const ENQUIRY_URL = BASE_URL + "/send-enquiry";
const DEVICE_CHECK_URL = BASE_URL + "/check-device";

async function submitForm(form, status, url, payload, successMessage) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  if (status) status.textContent = "Sending...";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok && data.status === "success") {
      if (status) status.textContent = successMessage;
      form.reset();
    } else {
      if (status) status.textContent = data.message || "Something went wrong. Please try again.";
    }
  } catch (err) {
    if (status) status.textContent = "Could not reach the server. Please try again later.";
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // --- Demo enquiry form (index.html) ---
  const demoForm = document.getElementById("demo-form");
  const demoStatus = document.getElementById("form-status");

  if (demoForm) {
    // capture:true + stopImmediatePropagation makes sure this runs first and
    // blocks any other submit handler already on the page (e.g. an existing
    // main.js that opens a mailto: link) from also firing.
    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const payload = {
        name: demoForm.querySelector("#name")?.value.trim() || "",
        company: demoForm.querySelector("#company")?.value.trim() || "",
        email: demoForm.querySelector("#email")?.value.trim() || "",
        phone: demoForm.querySelector("#phone")?.value.trim() || "",
        message: demoForm.querySelector("#message")?.value.trim() || "",
      };

      if (!payload.name || !payload.email) {
        if (demoStatus) demoStatus.textContent = "Please fill in your name and email.";
        return;
      }

      submitForm(demoForm, demoStatus, ENQUIRY_URL, payload, "Thanks! Your enquiry has been sent.");
    }, true);
  }

  // --- Device compatibility check form (attendance.html) ---
  const deviceForm = document.getElementById("device-check-form");
  const deviceStatus = document.getElementById("device-check-status");

  if (deviceForm) {
    deviceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const payload = {
        device: deviceForm.querySelector("#device-model")?.value.trim() || "",
        email: deviceForm.querySelector("#device-email")?.value.trim() || "",
      };

      if (!payload.device || !payload.email) {
        if (deviceStatus) deviceStatus.textContent = "Please fill in your device and email.";
        return;
      }

      submitForm(deviceForm, deviceStatus, DEVICE_CHECK_URL, payload, "Thanks! We'll confirm compatibility shortly.");
    }, true);
  }
});
