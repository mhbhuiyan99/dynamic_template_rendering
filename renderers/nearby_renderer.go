package renderers

import (
	"html/template"
	"net/url"
	"strings"

	"dynamic_template_rendering/models"
)

// RenderNearbyLocations preserves the classes used by the supplied widget.
func RenderNearbyLocations(locations []models.NearbyCity) string {
	var builder strings.Builder

	for _, location := range locations {
		name := location.Name
		if name == "" {
			name = location.Display
		}
		if name == "" || location.Slug == "" {
			continue
		}

		builder.WriteString(`<div content-type="nearby-rental-item" class="nearby-rental-item">`)
		builder.WriteString(`<h2 class="nearby-rental-location">`)
		builder.WriteString(template.HTMLEscapeString(name))
		builder.WriteString(`</h2><a href="/all/`)
		builder.WriteString(escapeSlug(location.Slug))
		builder.WriteString(`" class="nearby-rental-button">`)
		builder.WriteString(template.HTMLEscapeString(strings.ToUpper(name)))
		builder.WriteString(` VACATION RENTALS</a></div>`)
	}

	return builder.String()
}

func escapeSlug(slug string) string {
	parts := strings.Split(strings.Trim(slug, "/"), "/")
	for index, part := range parts {
		parts[index] = url.PathEscape(part)
	}
	return strings.Join(parts, "/")
}
