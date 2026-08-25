package models

import "strings"

type CategoryResponse struct {
	Error        interface{}     `json:"Error"`
	Message      string          `json:"Message"`
	Success      bool            `json:"Success"`
	GeoInfo      CategoryGeoInfo `json:"GeoInfo"`
	Result       CategoryResult  `json:"Result"`
	NearbyCities NearbyCities    `json:"NearbyCities"`
}

type CategoryGeoInfo struct {
	Name        string               `json:"Name"`
	Breadcrumbs []CategoryBreadcrumb `json:"Breadcrumbs"`
}

type CategoryBreadcrumb struct {
	Name string `json:"Name"`
	Slug string `json:"Slug"`
}

type NearbyCities struct {
	Items []NearbyCity `json:"Items"`
	Count int          `json:"Count"`
}

type NearbyCity struct {
	Display       string `json:"Display"`
	Name          string `json:"Name"`
	Slug          string `json:"Slug"`
	PropertyCount int    `json:"PropertyCount"`
}

type CategoryResult struct {
	Items        []CategoryItem `json:"Items"`
	NearbyCities NearbyCities   `json:"NearbyCities"`
}

type CategoryItem struct {
	ID       string       `json:"ID"`
	GeoInfo  GeoInfo      `json:"GeoInfo"`
	Property PropertyData `json:"Property"`
	Partner  Partner      `json:"Partner"`
	Feed     int          `json:"Feed"`
}

type GeoInfo struct {
	City         string               `json:"City"`
	Country      string               `json:"Country"`
	Display      string               `json:"Display"`
	LocationSlug string               `json:"LocationSlug"`
	State        string               `json:"State"`
	StateAbbr    string               `json:"StateAbbr"`
	Breadcrumbs  []CategoryBreadcrumb `json:"Breadcrumbs"`
}

type PropertyData struct {
	FeatureImage      string  `json:"FeatureImage"`
	PropertyName      string  `json:"PropertyName"`
	PropertyType      string  `json:"PropertyType"`
	PropertySlug      string  `json:"PropertySlug"`
	Address           string  `json:"Address"`
	Price             float64 `json:"Price"`
	ReviewScore       float64 `json:"ReviewScore"`
	ReviewCount       int     `json:"ReviewCount"`
	PropertyAttribute string  `json:"PropertyAttribute"`
	Counts            Counts  `json:"Counts"`
}

type Counts struct {
	Bedroom   int `json:"Bedroom"`
	Bathroom  int `json:"Bathroom"`
	Occupancy int `json:"Occupancy"`
}

type Partner struct {
	URL string `json:"URL"`
}

type Property struct {
	ID                string
	Name              string
	Image             string
	Location          string
	LocationSlug      string
	Price             float64
	PropertyType      string
	Slug              string
	ReviewScore       float64
	ReviewCount       int
	PropertyAttribute string
	Counts            Counts
	PartnerURL        string
	Feed              int
}

type PropertyGeoInfo struct {
	CountryCode  string `json:"CountryCode"`
	LocationSlug string `json:"LocationSlug"`

	// For Property Details API
	City               string     `json:"City"`
	State              string     `json:"State"`
	DistanceFromCenter string     `json:"DistanceFromCenter"`
	Categories         []PropertyLocationCategory `json:"Categories"`
}

type PropertyLocationCategory struct {
	Name string `json:"Name"`
}

func ToProperty(item CategoryItem) Property {
	locationSlug := buildLocationSlug(item.GeoInfo)
	if locationSlug == "" {
		locationSlug = item.GeoInfo.LocationSlug
	}

	return Property{
		ID:                item.ID,
		Name:              item.Property.PropertyName,
		Image:             item.Property.FeatureImage,
		Location:          item.GeoInfo.Display,
		LocationSlug:      locationSlug,
		Price:             item.Property.Price,
		PropertyType:      item.Property.PropertyType,
		Slug:              item.Property.PropertySlug,
		ReviewScore:       item.Property.ReviewScore,
		ReviewCount:       item.Property.ReviewCount,
		PropertyAttribute: item.Property.PropertyAttribute,
		Counts:            item.Property.Counts,
		PartnerURL:        item.Partner.URL,
		Feed:              item.Feed,
	}
}

func buildLocationSlug(geoInfo GeoInfo) string {
	displayParts := strings.Split(geoInfo.Display, ",")
	if len(displayParts) > 1 {
		slugParts := make([]string, 0, len(displayParts))
		for index := len(displayParts) - 1; index >= 0; index-- {
			part := strings.TrimSpace(displayParts[index])
			if strings.EqualFold(part, "USA") || strings.EqualFold(part, "United States") {
				part = "usa"
			}
			part = slugifyLocationPart(part)
			if part != "" {
				slugParts = append(slugParts, part)
			}
		}
		return strings.Join(slugParts, "/")
	}

	country := geoInfo.Country
	state := geoInfo.State
	city := geoInfo.City
	if state == "" || city == "" {
		displayParts := strings.Split(geoInfo.Display, ",")
		for index := range displayParts {
			displayParts[index] = strings.TrimSpace(displayParts[index])
		}
		if city == "" && len(displayParts) > 0 {
			city = displayParts[0]
		}
		if state == "" && len(displayParts) > 2 {
			state = displayParts[len(displayParts)-2]
		}
		if country == "" && len(displayParts) > 1 {
			country = displayParts[len(displayParts)-1]
		}
	}

	parts := []string{country, state, city}
	if strings.EqualFold(geoInfo.Country, "USA") || strings.EqualFold(geoInfo.Country, "United States") {
		parts[0] = "usa"
	}

	slugParts := make([]string, 0, len(parts))
	for _, part := range parts {
		part = slugifyLocationPart(part)
		if part != "" {
			slugParts = append(slugParts, part)
		}
	}

	return strings.Join(slugParts, "/")
}

func slugifyLocationPart(part string) string {
	part = strings.ToLower(strings.TrimSpace(part))
	return strings.NewReplacer("'", "", ",", "", ".", "", " ", "-").Replace(part)
}
