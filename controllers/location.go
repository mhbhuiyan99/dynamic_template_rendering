package controllers

import (
	"net/http"

	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type LocationController struct {
	web.Controller

	LocationService *services.LocationService
}

func NewLocationController(
	locationService *services.LocationService,
) *LocationController {
	return &LocationController{
		LocationService: locationService,
	}
}

func (c *LocationController) Get() {
	if c.LocationService == nil {
		c.CustomAbort(
			http.StatusInternalServerError,
			"location service is not configured",
		)
		return
	}

	keyword := c.GetString("keyword")

	location, err := c.LocationService.GetLocation(keyword)
	if err != nil {
		c.CustomAbort(
			http.StatusBadGateway,
			err.Error(),
		)
		return
	}

	c.Data["json"] = location
	c.ServeJSON()
}