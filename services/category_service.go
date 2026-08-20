package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"dynamic_template_rendering/models"

	"github.com/beego/beego/v2/server/web"
)

const categoryAPIPath = "/api/v1/category/details/usa"

type CategoryService struct {
	BaseURL  string
	Username string
	Password string
	APIKey   string
	Client   *http.Client
}

func NewCategoryService() *CategoryService {
	baseURL := web.AppConfig.DefaultString(
		"base_url",
		"",
	)

	username := web.AppConfig.DefaultString(
		"username",
		"",
	)

	password := web.AppConfig.DefaultString(
		"password",
		"",
	)

	apiKey := web.AppConfig.DefaultString(
		"api_key",
		"",
	)

	return &CategoryService{
		BaseURL:  strings.TrimRight(baseURL, "/"),
		Username: username,
		Password: password,
		APIKey:   apiKey,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *CategoryService) BuildRequest(
	config models.TileConfig,
) (*http.Request, error) {

	params := url.Values{}

	// Required by the category API.
	// Without items=1, property IDs are not returned.
	params.Set("items", "1")

	if config.PT != "" {
		params.Set("pt", config.PT)
	}

	if config.Amenities != "" {
		params.Set("amenities", config.Amenities)
	}

	if config.Order != "" {
		params.Set("order", config.Order)
	}

	requestURL := s.BaseURL + categoryAPIPath

	if encodedParams := params.Encode(); encodedParams != "" {
		requestURL += "?" + encodedParams
	}

	req, err := http.NewRequest(http.MethodGet, requestURL, nil)
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth(s.Username, s.Password)

	if s.APIKey != "" {
		req.Header.Set("x-api-key", s.APIKey)
	}

	return req, nil
}

func (s *CategoryService) FetchProperties(
	config models.TileConfig,
) (*models.CategoryResponse, error) {

	req, err := s.BuildRequest(config)
	if err != nil {
		return nil, fmt.Errorf("build category request: %w", err)
	}

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("category API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK ||
		resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf(
			"category API returned HTTP status %d",
			resp.StatusCode,
		)
	}

	var result models.CategoryResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode category API response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf(
			"category API returned unsuccessful response: %s",
			result.Message,
		)
	}

	return &result, nil
}
