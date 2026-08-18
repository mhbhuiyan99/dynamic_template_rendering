package services

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

func TestCategoryService_FetchProperties_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		assert.Equal(t, http.MethodGet, r.Method)
		assert.Equal(
			t,
			"/api/v1/category/details/usa:hawaii",
			r.URL.Path,
		)

		assert.Equal(t, "5-7", r.URL.Query().Get("pt"))
		assert.Equal(t, "1", r.URL.Query().Get("order"))

		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`{
			"Error": null,
			"Message": "",
			"Success": true,
			"Result": {
				"Items": []
			}
		}`))
	}))
	defer server.Close()

	service := &CategoryService{
		BaseURL: server.URL,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}

	config := models.TileConfig{
		PT:    "5-7",
		Order: "1",
	}

	result, err := service.FetchProperties(config)

	require.NoError(t, err)
	require.NotNil(t, result)

	assert.True(t, result.Success)
}

func TestCategoryService_FetchProperties_HTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {
		http.Error(
			w,
			`{"msg":"Unauthorized request."}`,
			http.StatusUnauthorized,
		)
	}))
	defer server.Close()

	service := &CategoryService{
		BaseURL: server.URL,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}

	config := models.TileConfig{
		PT:    "5-7",
		Order: "1",
	}

	result, err := service.FetchProperties(config)

	require.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "HTTP status 401")
}