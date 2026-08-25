package requests

import (
	"fmt"
	"net/url"

	"dynamic_template_rendering/models"
)

const (
	propertiesAPIPath      = "/api/properties/category/v1"
	propertyDetailsAPIPath = "/api/property/bookmark/v1"
)

type PropertyRequest struct {
	client *Client
}

func NewPropertyRequest(client *Client) *PropertyRequest {
	return &PropertyRequest{
		client: client,
	}
}

func (r *PropertyRequest) GetProperties(
	category string,
	countryCode string,
	order string,
	dateStart string,
	dateEnd string,
	pax string,
	amount string,
	amenities []string,
	petFriendly string,
	ecoFriendly string,
) (*models.PropertyListResponse, error) {

	if r == nil || r.client == nil {
		return nil, fmt.Errorf("property request is not configured")
	}

	query := url.Values{}

	query.Set("order", order)
	query.Set("category", category)

	query.Set("limit", "192")
	query.Set("items", "1")
	query.Set("locations", countryCode)
	query.Set("device", "desktop")
	query.Set("page", "1")

	if dateStart != "" {
		query.Set("dateStart", dateStart)
	}

	if dateEnd != "" {
		query.Set("dateEnd", dateEnd)
	}

	if pax != "" {
		query.Set("pax", pax)
	}

	if amount != "" {
		query.Set("amount", amount)
	}

	if len(amenities) > 0 {
		query.Set("amenities", joinAmenities(amenities))
	}

	if petFriendly == "true" {
		query.Set("petFriendly", "true")
	}

	if ecoFriendly == "true" {
		query.Set("ecoFriendly", "true")
	}

	requestURL, err := BuildURL(
		r.client.BaseURL,
		propertiesAPIPath,
		query,
	)
	if err != nil {
		return nil, err
	}

	request, err := r.client.NewGETRequest(requestURL)
	if err != nil {
		return nil, err
	}

	var response models.PropertyListResponse

	if err := r.client.Do(request, &response); err != nil {
		return nil, err
	}

	return &response, nil
}

func (r *PropertyRequest) GetPropertyDetails(
	propertyIDs []string,
) (*models.PropertyDetailsResponse, error) {

	if r == nil || r.client == nil {
		return nil, fmt.Errorf("property request is not configured")
	}

	if len(propertyIDs) == 0 {
		return nil, fmt.Errorf("property ID list is empty")
	}

	// TEMP DEBUG — remove after testing
	if len(propertyIDs) > 20 {
		propertyIDs = propertyIDs[:20]
	}

	query := url.Values{}
	query.Set("propertyIdList", joinIDs(propertyIDs))

	requestURL, err := BuildURL(
		r.client.BaseURL,
		propertyDetailsAPIPath,
		query,
	)
	if err != nil {
		return nil, err
	}

	request, err := r.client.NewGETRequest(requestURL)
	if err != nil {
		return nil, err
	}

	var response models.PropertyDetailsResponse

	if err := r.client.Do(request, &response); err != nil {
		return nil, err
	}

	return &response, nil
}

func joinIDs(ids []string) string {
	result := ""

	for index, id := range ids {
		if index > 0 {
			result += ","
		}

		result += id
	}

	return result
}

func joinAmenities(amenities []string) string {
	result := ""

	for index, amenity := range amenities {
		if index > 0 {
			result += "-"
		}

		result += amenity
	}

	return result
}