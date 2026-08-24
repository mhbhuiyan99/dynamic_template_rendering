package renderers

import (
	"fmt"
	"html/template"
	"net/url"
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
	if strings.HasPrefix(imageName, "http://") ||
		strings.HasPrefix(imageName, "https://") {
		return imageName
	}

	return r.imageBaseURL + "/" + imageName
}

func (r *TileRenderer) Render(properties []models.Property) (string, error) {
	var builder strings.Builder
	builder.WriteString(`
<div class="tiles-wrapper">
	<div data-per_page="4" class="tiles-item tile-slider">
		<div class="pres__row-container">
`)

	for index, property := range properties {
		builder.WriteString(r.renderPropertyTile(property, index))
	}

	builder.WriteString(`
		</div>
	</div>
</div>
`)

	return builder.String(), nil
}

func (r *TileRenderer) renderPropertyTile(
	property models.Property,
	index int,
) string {
	id := template.HTMLEscapeString(property.ID)
	image := template.HTMLEscapeString(
		r.buildImageURL(property.Image),
	)
	placeholderImage := "/static/img/property-placeholder.svg"
	if image == "" {
		image = placeholderImage
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

	propertyURL := "#"
	if property.Slug != "" && property.ID != "" {
		propertyURL = r.baseURL + "/property/" + url.PathEscape(property.Slug) + "/" + url.PathEscape(property.ID)
	}
	propertyURL = template.HTMLEscapeString(propertyURL)
	locationURL := ""
	if property.LocationSlug != "" {
		locationURL = "/all/" + escapeSlug(property.LocationSlug)
	}
	locationURL = template.HTMLEscapeString(locationURL)

	propertyType := template.HTMLEscapeString(property.PropertyType)
	attribute := template.HTMLEscapeString(property.PropertyAttribute)
	partnerURL := template.HTMLEscapeString(property.PartnerURL)
	ctaURL := partnerURL
	if ctaURL == "" {
		ctaURL = propertyURL
	}

	return fmt.Sprintf(`
<div
	data-id="%s"
	data-index="%d"
	data-counter="%d"
	id="js-item-%d"
	class="pointer tile-container js-property-tile"
>
	<div id="js-%s-border" class="pres__property-tiles sp-property-card">
		<div class="image-section pres__image-section relative">
			<img
				class="pres__property-image"
				src="%s"
				alt="%s"
				onerror="this.onerror=null;this.src='%s'"
			/>
			<button class="tile-favorite" type="button" data-property-id="%s" aria-label="Save property" aria-pressed="false">&#9825;</button>
		</div>

		<div class="pres__property-info">
			%s
			<h3 class="pres__property-title"><a href="%s">%s</a></h3>
			<div class="pres__property-location">%s</div>
			%s
			%s
			<div class="tile-footer">
				<div class="tile-price">
					<div class="pres__property-price">%s</div>
					<span class="price-period">/night</span>
				</div>
				<div class="tile-deal">
					%s
					<a class="tile-cta" href="%s">VIEW DEAL</a>
				</div>
			</div>
		</div>
	</div>
</div>
`,
		id,
		index,
		index,
		index,
		id,
		image,
		name,
		placeholderImage,
		id,
		optionalType(propertyType),
		propertyURL,
		name,
		renderPropertyLocation(location, locationURL),
		optionalRating(property.ReviewScore, property.ReviewCount),
		optionalDetails(propertyType, attribute, property.Counts),
		price,
		optionalPartner(property.Feed),
		ctaURL,
	)
}

func renderPropertyLocation(location, locationURL string) string {
	if locationURL == "" {
		return location
	}

	return `<a href="` + locationURL + `">` + location + `</a>`
}

func optionalType(propertyType string) string {
	if propertyType == "" {
		return ""
	}
	return `<div class="property-type">` + propertyType + `</div>`
}

func optionalRating(score float64, count int) string {
	if score <= 0 && count <= 0 {
		return ""
	}
	if count > 0 {
		return fmt.Sprintf(`<div class="property-rating"><span class="rating-score">%s</span> <span class="rating-label">%s</span> <span class="review-count">(%d Reviews)</span></div>`, ratingStars(score), ratingLabel(score), count)
	}
	return fmt.Sprintf(`<div class="property-rating"><span class="rating-score">%s</span> <span class="rating-label">%s</span></div>`, ratingStars(score), ratingLabel(score))
}

func ratingStars(score float64) string {
	if score <= 0 {
		return ""
	}
	return "★★★★★"
}

func ratingLabel(score float64) string {
	switch {
	case score >= 9:
		return "Exceptional"
	case score >= 8:
		return "Excellent"
	default:
		return fmt.Sprintf("%.1f", score)
	}
}

func optionalDetails(propertyType, attribute string, counts models.Counts) string {
	parts := make([]string, 0, 4)
	if attribute != "" {
		parts = append(parts, attribute)
	}
	if counts.Bedroom > 0 {
		parts = append(parts, fmt.Sprintf("%d Bedrooms", counts.Bedroom))
	}
	if counts.Bathroom > 0 {
		parts = append(parts, fmt.Sprintf("%d Bathrooms", counts.Bathroom))
	}
	if counts.Occupancy > 0 {
		parts = append(parts, fmt.Sprintf("%d Guests", counts.Occupancy))
	}
	if len(parts) == 0 || propertyType != "" && len(parts) == 1 && parts[0] == propertyType {
		return ""
	}
	return `<div class="property-meta">` + template.HTMLEscapeString(strings.Join(parts, " | ")) + `</div>`
}

func optionalPartner(feed int) string {
	logoPath := ""
	provider := ""
	switch feed {
	case 24:
		logoPath = "/static/img/expedia.svg"
		provider = "Expedia"
	case 11:
		logoPath = "/static/img/booking.svg"
		provider = "Booking.com"
	case 12:
		logoPath = "/static/img/vrbo.svg"
		provider = "Vrbo"
	default:
		return ""
	}

	return fmt.Sprintf(
		`<span class="tile-provider"><img src="%s" alt="%s" /></span>`,
		template.HTMLEscapeString(logoPath),
		template.HTMLEscapeString(provider),
	)
}
