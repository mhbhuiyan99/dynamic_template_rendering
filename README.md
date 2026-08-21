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

The application exposes the following page endpoint:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/custom-template` | Renders `views/custom_template.txt` and injects property tiles |

Static styles and scripts are served from `/static/` by Beego.

## How It Works

1. `routers/router.go` wires the template, tile, category, and renderer services.
2. `services/TemplateService` loads and executes `views/custom_template.txt` as a Go template.
3. `requests/CategoryRequest` requests property data from:

   ```text
   GET {base_url}/api/v1/category/details/usa
   ```

   Tile settings such as `pt`, `amenities`, and `order` are sent as query parameters. Common HTTP behavior is handled by `requests/Client`, including authentication, timeout, status validation, and JSON decoding.
4. `services/CategoryService` delegates API access to `requests/CategoryRequest`, while `services/TileService` converts API results into properties and limits the result using `TotalTiles` (or `TilesPerPage` when `TotalTiles` is not set).
5. `renderers/TileRenderer` creates the property-card HTML.
6. Each configured tile block with `data-block="property-tiles"` is replaced by matching `TilesBlockID` in `config/tiles.go`.

The template uses `{{.LocationName}}` for the location heading. This value is taken from the first configured tile whose `Keyword` is non-empty.

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