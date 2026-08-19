package services

import (
	"fmt"
	"html/template"
	"strings"

	"dynamic_template_rendering/models"
)

type TileRenderer struct {}

func NewTileRenderer() *TileRenderer {
	return &TileRenderer{}
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

	image := template.HTMLEscapeString(property.Image)
	name := template.HTMLEscapeString(property.Name)
	location := template.HTMLEscapeString(property.Location)

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
			<div class="pres__property-price">$%.2f</div>
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
		property.Price,
	)
}