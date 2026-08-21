package services

import (
	"errors"
	"testing"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/requests"

	"github.com/agiledragon/gomonkey/v2"
	"github.com/stretchr/testify/assert"
)

func TestCategoryService_FetchProperties(t *testing.T) {
	categoryRequest := requests.NewCategoryRequest(nil)
	service := NewCategoryService(categoryRequest)
	expected := errors.New("category API unavailable")

	patches := gomonkey.ApplyMethod(
		categoryRequest,
		"Fetch",
		func(*requests.CategoryRequest, models.TileConfig) (*models.CategoryResponse, error) {
			return nil, expected
		},
	)
	defer patches.Reset()

	result, err := service.FetchProperties(models.TileConfig{TilesPerPage: 4})

	assert.Nil(t, result)
	assert.ErrorIs(t, err, expected)
}
