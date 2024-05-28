import { Engine, Position, Size } from "../engine.js";
import { Camera } from "../ui/camera.js";
import { Viewport } from "../ui/viewport.js";
import { Map, ShapeRect, TilesetTile } from "../world/map.js";
import { UILayer } from "./uiLayer.js";

export class Renderer {

    // Engine
    private engine:Engine;

    // Camera
    private renderingCamera:Camera;

    // Map
    private map:Map;

    // Viewport
    private gameViewport:Viewport; 

    // UI Layers
    private uiLayers:UILayer[] = [];

    // Properties
    private flag_ready:boolean = false;
    private tileData: any;
    private imageSmoothing:boolean = false;

    public constructor(engine:Engine, map:Map, viewport:Viewport, camera:Camera) {

        // Set the engine
        this.engine = engine;

        // Set the viewport
        this.gameViewport = viewport;
 
        // Set the map
        this.map = map;

        // Set the camera
        this.camera = camera;

        // Setup the renderer
        this.setup();
    }

    public get ready() : boolean {
        return this.flag_ready;
    }

    public get antiAliasing() : boolean {
        return this.imageSmoothing;
    }

    public set antiAliasing(value:boolean) {
        this.imageSmoothing = value;
        this.gameViewport.context.imageSmoothingEnabled = value;
    }

    public get camera() : Camera {
        return this.renderingCamera;
    }

    public set camera(camera:Camera) {
        this.renderingCamera = camera;
    }

    public addUILayer(layer:UILayer) {
        this.uiLayers.push(layer);
    }

    public removeUILayer(layer:UILayer) {
        this.uiLayers = this.uiLayers.filter(l => l !== layer);
    }

    public render() {
        if (!this.flag_ready) return;

        // Get the area to render
        // in tiles
        const area:ShapeRect = this.renderingCamera.area();

        // Clear the viewport
        this.gameViewport.clear();

        // if viewport image smoothing is different
        // from the renderer's antiAliasing
        // set the viewport image smoothing
        if (this.gameViewport.context.imageSmoothingEnabled !== this.imageSmoothing) {
            this.gameViewport.context.imageSmoothingEnabled = this.imageSmoothing;
        }

        // Get the tile data
        const tilemapLayers:any     = this.map.area(area)?.layers ?? null;
        this.tileData               = tilemapLayers;

        // Each layer
        for (const tilemapLayer of this.tileData) this.renderMapLayer(area, tilemapLayer);

    }

    private renderMapLayer(area: ShapeRect, layer: any) {

        // Get the tile size
        const tileSize:Size     = this.map.tileSize;

        // Get the camera center
        const center:Position   = this.renderingCamera.center();
        
        // calculate the scaled tile size
        const scaledTileSize:Size = {
            width: this.map.tileSize.width * this.renderingCamera.zoom,
            height: this.map.tileSize.height * this.renderingCamera.zoom
        };

        // Each Row
        for (let y = area.y1; y <= area.y2; y++) {

            // Get the row
            const row = layer[y] ?? null;
            if (!row) continue;

            // Each Column
            for (let x = area.x1; x <= area.x2; x++) {

                // Get the tile
                const tile: TilesetTile = row[x] ?? null;
                if (!tile) continue;

                // Get the image
                const image: ImageBitmap = tile.image;

                // Calculate the position considering the camera's center
                const position: Position = {
                    x: (x * tileSize.width - center.x) * this.renderingCamera.zoom + this.gameViewport.width / 2,
                    y: (y * tileSize.height - center.y) * this.renderingCamera.zoom + this.gameViewport.height / 2
                };

                // Draw the tile
                this.gameViewport.context.drawImage(
                    image,
                    0, 0, tileSize.width, tileSize.height,
                    position.x, position.y, scaledTileSize.width, scaledTileSize.height
                );

            }

        }

    }

    private async setup() : Promise<void> {

        // Set the ready flag
        this.flag_ready = true;

        // set the viewport render mode
        this.antiAliasing = false;

    }

}