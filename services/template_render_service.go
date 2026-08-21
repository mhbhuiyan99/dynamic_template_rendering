package services

import (
	"fmt"

	"dynamic_template_rendering/config"
	"dynamic_template_rendering/models"
	"dynamic_template_rendering/renderers"
)

type TemplateRenderService struct {
	templateService *TemplateService
	tileService     *TileService
	tileRenderer    *renderers.TileRenderer
}

type templateData struct {
	LocationName string
}

func configuredLocationName(tileConfigs []models.TileConfig) string {
	for _, tileConfig := range tileConfigs {
		if tileConfig.Keyword != "" {
			return tileConfig.Keyword
		}
	}

	return ""
}

func NewTemplateRenderService(
	templateService *TemplateService,
	tileService *TileService,
	tileRenderer *renderers.TileRenderer,
) *TemplateRenderService {
	return &TemplateRenderService{
		templateService: templateService,
		tileService:     tileService,
		tileRenderer:    tileRenderer,
	}
}

func (s *TemplateRenderService) Render() (string, error) {
	return s.render("")
}

func (s *TemplateRenderService) RenderForLocation(location string) (string, error) {
	if location == "" {
		return "", fmt.Errorf("category location is empty")
	}

	return s.render(location)
}

func (s *TemplateRenderService) render(location string) (string, error) {
	if s == nil {
		return "", fmt.Errorf("template render service is nil")
	}

	if s.templateService == nil {
		return "", fmt.Errorf("template service is nil")
	}

	if s.tileService == nil {
		return "", fmt.Errorf("tile service is nil")
	}

	if s.tileRenderer == nil {
		return "", fmt.Errorf("tile renderer is nil")
	}

	tileConfigs := make([]models.TileConfig, len(config.TileConfigs))
	copy(tileConfigs, config.TileConfigs)
	if location != "" {
		for index := range tileConfigs {
			tileConfigs[index].Keyword = location
		}
	}

	// Execute the .txt file as a Go template before parsing its HTML structure.
	content, err := s.templateService.LoadTemplate()
	if err != nil {
		return "", err
	}

	content, err = s.templateService.ExecuteTemplate(content, templateData{
		LocationName: configuredLocationName(tileConfigs),
	})
	if err != nil {
		return "", err
	}

	// Parse the HTML so we can find and replace tile blocks.
	doc, err := s.templateService.ParseHTML(content)
	if err != nil {
		return "", err
	}

	for _, tileConfig := range tileConfigs {
		if tileConfig.TilesBlockID == "" {
			continue
		}

		properties, err := s.tileService.GetProperties(tileConfig)
		if err != nil {
			fmt.Printf(
				"failed to get properties for tile block %s: %v\n",
				tileConfig.TilesBlockID,
				err,
			)
			continue
		}

		tileHTML, err := s.tileRenderer.Render(properties)
		if err != nil {
			fmt.Printf(
				"failed to render tile block %s: %v\n",
				tileConfig.TilesBlockID,
				err,
			)
			continue
		}

		err = s.templateService.ReplaceTileBlockContent(
			doc,
			tileConfig.TilesBlockID,
			tileHTML,
		)
		if err != nil {
			fmt.Printf(
				"failed to replace tile block %s: %v\n",
				tileConfig.TilesBlockID,
				err,
			)
		}
	}

	return s.templateService.RenderHTML(doc)
}

func (s *TemplateRenderService) RenderPage() (string, error) {
	return s.renderPage(s.Render())
}

func (s *TemplateRenderService) RenderPageForLocation(location string) (string, error) {
	return s.renderPage(s.RenderForLocation(location))
}

func (s *TemplateRenderService) renderPage(content string, err error) (string, error) {
	if err != nil {
		return "", err
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">

	<link
		rel="stylesheet"
		href="/static/css/category-template-base.css"
	>

	<link
		rel="stylesheet"
		href="/static/css/category-template.css"
	>

	<link
		rel="stylesheet"
		href="/static/css/tile-overrides.css"
	>

	<script
		src="/static/js/category-template.js"
		defer
	></script>
</head>
<body>
` + content + `
</body>
</html>`, nil
}
