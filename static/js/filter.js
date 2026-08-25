function renderFilters() {

    const container = document.getElementById("filters");

    container.innerHTML = `
        <button class="filter-btn" id="date-filter-btn">
            Dates
        </button>

        <button class="filter-btn" id="price-filter-btn">
            Price
        </button>

        <button class="filter-btn" id="guest-filter-btn">
            Guests
        </button>

        <button class="filter-btn" id="more-filter-btn">
            More
        </button>
    `;

    document
        .getElementById("date-filter-btn")
        .addEventListener("click", () => {
            // console.log("OPENING DATE DIRECTLY");
            openDateModal("refine");
        });

    document
        .getElementById("price-filter-btn")
        .addEventListener("click", () => {
            openFilterModal("price");
        });

    document
        .getElementById("guest-filter-btn")
        .addEventListener("click", () => {
            openFilterModal("guest");
        });

    document
        .getElementById("more-filter-btn")
        .addEventListener("click", () => {
            openFilterModal();
        });
}

function formatButtonDate(date) {

    if (!date) {
        return "";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });

}

function updateFilterButtons() {

    const state = window.filterState;

    // Date
    const dateBtn = document.getElementById("date-filter-btn");

    if (state.startDate && state.endDate) {

        dateBtn.innerHTML = `
            ${formatButtonDate(state.startDate)} - ${formatButtonDate(state.endDate)}
            <span class="filter-clear" data-filter="date">×</span>
        `;

    } else {

        dateBtn.textContent = "Dates";

    }

    // Price
    const priceBtn = document.getElementById("price-filter-btn");
    const symbol = getCurrencySymbol(window.currencyCode);

    if (
        state.minPrice !== window.priceRange.min ||
        state.maxPrice !== window.priceRange.max
    ) {
        priceBtn.innerHTML = `
            ${symbol}${state.minPrice.toLocaleString()}
            -
            ${symbol}${state.maxPrice.toLocaleString()}
            <span class="filter-clear" data-filter="price">×</span>
        `;

    } else {

        priceBtn.textContent = "Price";

    }

    // Guests
    const guestBtn = document.getElementById("guest-filter-btn");

    if (state.guests > 0) {

        guestBtn.innerHTML = `
            ${state.guests} Guests
            <span class="filter-clear" data-filter="guest">×</span>
        `;

    } else {

        guestBtn.textContent = "Guests";

    }

    // More
    const moreBtn = document.getElementById("more-filter-btn");

    let count = 0;

    if (state.petFriendly) count++;
    if (state.ecoFriendly) count++;

    if (count > 0) {

        moreBtn.innerHTML = `
            More
            <span class="filter-count">${count}</span>
        `;

    } else {

        moreBtn.textContent = "More";

    }

    bindClearButtons();
}

function bindClearButtons() {

    document
        .querySelectorAll(".filter-clear")
        .forEach(button => {

            button.onclick = function (e) {

                e.stopPropagation();

                const filter =
                    this.dataset.filter;

                switch (filter) {

                    case "date":

                        window.filterState.startDate = null;
                        window.filterState.endDate = null;

                        window.pendingStartDate = null;
                        window.pendingEndDate = null;
                        window.pendingNights = null;

                        if (datePicker) {
                            datePicker.clear();
                        }

                        reloadWithUpdatedFilters();
                        break;

                    case "price":

                        window.filterState.minPrice =
                            window.priceRange.min;

                        window.filterState.maxPrice =
                            window.priceRange.max;

                        reloadWithUpdatedFilters();
                        break;

                    case "guest":

                        window.filterState.guests = 0;

                        reloadWithUpdatedFilters();
                        break;

                }

                applyFilters();

                updateFilterButtons();

            };

        });

}

function reloadWithUpdatedFilters() {

    const url = new URL(window.location);

    // Date
    if (
        window.filterState.startDate &&
        window.filterState.endDate
    ) {
        url.searchParams.set(
            "dateStart",
            flatpickr.formatDate(
                window.filterState.startDate,
                "Y-m-d"
            )
        );

        url.searchParams.set(
            "dateEnd",
            flatpickr.formatDate(
                window.filterState.endDate,
                "Y-m-d"
            )
        );
    } else {
        url.searchParams.delete("dateStart");
        url.searchParams.delete("dateEnd");
    }

    // Guests
    if (window.filterState.guests > 0) {
        url.searchParams.set(
            "pax",
            window.filterState.guests
        );
    } else {
        url.searchParams.delete("pax");
    }

    // Price
    const defaultMinPrice = Number(window.priceRange.min);
    const defaultMaxPrice = Number(window.priceRange.max);

    if (
        Number(window.filterState.minPrice) !== defaultMinPrice ||
        Number(window.filterState.maxPrice) !== defaultMaxPrice
    ) {
        url.searchParams.set(
            "amount",
            `${window.filterState.minPrice}-${window.filterState.maxPrice}`
        );

        url.searchParams.set(
            "selectedCurrency",
            window.currencyCode
        );
    } else {
        url.searchParams.delete("amount");
        url.searchParams.delete("selectedCurrency");
    }

    // Pet friendly
    if (window.filterState.petFriendly) {
        url.searchParams.set("petFriendly", "true");
    } else {
        url.searchParams.delete("petFriendly");
    }

    // Eco friendly
    if (window.filterState.ecoFriendly) {
        url.searchParams.set("ecoFriendly", "true");
    } else {
        url.searchParams.delete("ecoFriendly");
    }

    // Amenities
    if (window.filterState.amenities.length > 0) {
        url.searchParams.set(
            "amenities",
            window.filterState.amenities.join("-")
        );
    } else {
        url.searchParams.delete("amenities");
    }

    // Actually reload the page so refine.js reads the new URL
    window.location.href = url.toString();
}