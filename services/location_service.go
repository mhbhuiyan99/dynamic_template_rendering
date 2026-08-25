package services

import (
	"fmt"
	"strings"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/requests"
)

type LocationService struct {
	request *requests.LocationRequest
}

func NewLocationService(
	request *requests.LocationRequest,
) *LocationService {
	return &LocationService{
		request: request,
	}
}

func (s *LocationService) GetLocation(
	keyword string,
) (*models.LocationResponse, error) {

	if s == nil || s.request == nil {
		return nil, fmt.Errorf("location service is not configured")
	}

	keyword = strings.TrimSpace(keyword)

	if keyword == "" {
		return nil, fmt.Errorf("location keyword is empty")
	}

	return s.request.GetLocation(keyword)
}