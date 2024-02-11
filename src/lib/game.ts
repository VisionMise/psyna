import { Player } from "./player.js";
import { Stage } from "./stage.js";

export class Game {

    private gameStage:Stage         = null;
    private eventTarget:EventTarget = new EventTarget();

    public players:Player[] = [];
    public  x:number = 0;

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

    public get player() : Player {
        return this.players[0];
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
        this.gameStage = new Stage("01", this);

        // create the player
        const player1:Player = new Player(this.gameStage);
        this.players.push(player1);

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