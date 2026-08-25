
const CURRENCIES = {
    "AE": {
        "Code": "AED",
        "Country": "AE",
        "Symbol": "د.إ.‏",
        "Rate": 3.6725
    },
    "AU": {
        "Code": "AUD",
        "Country": "AU",
        "Symbol": "AU $",
        "Rate": 1.42572
    },
    "BD": {
        "Code": "BDT",
        "Country": "BD",
        "Symbol": "৳",
        "Rate": 123.113592
    },
    "BE": {
        "Code": "EUR",
        "Country": "BE",
        "Symbol": "€",
        "Rate": 0.867115
    },
    "CA": {
        "Code": "CAD",
        "Country": "CA",
        "Symbol": "CA $",
        "Rate": 1.40305
    },
    "DE": {
        "Code": "EUR",
        "Country": "DE",
        "Symbol": "€",
        "Rate": 0.867115
    },
    "ES": {
        "Code": "EUR",
        "Country": "ES",
        "Symbol": "€",
        "Rate": 0.867115
    },
    "FR": {
        "Code": "EUR",
        "Country": "FR",
        "Symbol": "€",
        "Rate": 0.867115
    },
    "GB": {
        "Code": "GBP",
        "Country": "GB",
        "Symbol": "£",
        "Rate": 0.741785
    },
    "IE": {
        "Code": "GBP",
        "Country": "IE",
        "Symbol": "£",
        "Rate": 0.741785
    },
    "IT": {
        "Code": "EUR",
        "Country": "IT",
        "Symbol": "€",
        "Rate": 0.867115
    },
    "JP": {
        "Code": "JPY",
        "Country": "JP",
        "Symbol": "￥",
        "Rate": 157.395
    },
    "SG": {
        "Code": "SGD",
        "Country": "SG",
        "Symbol": "SG $",
        "Rate": 1.2839
    },
    "UK": {
        "Code": "GBP",
        "Country": "UK",
        "Symbol": "£",
        "Rate": 0.741785
    },
    "US": {
        "Code": "USD",
        "Country": "US",
        "Symbol": "US $",
        "Rate": 1
    },
    "ZA": {
        "Code": "ZAR",
        "Country": "ZA",
        "Symbol": "R",
        "Rate": 16.55767
    }
}

function getExchangeRate(countryCode) {
    return CURRENCIES[countryCode]?.Rate ?? 1;
}

function getCurrencySymbol(countryCode) {
    return CURRENCIES[countryCode]?.Symbol ?? "$";
}

function convertPrice(priceUSD, countryCode) {
    return Math.round(priceUSD * getExchangeRate(countryCode));
}

function formatCurrency(priceUSD, countryCode) {
    if (!priceUSD) return "";

    const symbol = getCurrencySymbol(countryCode);
    const converted = convertPrice(priceUSD, countryCode);

    return `${symbol}${converted.toLocaleString()}`;
}

function convertPriceToUSD(price, countryCode) {
    const rate = getExchangeRate(countryCode);

    if (!rate) {
        return Math.round(price);
    }

    return Math.round(price / rate);
}