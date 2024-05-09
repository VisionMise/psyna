//#region Imports
import { Stage } from "./stage.js";
//#endregion
//#region World Class
export class World {
    constructor(gameEngine) {
        // Set the game engine
        this.gameEngine = gameEngine;
        // Log the setup
        this.gameEngine.console('World initialized');
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
        const cameraPos = this.viewport.camera.position;
        // get the viewport size
        const viewportSize = this.viewport.size;
        // scale the viewport size
        // by the camera zoom level
        viewportSize.width *= this.viewport.camera.zoom;
        viewportSize.height *= this.viewport.camera.zoom;
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
    async loadStage(stageName) {
        // Load the stage
        this.currentStage = new Stage(stageName, this);
        // wait for the stage to load
        await this.currentStage.loaded();
        // Set camera bounds based on the stage dimensions
        const stageBounds = {
            x1: 0,
            y1: 0,
            x2: this.currentStage.configuration.width,
            y2: this.currentStage.configuration.height
        };
        // Set the camera bounds
        this.viewport.camera.bounds = stageBounds;
    }
}
//#endregion
