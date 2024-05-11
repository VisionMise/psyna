//#region Imports
import { Viewport } from "../ui/viewport.js";
import { Stage } from "./stage.js";
//#endregion
//#region World Class
export class World {
    constructor(gameEngine) {
        // Set the game engine
        this.gameEngine = gameEngine;
        // Log the setup
        this.gameEngine.console('Creating the world');
        // Setup the world
        this.setup().then(() => {
            // Log the setup
            this.gameEngine.console('World created');
        });
    }
    get stage() {
        return this.currentStage;
    }
    get engine() {
        return this.gameEngine;
    }
    async loadStage(stageName) {
        // Load the stage
        this.currentStage = new Stage(stageName, this);
        // wait for the stage to load
        await this.currentStage.loaded();
    }
    async setup() {
        // create the viewport
        this.viewport = new Viewport();
    }
}
//#endregion
