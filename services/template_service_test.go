package services

import (
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
)

func TestFindTileBlocks(t *testing.T) {
	html := `
		<html>
			<body>
				<div data-block="property-tiles" id="ile57am">
					Tile 1
				</div>

				<div data-block="property-tiles" id="ipv1476">
					Tile 2
				</div>

				<div>
					Not a tile
				</div>
			</body>
		</html>
	`

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		t.Fatal(err)
	}

	service := NewTemplateService("")

	tiles := service.FindTileBlocks(doc)

	if tiles.Length() != 2 {
		t.Fatalf("expected 2 tile blocks, got %d", tiles.Length())
	}
}