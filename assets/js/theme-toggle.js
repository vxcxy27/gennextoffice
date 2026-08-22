/*
  theme-toggle.js
  ----------------
  Makes the existing [data-theme-toggle] button in the header actually
  switch dark mode on/off. Works with styles.css, which reads the
  `data-theme="dark"` attribute on <html>.

  HOW TO USE:
  Add this line in every page, right before </body> (alongside
  contact-form.js where that's already present):
    <script defer src="assets/js/theme-toggle.js"></script>
*/

(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "gno-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  // Apply saved choice (or system preference) as early as possible,
  // before the toggle button even exists, to avoid a flash of the
  // wrong theme.
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* localStorage unavailable (privacy mode etc.) - fall back below */
  }

  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* ignore - theme just won't persist across visits */
      }
    });
  });
})();
