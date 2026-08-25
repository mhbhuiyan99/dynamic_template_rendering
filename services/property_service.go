package services

import (
	"fmt"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/requests"
)

type PropertyService struct {
	request *requests.PropertyRequest
}

func NewPropertyService(
	request *requests.PropertyRequest,
) *PropertyService {
	return &PropertyService{
		request: request,
	}
}

func (s *PropertyService) GetProperties(
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
) (*models.CategoryResponse, error) {

	if s == nil || s.request == nil {
		return nil, fmt.Errorf("property service is not configured")
	}

	return s.request.GetProperties(
		category,
		countryCode,
		order,
		dateStart,
		dateEnd,
		pax,
		amount,
		amenities,
		petFriendly,
		ecoFriendly,
	)
}

func (s *PropertyService) GetPropertyDetails(
	propertyIDs []string,
) (*models.PropertyDetailsResponse, error) {

	if s == nil || s.request == nil {
		return nil, fmt.Errorf("property service is not configured")
	}

	return s.request.GetPropertyDetails(propertyIDs)
}