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

	// TilesPerPage controls the row width; TotalTiles controls the full result.
	limit := config.TotalTiles
	if limit <= 0 {
		limit = config.TilesPerPage
	}

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

func (s *TileService) GetNearby(
	keyword string,
	count int,
) ([]models.NearbyCity, error) {
	response, err := s.GetNearbyResponse(keyword, count)
	if err != nil {
		return nil, err
	}

	nearbyCities := response.NearbyCities.Items
	if len(nearbyCities) == 0 {
		nearbyCities = response.Result.NearbyCities.Items
	}

	return nearbyCities, nil
}

func (s *TileService) GetNearbyResponse(
	keyword string,
	count int,
) (*models.CategoryResponse, error) {
	if s == nil || s.categoryService == nil {
		return nil, fmt.Errorf("tile service is not configured")
	}

	response, err := s.categoryService.FetchNearby(keyword, count)
	if err != nil {
		return nil, fmt.Errorf("fetch nearby locations: %w", err)
	}

	return response, nil
}
