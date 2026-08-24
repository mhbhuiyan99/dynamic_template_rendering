# Dynamic Template Rendering

A Go and Beego application that renders a category page from an HTML template and dynamically replaces property-tile placeholders with property data returned by an external category API.

## Requirements

- Go `1.25` or later
- Access to the category/property API configured by `base_url`
- API credentials when the upstream API requires authentication

## Setup

1. Create the local Beego configuration file:

   ```bash
   cp conf/app.conf.example conf/app.conf
   ```

2. Update `conf/app.conf` with the API host and credentials:

   ```ini
   appname = dynamic_template_rendering
   httpport = 8080
   runmode = dev

   base_url = "https://api.example.com"
   image_base_url = "https://images.example.com"
   username = "your-username"
   password = "your-password"
   api_key = "your-api-key"
   ```

   `base_url` is used for the category API and generated property links. `image_base_url` is used to resolve relative image names returned by the API. Keep credentials in the local, ignored `conf/app.conf` file.

3. Download dependencies:

   ```bash
   go mod download
   ```

## Run

Start the development server with:

```bash
go run .
```

Open [http://localhost:8080/custom-template](http://localhost:8080/custom-template) in a browser.

The application exposes these page endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/custom-template` | Renders `views/custom_template.txt` and injects property tiles |
| `GET` | `/all/{country}` | Renders a dynamic category page |
| `GET` | `/all/{country}/{state}` | Renders a dynamic category page |
| `GET` | `/all/{country}/{state}/{city}` | Renders a dynamic category page |

Static styles and scripts are served from `/static/` by Beego.

## Assignment Flows

### Assignment 6: Dynamic Template Rendering

The supplied `views/custom_template.txt` remains the primary page structure. The server does not recreate the page manually.

```text
/custom-template
   -> CustomTemplateController
   -> TemplateRenderService
   -> TemplateService loads the .txt template
   -> Go template execution replaces {{.LocationName}}
   -> Parse HTML with goquery
   -> Read config.TileConfigs
   -> Build one Category API request per tile configuration
   -> Convert API items into properties
   -> Render property tile HTML
   -> Find matching data-block="property-tiles" and TilesBlockID
   -> Replace only the matching tile block
   -> Return the completed HTML page
```

### Assignment 7: Dynamic Category Pages

For a request such as `/all/usa/texas`:

```text
Browser requests /all/usa/texas
   -> CategoryController reads the URL
   -> CategoryLocationService parses it as usa:texas
   -> TemplateRenderService copies the tile configuration list
   -> Each copied Keyword becomes usa:texas
   -> The global configuration is not mutated
```

The request layer converts the keyword into the API path and keeps the display value separate:

```text
URL location:       usa:texas
API path:           /api/v1/category/details/usa:texas
Page display name:  Texas, USA (from API GeoInfo.Name when available)
Breadcrumbs:        USA > Texas
```

The same logic supports deeper locations such as:

```text
/all/usa/texas/galveston/port-bolivar
```

### Concurrent Tile Requests

Property requests for configured tile blocks run concurrently. A buffered result channel collects one result per tile block, including its original index. Results are then applied to the HTML sequentially in configuration order so DOM updates remain deterministic and race-free.

```text
Tile 1 ─┐
Tile 2 ─┤
Tile 3 ─┤ -> buffered result channel -> ordered tile replacement
Tile 4 ─┤
Tile N ─┘
```

Each tile request follows this service flow:

```text
TemplateRenderService
   -> TileService.GetProperties
   -> CategoryService.FetchProperties
   -> CategoryRequest.Fetch
   -> Client.Do
   -> Category API
```

The API request includes `device=desktop`, `items=1`, `locations=US`, and configured filters such as `pt`, `amenities`, and `order`.

### Nearby Locations

Category pages make a nearby request using the requested page location:

```text
/all/usa/hawaii
   -> /api/v1/category/details/usa:hawaii?device=desktop&items=1&locations=US&nearby=12
   -> read NearbyCities.Items
   -> render the existing nearby-places widget
   -> use each item Slug for /all/... links
```

The existing widget in `views/custom_template.txt` is preserved. Only its grid contents are replaced. Twelve locations are requested to support three rows of four items. Empty or failed nearby responses produce an empty widget instead of broken placeholder content.

### Dynamic Breadcrumbs

Page breadcrumbs are generated from the requested URL, not from a nearby property result. This prevents a nearby city from replacing the page’s actual location.

```text
/all/usa/galveston
   -> USA > Galveston

/all/usa/texas/galveston/port-bolivar
   -> USA > Texas > Galveston > Port Bolivar
```

Breadcrumb links use the accumulated `/all/...` slug for each parent level.

### Tile UI Behavior

Generated tiles preserve the existing tile classes and display property image, title, price, location, rating, and partner information when available.

- Missing images use `/static/img/property-placeholder.svg`.
- Failed image loads switch to the same local placeholder.
- Property locations use the `pres__property-location` class and link to the complete location path when location data is available.
- Favorite buttons use `data-property-id` and persist their state in `localStorage` through `static/js/fav-icon.js`.
- Selected favorite icons receive the `is-favorite` class and display in red.
- Individual API or rendering failures clear only the affected tile block so the rest of the page can render.

## Tile Configuration

Edit `config/tiles.go` to change the tile queries or connect them to different placeholders in `views/custom_template.txt`.

Important fields in `models.TileConfig`:

| Field | Purpose |
| --- | --- |
| `Keyword` | Location name displayed in the template |
| `PT` | Property-type filter sent to the category API |
| `Amenities` | Amenities filter sent to the category API |
| `Order` | Result ordering sent to the category API |
| `TilesPerPage` | Tile row width and fallback result limit |
| `TotalTiles` | Maximum number of properties rendered |
| `TilesBlockID` | HTML element ID to replace |

Each target block must have both attributes:

```html
<div data-block="property-tiles" id="your-block-id">
  <!-- placeholder content -->
</div>
```

## Tests

Run all tests with:

```bash
go test ./...
```

The test suite covers API request construction and responses, template parsing and tile replacement, property conversion, and template rendering.

## Project Structure

```text
config/       Tile query configuration
controllers/  HTTP controllers
models/       API and application data models
requests/     Shared HTTP client and Category API requests
renderers/    Property-tile HTML rendering
routers/      Beego route registration
services/     API, template, tile, and orchestration services
static/       CSS, JavaScript, and image assets
views/        HTML/Go templates
conf/         Local Beego configuration
```