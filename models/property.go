package models

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
	City      string `json:"City"`
	Country   string `json:"Country"`
	Display   string `json:"Display"`
	State     string `json:"State"`
	StateAbbr string `json:"StateAbbr"`
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

func ToProperty(item CategoryItem) Property {
	return Property{
		ID:                item.ID,
		Name:              item.Property.PropertyName,
		Image:             item.Property.FeatureImage,
		Location:          item.GeoInfo.Display,
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
