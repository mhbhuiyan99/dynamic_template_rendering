package services

import (
	"dynamic_template_rendering/models"
	"fmt"
	"strings"
)

type CategoryLocationService struct{}

func NewCategoryLocationService() *CategoryLocationService {
	return &CategoryLocationService{}
}

func (s *CategoryLocationService) Parse(path string) (models.CategoryLocation, error) {

	path = strings.Trim(path, "/")
	parts := strings.Split(path, "/")

	if len(parts) < 2 || parts[0] != "all" {
		return models.CategoryLocation{}, fmt.Errorf(
			"invalid category URL: %s", path,
		)
	}

	locationParts := parts[1:]

	for _, part := range locationParts {
		if strings.TrimSpace(part) == "" {
			return models.CategoryLocation{}, fmt.Errorf(
				"invalid category location",
			)
		}
	}

	keyword := strings.Join(locationParts, ":")

	return models.CategoryLocation{
		Keyword: keyword,
		Parts:   locationParts,
	}, nil
}
