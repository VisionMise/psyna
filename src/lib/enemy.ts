import { Actor } from "./actor.js";
import { Position, Size, Stage } from "./stage.js";

export class Enemy extends Actor {

    public constructor(stage:Stage) {

        
        const position:Position = { x: 0, y: 0 } as Position;
        const size:Size = { width: 32, height: 32 } as Size;

        super(stage, position, size, 'assets/enemy.png');
    }

}