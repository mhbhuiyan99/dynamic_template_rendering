package requests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"dynamic_template_rendering/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCategoryRequest_Fetch(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(
		responseWriter http.ResponseWriter,
		request *http.Request,
	) {
		assert.Equal(t, http.MethodGet, request.Method)
		assert.Equal(t, "/api/v1/category/details/usa", request.URL.Path)
		assert.Equal(t, "5-7", request.URL.Query().Get("pt"))
		assert.Equal(t, "1", request.URL.Query().Get("order"))

		username, password, ok := request.BasicAuth()
		assert.True(t, ok)
		assert.Equal(t, "user", username)
		assert.Equal(t, "pass", password)
		assert.Equal(t, "key", request.Header.Get("x-api-key"))

		_, _ = responseWriter.Write([]byte(`{
			"Success": true,
			"Result": {"Items": []}
		}`))
	}))
	defer server.Close()

	client := NewClient(server.URL, "user", "pass", "key")
	requestLayer := NewCategoryRequest(client)

	result, err := requestLayer.Fetch(models.TileConfig{
		PT:    "5-7",
		Order: "1",
	})

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.True(t, result.Success)
}

func TestCategoryRequest_FetchHTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(
		responseWriter http.ResponseWriter,
		_request *http.Request,
	) {
		responseWriter.WriteHeader(http.StatusUnauthorized)
	}))
	defer server.Close()

	requestLayer := NewCategoryRequest(NewClient(server.URL, "", "", ""))
	result, err := requestLayer.Fetch(models.TileConfig{PT: "5-7"})

	assert.Nil(t, result)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unexpected HTTP status: 401")
}
