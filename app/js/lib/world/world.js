//#region Imports
import { Stage } from "./stage";
//#endregion
//#region World Class
export class World {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    get stage() {
        return this.currentStage;
    }
    get engine() {
        return this.gameEngine;
    }
    get viewport() {
        return this.gameEngine.viewport;
    }
    get viewableArea() {
        // get the camera position
        const cameraPos = this.gameEngine.viewport.camera.position;
        // get the viewport size
        const viewportSize = this.gameEngine.viewport.size;
        // calculate the viewable area
        // based on the camera position and the viewport size
        // pos is center of viewport
        return {
            x1: cameraPos.x - viewportSize.width / 2,
            y1: cameraPos.y - viewportSize.height / 2,
            x2: cameraPos.x + viewportSize.width / 2,
            y2: cameraPos.y + viewportSize.height / 2
        };
    }
    loadStage(stageName) {
        this.currentStage = new Stage(stageName, this);
    }
}
//#endregion
