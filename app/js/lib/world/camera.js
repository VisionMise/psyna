//#region Imports
//#endregion
//#region Camera Class
export class Camera {
    constructor(viewport) {
        // Set the viewport
        this.viewport = viewport;
        // Set up the camera
        this.setup();
    }
    get position() {
        return this.currentPosition;
    }
    get zoom() {
        return this.currentZoom;
    }
    setup() {
        // Set the initial position and zoom
        this.currentPosition = { x: 0, y: 0 };
        this.currentZoom = 1;
    }
}
//#endregion
