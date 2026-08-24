package requests

import (
	"fmt"
	"net/url"
	"strings"

	"dynamic_template_rendering/models"
)

const categoryAPIPath = "/api/v1/category/details/"

// CategoryRequest handles communication with the Category API.
type CategoryRequest struct {
	client *Client
}

func NewCategoryRequest(client *Client) *CategoryRequest {
	return &CategoryRequest{client: client}
}

func (r *CategoryRequest) Fetch(config models.TileConfig) (*models.CategoryResponse, error) {
	if r == nil || r.client == nil {
		return nil, fmt.Errorf("category request client is nil")
	}
	if config.Keyword == "" {
		return nil, fmt.Errorf("category location keyword is empty")
	}

	queryParams := url.Values{}
	if config.PT != "" {
		queryParams.Set("pt", config.PT)
	}
	if config.Amenities != "" {
		queryParams.Set("amenities", config.Amenities)
	}
	if config.Order != "" {
		queryParams.Set("order", config.Order)
	}
	if len(queryParams) > 0 {
		queryParams.Set("items", "1")
	}

	requestURL, err := BuildURL(
		r.client.BaseURL,
		categoryAPIPath+url.PathEscape(strings.ToLower(config.Keyword)),
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
