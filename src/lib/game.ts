import { Stage } from "./stage.js";

export class Game {

    private gameStage:Stage         = null;
    private eventTarget:EventTarget = new EventTarget();

    public constructor() {
        
        // Log the game
        this.log('Game loaded');

    }

    public get stage() : Stage {
        return this.gameStage;
    }

    public get events() : EventTarget {
        return this.eventTarget;
    }

    public start() {

        // Setup the game
        this.setup();

        // Start animation loop
        this.animate();

        // Log the game
        this.log('Game started');
    }

    private setup() {

        // create 
        this.gameStage = new Stage('Level 1', this);

    }

    private animate() {

        // dispatch an event
        this.eventTarget.dispatchEvent(new Event('animate'));

        // Request the next animation frame
        requestAnimationFrame(() => this.animate());
    }

    public log(message:string, error?:boolean) {

        if (error) {
            console.error(message);
            return;
        }

        console.log(message);
    }

}