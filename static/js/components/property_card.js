function renderPropertyCard(item, countryCode) {
    const p = item.Property;

    const image = p.FeatureImage || "/static/images/placeholder.jpg";

    const propertyUrl =
       `https://ownerdirect.beta.123presto.com/property/${item.Property.PropertySlug}/${item.ID}`;


    // console.log("Image_src: ", image);
    const price =
        formatCurrency(
                p.Price,
                window.locationData.GeoInfo.CountryCode
        );

    const guests =
        p.Counts.Occupancy > 0
            ? `<span>${p.Counts.Occupancy} Guests</span>`
            : "";

    const amenities =
        (p.TopListedAmenities || [])
            .slice(0, 2)
            .map(item => `
                <span class="amenity-tag">
                    <img
                        src="${getAmenityIcon(item.Name)}"
                        class="amenity-icon"
                        alt="${item.Name}"
                    >
                    ${item.Name}
                </span>
            `)
            .join("");

    const partnerLogo = getPartnerLogo(item.Feed);
    const partnerUrl = item.Partner?.URL || "#";
    //console.log("Partner URL:", partnerUrl);

    const state = item.GeoInfo?.State || "";
    const city = item.GeoInfo?.City || "";
    const distance = item.GeoInfo?.DistanceFromCenter || "";

    const nightPrice =
        convertPrice(
            p.Price,
            countryCode
        );

    const nights =
        getSelectedNights();

    const totalPrice =
        nightPrice * nights;

    return `
        <div
            class="property-card"
            data-property-type="${p.PropertyType}">

            <div class="image-wrapper">

                <div
                    class="property-slider"
                    data-property-id="${item.ID}"
                >

                    <img
                        class="property-image"
                        src="${image}"
                        alt="${p.PropertyName}"
                    >

                    <div class="slider-loading hidden">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <button
                        class="slider-btn prev"
                        aria-label="Previous Image"
                    >
                        &#10094;
                    </button>

                    <button
                        class="slider-btn next"
                        aria-label="Next Image"
                    >
                        &#10095;
                    </button>

                    <div class="slider-dots">

                    </div>

                </div>

            </div>

            <div class="property-body">

                <div class="property-type">
                    ${p.PropertyType}
                </div>

                <h3 class="property-title">
                    <a href="${propertyUrl}" target="_blank" rel="noopener noreferrer">
                        ${item.Property.PropertyName}
                    </a>
                </h3>

                <div class="property-location">

                    <img
                        src="/static/images/amenities/map_pin.svg"
                        class="location-icon"
                        alt="Location">

                    ${state}

                    ${state && city ? " • " : ""}

                    ${city}

                    ${
                        distance
                            ? `<span>${distance} to center</span>`
                            : ""
                    }

                </div>

                <div class="property-rating">

                    <div class="rating-badge">
                        <img
                            src="/static/images/amenities/like-v2.svg"
                            class="rating-icon"
                            alt="Rating"
                        >
                        <span>${p.ReviewScore}</span>
                    </div>

                </div>

                <div class="property-attribute">

                    ${p.PropertyAttribute}

                </div>

                <div class="property-meta">

                    <span>${p.Counts.Bedroom} Bedrooms</span>

                    •

                    <span>${p.Counts.Bathroom} Bathrooms</span>

                    ${guests ? "•" : ""}

                    ${guests}

                </div>

                <div class="property-amenities">

                    ${amenities}

                </div>

                <div class="property-footer">

                    <div class="price"
                    data-price="${p.Price}">

                        ${formatCurrency(p.Price, countryCode)}

                        <span>/night</span>

                        <div class="total-price">

                            ${nights} night${nights > 1 ? "s" : ""}

                            -

                            ${formatCurrency(totalPrice, countryCode)}

                        </div>

                    </div>

                    <div class="deal-section">

                       <a
                            class="partner-logo"
                            href="${partnerUrl}"
                            target="_blank">

                            ${
                                partnerLogo
                                    ? `<img src="${partnerLogo}" alt="Partner">`
                                    : ""
                            }

                        </a>

                        <a
                            class="deal-btn"
                            href="${partnerUrl}"
                            target="_blank">

                            View Deal

                        </a>

                    </div>

                </div>

            </div>

        </div>
    `;
}

function getSelectedNights() {

    const start = window.filterState?.startDate;
    const end   = window.filterState?.endDate;

    if (!start || !end) {
        return 7;
    }

    const diff =
        Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        );

    return diff > 0 ? diff : 7;
}
