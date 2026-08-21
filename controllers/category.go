package controllers

import (
	"net/http"

	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type CategoryController struct {
	web.Controller

	categoryLocationService *services.CategoryLocationService
	templateRenderService   *services.TemplateRenderService
}

func NewCategoryController(
	categoryLocationService *services.CategoryLocationService,
	templateRenderService *services.TemplateRenderService,
) *CategoryController {
	return &CategoryController{
		categoryLocationService: categoryLocationService,
		templateRenderService:   templateRenderService,
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

	html, err := c.templateRenderService.RenderPageForLocation(location.Keyword)
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
