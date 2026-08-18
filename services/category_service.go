package services

import (
	"net/http"
	"net/url"
	"strings"

	"dynamic_template_rendering/models"

	"github.com/beego/beego/v2/server/web"
)

const categoryAPIPath = "/api/v1/category/details/usa:hawaii"

type CategoryService struct {
	BaseURL string
	Client  *http.Client
}

func NewCategoryService() *CategoryService {
	baseURL := web.AppConfig.DefaultString(
		"category_api_base_url",
		"",
	)

	return &CategoryService{
		BaseURL: strings.TrimRight(baseURL, "/"),
		Client:  &http.Client{},
	}
}

func (s *CategoryService) BuildRequest(
	config models.TileConfig,
) (*http.Request, error) {

	params := url.Values{}

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

	return http.NewRequest(http.MethodGet, requestURL, nil)
}