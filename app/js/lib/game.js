import { Stage } from "./stage.js";
export class Game {
    constructor() {
        this.gameStage = null;
        this.eventTarget = new EventTarget();
        // Log the game
        this.log('Game loaded');
    }
    get stage() {
        return this.gameStage;
    }
    get events() {
        return this.eventTarget;
    }
    start() {
        // Setup the game
        this.setup();
        // Start animation loop
        this.animate();
        // Log the game
        this.log('Game started');
    }
    setup() {
        // create 
        this.gameStage = new Stage('Level 1', this);
    }
    animate() {
        // dispatch an event
        this.eventTarget.dispatchEvent(new Event('animate'));
        // Request the next animation frame
        requestAnimationFrame(() => this.animate());
    }
    log(message, error) {
        if (error) {
            console.error(message);
            return;
        }
        console.log(message);
    }
}
