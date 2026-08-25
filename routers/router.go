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
	client := requests.NewClient(
		apiConfig.BaseURL,
		apiConfig.Username,
		apiConfig.Password,
		apiConfig.APIKey,
	)

	categoryRequest := requests.NewCategoryRequest(client)
	categoryService := services.NewCategoryService(categoryRequest)

	locationRequest := requests.NewLocationRequest(client)
	locationService := services.NewLocationService(locationRequest)

	locationController := controllers.NewLocationController(
		locationService,
	)

	web.Router(
		"/api/location",
		locationController,
	)
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
	propertyRequest := requests.NewPropertyRequest(
		client,
	)

	propertyService := services.NewPropertyService(
		propertyRequest,
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
		templateRenderService,
	)

	web.Router(
		"/all/*",
		categoryController,
	)

	refineController := controllers.NewRefineController()

	web.Router(
		"/refine",
		refineController,
	)


	propertyController := controllers.NewPropertyController(
		propertyService,
	)

	web.Router(
		"/api/properties",
		propertyController,
		"get:GetProperties",
	)

	web.Router(
		"/api/property-details",
		propertyController,
		"get:GetPropertyDetails",
	)
}
