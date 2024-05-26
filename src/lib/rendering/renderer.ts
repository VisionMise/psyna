import { Engine, Position, Size } from "../engine.js";
import { Camera } from "../ui/camera.js";
import { Viewport } from "../ui/viewport.js";
import { Map, ShapeRect, TilesetTile } from "../world/map.js";
import { Shader } from "./shader.js";

export class Renderer {

    // Camera
    private renderingCamera:Camera;

    // Map
    private map:Map;

    // Viewport
    private viewport:Viewport;    

    // Properties
    private flag_ready:boolean = false;
    private tileData: any;
    private imageSmoothing:boolean = false;
    private appliedShaders:Shader[] = [];


    public constructor(map:Map, viewport:Viewport, camera:Camera) {

        // Set the viewport
        this.viewport = viewport;
 
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
        this.viewport.context.imageSmoothingEnabled = value;
    }

    public get camera() : Camera {
        return this.renderingCamera;
    }

    public set camera(camera:Camera) {
        this.renderingCamera = camera;
    }

    public applyShader(shader:Shader) {

        // Check if the shader is already applied
        if (this.appliedShaders.includes(shader)) return;

        // Apply the shader
        this.appliedShaders.push(shader);

        // Import the shader to the DOM
        this.importShader(shader);
    }

    public removeShader(shader:Shader) {
        // Find the shader
        const index = this.appliedShaders.indexOf(shader);

        // Remove the shader
        if (index > -1) this.appliedShaders.splice(index, 1);
    }

    public render() {
        if (!this.flag_ready) return;

        // Get the area to render
        // in tiles
        const area:ShapeRect = this.renderingCamera.area();

        // Clear the viewport
        this.viewport.clear();

        // Get the tile data
        const layers:any     = this.map.area(area)?.layers ?? null;
        this.tileData        = layers;

        // Each layer
        for (const layer of this.tileData) this.renderMapLayer(area, layer);

        // Generate shader string
        const shaders:string[] = [];
        for (const shader of this.appliedShaders) shaders.push(`url(#${shader.name})`);
        const shaderString = shaders.join(' ');

        // apply the shader as css filter
        // to the canvas
        this.viewport.canvas.style.filter = shaderString;
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
                    x: (x * tileSize.width - center.x) * this.renderingCamera.zoom + this.viewport.width / 2,
                    y: (y * tileSize.height - center.y) * this.renderingCamera.zoom + this.viewport.height / 2
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

    private async setup() : Promise<void> {

        // Set the ready flag
        this.flag_ready = true;

        // set the viewport render mode
        this.viewport.context.imageSmoothingEnabled = this.imageSmoothing;

    }

    private importShader(shader:Shader) {
        shader.importToDOM();
    }

}