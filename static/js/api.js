async function getLocation(keyword) {
  const response = await fetch(
    `/api/location?keyword=${encodeURIComponent(keyword)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location");
  }

  return await response.json();
}

const DEFAULT_PROPERTY_OPTIONS = {
  page: 1,
  limit: 192,
  items: 1,
  device: "desktop",
};

async function getProperties(
    category,
    locations,
    order,
    filters = {}
) {
    const query = new URLSearchParams({
        category: category,
        location: locations,
        order: order,

        page: DEFAULT_PROPERTY_OPTIONS.page,
        limit: DEFAULT_PROPERTY_OPTIONS.limit,
        items: DEFAULT_PROPERTY_OPTIONS.items,
        device: DEFAULT_PROPERTY_OPTIONS.device,
    });

    // Dates
    if (filters.startDate) {
        query.set("dateStart", filters.startDate);
    }

    if (filters.endDate) {
        query.set("dateEnd", filters.endDate);
    }

    // Guests
    if (filters.pax) {
        query.set("pax", filters.pax);
    }

    // Price
    if (filters.amount) {
        query.set("amount", filters.amount);
    }

    // Amenities
    if (
        filters.amenities &&
        filters.amenities.length > 0
    ) {
        query.set(
            "amenities",
            filters.amenities.join("-")
        );
    }

    // Pet friendly
    if (filters.petFriendly === "true") {
        query.set("petFriendly", "true");
    }

    // Eco friendly
    if (filters.ecoFriendly === "true") {
        query.set("ecoFriendly", "true");
    }

    console.log(
        "[getProperties] URL:",
        `/api/properties?${query.toString()}`
    );

    const response = await fetch(
        `/api/properties?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch properties"
        );
    }

    return await response.json();
}

async function getPropertyDetails(propertyIDs) {
  const query = new URLSearchParams({
    propertyIdList: propertyIDs.join(","),
  });

  const response = await fetch(`/api/property-details?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch property details");
  }

  return await response.json();
}
