import { Player } from "./player.js";
import { Stage } from "./stage.js";
export class Game {
    constructor() {
        this.gameStage = null;
        this.eventTarget = new EventTarget();
        this.players = [];
        this.x = 0;
        // Log the game
        this.log('Game loaded');
    }
    get stage() {
        return this.gameStage;
    }
    get events() {
        return this.eventTarget;
    }
    get player() {
        return this.players[0];
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
        this.gameStage = new Stage("01", this);
        // create the player
        const player1 = new Player(this.gameStage);
        this.players.push(player1);
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
