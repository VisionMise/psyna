import { Actor } from "./actor.js";
export class Player extends Actor {
    constructor(stage, position) {
        const size = { width: 64, height: 64 };
        super(stage, position, size, "./assets/player/player_normal_256.png");
        this.flag_ready = true;
    }
}
