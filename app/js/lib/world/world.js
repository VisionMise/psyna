//#region Imports
import { Viewport } from "../ui/viewport.js";
import { Stage } from "./stage.js";
//#endregion
//#region World Class
export class World {
    constructor(gameEngine) {
        this.flag_ready = false;
        // Set the game engine
        this.gameEngine = gameEngine;
        // Setup the world
        this.setup().then(() => {
            // Set the ready flag
            this.flag_ready = true;
            // Log the setup
            this.gameEngine.console('Game world ready');
        });
        ;
    }
    get ready() {
        return this.flag_ready;
    }
    get stage() {
        return this.currentStage;
    }
    get engine() {
        return this.gameEngine;
    }
    async loaded() {
        // Wait for the world to be ready
        while (!this.ready) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    async loadStage(stageName = 'main') {
        // Load the stage
        this.currentStage = new Stage(stageName, this);
        // wait for the stage to load
        await this.currentStage.loaded();
    }
    async setup() {
        // create the viewport
        this.viewport = new Viewport();
        // Load the stage
        await this.loadStage();
    }
}
//#endregion
