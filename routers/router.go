package routers

import (
	"dynamic_template_rendering/config"
	"dynamic_template_rendering/controllers"
	"dynamic_template_rendering/renderers"
	"dynamic_template_rendering/requests"
	"dynamic_template_rendering/services"

	"github.com/beego/beego/v2/server/web"
)

func init() {
	apiConfig := config.LoadAPIConfig()
	categoryRequest := requests.NewCategoryRequest(
		requests.NewClient(
			apiConfig.BaseURL,
			apiConfig.Username,
			apiConfig.Password,
			apiConfig.APIKey,
		),
	)
	categoryService := services.NewCategoryService(categoryRequest)

	tileService := services.NewTileService(
		categoryService,
	)

	templateService := services.NewTemplateService(
		"views/custom_template.txt",
	)

	tileRenderer := renderers.NewTileRenderer(
		apiConfig.BaseURL,
		apiConfig.ImageBaseURL,
	)

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

	categoryLocationService := services.NewCategoryLocationService()

	categoryController := controllers.NewCategoryController(
		categoryLocationService,
	)

	web.Router(
		"/all/*",
		categoryController,
	)
}
