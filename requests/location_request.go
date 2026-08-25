package requests

import (
	"fmt"
	"net/url"

	"dynamic_template_rendering/models"
)

const locationAPIPath = "/api/location/v1"

type LocationRequest struct {
	client *Client
}

func NewLocationRequest(client *Client) *LocationRequest {
	return &LocationRequest{
		client: client,
	}
}

func (r *LocationRequest) GetLocation(
	keyword string,
) (*models.LocationResponse, error) {

	if r == nil || r.client == nil {
		return nil, fmt.Errorf("location request is not configured")
	}

	query := url.Values{}
	query.Set("keyword", keyword)
	query.Set("isLocationEntity", "true")

	requestURL, err := BuildURL(
		r.client.BaseURL,
		locationAPIPath,
		query,
	)
	if err != nil {
		return nil, err
	}

	request, err := r.client.NewGETRequest(requestURL)
	if err != nil {
		return nil, err
	}

	var response models.LocationResponse

	if err := r.client.Do(request, &response); err != nil {
		return nil, err
	}

	return &response, nil
}