import { Size, Position, Engine } from "../engine";
import { TilesetTile, Map } from "../world/map";
import { Viewport } from "./viewport";

export enum MovementType {
    Linear,
    Smooth,
    Instant
}

export class Camera {

    private currentPosition:Position;
    private targetPosition:Position;
    private currentSpeed:number = 10;
    private currentZoom:number = 3;
    private currentMovementType:MovementType = MovementType.Linear;
    private map:Map;

    public constructor(worldMap:Map, engine:Engine) {

        // set the map
        this.map = worldMap;
    
        // set the camera position
        this.position = { x: 4, y: 4 };
        this.targetPosition = this.position;

        // listen for the update_frame event
        // and call the update method
        engine.Events.addEventListener('frame_update', (event:CustomEvent) => {
            const deltaTime = event?.detail ?? 0;
            this.update(deltaTime);
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

    public set zoom(zoom:number) {
        this.currentZoom = zoom;
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

    public viewableTiles(viewport:Viewport) : Size {
        // Assuming viewport dimensions are accessible via this.viewportWidth and this.viewportHeight
        const tileSize: Size = this.map.tileSize;

        // Calculate the number of tiles that fit in the viewport's width and height
        const tilesX: number = Math.ceil(viewport.width / tileSize.width);
        const tilesY: number = Math.ceil(viewport.height / tileSize.height);

        return { width: tilesX, height: tilesY };
    }

    public moveTo(position:Position) {

        // set the target position
        this.targetPosition = position;

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
        }
    }

    private update_linear(deltaTime:number, speed:number) {

        // Calculate the difference in position
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the velocity
        const velocity = speed * 2 * deltaTime;

        if (distance < velocity) {
            this.currentPosition = this.targetPosition;
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

    private update_instant() {
        this.currentPosition = this.targetPosition;
    }




}