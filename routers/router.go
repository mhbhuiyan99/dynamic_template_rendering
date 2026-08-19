package routers

import (
	"dynamic_template_rendering/controllers"
	"github.com/beego/beego/v2/server/web"
)

func init() {
	web.Router("/custom-template", &controllers.CustomTemplateController{})
}
