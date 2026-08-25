function initializeCurrencyDropdown() {

    const saved =
        localStorage.getItem("currency") || "US";

    window.currencyCode = saved;

    populateCurrencyDropdown(saved);

    const select =
        document.getElementById("currency-select");

    if (!select) {
        return;
    }

    // Prevent duplicate event listeners
    select.onchange = function () {

        const newCurrency = this.value;

        // Update current currency
        window.currencyCode = newCurrency;

        // Save currency preference
        localStorage.setItem(
            "currency",
            newCurrency
        );

        // -----------------------------
        // Refine page
        // -----------------------------
        if (
            typeof applyFilters === "function" &&
            Array.isArray(window.allProperties)
        ) {

            // Recalculate price range
            // using the NEW currency
            window.priceRange =
                computePriceRange(
                    window.allProperties,
                    window.currencyCode
                );

            // If price filter is currently selected,
            // convert the existing USD-based price
            // filter to the new currency.
            //
            // For now, reset to the full range.
            window.filterState.minPrice =
                window.priceRange.min;

            window.filterState.maxPrice =
                window.priceRange.max;

            // Update cards WITHOUT API reload
            renderTiles(
                window.allProperties,
                window.currencyCode
            );

            // Update filter buttons
            updateFilterButtons();

            // Update the modal if it is opened later
            return;
        }

        // -----------------------------
        // Category page
        // -----------------------------
        if (
            typeof updateCategoryPrices === "function"
        ) {
            updateCategoryPrices();
        }
    };
}

function populateCurrencyDropdown(selected = "US") {

    const select =
        document.getElementById("currency-select");

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const addedCodes = new Set();

    Object.entries(CURRENCIES).forEach(([key, currency]) => {

        // Skip duplicate currencies (EUR, GBP, etc.)
        if (addedCodes.has(currency.Code)) {
            return;
        }
        addedCodes.add(currency.Code);

        const option =
            document.createElement("option");

        option.value = key;

        option.textContent =
            `${currency.Code} (${currency.Symbol})`;

        option.selected =
            key === selected;

        select.appendChild(option);

    });

}


