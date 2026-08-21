package controllers

import (
	"net/http"

	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type CategoryController struct {
	web.Controller

	categoryLocationService *services.CategoryLocationService
}

func NewCategoryController(
	categoryLocationService *services.CategoryLocationService,
) *CategoryController {
	return &CategoryController{
		categoryLocationService: categoryLocationService,
	}
}

func (c *CategoryController) Get() {
	path := c.Ctx.Request.URL.Path

	location, err := c.categoryLocationService.Parse(path)
	if err != nil {
		c.CustomAbort(
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	c.Ctx.WriteString(
		"Category location: " + location.Keyword,
	)
}
