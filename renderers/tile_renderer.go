package renderers

import (
	"fmt"
	"html/template"
	"strings"

	"dynamic_template_rendering/models"
)

const propertyImagesAPIPath = "/api/property/images/v1"

type TileRenderer struct {
	baseURL      string
	imageBaseURL string
}

func NewTileRenderer(baseURL string, imageBaseURL string) *TileRenderer {
	return &TileRenderer{
		baseURL:      strings.TrimRight(baseURL, "/"),
		imageBaseURL: strings.TrimRight(imageBaseURL, "/"),
	}
}

func (r *TileRenderer) buildImageURL(imageName string) string {
	if imageName == "" {
		return ""
	}

	return r.imageBaseURL + "/" + imageName
}

func (r *TileRenderer) Render(properties []models.Property) (string, error) {
	var builder strings.Builder

	for index, property := range properties {
		builder.WriteString(r.renderPropertyTile(property, index))
	}

	return builder.String(), nil
}

func (r *TileRenderer) renderPropertyTile(
	property models.Property,
	index int,
) string {
	image := template.HTMLEscapeString(
		r.buildImageURL(property.Image),
	)
	if image == "" {
		image = "/static/img/property-placeholder.svg"
	}

	name := template.HTMLEscapeString(property.Name)
	if name == "" {
		name = "Property"
	}

	location := template.HTMLEscapeString(property.Location)
	if location == "" {
		location = "Location unavailable"
	}

	price := "Price unavailable"
	if property.Price > 0 {
		price = fmt.Sprintf("$%.2f", property.Price)
	}

	return fmt.Sprintf(`
<div
	data-id="%s"
	data-index="%d"
	data-counter="%d"
	id="js-item-%d"
	class="pointer tile-container js-property-tile"
>
	<div
		id="js-%s-border"
		class="pres__property-tiles sp-property-card"
	>
		<div class="pres__tiles-icons tiles-icons absolute">
			<div
				title="Bookmark"
				class="pres__tiles-icon"
			>
				<img
					src="/images/heart_icon.png"
					alt="Heart Icon"
					width="16"
					height="14"
				/>
			</div>
		</div>

		<div class="image-section pres__image-section relative">
			<img
				class="pres__property-image"
				src="%s"
				alt="%s"
			/>
		</div>

		<div class="pres__property-info">
			<h3 class="pres__property-title">%s</h3>
			<div class="pres__property-location">%s</div>
			<div class="pres__property-price">%s</div>
		</div>
	</div>
</div>
`,
		property.ID,
		index,
		index,
		index,
		property.ID,
		image,
		name,
		name,
		location,
		price,
	)
}
