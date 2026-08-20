package services

import (
	"fmt"

	"dynamic_template_rendering/config"
	"dynamic_template_rendering/renderers"
)

type TemplateRenderService struct {
	templateService *TemplateService
	tileService     *TileService
	tileRenderer    *renderers.TileRenderer
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

	// Load the original HTML template.
	content, err := s.templateService.LoadTemplate()
	if err != nil {
		return "", err
	}

	// Parse the HTML so we can find and replace tile blocks.
	doc, err := s.templateService.ParseHTML(content)
	if err != nil {
		return "", err
	}
	

	for _, tileConfig := range config.TileConfigs {
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
		fmt.Printf(
	"Tile block %s: API returned %d properties\n",
	tileConfig.TilesBlockID,
	len(properties),
)

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
	content, err := s.Render()
	if err != nil {
		return "", err
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">

	<link
		rel="stylesheet"
		href="https://cdn.123presto.com/canary/preview/category-template-latest/category-template-latest-template-css-file.css?v=1.3000000000000003"
	>

	<link
		rel="stylesheet"
		href="https://cdn.123presto.com/canary/preview/category-template-latest/category-template-latest-css-file.css?v=1.3000000000000003"
	>

	<script
		src="https://cdn.123presto.com/canary/preview/category-template-latest/category-template-latest-js-file.js?v=1.3000000000000003"
		defer
	></script>
</head>
<body>
` + content + `
</body>
</html>`, nil
}
