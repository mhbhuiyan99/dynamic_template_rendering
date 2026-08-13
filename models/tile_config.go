package models

type TileConfig struct {
	Keyword      string                 `json:"keyword"`
	PT           string                 `json:"pt"`
	Amenities    string                 `json:"amenities"`
	TilesPerPage int                    `json:"tiles_per_page"`
	TotalTiles   int                    `json:"total_tiles"`
	Order        string                 `json:"order"`
	Mode         map[string]interface{} `json:"mode"`
	TilesBlockID string                 `json:"tiles_block_id"`
	Layout       string                 `json:"layout"`
	Properties   []interface{}          `json:"properties"`
}