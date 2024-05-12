import { Size, Position, Engine } from "../engine";
import { TilesetTile, Map } from "../world/map";
import { Viewport } from "./viewport";

export class Camera {

    private currentPosition:Position;
    private targetPosition:Position;
    private map:Map;
    private currentZoom:number = 3;

    public constructor(worldMap:Map, engine:Engine) {

        // set the map
        this.map = worldMap;
    
        // set the camera position
        this.position = { x: 4, y: 4 };
        this.targetPosition = this.position;

        // listen for the update_frame event
        // and call the update method
        engine.Events.addEventListener('frame_update', () => this.update());


    }
    

    public set position(position:Position) {
        this.currentPosition = position;
    }

    public get position() : Position {
        return this.currentPosition;
    }

    public get zoom() : number {
        return this.currentZoom;
    }

    public set zoom(zoom:number) {
        this.currentZoom = zoom;
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
        this.currentPosition = position;        

    }

    public update() {

        if (this.targetPosition.x !== this.currentPosition.x || this.targetPosition.y !== this.currentPosition.y) {
            
            const dx = this.targetPosition.x - this.currentPosition.x;
            const dy = this.targetPosition.y - this.currentPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = 0.8;

            if (distance > 0.5) {
                this.currentPosition.x += dx * speed;
                this.currentPosition.y += dy * speed;
            }

        }

    }


}