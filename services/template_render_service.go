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

	// Process every tile configuration.
	for _, tileConfig := range config.TileConfigs {
		if tileConfig.TilesBlockID == "" {
			continue
		}

		properties, err := s.tileService.GetProperties(tileConfig)
		if err != nil {
			// One tile failing should not stop the whole page.
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

	// Return the final HTML.
	return s.templateService.RenderHTML(doc)
}
