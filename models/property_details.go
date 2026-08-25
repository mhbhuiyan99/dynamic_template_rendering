package models

type PropertyDetailsRequest struct {
	PropertyIDList []string
}

type PropertyDetailsResponse struct {
	Success bool                  `json:"Success"`
	Message string                `json:"Message"`
	Error   any                   `json:"Error"`
	Items   []PropertyDetails     `json:"Items"`
	Result  PropertyDetailsResult `json:"Result"`
}

type PropertyDetailsResult struct {
	ItemsByID map[string]PartnerInfo `json:"ItemsByID"`
}

type PartnerInfo struct {
	Feed            int    `json:"Feed"`
	FeedProviderUrl string `json:"FeedProviderUrl"`
}

type PropertyDetails struct {
    ID       string                   `json:"ID"`
    Property PropertyDetailsProperty  `json:"Property"`
    Partner  Partner                  `json:"Partner"`
    Feed     int                      `json:"Feed"`
    GeoInfo  PropertyGeoInfo          		  `json:"GeoInfo"`
}

type PropertyDetailsProperty struct {
    PropertyName      string            `json:"PropertyName"`
    PropertyType      string            `json:"PropertyType"`
    PropertySlug      string            `json:"PropertySlug"`
    FeatureImage      string            `json:"FeatureImage"`
    Price             float64           `json:"Price"`
    ReviewScore       float64           `json:"ReviewScore"`
    PropertyAttribute string            `json:"PropertyAttribute"`
    Amenities         map[string]string `json:"Amenities"`
    TopListedAmenities []Amenity        `json:"TopListedAmenities"`
    Counts             Counts            `json:"Counts"`
}

type Amenity struct {
    ID   string `json:"ID"`
    Name string `json:"Name"`
}