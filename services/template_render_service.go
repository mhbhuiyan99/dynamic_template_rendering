package services

import (
	"fmt"
	"strings"

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

type tileFetchResult struct {
	index      int
	properties []models.Property
	err        error
}

func configuredLocationName(tileConfigs []models.TileConfig) string {
	for _, tileConfig := range tileConfigs {
		if tileConfig.Keyword != "" {
			return formatLocationName(tileConfig.Keyword)
		}
	}

	return ""
}

func formatLocationName(location string) string {
	parts := strings.Split(location, ":")
	for index, part := range parts {
		if part == "" {
			continue
		}
		parts[index] = strings.ToUpper(part[:1]) + strings.ToLower(part[1:])
	}

	return strings.Join(parts, ": ")
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

	locationName := configuredLocationName(tileConfigs)
	var nearbyLocations []models.NearbyCity
	var breadcrumbs []models.CategoryBreadcrumb
	breadcrumbName := ""
	if location != "" {
		breadcrumbs, breadcrumbName = renderers.RequestedBreadcrumbs(location)
		nearbyResponse, err := s.tileService.GetNearbyResponse(location, 12)
		if err != nil {
			fmt.Printf("failed to get nearby locations: %v\n", err)
		} else {
			locationName = nearbyResponse.GeoInfo.Name
			nearbyLocations = nearbyResponse.NearbyCities.Items
			if len(nearbyLocations) == 0 {
				nearbyLocations = nearbyResponse.Result.NearbyCities.Items
			}
		}
	}
	if locationName == "" {
		locationName = configuredLocationName(tileConfigs)
	}

	// Execute the .txt file as a Go template before parsing its HTML structure.
	content, err := s.templateService.LoadTemplate()
	if err != nil {
		return "", err
	}

	content, err = s.templateService.ExecuteTemplate(content, templateData{
		LocationName: locationName,
	})
	if err != nil {
		return "", err
	}

	// Parse the HTML so we can find and replace tile blocks.
	doc, err := s.templateService.ParseHTML(content)
	if err != nil {
		return "", err
	}

	results := make(chan tileFetchResult, len(tileConfigs))
	requestedTiles := 0
	for index, tileConfig := range tileConfigs {
		if tileConfig.TilesBlockID == "" {
			continue
		}

		requestedTiles++
		go func(index int, tileConfig models.TileConfig) {
			properties, err := s.tileService.GetProperties(tileConfig)
			results <- tileFetchResult{
				index:      index,
				properties: properties,
				err:        err,
			}
		}(index, tileConfig)
	}

	fetchedTiles := make([]tileFetchResult, len(tileConfigs))
	for index := 0; index < requestedTiles; index++ {
		result := <-results
		fetchedTiles[result.index] = result
	}
	close(results)

	for index, tileConfig := range tileConfigs {
		if tileConfig.TilesBlockID == "" {
			continue
		}

		result := fetchedTiles[index]
		if result.err != nil {
			fmt.Printf(
				"failed to get properties for tile block %s: %v\n",
				tileConfig.TilesBlockID,
				result.err,
			)
			if replaceErr := s.templateService.ReplaceTileBlockContent(
				doc,
				tileConfig.TilesBlockID,
				"",
			); replaceErr != nil {
				fmt.Printf(
					"failed to clear tile block %s: %v\n",
					tileConfig.TilesBlockID,
					replaceErr,
				)
			}
			continue
		}

		tileHTML, err := s.tileRenderer.Render(result.properties)
		if err != nil {
			fmt.Printf(
				"failed to render tile block %s: %v\n",
				tileConfig.TilesBlockID,
				err,
			)
			if replaceErr := s.templateService.ReplaceTileBlockContent(
				doc,
				tileConfig.TilesBlockID,
				"",
			); replaceErr != nil {
				fmt.Printf(
					"failed to clear tile block %s: %v\n",
					tileConfig.TilesBlockID,
					replaceErr,
				)
			}
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

	if location != "" {
		if err := s.templateService.ReplaceNearbyLocations(
			doc,
			renderers.RenderNearbyLocations(nearbyLocations),
		); err != nil {
			fmt.Printf("failed to replace nearby locations: %v\n", err)
		}
		if err := s.templateService.ReplaceBreadcrumbs(
			doc,
			renderers.RenderBreadcrumbs(breadcrumbs, breadcrumbName, location),
		); err != nil {
			fmt.Printf("failed to replace breadcrumbs: %v\n", err)
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

	<script
		src="/static/js/fav-icon.js"
		defer
	></script>
</head>
<body>
` + content + `
</body>
</html>`, nil
}
