package requests

import (
	"fmt"
	"net/url"
	"strings"

	"dynamic_template_rendering/models"
)

const categoryAPIPath = "/api/v1/category/details/"

const (
	categoryDevice    = "desktop"
	categoryItems     = "1"
	categoryLocations = "US"
)

const defaultNearbyCount = 12

// CategoryRequest handles communication with the Category API.
type CategoryRequest struct {
	client *Client
}

func NewCategoryRequest(client *Client) *CategoryRequest {
	return &CategoryRequest{client: client}
}

//go:noinline
func (r *CategoryRequest) Fetch(config models.TileConfig) (*models.CategoryResponse, error) {
	return r.fetch(config.Keyword, config, 0)
}

func (r *CategoryRequest) FetchNearby(keyword string, count int) (*models.CategoryResponse, error) {
	if count <= 0 {
		count = defaultNearbyCount
	}

	return r.fetch(keyword, models.TileConfig{Keyword: keyword}, count)
}

func (r *CategoryRequest) fetch(keyword string, config models.TileConfig, nearby int) (*models.CategoryResponse, error) {
	if r == nil || r.client == nil {
		return nil, fmt.Errorf("category request client is nil")
	}
	if keyword == "" {
		return nil, fmt.Errorf("category location keyword is empty")
	}

	queryParams := url.Values{}
	queryParams.Set("device", categoryDevice)
	queryParams.Set("items", categoryItems)
	queryParams.Set("locations", categoryLocations)
	if nearby > 0 {
		queryParams.Set("nearby", fmt.Sprintf("%d", nearby))
	}
	if config.PT != "" {
		queryParams.Set("pt", config.PT)
	}
	if config.Amenities != "" {
		queryParams.Set("amenities", config.Amenities)
	}
	if config.Order != "" {
		queryParams.Set("order", config.Order)
	}
	requestURL, err := BuildURL(
		r.client.BaseURL,
		categoryAPIPath+url.PathEscape(strings.ToLower(keyword)),
		queryParams,
	)
	if err != nil {
		return nil, fmt.Errorf("build category request URL: %w", err)
	}

	request, err := r.client.NewGETRequest(requestURL)
	if err != nil {
		return nil, err
	}

	var response models.CategoryResponse
	if err := r.client.Do(request, &response); err != nil {
		return nil, fmt.Errorf("category API request failed: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("category API returned unsuccessful response: %s", response.Message)
	}

	return &response, nil
}
