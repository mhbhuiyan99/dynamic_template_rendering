package controllers

import (
	"net/http"

	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type CategoryController struct {
	web.Controller

	CategoryLocationService *services.CategoryLocationService
	TemplateRenderService   *services.TemplateRenderService
}

func NewCategoryController(
	categoryLocationService *services.CategoryLocationService,
	templateRenderService *services.TemplateRenderService,
) *CategoryController {
	return &CategoryController{
		CategoryLocationService: categoryLocationService,
		TemplateRenderService:   templateRenderService,
	}
}

func (c *CategoryController) Get() {
	if c.CategoryLocationService == nil || c.TemplateRenderService == nil {
		c.CustomAbort(
			http.StatusInternalServerError,
			"category controller is not configured",
		)
		return
	}

	path := c.Ctx.Request.URL.Path

	location, err := c.CategoryLocationService.Parse(path)
	if err != nil {
		c.CustomAbort(
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	html, err := c.TemplateRenderService.RenderPageForLocation(location.Keyword)
	if err != nil {
		c.CustomAbort(http.StatusInternalServerError, err.Error())
		return
	}

	c.Ctx.ResponseWriter.Header().Set(
		"Content-Type",
		"text/html; charset=utf-8",
	)

	c.Ctx.WriteString(html)
}
