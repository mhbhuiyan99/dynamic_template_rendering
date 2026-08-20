<!DOCTYPE html>

<html>
<head>
  <link
      rel="stylesheet"
      href="/static/css/category-template-base.css"
  />

  <link
      rel="stylesheet"
      href="/static/css/category-template.css"
  />

    <link
      rel="stylesheet"
      href="/static/css/tile-overrides.css"
    />

  <script
      src="/static/js/category-template.js"
      defer
  ></script>
</head>

<body>
  <header>
    <h1 class="logo">Welcome to Beego</h1>
    <div class="description">
      Beego is a simple & powerful Go web framework which is inspired by tornado and sinatra.
    </div>
  </header>
  <footer>
    <div class="author">
      Official website:
      <a href="http://{{.Website}}">{{.Website}}</a> /
      Contact me:
      <a class="email" href="mailto:{{.Email}}">{{.Email}}</a>
    </div>
  </footer>
  <div class="backdrop"></div>

  <script src="/static/js/reload.min.js"></script>
</body>
</html>
