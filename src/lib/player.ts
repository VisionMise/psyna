import { Actor } from "./actor.js";
import { Position, Size, Stage } from "./stage.js";

export class Player extends Actor {

    public constructor(stage:Stage, position:Position) {

        const size:Size = { width: 64, height: 64 } as Size;

        super(stage, position, size, "./assets/player/player_normal_256.png");

        this.flag_ready = true;
    }

}