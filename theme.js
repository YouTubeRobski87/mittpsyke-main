// När sidan laddar – sätt rätt tema
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");

  if (saved === "light") {
    document.body.classList.remove("dark-mode");
    updateThemeIcon("light");
  } else {
    document.body.classList.add("dark-mode");
    updateThemeIcon("dark");
  }
});

// Växla tema
function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");

  if (isDark) {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    updateThemeIcon("light");
  } else {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    updateThemeIcon("dark");
  }
}

// Uppdatera ikon
function updateThemeIcon(theme) {
  const btn = document.querySelector(".theme-toggle");
  btn.textContent = theme === "light" ? "🌙" : "☀️";
}
