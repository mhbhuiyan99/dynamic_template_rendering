package models

type CategoryResponse struct {
	Error   interface{}     `json:"Error"`
	Message string           `json:"Message"`
	Success bool             `json:"Success"`
	Result  CategoryResult   `json:"Result"`
}

type CategoryResult struct {
	Items []CategoryItem `json:"Items"`
}

type CategoryItem struct {
	ID       string       `json:"ID"`
	GeoInfo  GeoInfo      `json:"GeoInfo"`
	Property PropertyData `json:"Property"`
}

type GeoInfo struct {
	City        string `json:"City"`
	Country     string `json:"Country"`
	Display     string `json:"Display"`
	State       string `json:"State"`
	StateAbbr   string `json:"StateAbbr"`
}

type PropertyData struct {
	FeatureImage  string  `json:"FeatureImage"`
	PropertyName  string  `json:"PropertyName"`
	PropertySlug  string  `json:"PropertySlug"`
	Address       string  `json:"Address"`
	Price         float64 `json:"Price"`
}

type Property struct {
	ID       string
	Name     string
	Image    string
	Location string
	Price    float64
}

func ToProperty(item CategoryItem) Property {
	return Property{
		ID:       item.ID,
		Name:     item.Property.PropertyName,
		Image:    item.Property.FeatureImage,
		Location: item.GeoInfo.Display,
		Price:    item.Property.Price,
	}
}