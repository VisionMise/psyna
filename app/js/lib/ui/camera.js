export var MovementType;
(function (MovementType) {
    MovementType[MovementType["Linear"] = 0] = "Linear";
    MovementType[MovementType["Smooth"] = 1] = "Smooth";
    MovementType[MovementType["Instant"] = 2] = "Instant";
})(MovementType || (MovementType = {}));
export class Camera {
    constructor(worldMap, engine, viewport) {
        this.currentSpeed = 10;
        this.currentZoom = 3;
        this.currentMovementType = MovementType.Smooth;
        // set the map
        // size in tiles
        this.worldMap = worldMap;
        // set the viewport
        // size in pixels
        this.currentViewport = viewport;
        // set the camera position
        // in pixels
        this.position = { x: 0, y: 0 };
        this.targetPosition = { ...this.position };
        // listen for the update_frame event
        // and call the update method
        engine.Events.addEventListener('frame_update', (event) => {
            const deltaTime = event?.detail ?? 0;
            this.update(deltaTime);
        });
    }
    get speed() {
        return this.currentSpeed;
    }
    set speed(speed) {
        this.currentSpeed = speed;
    }
    get zoom() {
        return this.currentZoom;
    }
    set zoom(zoom) {
        this.currentZoom = zoom;
    }
    get movementType() {
        return this.currentMovementType;
    }
    set movementType(movementType) {
        this.currentMovementType = movementType;
    }
    set position(position) {
        this.currentPosition = position;
    }
    get position() {
        return this.currentPosition;
    }
    get viewport() {
        return this.currentViewport;
    }
    get map() {
        return this.worldMap;
    }
    viewableTiles() {
        // assuming the camera is in the center
        // of the viewport
        // get the number of tiles that fit in the viewport
        // in pixels
        let tileCount = {
            width: Math.ceil(this.viewport.width / this.map.tileSize.width),
            height: Math.ceil(this.viewport.height / this.map.tileSize.height)
        };
        // adjust for zoom
        tileCount.width = Math.floor(tileCount.width / this.zoom);
        tileCount.height = Math.floor(tileCount.height / this.zoom);
        // return the tile count
        return tileCount;
    }
    area() {
        // buffer
        const buffer = 1;
        // get the count of viewable tiles
        const tiles = this.viewableTiles();
        // get the area in tiles
        let area = {
            x1: Math.floor(this.position.x / this.map.tileSize.width - tiles.width / 2) - buffer,
            y1: Math.floor(this.position.y / this.map.tileSize.height - tiles.height / 2) - buffer,
            x2: Math.ceil(this.position.x / this.map.tileSize.width + tiles.width / 2) + buffer,
            y2: Math.ceil(this.position.y / this.map.tileSize.height + tiles.height / 2) + buffer
        };
        return area;
    }
    center() {
        return this.position;
    }
    moveTo(position) {
        // set the target position
        this.targetPosition = { ...position };
    }
    update(deltaTime) {
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
        // Clamp the camera position
        this.clampPosition();
        // draw the camera center as a red circle
        const context = this.viewport.context;
        const center = this.viewport.center;
        context.beginPath();
        context.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
        context.closePath();
        // draw the camera bounds as a blue rectangle
        // centered 80% of the viewport
        const bounds = this.viewport.center;
        context.beginPath();
        context.rect(bounds.x - this.viewport.width * 0.4, bounds.y - this.viewport.height * 0.4, this.viewport.width * 0.8, this.viewport.height * 0.8);
        context.strokeStyle = 'blue';
        context.stroke();
        context.closePath();
    }
    update_linear(deltaTime, speed) {
        // Calculate the difference in position
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate the velocity
        const velocity = speed * 2 * deltaTime;
        if (distance < velocity) {
            this.currentPosition = { ...this.targetPosition };
        }
        else {
            //normalize the direction
            const nx = dx / distance;
            const ny = dy / distance;
            //move the camera
            this.currentPosition.x += nx * velocity;
            this.currentPosition.y += ny * velocity;
        }
    }
    update_smooth(deltaTime, speed) {
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
    update_instant() {
        this.currentPosition = { ...this.targetPosition };
    }
    clampPosition() {
        const halfViewportWidth = (this.viewport.width / 2) / this.currentZoom;
        const halfViewportHeight = (this.viewport.height / 2) / this.currentZoom;
        const mapWidthInPixels = this.map.size.width * this.map.tileSize.width;
        const mapHeightInPixels = this.map.size.height * this.map.tileSize.height;
        // Ensure the camera does not move out of the map boundaries
        this.currentPosition.x = Math.max(halfViewportWidth, Math.min(mapWidthInPixels - halfViewportWidth, this.currentPosition.x));
        this.currentPosition.y = Math.max(halfViewportHeight, Math.min(mapHeightInPixels - halfViewportHeight, this.currentPosition.y));
    }
}
