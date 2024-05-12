//#region Imports
import { Map } from "./map.js";
//#endregion
//#region World Class
export class World {
    constructor(gameEngine) {
        this.worldTicks = 0;
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
    get map() {
        return this.currentMap;
    }
    get engine() {
        return this.gameEngine;
    }
    get ticks() {
        return this.worldTicks;
    }
    async loaded() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.ready) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    async loadMap(mapName = 'main') {
        // Load the map
        this.currentMap = new Map(mapName, this);
        // wait for the stage to load
        await this.currentMap.loaded();
    }
    async setup() {
        // hook in to the clock update event
        this.gameEngine.Events.addEventListener('clock_update', () => this.worldTicks++);
        // Load the map
        await this.loadMap();
    }
}
//#endregion
