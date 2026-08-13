package routers

import (
	"github.com/beego/beego/v2/server/web"
	"dynamic_template_rendering/controllers"
)

func init() {
	web.Router("/custom-template", &controllers.CustomTemplateController{})
}
