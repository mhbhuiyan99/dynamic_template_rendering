package controllers

import (
	"github.com/beego/beego/v2/server/web"
)

type CustomTemplateController struct {
	web.Controller
}

func (c *CustomTemplateController) Get() {
	c.TplName = "custom_template.txt"
}