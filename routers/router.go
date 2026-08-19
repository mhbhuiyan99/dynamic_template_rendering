package routers

import (
	"dynamic_template_rendering/controllers"
	"dynamic_template_rendering/renderers"
	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

func init() {
	categoryService := services.NewCategoryService()

	tileService := services.NewTileService(
		categoryService,
	)

	templateService := services.NewTemplateService(
		"views/custom_template.txt",
	)

	tileRenderer := renderers.NewTileRenderer()

	templateRenderService := services.NewTemplateRenderService(
		templateService,
		tileService,
		tileRenderer,
	)

	controller := controllers.NewCustomTemplateController(
		templateRenderService,
	)

	web.Router(
		"/custom-template",
		controller,
	)
}
