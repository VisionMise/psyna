export class Renderer {
    constructor(engine, viewport, map, camera) {
        this.flag_ready = false;
        // Set the engine
        this.engine = engine;
        // Set the viewport
        this.viewport = viewport;
        // Set the map
        this.map = map;
        // Set the camera
        this.camera = camera;
        // Setup the renderer
        this.setup();
    }
    async setup() {
        // Set the ready flag
        this.flag_ready = true;
    }
    async render() {
        if (!this.flag_ready)
            return;
        // Get the area to render
        // in tiles
        const area = this.camera.area();
        // Clear the viewport
        this.viewport.context.imageSmoothingEnabled = false;
        this.viewport.clear();
        // Get the tile data
        const layers = this.map.area(area)?.layers ?? null;
        this.tileData = layers;
        // calculate the scaled tile size
        const scaledTileSize = {
            width: this.map.tileSize.width * this.camera.zoom,
            height: this.map.tileSize.height * this.camera.zoom
        };
        const tileSize = this.map.tileSize;
        const center = this.camera.center();
        // Each layer
        for (const layer of layers) {
            // Each Row
            for (let y = area.y1; y <= area.y2; y++) {
                const row = layer[y] ?? null;
                if (!row)
                    continue;
                // Each Tile
                for (let x = area.x1; x <= area.x2; x++) {
                    // Get the tile
                    const tile = row[x] ?? null;
                    if (!tile)
                        continue;
                    // Get the image
                    const image = tile.image;
                    // Calculate the position
                    // const position:Position = {
                    //     x: (x - area.x1) * scaledTileSize.width,
                    //     y: (y - area.y1) * scaledTileSize.height
                    // };
                    // Calculate the position considering the camera's center
                    const position = {
                        x: (x * tileSize.width - center.x) * this.camera.zoom + this.viewport.width / 2,
                        y: (y * tileSize.height - center.y) * this.camera.zoom + this.viewport.height / 2
                    };
                    // Draw the tile
                    this.viewport.context.drawImage(image, 0, 0, tileSize.width, tileSize.height, position.x, position.y, scaledTileSize.width, scaledTileSize.height);
                }
            }
        }
    }
}
