import { Engine, Size } from "../engine.js";
import { Camera } from "../ui/camera.js";
import { Viewport } from "../ui/viewport.js";
import { Map, TilesetTile } from "../world/map.js";

export class Renderer {

    private camera:Camera;
    private map:Map;
    private viewport:Viewport;
    private engine:Engine;
    private flag_ready:boolean = false;


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

            
    public async render() {
        const tiles = this.camera.viewableTiles(this.viewport);
        const area = {
            x: Math.floor(this.camera.position.x),
            y: Math.floor(this.camera.position.y),
            width: tiles.width,
            height: tiles.height
        };

        const tileSize = this.map.tileSize;
        const scale: Size = this.map.scale(this.camera, tileSize);

        const scaledTileSize = {
            width: tileSize.width * scale.width,
            height: tileSize.height * scale.height
        };

        this.viewport.context.imageSmoothingEnabled = false;
        this.viewport.clear();

        // Adjusted area to include partial tiles
        const tileData = this.map.area(area.x - 1, area.y - 1, area.x + area.width + 2, area.y + area.height + 2);
        const layers = tileData.layers;

        for (const layer of layers) {
            for (let y = 0; y <= area.height + 1; y++) {
                for (let x = 0; x <= area.width + 1; x++) {
                    if (!layer[y] || !layer[y][x]) continue;

                    const tile: TilesetTile = layer[y][x];

                    // Calculate position using exact floating-point values
                    const posX = (x - this.camera.position.x + area.x) * scaledTileSize.width;
                    const posY = (y - this.camera.position.y + area.y) * scaledTileSize.height;

                    // Draw the tile at the exact floating-point positio
                    this.viewport.context.drawImage(
                        tile.image,
                        0, 0, tileSize.width, tileSize.height,
                        posX, posY, scaledTileSize.width + 1, scaledTileSize.height + 1
                    );
                }
            }
        }
    }




}