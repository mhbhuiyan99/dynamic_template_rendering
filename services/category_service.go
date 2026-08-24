package services

import (
	"fmt"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/requests"
)

type CategoryService struct {
	categoryRequest *requests.CategoryRequest
}

func NewCategoryService(categoryRequest *requests.CategoryRequest) *CategoryService {
	return &CategoryService{categoryRequest: categoryRequest}
}

func (s *CategoryService) FetchProperties(
	config models.TileConfig,
) (*models.CategoryResponse, error) {
	if s == nil || s.categoryRequest == nil {
		return nil, fmt.Errorf("category service is not configured")
	}

	return s.categoryRequest.Fetch(config)
}

func (s *CategoryService) FetchNearby(
	keyword string,
	count int,
) (*models.CategoryResponse, error) {
	if s == nil || s.categoryRequest == nil {
		return nil, fmt.Errorf("category service is not configured")
	}

	return s.categoryRequest.FetchNearby(keyword, count)
}
