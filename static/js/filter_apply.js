async function applyFilters() {
    await reloadPropertiesFromAPI();
}

function clearFilters() {

    const url = new URL(window.location);

    url.searchParams.delete("dateStart");
    url.searchParams.delete("dateEnd");
    url.searchParams.delete("pax");
    url.searchParams.delete("amount");
    url.searchParams.delete("amenities");
    url.searchParams.delete("petFriendly");
    url.searchParams.delete("ecoFriendly");

    history.replaceState({}, "", url);


    window.filterState = {

        startDate: null,
        endDate: null,

        guests: 0,

        minPrice: window.priceRange.min,
        maxPrice: window.priceRange.max,

        amenities: [],

        petFriendly: false,
        ecoFriendly: false
    };


    window.pendingStartDate = null;
    window.pendingEndDate = null;
    window.pendingNights = null;


    // Reload using the clean URL
    reloadPropertiesFromAPI();

    updateFilterButtons();

    closeFilterModal();
}