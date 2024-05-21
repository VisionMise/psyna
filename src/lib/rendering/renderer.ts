import { Engine, Position, Size } from "../engine.js";
import { Camera } from "../ui/camera.js";
import { Viewport } from "../ui/viewport.js";
import { Map, ShapeRect, TilesetTile } from "../world/map.js";

export class Renderer {

    private camera:Camera;
    private map:Map;
    private viewport:Viewport;
    private engine:Engine;
    private flag_ready:boolean = false;
    private tileData: any;


    public constructor(engine:Engine, viewport:Viewport, map:Map, camera:Camera) {

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

    private async setup() : Promise<void> {

        // Set the ready flag
        this.flag_ready = true;

    }

    async render() {
        if (!this.flag_ready) return;

        // Get the area to render
        // in tiles
        const area:ShapeRect = this.camera.area();

        // Clear the viewport
        this.viewport.context.imageSmoothingEnabled = false;
        this.viewport.clear();

        // Get the tile data
        const layers:any     = this.map.area(area)?.layers ?? null;
        this.tileData        = layers;

        // calculate the scaled tile size
        const scaledTileSize:Size = {
            width: this.map.tileSize.width * this.camera.zoom,
            height: this.map.tileSize.height * this.camera.zoom
        };

        const tileSize:Size = this.map.tileSize;
        const center:Position = this.camera.center();

        // Each layer
        for (const layer of layers) {

            // Each Row
            for (let y = area.y1; y <= area.y2; y++) {

                const row = layer[y] ?? null;
                if (!row) continue;

                // Each Tile
                for (let x = area.x1; x <= area.x2; x++) {

                    // Get the tile
                    const tile:TilesetTile = row[x] ?? null;
                    if (!tile) continue;

                    // Get the image
                    const image:ImageBitmap = tile.image;

                    // Calculate the position
                    // const position:Position = {
                    //     x: (x - area.x1) * scaledTileSize.width,
                    //     y: (y - area.y1) * scaledTileSize.height
                    // };
                    
                    
                    // Calculate the position considering the camera's center
                    const position: Position = {
                        x: (x * tileSize.width - center.x) * this.camera.zoom + this.viewport.width / 2,
                        y: (y * tileSize.height - center.y) * this.camera.zoom + this.viewport.height / 2
                    };



                    // Draw the tile
                    this.viewport.context.drawImage(
                        image,
                        0, 0, tileSize.width, tileSize.height,
                        position.x, position.y, scaledTileSize.width, scaledTileSize.height
                    );

                }

            }

        }
        
    }



}