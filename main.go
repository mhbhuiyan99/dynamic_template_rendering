package main

import (
	_ "dynamic_template_rendering/routers"
	"github.com/beego/beego/v2/server/web"
)

func main() {
	web.AddTemplateExt("txt")
	web.Run()
}

