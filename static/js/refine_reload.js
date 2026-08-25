async function reloadPropertiesFromAPI() {

    try {

        renderSkeletonCards(32);

        const params =
            new URLSearchParams(window.location.search);

        const category =
            window.locationData.GeoInfo.LocationSlug;

        const location =
            window.locationData.GeoInfo.CountryCode;

        const order =
            window.refineConfig.order || 1;

        const amenitiesParam =
            params.get("amenities");

        const amenities =
            amenitiesParam
                ? amenitiesParam.split("-")
                : [];
        
        const amountParam = params.get("amount");
        const selectedCurrency = params.get("selectedCurrency");

        let apiAmount = amountParam;

        if (amountParam && selectedCurrency && selectedCurrency !== "US") {
            const [min, max] = amountParam.split("-").map(Number);

            const minUSD = convertPriceToUSD(min, selectedCurrency);
            const maxUSD = convertPriceToUSD(max, selectedCurrency);

            apiAmount = `${Math.round(minUSD)}-${Math.round(maxUSD)}`;
        }

        const properties = await getProperties(
            category,
            location,
            order,
            {
                startDate: params.get("dateStart"),
                endDate: params.get("dateEnd"),
                pax: params.get("pax"),
                amount: apiAmount,
                amenities: amenities,
                petFriendly: params.get("petFriendly"),
                ecoFriendly: params.get("ecoFriendly")
            }
        );

        const propertyIDs =
            properties.Result.ItemIDs || [];

        console.log(
            "[reloadPropertiesFromAPI] IDs:",
            propertyIDs.length
        );

        if (propertyIDs.length === 0) {

            window.allProperties = [];

            renderTiles(
                [],
                window.currencyCode
            );

            return;
        }

        const propertyDetails =
            await getPropertyDetails(propertyIDs);

        window.allProperties =
            propertyDetails.Items || [];

        renderTiles(
            window.allProperties,
            window.currencyCode
        );

        updateFilterButtons();

    } catch (error) {

        console.error(
            "[reloadPropertiesFromAPI] failed:",
            error
        );

    }
}