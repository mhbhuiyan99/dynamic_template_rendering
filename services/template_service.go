package services

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type TemplateService struct {
	templatePath string
}

func NewTemplateService(templatePath string) *TemplateService {
	return &TemplateService{
		templatePath: templatePath,
	}
}

func (s *TemplateService) LoadTemplate() (string, error) {
	content, err := os.ReadFile(s.templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to read template: %w", err)
	}

	return string(content), nil
}

func (s *TemplateService) ExecuteTemplate(
	content string,
	data interface{},
) (string, error) {
	tmpl, err := template.New("custom-template").Parse(content)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	var rendered bytes.Buffer
	if err := tmpl.Execute(&rendered, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return rendered.String(), nil
}

func (s *TemplateService) ParseHTML(content string) (*goquery.Document, error) {
	reader := strings.NewReader(content)

	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	return doc, nil
}

func (s *TemplateService) FindTileBlocks(
	doc *goquery.Document,
) *goquery.Selection {

	return doc.Find(`[data-block="property-tiles"]`)
}

func (s *TemplateService) FindTileBlock(
	doc *goquery.Document,
	blockID string,
) *goquery.Selection {
	var block *goquery.Selection

	doc.Find(`[data-block="property-tiles"]`).EachWithBreak(
		func(_ int, selection *goquery.Selection) bool {
			id, exists := selection.Attr("id")
			if exists && id == blockID {
				block = selection
				return false
			}

			return true
		},
	)

	if block == nil {
		return doc.Find("#__missing_tile_block__")
	}

	return block
}

func (s *TemplateService) GetTileBlockIDs(doc *goquery.Document) []string {
	var blockIDs []string

	doc.Find(`[data-block="property-tiles"]`).Each(func(_ int, selection *goquery.Selection) {
		id, exists := selection.Attr("id")

		if exists && id != "" {
			blockIDs = append(blockIDs, id)
		}
	})

	return blockIDs
}

func (s *TemplateService) ReplaceTileBlockContent(
	doc *goquery.Document,
	blockID string,
	newHTML string,
) error {

	block := s.FindTileBlock(doc, blockID)

	if block.Length() == 0 {
		return fmt.Errorf("tile block with ID '%s' not found", blockID)
	}

	block.Empty()
	block.AppendHtml(newHTML)

	return nil
}

func (s *TemplateService) RenderHTML(doc *goquery.Document) (string, error) {
	html, err := goquery.OuterHtml(doc.Selection)
	if err != nil {
		return "", fmt.Errorf("failed to render HTML: %w", err)
	}

	return html, nil
}
