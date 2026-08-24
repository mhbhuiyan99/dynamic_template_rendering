package services

import (
	"strings"
	"testing"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/renderers"

	"github.com/agiledragon/gomonkey/v2"
	"github.com/stretchr/testify/assert"
)

func TestTemplateRenderService_Render(t *testing.T) {
	templateService := NewTemplateService("dummy.txt")
	tileService := &TileService{}
	tileRenderer := renderers.NewTileRenderer("http://example.com", "http://imageservice.example.com")

	service := NewTemplateRenderService(
		templateService,
		tileService,
		tileRenderer,
	)

	t.Run("successfully renders template with tile content", func(t *testing.T) {
		patches := gomonkey.NewPatches()
		defer patches.Reset()

		templateHTML := `
			<html>
				<body>
					<div
						data-block="property-tiles"
						id="ile57am"
					>
						Old content
					</div>
				</body>
			</html>
		`

		property := models.Property{
			ID:       "P-123",
			Name:     "Test Property",
			Image:    "test.jpg",
			Location: "Hawaii, USA",
			Price:    150,
		}

		patches.ApplyMethod(
			templateService,
			"LoadTemplate",
			func(*TemplateService) (string, error) {
				return templateHTML, nil
			},
		)

		patches.ApplyMethod(
			tileService,
			"GetProperties",
			func(*TileService, models.TileConfig) ([]models.Property, error) {
				return []models.Property{property}, nil
			},
		)

		patches.ApplyMethod(
			tileRenderer,
			"Render",
			func(*renderers.TileRenderer, []models.Property) (string, error) {
				return `<div class="generated-tile">Test Property</div>`, nil
			},
		)

		result, err := service.Render()

		assert.NoError(t, err)
		assert.True(
			t,
			strings.Contains(result, `class="generated-tile"`),
		)
		assert.Contains(t, result, "Test Property")
		assert.NotContains(t, result, "Old content")
	})
}

func TestTemplateRenderService_ClearsTileBlockWhenAPIRequestFails(t *testing.T) {
	templateService := NewTemplateService("dummy.txt")
	tileService := &TileService{}
	tileRenderer := renderers.NewTileRenderer("http://example.com", "http://imageservice.example.com")

	service := NewTemplateRenderService(
		templateService,
		tileService,
		tileRenderer,
	)

	patches := gomonkey.NewPatches()
	defer patches.Reset()

	patches.ApplyMethod(
		templateService,
		"LoadTemplate",
		func(*TemplateService) (string, error) {
			return `<div data-block="property-tiles" id="ile57am">Old content</div>`, nil
		},
	)
	patches.ApplyMethod(
		tileService,
		"GetProperties",
		func(*TileService, models.TileConfig) ([]models.Property, error) {
			return nil, assert.AnError
		},
	)

	result, err := service.Render()

	assert.NoError(t, err)
	assert.NotContains(t, result, "Old content")
}