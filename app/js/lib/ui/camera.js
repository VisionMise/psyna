export class Camera {
    constructor(worldMap) {
        this.currentZoom = 8;
        // set the map
        this.map = worldMap;
        // set the camera position
        this.position = { x: 0, y: 0 };
    }
    set position(position) {
        this.currentPosition = position;
    }
    get position() {
        return this.currentPosition;
    }
    get zoom() {
        return this.currentZoom;
    }
    set zoom(zoom) {
        this.currentZoom = zoom;
    }
    viewableTiles() {
        // get the tile size
        const tileSize = this.map.tileSize;
        // the size of the map
        const mapSize = this.map.size;
        // get the number of tiles in the viewport
        const tilesX = Math.ceil(mapSize.width / tileSize.width);
        const tilesY = Math.ceil(mapSize.height / tileSize.height);
        return { width: tilesX, height: tilesY };
    }
}
