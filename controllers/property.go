package controllers

import (
	"net/http"
	"strings"

	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type PropertyController struct {
	web.Controller

	PropertyService *services.PropertyService
}

func NewPropertyController(
	propertyService *services.PropertyService,
) *PropertyController {
	return &PropertyController{
		PropertyService: propertyService,
	}
}

func (c *PropertyController) GetProperties() {
	if c.PropertyService == nil {
		c.CustomAbort(
			http.StatusInternalServerError,
			"property service is not configured",
		)
		return
	}

	category := strings.TrimSpace(c.GetString("category"))
	countryCode := strings.TrimSpace(c.GetString("location"))
	order := c.GetString("order")

	dateStart := c.GetString("dateStart")
	dateEnd := c.GetString("dateEnd")
	pax := c.GetString("pax")
	amount := c.GetString("amount")

	amenities := []string{}

	if value := c.GetString("amenities"); value != "" {
		amenities = strings.Split(value, "-")
	}

	petFriendly := c.GetString("petFriendly")
	ecoFriendly := c.GetString("ecoFriendly")

	if category == "" {
		c.CustomAbort(
			http.StatusBadRequest,
			"category is required",
		)
		return
	}

	response, err := c.PropertyService.GetProperties(
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

	if err != nil {
		c.CustomAbort(
			http.StatusBadGateway,
			err.Error(),
		)
		return
	}

	c.Data["json"] = response
	c.ServeJSON()
}

func (c *PropertyController) GetPropertyDetails() {
	if c.PropertyService == nil {
		c.CustomAbort(
			http.StatusInternalServerError,
			"property service is not configured",
		)
		return
	}

	value := strings.TrimSpace(
		c.GetString("propertyIdList"),
	)

	if value == "" {
		c.CustomAbort(
			http.StatusBadRequest,
			"propertyIdList is required",
		)
		return
	}

	propertyIDs := strings.Split(value, ",")

	response, err := c.PropertyService.GetPropertyDetails(
		propertyIDs,
	)

	if err != nil {
		c.CustomAbort(
			http.StatusBadGateway,
			err.Error(),
		)
		return
	}

	c.Data["json"] = response
	c.ServeJSON()
}