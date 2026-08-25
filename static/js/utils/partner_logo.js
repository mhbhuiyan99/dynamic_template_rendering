function getPartnerLogo(feed) {
    switch (feed) {
        case 11:
            return "/static/images/amenities/booking.svg";

        case 12:
            return "/static/images/amenities/vrbo.svg";

        case 24:
            return "/static/images/amenities/expedia.svg";

        default:
            return "";
    }
}