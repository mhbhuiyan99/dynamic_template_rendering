package controllers

import (
	"net/http"

	"dynamic_template_rendering/renderers"
	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

type CustomTemplateController struct {
	web.Controller
}

func (c *CustomTemplateController) Get() {
	templateService := services.NewTemplateService(
		"views/custom_template.txt",
	)

	categoryService := services.NewCategoryService()

	tileService := services.NewTileService(
		categoryService,
	)

	tileRenderer := renderers.NewTileRenderer()

	templateRenderService := services.NewTemplateRenderService(
		templateService,
		tileService,
		tileRenderer,
	)

	html, err := templateRenderService.Render()
	if err != nil {
		c.Ctx.ResponseWriter.WriteHeader(http.StatusInternalServerError)
		c.Ctx.WriteString("failed to render custom template")
		return
	}

	c.Ctx.ResponseWriter.Header().Set(
		"Content-Type",
		"text/html; charset=utf-8",
	)

	c.Ctx.WriteString(html)
}
