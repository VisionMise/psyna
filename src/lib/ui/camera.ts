import { Size, Position } from "../engine";
import { TilesetTile, Map } from "../world/map";
import { Viewport } from "./viewport";

export class Camera {

    private currentPosition:Position;
    private map:Map;
    private currentZoom:number = 3;

    public constructor(worldMap:Map) {

        // set the map
        this.map = worldMap;
    
        // set the camera position
        this.position = { x: 0, y: 0 };

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


}