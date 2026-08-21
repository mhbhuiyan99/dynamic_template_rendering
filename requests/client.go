// Package requests contains the external API request layer.
package requests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultTimeout = 10 * time.Second

// Client contains common configuration and behavior for external API calls.
type Client struct {
	BaseURL    string
	Username   string
	Password   string
	APIKey     string
	HTTPClient *http.Client
}

func NewClient(
	baseURL string,
	username string,
	password string,
	apiKey string,
) *Client {
	return &Client{
		BaseURL:  strings.TrimRight(baseURL, "/"),
		Username: username,
		Password: password,
		APIKey:   apiKey,
		HTTPClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

func BuildURL(baseURL string, path string, queryParams url.Values) (string, error) {
	parsedURL, err := url.Parse(strings.TrimRight(baseURL, "/"))
	if err != nil {
		return "", fmt.Errorf("parse base URL: %w", err)
	}

	parsedURL.Path = path
	parsedURL.RawQuery = queryParams.Encode()

	return parsedURL.String(), nil
}

func (c *Client) NewGETRequest(requestURL string) (*http.Request, error) {
	request, err := http.NewRequest(http.MethodGet, requestURL, nil)
	if err != nil {
		return nil, fmt.Errorf("create GET request: %w", err)
	}

	request.SetBasicAuth(c.Username, c.Password)
	request.Header.Set("Accept", "application/json")
	if c.APIKey != "" {
		request.Header.Set("x-api-key", c.APIKey)
	}

	return request, nil
}

func (c *Client) Do(request *http.Request, target interface{}) error {
	if c == nil {
		return fmt.Errorf("request client is nil")
	}

	httpClient := c.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: defaultTimeout}
	}

	response, err := httpClient.Do(request)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("unexpected HTTP status: %d", response.StatusCode)
	}

	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode response failed: %w", err)
	}

	return nil
}
