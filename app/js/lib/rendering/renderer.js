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
        // hook into the frame_update event
        this.engine.Events.addEventListener('frame_update', () => this.render());
        // Set the ready flag
        this.flag_ready = true;
    }
    render() {
        // get the viewable tiles
        const tiles = this.camera.viewableTiles();
        // get area of the map to render
        const area = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            width: tiles.width,
            height: tiles.height
        };
        // get the tile size
        const tileSize = this.map.tileSize;
        // get the viewport size
        const viewportSize = this.viewport.size;
        // get the context
        const context = this.viewport.context;
        // get tile data
        const tileData = this.map.area(area.x, area.y, area.width, area.height);
        const layers = tileData.layers;
        // scaled tile size
        const scale = this.map.scale(this.viewport, this.camera.zoom);
        // scaled tile size (clamped)
        const scaledTileSize = {
            width: Math.ceil(tileSize.width * scale.width),
            height: Math.ceil(tileSize.height * scale.height)
        };
        // clear the viewport
        this.viewport.clear();
        for (let layer of layers) {
            for (let y = area.y; y < area.y + area.height; y++) {
                for (let x = area.x; x < area.x + area.width; x++) {
                    // get the tile
                    const tile = layer[y][x];
                    // get the tile position
                    const position = {
                        x: (x - area.x) * scaledTileSize.width,
                        y: (y - area.y) * scaledTileSize.height
                    };
                    // convert imageData to CanvasImageSource
                    let image;
                    if (tile.image instanceof ImageData) {
                        // create a temporary canvas
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d', { alpha: true });
                        context.imageSmoothingEnabled = false;
                        canvas.style.imageRendering = 'pixelated';
                        canvas.width = tile.image.width;
                        canvas.height = tile.image.height;
                        // put the imageData on the canvas
                        context.putImageData(tile.image, 0, 0);
                        // set the image
                        image = canvas;
                    }
                    // Example of rounding position and size
                    const posX = Math.round(position.x);
                    const posY = Math.round(position.y);
                    const width = Math.round(scaledTileSize.width);
                    const height = Math.round(scaledTileSize.height);
                    context.drawImage(image, posX, posY, width, height);
                    // draw the tile
                    // context.drawImage(image, position.x * scaledTileSize.width, position.y * scaledTileSize.height, scaledTileSize.width, scaledTileSize.height);
                    // context.drawImage(image, position.x, position.y, scaledTileSize.width, scaledTileSize.height);
                }
            }
        }
    }
}
