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

        // hook into the frame_update event
        this.engine.Events.addEventListener('frame_update', () => this.render());


        // Set the ready flag
        this.flag_ready = true;

    }

        
    public render() {

        // Calculate the viewable area
        const tiles = this.camera.viewableTiles(this.viewport);

        // Calculate the area of the map to render
        const area = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            width: tiles.width,
            height: tiles.height
        };


        // Get the tile size and calculate scale
        const tileSize = this.map.tileSize;
        const scale: Size = this.map.scale(this.camera, tileSize);

        // Calculate scaled tile size as an integer multiple
        const scaledTileSize = {
            width: Math.floor(tileSize.width * scale.width),
            height: Math.floor(tileSize.height * scale.width)
        };

        // Adjust the size of the offscreen canvas to match the scaled tile size
        const offscreenCanvas = document.createElement('canvas');
        const offscreenContext = offscreenCanvas.getContext('2d', { alpha: true });
        offscreenCanvas.width = tileSize.width;
        offscreenCanvas.height = tileSize.height;
        offscreenCanvas.style.width = `${tileSize.width}px`;
        offscreenCanvas.style.height = `${tileSize.height}px`;
        offscreenCanvas.style.imageRendering = 'pixelated';
        offscreenContext.imageSmoothingEnabled = false;
        // offscreenContext.globalCompositeOperation = 'source-over';
        
        // Set the image smoothing to false on the main canvas
        this.viewport.context.imageSmoothingEnabled = false;
        this.viewport.context.globalCompositeOperation = 'source-over';


        // Clear the viewport
        this.viewport.clear();

        // Fetch tile data considering the entire visible area plus one extra row and column if possible
        const tileData = this.map.area(area.x, area.y, area.x + area.width + 1, area.y + area.height + 1);
        const layers = tileData.layers;

        for (const layer of layers) {
            for (let y = 0; y <= area.height; y++) {  // Include one extra row if within bounds
                for (let x = 0; x <= area.width; x++) {  // Include one extra column if within bounds

                    if (!layer[y] || !layer[y][x]) continue;

                    // Get the tile data
                    const tile: TilesetTile = layer[y][x];                    

                    // Draw tile image data onto offscreen canvas
                    offscreenContext.clearRect(0, 0, tileSize.width, tileSize.height);  // Clear previous image
                    offscreenContext.putImageData(tile.image, 0, 0);

                    // Calculate position on the main canvas
                    const posX = Math.round(x * scaledTileSize.width);
                    const posY = Math.round(y * scaledTileSize.height);

                    // Draw the image from offscreen canvas to the main viewport at scaled size
                    this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
                }
            }            
        }
    }


}