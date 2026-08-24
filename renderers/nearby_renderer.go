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

func RenderBreadcrumbs(
	breadcrumbs []models.CategoryBreadcrumb,
	currentName string,
	currentKeyword string,
) string {
	var builder strings.Builder
	currentSlug := strings.ReplaceAll(strings.ToLower(currentKeyword), ":", "/")
	validBreadcrumbs := make([]models.CategoryBreadcrumb, 0, len(breadcrumbs))
	for _, breadcrumb := range breadcrumbs {
		if strings.ToLower(strings.Trim(breadcrumb.Slug, "/")) == currentSlug {
			continue
		}
		validBreadcrumbs = append(validBreadcrumbs, breadcrumb)
	}

	for index, breadcrumb := range validBreadcrumbs {
		if breadcrumb.Name == "" || breadcrumb.Slug == "" {
			continue
		}
		if index > 0 {
			builder.WriteString(" &gt; ")
		}
		builder.WriteString(`<a class="breadcrubms" href="/all/`)
		builder.WriteString(escapeSlug(breadcrumb.Slug))
		builder.WriteString(`">`)
		builder.WriteString(template.HTMLEscapeString(breadcrumb.Name))
		builder.WriteString(`</a>`)
	}

	if currentName != "" {
		if len(validBreadcrumbs) > 0 {
			builder.WriteString(" &gt; ")
		}
		builder.WriteString(`<span class="breadcrubms active">`)
		builder.WriteString(template.HTMLEscapeString(currentName))
		builder.WriteString(`</span>`)
	}

	return builder.String()
}
