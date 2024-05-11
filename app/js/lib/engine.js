//#region imports
import { World } from "./world/world.js";
//#endregion
//#region constants
// Psyna Engine version
const PSYNA_VERSION = '0.0.1';
//#endregion
//#region enums
export var Shape;
(function (Shape) {
    Shape[Shape["Rectangle"] = 0] = "Rectangle";
    Shape[Shape["Circle"] = 1] = "Circle";
})(Shape || (Shape = {}));
//#endregion
//#region Game Engine
export class Engine {
    constructor() {
        this.Events = new EventTarget();
        // Log the setup
        this.console('Engine started');
        // Setup the world
        // then start the game
        this.setup().then(() => this.run());
    }
    startClock() {
        this.worldClock = setInterval(() => this.Events.dispatchEvent(new CustomEvent('clock_update')), 1000);
    }
    stopClock() {
        clearInterval(this.worldClock);
    }
    async setup() {
        // Create the world
        this.world = new World(this);
        // load the first stage
        this.world.loadStage('main');
        // Create a clock event
        this.startClock();
    }
    run(delta) {
        // raise the update event
        // every frame
        this.Events.dispatchEvent(new CustomEvent('frame_update', { detail: delta }));
        // request the next frame
        requestAnimationFrame(delta => this.run(delta));
    }
    console(message) {
        const title = "color: #08f; font-weight: bold;";
        const app = "color: #0084ff; font-size: 7px;";
        const style = "color: #9ab;";
        console.log(`%cPsyna %cv${PSYNA_VERSION}\n%c${message}`, title, app, style);
    }
}
//#endregion
