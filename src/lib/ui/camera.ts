import { Size, Position } from "../engine";
import { TilesetTile, Map } from "../world/map";

export class Camera {

    private currentPosition:Position;
    private map:Map;
    private currentZoom:number = 8;

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

    public viewableTiles() : Size {

        // get the tile size
        const tileSize:Size = this.map.tileSize

        // the size of the map
        const mapSize:Size = this.map.size;

        // get the number of tiles in the viewport
        const tilesX:number = Math.ceil(mapSize.width / tileSize.width);
        const tilesY:number = Math.ceil(mapSize.height / tileSize.height);

        return { width: tilesX, height: tilesY };
    }


}