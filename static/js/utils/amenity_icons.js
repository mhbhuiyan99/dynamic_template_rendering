const AMENITY_ICONS = {
    "Air Conditioner": "/static/images/amenities/air-conditioner.svg",
    "Parking": "/static/images/amenities/parking.svg",
    "Internet": "/static/images/amenities/internet.svg",
    "Kitchen": "/static/images/amenities/kitchen.svg",
    "Laundry": "/static/images/amenities/laundry.svg",
    "View": "/static/images/amenities/view.svg",
    "Hot Tub": "/static/images/amenities/hot-tub.svg",
    "Pool": "/static/images/amenities/pool.svg",
    "Fireplace": "/static/images/amenities/fireplace.svg",
    "Balcony/Terrace": "/static/images/amenities/balcony.svg",
    "Child Friendly" : "/static/images/amenities/child_friendly.svg",
    "Security/Safety": "/static/images/amenities/security.svg",
    "Breakfast": "/static/images/amenities/breakfast.svg",
    "TV": "/static/images/amenities/tv.svg",
    "Wheelchair Accessible" : "/static/images/amenities/balcony.svg",
    "Accessibility": "/static/images/amenities/access.svg",
    "Pet Friendly": "/static/images/amenities/pet_friendly.svg",
};

function getAmenityIcon(name) {
    return AMENITY_ICONS[name] ||
        "/static/images/amenities/default.svg";
}