package controllers

import (
	"strings"

	"github.com/beego/beego/v2/server/web"
)

type RefineController struct {
	web.Controller
}

func NewRefineController() *RefineController {
	return &RefineController{}
}

func (c *RefineController) Get() {
	c.Data["Search"] = strings.TrimSpace(
		c.GetString("search"),
	)

	c.Data["DateStart"] = c.GetString("dateStart")
	c.Data["DateEnd"] = c.GetString("dateEnd")
	c.Data["Pax"] = c.GetString("pax")

	c.TplName = "refine.tpl"
}