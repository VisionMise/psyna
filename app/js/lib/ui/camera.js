export class Camera {
    constructor(worldMap, engine) {
        this.currentZoom = 3;
        // set the map
        this.map = worldMap;
        // set the camera position
        this.position = { x: 4, y: 4 };
        this.targetPosition = this.position;
        // listen for the update_frame event
        // and call the update method
        engine.Events.addEventListener('frame_update', (event) => {
            const deltaTime = event?.detail ?? 0;
            this.update(deltaTime);
        });
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
    moveTo(position) {
        // set the target position
        this.targetPosition = position;
    }
    update(deltaTime, speed = 5) {
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
        if (distance < 0.1) { // Lowered threshold
            this.currentPosition.x = this.targetPosition.x;
            this.currentPosition.y = this.targetPosition.y;
        }
    }
}
