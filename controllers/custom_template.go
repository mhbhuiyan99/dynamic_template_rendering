package controllers

import (
	"dynamic_template_rendering/services"
	"github.com/beego/beego/v2/server/web"
)

type CustomTemplateController struct {
	web.Controller
	TemplateRenderService *services.TemplateRenderService
}

func NewCustomTemplateController(
	templateRenderService *services.TemplateRenderService,
) *CustomTemplateController {
	return &CustomTemplateController{
		TemplateRenderService: templateRenderService,
	}
}

func (c *CustomTemplateController) Get() {
	html, err := c.TemplateRenderService.RenderPage()
	if err != nil {
		c.CustomAbort(500, err.Error())
		return
	}

	c.Ctx.ResponseWriter.Header().Set(
		"Content-Type",
		"text/html; charset=utf-8",
	)

	c.Ctx.WriteString(html)
}
