package services

import (
	"fmt"
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