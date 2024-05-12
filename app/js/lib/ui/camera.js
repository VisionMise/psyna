export class Camera {
    constructor(worldMap) {
        this.currentZoom = 3;
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
    viewableTiles(viewport) {
        // Assuming viewport dimensions are accessible via this.viewportWidth and this.viewportHeight
        const tileSize = this.map.tileSize;
        // Calculate the number of tiles that fit in the viewport's width and height
        const tilesX = Math.ceil(viewport.width / tileSize.width);
        const tilesY = Math.ceil(viewport.height / tileSize.height);
        return { width: tilesX, height: tilesY };
    }
}
