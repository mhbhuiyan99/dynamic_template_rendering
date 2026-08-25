package models

type Breadcrumb struct {
	Name       string   `json:"Name"`
	Slug       string   `json:"Slug"`
	Type       string   `json:"Type"`
	Display    []string `json:"Display"`
	LocationID string   `json:"LocationID"`
}

type LocationGeoInfo struct {
	Name         string       `json:"Name"`
	Display      string       `json:"Display"`
	City         string       `json:"City"`
	State        string       `json:"State"`
	Country      string       `json:"Country"`
	CountryCode  string       `json:"CountryCode"`
	LocationID   string       `json:"LocationID"`
	LocationSlug string       `json:"LocationSlug"`
	LocationType string       `json:"LocationType"`
	Breadcrumbs  []Breadcrumb `json:"Breadcrumbs"`
}

type LocationResponse struct {
	Success bool            `json:"Success"`
	GeoInfo LocationGeoInfo `json:"GeoInfo"`
	Message string          `json:"Message"`
}