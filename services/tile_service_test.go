package services

import (
	"errors"
	"testing"

	"dynamic_template_rendering/models"

	"github.com/agiledragon/gomonkey/v2"
	"github.com/stretchr/testify/assert"
)

func TestTileService_GetProperties(t *testing.T) {
	categoryService := &CategoryService{}
	service := NewTileService(categoryService)

	t.Run("successfully converts and limits properties", func(t *testing.T) {
		config := models.TileConfig{
			TilesPerPage: 2,
			TotalTiles:   2,
		}

		response := models.CategoryResponse{
			Success: true,
			Result: models.CategoryResult{
				Items: []models.CategoryItem{
					{
						ID: "P1",
						GeoInfo: models.GeoInfo{
							Display: "Hawaii, USA",
						},
						Property: models.PropertyData{
							PropertyName: "Ocean View Villa",
							FeatureImage: "villa.jpg",
							Price:        250,
						},
					},
					{
						ID: "P2",
						GeoInfo: models.GeoInfo{
							Display: "Maui, USA",
						},
						Property: models.PropertyData{
							PropertyName: "Beach House",
							FeatureImage: "beach.jpg",
							Price:        300,
						},
					},
					{
						ID: "P3",
						GeoInfo: models.GeoInfo{
							Display: "Kauai, USA",
						},
						Property: models.PropertyData{
							PropertyName: "Mountain House",
							FeatureImage: "mountain.jpg",
							Price:        200,
						},
					},
				},
			},
		}

		patches := gomonkey.ApplyMethod(
			categoryService,
			"FetchProperties",
			func(_ *CategoryService, _ models.TileConfig) (*models.CategoryResponse, error) {
				return &response, nil
			},
		)
		defer patches.Reset()

		properties, err := service.GetProperties(config)

		assert.NoError(t, err)
		assert.Len(t, properties, 2)

		assert.Equal(t, "P1", properties[0].ID)
		assert.Equal(t, "Ocean View Villa", properties[0].Name)
		assert.Equal(t, "villa.jpg", properties[0].Image)
		assert.Equal(t, "Hawaii, USA", properties[0].Location)
		assert.Equal(t, 250.0, properties[0].Price)

		assert.Equal(t, "P2", properties[1].ID)
		assert.Equal(t, "Beach House", properties[1].Name)
	})

	t.Run("returns empty properties when TilesPerPage is zero", func(t *testing.T) {
		config := models.TileConfig{
			TilesPerPage: 0,
		}

		properties, err := service.GetProperties(config)

		assert.NoError(t, err)
		assert.Empty(t, properties)
	})

	t.Run("returns empty properties when TilesPerPage is negative", func(t *testing.T) {
		config := models.TileConfig{
			TilesPerPage: -1,
		}

		properties, err := service.GetProperties(config)

		assert.NoError(t, err)
		assert.Empty(t, properties)
	})

	t.Run("returns error when Category API fails", func(t *testing.T) {
		config := models.TileConfig{
			TilesPerPage: 4,
		}

		expectedErr := errors.New("category API unavailable")

		patches := gomonkey.ApplyMethod(
			categoryService,
			"FetchProperties",
			func(_ *CategoryService, _ models.TileConfig) (*models.CategoryResponse, error) {
				return &models.CategoryResponse{}, expectedErr
			},
		)
		defer patches.Reset()

		properties, err := service.GetProperties(config)

		assert.Error(t, err)
		assert.Nil(t, properties)
		assert.ErrorIs(t, err, expectedErr)
	})

	t.Run("returns all properties when API returns fewer than limit", func(t *testing.T) {
		config := models.TileConfig{
			TilesPerPage: 4,
		}

		response := models.CategoryResponse{
			Success: true,
			Result: models.CategoryResult{
				Items: []models.CategoryItem{
					{
						ID: "P1",
						Property: models.PropertyData{
							PropertyName: "Villa",
						},
					},
				},
			},
		}

		patches := gomonkey.ApplyMethod(
			categoryService,
			"FetchProperties",
			func(_ *CategoryService, _ models.TileConfig) (*models.CategoryResponse, error) {
				return &response, nil
			},
		)
		defer patches.Reset()

		properties, err := service.GetProperties(config)

		assert.NoError(t, err)
		assert.Len(t, properties, 1)
		assert.Equal(t, "P1", properties[0].ID)
	})
}