const params = new URLSearchParams(window.location.search);

const search = window.refineConfig.search || "";
const order = window.refineConfig.order || 1;

//console.log("Search: ", search);
//console.log("Order: ", order);

async function init() {
  renderSkeletonCards(32);
  renderFilters();
  renderSort();

  try {
    const location = await getLocation(search);
    window.locationData = location;

    renderHeader(location);
    renderBreadcrumb(location);

    // Get the query parameters from the URL
    // -------------------------------------
    const params = new URLSearchParams(window.location.search);

    const startDate = params.get("dateStart");
    const endDate = params.get("dateEnd");
    const pax = params.get("pax");

    const amount = params.get("amount");

    const amenitiesParam = params.get("amenities");
    const amenities = amenitiesParam
      ? amenitiesParam.split("-")
      : [];

    const petFriendly = params.get("petFriendly");
    const ecoFriendly = params.get("ecoFriendly");

    // Get filtered property list
    // --------------------------
    const properties = await getProperties(
      location.GeoInfo.LocationSlug,
      location.GeoInfo.CountryCode,
      order,
      {
        startDate,
        endDate,
        pax,
        amount,
        amenities,
        petFriendly,
        ecoFriendly
      }
    );

    const propertyIDs = properties.Result.ItemIDs;

    // Get details only for returned IDs
    // ---------------------------------
    const propertyDetails = await getPropertyDetails(propertyIDs);

    const countryCode = location.GeoInfo.CountryCode;

    const selectedCurrency =
        params.get("selectedCurrency");

    window.currencyCode =
        selectedCurrency ||
        localStorage.getItem("currency") ||
        countryCode;

    window.priceRange =
      computePriceRange(
        propertyDetails.Items,
        window.currencyCode
      );

    window.allProperties = propertyDetails.Items;

    window.filterState = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,

      guests: pax ? Number(pax) : 0,

      minPrice: window.priceRange.min,
      maxPrice: window.priceRange.max,

      amenities: amenities,

      petFriendly: petFriendly === "true",
      ecoFriendly: ecoFriendly === "true",
    };

    renderTiles(window.allProperties, window.currencyCode);

    updateFilterButtons();
    initializeCurrencyDropdown();

  } catch (error) {
    console.log(error);
  }
}

init();
