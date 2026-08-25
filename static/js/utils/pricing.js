function updateCategoryPrices() {

    const currency =
        window.currencyCode ||
        localStorage.getItem("currency") ||
        "USD";

    document.querySelectorAll(".price").forEach(priceEl => {

        const usdPrice =
            Number(priceEl.dataset.price);

        priceEl.innerHTML = `
            ${formatCurrency(usdPrice, currency)}
            <span>/night</span>
        `;

    });

}


function computePriceRange(items, countryCode) {

    if (!Array.isArray(items)) {
        return {
            min: 0,
            max: 50000
        };
    }

    const prices = items
        .map(item => item.Property.Price)
        .filter(price => price > 0)
        .map(price => convertPrice(price, countryCode));

    if (prices.length === 0) {
        return {
            min: 0,
            max: 50000
        };
    }

    return {
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
    };
}

