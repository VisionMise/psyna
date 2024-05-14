export var MovementType;
(function (MovementType) {
    MovementType[MovementType["Linear"] = 0] = "Linear";
    MovementType[MovementType["Smooth"] = 1] = "Smooth";
    MovementType[MovementType["Instant"] = 2] = "Instant";
})(MovementType || (MovementType = {}));
export class Camera {
    constructor(worldMap, engine) {
        this.currentSpeed = 10;
        this.currentZoom = 3;
        this.currentMovementType = MovementType.Linear;
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
    }
    update_linear(deltaTime, speed) {
        // Calculate the difference in position
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate the velocity
        const velocity = speed * 2 * deltaTime;
        if (distance < velocity) {
            this.currentPosition = this.targetPosition;
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
        this.currentPosition = this.targetPosition;
    }
}
