function initFiltersToggle() {
  const toggleBtn = document.querySelector("[data-filters-toggle]");
  const filtersPanel = document.getElementById("filters-panel");

  if (!toggleBtn || !filtersPanel) return;

  const mobileQuery = window.matchMedia("(max-width: 576px)");

  /*
   * Синхронизирует состояние панели с текущей шириной экрана.
   */
  function syncPanelState() {
    const isMobile = mobileQuery.matches;

    filtersPanel.hidden = isMobile;
    toggleBtn.setAttribute("aria-expanded", String(!isMobile));
  }

  function togglePanel() {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

    toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
    filtersPanel.hidden = isExpanded;

    if (!isExpanded && !filtersPanel.hidden) {
      const firstFocusable = filtersPanel.querySelector(
        "input, button, a[href]",
      );
      if (firstFocusable) firstFocusable.focus();
    }
  }

  toggleBtn.addEventListener("click", togglePanel);
  mobileQuery.addEventListener("change", syncPanelState);

  syncPanelState();

  /*
   * Заглушка для будущей логики сброса фильтров.
   */
  const resetBtn = document.querySelector("[data-filters-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      console.log("Фильтры сброшены");
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFiltersToggle);
} else {
  initFiltersToggle();
}
