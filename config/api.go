package config

import (
	"strings"

	"github.com/beego/beego/v2/server/web"
)

type APIConfig struct {
	BaseURL      string
	ImageBaseURL string
	Username     string
	Password     string
	APIKey       string
}

func LoadAPIConfig() APIConfig {
	return APIConfig{
		BaseURL: strings.TrimRight(
			web.AppConfig.DefaultString("base_url", ""),
			"/",
		),
		ImageBaseURL: strings.TrimRight(
			web.AppConfig.DefaultString("image_base_url", ""),
			"/",
		),
		Username: web.AppConfig.DefaultString("username", ""),
		Password: web.AppConfig.DefaultString("password", ""),
		APIKey:   web.AppConfig.DefaultString("api_key", ""),
	}
}