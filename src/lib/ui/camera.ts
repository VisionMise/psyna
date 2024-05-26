import { Size, Position, Engine } from "../engine";
import { TilesetTile, Map, Shape, ShapeRect } from "../world/map";
import { Viewport } from "./viewport";

export enum MovementType {
    Linear,
    Smooth,
    Instant,
    Bezier
}

export class Camera {

    // position properties
    private currentPosition:Position; // in pixels
    private targetPosition:Position;  // in pixels
    private progress:number = 0;

    // zoom properties
    private currentSpeed:number = 10;
    private currentZoom:number = 3;
    private targetZoom:number = 3;
    private currentZoomSpeed:number = 1;
    private maxZoom:number = 6;
    private minZoom:number = 1;
    private zoomProgress:number = 0;

    // movement properties
    private currentMovementType:MovementType = MovementType.Linear;
    private currentViewport:Viewport;

    // map properties
    private worldMap:Map;

    public constructor(worldMap:Map, engine:Engine, viewport:Viewport) {

        // set the map
        // size in tiles
        this.worldMap = worldMap;

        // set the viewport
        // size in pixels
        this.currentViewport = viewport;
    
        // set the camera position
        // in pixels
        this.position = { x: 0, y: 0 };
        this.targetPosition = {...this.position};

        // listen for the update_frame event
        // and call the update method
        engine.Events.addEventListener('frame_update', (event:CustomEvent) => {
            const deltaTime = event?.detail ?? 0;
            this.update(deltaTime);
        });

        //listen for mouse wheel events
        viewport.canvas.addEventListener('wheel', (event:WheelEvent) => {
            this.zoom += event.deltaY > 0 ? -this.currentZoomSpeed : this.currentZoomSpeed;

            // clamp the zoom
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
        });

    }

    public get speed() : number {
        return this.currentSpeed;
    }

    public set speed(speed:number) {
        this.currentSpeed = speed;
    }
    
    public get zoom() : number {
        return this.currentZoom;
    }
    
    public set zoom(zoom: number) {
        const oldZoom       = this.currentZoom;
        this.currentZoom    = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));

        // Adjust the camera position to zoom towards the center
        const center = this.viewport.center;
        const dx = center.x - this.position.x;
        const dy = center.y - this.position.y;

        // update the target position
        // based on the zoom change
        this.targetPosition.x = center.x - dx * (this.zoom / oldZoom);
        this.targetPosition.y = center.y - dy * (this.zoom / oldZoom);
    }


    public get movementType() : MovementType {
        return this.currentMovementType;
    }

    public set movementType(movementType:MovementType) {
        this.currentMovementType = movementType;
    }

    public set position(position:Position) {
        this.currentPosition = position;
    }

    public get position() : Position {
        return this.currentPosition;
    }

    public get viewport() : Viewport {
        return this.currentViewport;
    }

    public get map() : Map {
        return this.worldMap;
    }

    public viewableTiles() : Size {
        // assuming the camera is in the center
        // of the viewport

        // get the number of tiles that fit in the viewport
        // in pixels
        let tileCount:Size = {
            width:  Math.ceil(this.viewport.width / this.map.tileSize.width),
            height: Math.ceil(this.viewport.height / this.map.tileSize.height)
        };

        // adjust for zoom
        tileCount.width = Math.floor(tileCount.width / this.zoom);
        tileCount.height = Math.floor(tileCount.height / this.zoom);

        // return the tile count
        return tileCount;        
    }

    public area(): ShapeRect {

        // buffer
        const buffer = 1;

        // get the count of viewable tiles
        const tiles = this.viewableTiles();

        // get the area in tiles
        let area: ShapeRect = {
            x1: Math.floor(this.position.x / this.map.tileSize.width - tiles.width / 2) - buffer,
            y1: Math.floor(this.position.y / this.map.tileSize.height - tiles.height / 2) - buffer,
            x2: Math.ceil(this.position.x / this.map.tileSize.width + tiles.width / 2) + buffer,
            y2: Math.ceil(this.position.y / this.map.tileSize.height + tiles.height / 2) + buffer
        };

        return area;
    }


    public center() : Position {
        return this.position;
    }

    public moveTo(position:Position) {

        // set the target position
        this.targetPosition = {...position};

    }

    public update(deltaTime: number) {
        
        // Update the camera position based on the movement type
        switch (this.movementType) {
            case MovementType.Linear:
                this.update_linear(deltaTime, this.speed);
                break;
            case MovementType.Smooth:
                this.update_smooth(deltaTime, this.speed);
                break;
            case MovementType.Instant:
                this.update_instant();
                break;
            case MovementType.Bezier:
                this.update_bezier(deltaTime, this.speed);
                break;
        }

        // Clamp the camera position
        this.clampPosition();

        // Draw the camera
        this.drawCamera();

    }

    private update_linear(deltaTime:number, speed:number) {

        // Calculate the difference in position
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the velocity
        const velocity = speed * 20 * deltaTime;

        if (distance < velocity) {
            this.currentPosition = {...this.targetPosition};
        } else {

            //normalize the direction
            const nx = dx / distance;
            const ny = dy / distance;

            //move the camera
            this.currentPosition.x += nx * velocity;
            this.currentPosition.y += ny * velocity;
        }
    }

    private update_smooth(deltaTime:number, speed:number) {
        // Constants
        const lerpFactor = speed / 10;

        // Calculate the difference in position
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;

        // Perform linear interpolation with adjusted deltaTime
        this.currentPosition.x += dx * lerpFactor * deltaTime;
        this.currentPosition.y += dy * lerpFactor * deltaTime;

        // Snap to target if very close to avoid jitter
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.15) { //snap to target if very close
            this.currentPosition.x = this.targetPosition.x;
            this.currentPosition.y = this.targetPosition.y;
        }
    }

    private update_bezier(deltaTime:number, speed:number) {
        // Constants
        const increment:number = speed * deltaTime / 1000;

        // Define the cubic Bezier curve function
        const curve = (t: number, p0: number, p1: number, p2: number, p3: number) => {
            return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
        };

        // Points for the Bezier curve
        const x0 = this.currentPosition.x;
        const x1 = this.currentPosition.x + 10;
        const x2 = this.targetPosition.x - 10;
        const x3 = this.targetPosition.x;

        const y0 = this.currentPosition.y;
        const y1 = this.currentPosition.y + 10;
        const y2 = this.targetPosition.y - 10;
        const y3 = this.targetPosition.y;
        
        // Increment the progress
        this.progress += increment;
        if (this.progress > 1) this.progress = 1; // Clamp progress to 1

        // Calculate the current position on the Bezier curve
        this.currentPosition.x = curve(this.progress, x0, x1, x2, x3);
        this.currentPosition.y = curve(this.progress, y0, y1, y2, y3);

        // Snap to target if very close to avoid jitter
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 5 || this.progress >= 1) { // Snap to target if very close or progress is complete
            this.currentPosition.x = this.targetPosition.x;
            this.currentPosition.y = this.targetPosition.y;
            this.progress = 0; // Reset progress for next movement
        }

    }

    private update_instant() {
        this.currentPosition = {...this.targetPosition};
    }

    private drawCamera() {
        // draw the camera center as a blue rectangle
        // that is 2% the size of the viewport
        const context = this.viewport.context;
        const center:Position = this.viewport.center;

        context.beginPath();
        context.lineWidth = 2;

        context.rect(
            center.x - this.viewport.width * 0.48,
            center.y - this.viewport.height * 0.48,
            this.viewport.width * 0.96,
            this.viewport.height * 0.96
        );

        context.strokeStyle = '#0d88ffaa';
        context.stroke();
        context.closePath();
    }




private clampPosition(): void {
    const halfViewportWidth = (this.viewport.width / 2) / this.currentZoom;
    const halfViewportHeight = (this.viewport.height / 2) / this.currentZoom;

    const mapWidthInPixels = this.map.size.width * this.map.tileSize.width;
    const mapHeightInPixels = this.map.size.height * this.map.tileSize.height;

    // Ensure the camera does not move out of the map boundaries
    this.currentPosition.x = Math.max(halfViewportWidth, Math.min(mapWidthInPixels - halfViewportWidth, this.currentPosition.x));
    this.currentPosition.y = Math.max(halfViewportHeight, Math.min(mapHeightInPixels - halfViewportHeight, this.currentPosition.y));
}


}