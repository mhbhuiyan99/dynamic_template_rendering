package services

import (
	"testing"

	"dynamic_template_rendering/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCategoryService_BuildRequest(t *testing.T) {
	service := &CategoryService{
		BaseURL: "https://example.com",
	}

	config := models.TileConfig{
		PT:        "5-7",
		Amenities: "",
		Order:     "1",
	}

	req, err := service.BuildRequest(config)

	require.NoError(t, err)
	require.NotNil(t, req)

	assert.Equal(t, "GET", req.Method)
	assert.Equal(
		t,
		"https://example.com/api/v1/category/details/usa:hawaii",
		req.URL.Scheme+"://"+req.URL.Host+req.URL.Path,
	)

	assert.Equal(t, "5-7", req.URL.Query().Get("pt"))
	assert.Equal(t, "1", req.URL.Query().Get("order"))
	assert.Empty(t, req.URL.Query().Get("amenities"))
}

func TestCategoryService_BuildRequest_EmptyParameters(t *testing.T) {
	service := &CategoryService{
		BaseURL: "https://example.com",
	}

	config := models.TileConfig{
		PT:        "",
		Amenities: "",
		Order:     "",
	}

	req, err := service.BuildRequest(config)

	require.NoError(t, err)
	require.NotNil(t, req)

	assert.Equal(
		t,
		"https://example.com/api/v1/category/details/usa:hawaii",
		req.URL.String(),
	)
}