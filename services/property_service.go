package services

import (
	"fmt"
	"sync"

	"dynamic_template_rendering/models"
	"dynamic_template_rendering/requests"
)

const propertyDetailsBatchSize = 50

type PropertyService struct {
	request      *requests.PropertyRequest
	imageBaseURL string
}

func NewPropertyService(
	request *requests.PropertyRequest,
	imageBaseURL string,
) *PropertyService {
	return &PropertyService{
		request:      request,
		imageBaseURL: imageBaseURL,
	}
}

func (s *PropertyService) GetProperties(
	category string,
	countryCode string,
	order string,
	dateStart string,
	dateEnd string,
	pax string,
	amount string,
	amenities []string,
	petFriendly string,
	ecoFriendly string,
) (*models.PropertyListResponse, error) {

	if s == nil || s.request == nil {
		return nil, fmt.Errorf("property service is not configured")
	}

	return s.request.GetProperties(
		category,
		countryCode,
		order,
		dateStart,
		dateEnd,
		pax,
		amount,
		amenities,
		petFriendly,
		ecoFriendly,
	)
}

func (s *PropertyService) GetPropertyDetails(
	propertyIDs []string,
) (*models.PropertyDetailsResponse, error) {

	if s == nil || s.request == nil {
		return nil, fmt.Errorf("property service is not configured")
	}

	chunks := chunkStrings(propertyIDs, propertyDetailsBatchSize)

	merged := &models.PropertyDetailsResponse{
		Success: true,
		Result: models.PropertyDetailsResult{
			ItemsByID: make(map[string]models.PartnerInfo),
		},
	}

	type batchResult struct {
		Index int
		Data  *models.PropertyDetailsResponse
		Err   error
	}

	results := make(chan batchResult, len(chunks))
	var wg sync.WaitGroup

	for index, ids := range chunks {
		wg.Add(1)
		go func(idx int, batchIDs []string) {
			defer wg.Done()
			data, err := s.request.GetPropertyDetails(batchIDs)
			results <- batchResult{Index: idx, Data: data, Err: err}
		}(index, ids)
	}

	wg.Wait()
	close(results)

	ordered := make([]*models.PropertyDetailsResponse, len(chunks))
	for result := range results {
		if result.Err != nil {
			return nil, result.Err
		}
		ordered[result.Index] = result.Data
	}

	for _, batch := range ordered {
		if batch == nil {
			continue
		}
		merged.Items = append(merged.Items, batch.Items...)
		for id, info := range batch.Result.ItemsByID {
			merged.Result.ItemsByID[id] = info
		}
	}

	// Build full image URLs, and reattach Feed info in original ID order.
	for i := range merged.Items {
		image := merged.Items[i].Property.FeatureImage
		if image != "" {
			merged.Items[i].Property.FeatureImage = buildImageURL(s.imageBaseURL, image)
		}

		if i < len(propertyIDs) {
			if partnerInfo, ok := merged.Result.ItemsByID[propertyIDs[i]]; ok {
				merged.Items[i].Feed = partnerInfo.Feed
			}
		}
	}

	return merged, nil
}