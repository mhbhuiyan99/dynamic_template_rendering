package services

import (
	"dynamic_template_rendering/models"
	"fmt"
)

type TileService struct {
	categoryService *CategoryService
}

func NewTileService(categoryService *CategoryService) *TileService {
	return &TileService{
		categoryService: categoryService,
	}
}

func (s *TileService) GetProperties(
	config models.TileConfig,
) ([]models.Property, error) {

	if config.TilesPerPage <= 0 {
		return []models.Property{}, nil
	}

	response, err := s.categoryService.FetchProperties(config)
	if err != nil {
		return nil, fmt.Errorf("fetch properties: %w", err)
	}

	items := response.Result.Items

	limit := config.TilesPerPage

	if len(items) > limit {
		items = items[:limit]
	}

	properties := make([]models.Property, 0, len(items))

	for _, item := range items {
		properties = append(
			properties,
			models.ToProperty(item),
		)
	}

	return properties, nil
}