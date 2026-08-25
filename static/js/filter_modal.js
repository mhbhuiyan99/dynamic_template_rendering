function openFilterModal(active = null) {
    const existing = document.getElementById("filter-modal");
    if (existing) existing.remove(); // always rebuild with latest data

    document.body.insertAdjacentHTML("beforeend", getFilterModalHTML());
    const modal = document.getElementById("filter-modal");

    document.getElementById("filter-close").addEventListener("click", closeFilterModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeFilterModal();
    });
    bindModalEvents();

    modal.style.display = "flex";
    highlightSection(active);
}

function closeFilterModal() {
    document.getElementById("filter-modal").style.display = "none";
}

function highlightSection(section) {

    document
        .querySelectorAll(".filter-section")
        .forEach(item => item.classList.remove("active"));

    if (!section) {
        return;
    }

    const target =
        document.getElementById(`${section}-section`);

    if (target) {
        target.classList.add("active");
        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

async function bindModalEvents() {

    const minus = document.getElementById("guest-minus");
    const plus = document.getElementById("guest-plus");
    const count = document.getElementById("guest-count");

    count.textContent = window.filterState.guests;

    minus.onclick = () => {

        if (window.filterState.guests > 0) {

            window.filterState.guests--;

            count.textContent = window.filterState.guests;

        }

    };

    plus.onclick = () => {

        window.filterState.guests++;

        count.textContent = window.filterState.guests;

    };

    document
        .getElementById("modal-date-btn")
        .onclick = () => {
            //console.log("OPENING DATE FROM FILTER MODAL");
            openDateModal("refine-pending"); // inside the Filter modal
        };

    const minSlider = document.getElementById("min-price");
    const maxSlider = document.getElementById("max-price");
    const minInput = document.getElementById("min-price-value");
    const maxInput = document.getElementById("max-price-value");
    const fill = document.getElementById("price-slider-fill");

    // Dynamic scale limits based on the actual range configuration
    const range = window.priceRange || { min: 0, max: 50000 };
    const MIN_PRICE = Number(range.min);
    const MAX_PRICE = Number(range.max);
    const MIN_GAP = Math.round((MAX_PRICE - MIN_PRICE) * 0.01) || 100; // 1% of the total range as minimum gap

    minSlider.min = MIN_PRICE;
    minSlider.max = MAX_PRICE;
    maxSlider.min = MIN_PRICE;
    maxSlider.max = MAX_PRICE;

    minSlider.value = window.filterState.minPrice;
    maxSlider.value = window.filterState.maxPrice;

    minInput.value = window.filterState.minPrice;
    maxInput.value = window.filterState.maxPrice;

    document
    .getElementById("filter-search")
    .addEventListener("click", async () => {

        // 1. Create URL object first
        // --------------------------
        const url = new URL(window.location);

        // 2. Commit pending dates
        // -----------------------
        if (
            window.pendingStartDate &&
            window.pendingEndDate
        ) {

            window.filterState.startDate =
                window.pendingStartDate;

            window.filterState.endDate =
                window.pendingEndDate;

            window.filterState.nights =
                window.pendingNights;

        }

        // 3. Date URL
        // -----------
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



        // 4. Guests
        // ----------
        if (window.filterState.guests > 0) {
            url.searchParams.set(
                "pax",
                window.filterState.guests
            );
        } else {
            url.searchParams.delete("pax")
        }

        // 5. Pet-friendly
        // -----------------
        if (window.filterState.petFriendly) {
            url.searchParams.set("petFriendly", "true");
        } else {
            url.searchParams.delete("petFriendly");
        }

        // 6. Eco-friendly
        // ----------------
        if (window.filterState.ecoFriendly) {
            url.searchParams.set("ecoFriendly", "true");
        } else {
            url.searchParams.delete("ecoFriendly");
        }

        // 7. Amenities
        // --------------
        if (window.filterState.amenities.length > 0) {
            url.searchParams.set(
                "amenities",
                window.filterState.amenities.join("-")
            );
        } else {
            url.searchParams.delete("amenities");
        }

        // 8. Price
        // ---------
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


        // 9. Update URL
        // --------------
        history.replaceState({}, "", url);

        // 10. Close modal
        // ---------------
        closeFilterModal();

        // 11. Reload properties from API
        // ------------------------------
        await reloadPropertiesFromAPI();

        // 12. Clear pending dates
        // ------------------------
        window.pendingStartDate = null;
        window.pendingEndDate = null;
        window.pendingNights = null;

        // 13. Update UI
        // --------------
        updateFilterButtons();
    });
    
    document
        .getElementById("filter-clear")
        .addEventListener("click", () => {

            clearFilters();

        });


    function updatePriceUI() {
        const min = Number(minSlider.value);
        const max = Number(maxSlider.value);

        // Fix the calculation to prevent division by zero if MIN and MAX are equal
        const totalRange = MAX_PRICE - MIN_PRICE || 1;
        const minPercent = ((min - MIN_PRICE) / totalRange) * 100;
        const maxPercent = ((max - MIN_PRICE) / totalRange) * 100;

        fill.style.left = `${minPercent}%`;
        fill.style.right = `${100 - maxPercent}%`;

        minInput.value = min;
        maxInput.value = max;

        window.filterState.minPrice =
            Number(minInput.value);

        window.filterState.maxPrice =
            Number(maxInput.value);
    }

    minSlider.oninput = () => {
        if (Number(minSlider.value) > Number(maxSlider.value) - MIN_GAP) {
            minSlider.value = Number(maxSlider.value) - MIN_GAP;
        }
        updatePriceUI();
    };

    maxSlider.oninput = () => {
        if (Number(maxSlider.value) < Number(minSlider.value) + MIN_GAP) {
            maxSlider.value = Number(minSlider.value) + MIN_GAP;
        }
        updatePriceUI();
    };

    minInput.onchange = () => {
        let value = Number(minInput.value);

        value = Math.max(value, MIN_PRICE);
        value = Math.min(value, Number(maxSlider.value) - MIN_GAP);

        minInput.value = value;
        minSlider.value = value;

        updatePriceUI();
    };

    maxInput.onchange = () => {
        let value = Number(maxInput.value);

        value = Math.min(value, MAX_PRICE);
        value = Math.max(value, Number(minSlider.value) + MIN_GAP);

        maxInput.value = value;
        maxSlider.value = value;

        updatePriceUI();
    };

    document.querySelector('.price-slider').addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return; // dragging a thumb already handles itself

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const value = Math.round(MIN_PRICE + percent * (MAX_PRICE - MIN_PRICE));

        const minVal = Number(minSlider.value);
        const maxVal = Number(maxSlider.value);

        if (Math.abs(value - minVal) <= Math.abs(value - maxVal)) {
            minSlider.value = Math.min(value, maxVal - MIN_GAP);
        } else {
            maxSlider.value = Math.max(value, minVal + MIN_GAP);
        }
        updatePriceUI();
    });

    document.querySelectorAll(".filter-top input")[0].checked =
    window.filterState.petFriendly;

    document.querySelectorAll(".filter-top input")[1].checked =
    window.filterState.ecoFriendly;

    document.querySelectorAll(".filter-top input")[0].onchange = e => {
    window.filterState.petFriendly = e.target.checked;
    };

    document.querySelectorAll(".filter-top input")[1].onchange = e => {
        window.filterState.ecoFriendly = e.target.checked;
    };

    document
    .querySelectorAll(".amenity-checkbox")
    .forEach(box => {

        box.onchange = function () {

            if (this.checked) {

                if (!window.filterState.amenities.includes(this.value)) {

                    window.filterState.amenities.push(this.value);

                }

            } else {

                window.filterState.amenities =
                    window.filterState.amenities.filter(
                        item => item !== this.value
                    );

            }

        };

    });

    updatePriceUI(); // draw initial fill on modal open
    updateFilterDateButton();
}

function getAmenitiesHTML() {

    const allAmenities = new Map();

    window.allProperties.forEach(property => {

        if (!property.Property.Amenities) {
            return;
        }

        Object.entries(property.Property.Amenities)
            .forEach(([id, name]) => {
                allAmenities.set(String(id), name);
            });

    });

    return [...allAmenities.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, name]) => `

            <label>
                ${name}

                <input
                    type="checkbox"
                    class="amenity-checkbox"
                    value="${id}"
                    ${
                        window.filterState.amenities.includes(String(id))
                            ? "checked"
                            : ""
                    }
                >

                <span class="checkmark"></span>
            </label>

        `)
        .join("");
}

function getFilterModalHTML() {
    const range = window.priceRange || { min: 0, max: 50000 };
    const countryCode = window.currencyCode || "US";
    const symbol = getCurrencySymbol(countryCode);

    return `
    <div id="filter-modal" class="filter-modal">
        <div class="filter-dialog">
        <div class="filter-header">
            <h2>Filters</h2>
            <button id="filter-close">✕</button>
        </div>
    <div class="filter-body">

    <div class="filter-top">
    <label class="icon-label">
        <span class="filter-icon paw-icon">🐾</span> Pet-friendly only
        <input type="checkbox"><span class="checkmark"></span>
    </label>
    <label class="icon-label">
        <span class="filter-icon leaf-icon">🍃</span> Eco-friendly only
        <input type="checkbox"><span class="checkmark"></span>
    </label>
    </div>

    <div class="filter-row-2col">
    <div class="filter-section" id="date-section">
    <h3>Select date</h3>
    <button id="modal-date-btn">
        <span>Select Date</span>
        <span class="date-icon">📅</span>
    </button>
    </div>

    <div class="filter-section" id="guest-section">
    <h3>Guests</h3>
        <div class="guest-box">
            <button id="guest-minus">−</button>
            <span id="guest-count">${window.filterState?.guests ?? 0}</span>
            <button id="guest-plus">+</button>
        </div>
    </div>
    </div>

    <div id="price-section" class="filter-section">
    <h3>Price range</h3>
    <div class="price-slider">
        <div class="price-slider-track"></div>
        <div class="price-slider-fill" id="price-slider-fill"></div>
            <input id="min-price" type="range" min="${value="${window.filterState.minPrice}"}" max="${value="${window.filterState.maxPrice}"}" value="${value="${window.filterState.minPrice}"}">
            <input id="max-price" type="range" min="${value="${window.filterState.minPrice}"}" max="${value="${window.filterState.maxPrice}"}" value="${value="${window.filterState.maxPrice}"}">
        </div>
        <div class="price-inputs">
            <span class="price-label side-label">Min price</span>
            <div class="price-input-group">
            <span class="price-currency">${symbol}</span>
            <input id="min-price-value" type="number" value="${window.filterState.minPrice}">
        </div>
        <span>—</span>
        <div class="price-input-group">
        <span class="price-currency">${symbol}</span>
        <input id="max-price-value" type="number" value="${window.filterState.maxPrice}">
        </div>
        <span class="price-label side-label">Max price</span>
    </div>
    </div>

    <div class="filter-section">
    <h3>Amenities</h3>
    <div class="amenities-grid">
        ${getAmenitiesHTML()}
    </div>
    </div>

    </div>
    <div class="filter-footer">
    <button id="filter-clear">Clear</button>
    <button id="filter-search">Search</button>
    </div>
    </div>
    </div>
    `;
}

