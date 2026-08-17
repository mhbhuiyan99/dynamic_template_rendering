package services

import (
	"path/filepath"
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

func TestFindTileBlock(t *testing.T) {
	templatePath := filepath.Join("..", "views", "custom_template.txt")

	service := NewTemplateService(templatePath)

	content, err := service.LoadTemplate()
	if err != nil {
		t.Fatal(err)
	}

	doc, err := service.ParseHTML(content)
	if err != nil {
		t.Fatal(err)
	}

	block := service.FindTileBlock(doc, "ile57am")

	if block.Length() != 1 {
		t.Fatalf("expected 1 tile block, got %d", block.Length())
	}

	id, exists := block.Attr("id")

	if !exists {
		t.Fatal("tile block does not have an id")
	}

	if id != "ile57am" {
		t.Fatalf("expected ile57am, got %s", id)
	}
}

func TestGetTileBlockIDs(t *testing.T) {
	templatePath := filepath.Join("..", "views", "custom_template.txt")

	service := NewTemplateService(templatePath)

	content, err := service.LoadTemplate()
	if err != nil {
		t.Fatal(err)
	}

	doc, err := service.ParseHTML(content)
	if err != nil {
		t.Fatal(err)
	}

	blockIDs := service.GetTileBlockIDs(doc)

	t.Logf("Found tile blocks: %v", blockIDs)

	if len(blockIDs) != 7 {
		t.Fatalf("expected 7 tile blocks, got %d", len(blockIDs))
	}
}

func TestReplaceTileBlockContent(t *testing.T) {
	html := `
<html>
<body>

<div
    data-block="property-tiles"
    id="ile57am"
    class="pres__tiles-container"
>
    <div class="tiles-wrapper">
        OLD CONTENT
    </div>
</div>

<footer>
    Keep me
</footer>

</body>
</html>
`

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		t.Fatal(err)
	}

	service := NewTemplateService("")

	newHTML := `
<div class="tiles-wrapper">
    <div class="tiles-item">
        NEW PROPERTY
    </div>
</div>
`

	err = service.ReplaceTileBlockContent(
		doc,
		"ile57am",
		newHTML,
	)

	if err != nil {
		t.Fatal(err)
	}

	// Verify the old content is gone.
	if strings.Contains(doc.Text(), "OLD CONTENT") {
		t.Fatal("old content still exists")
	}

	// Verify new content exists.
	if !strings.Contains(doc.Text(), "NEW PROPERTY") {
		t.Fatal("new content was not inserted")
	}

	// Verify unrelated HTML still exists.
	if !strings.Contains(doc.Text(), "Keep me") {
		t.Fatal("unrelated content was removed")
	}
}

