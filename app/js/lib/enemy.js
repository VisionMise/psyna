import { Actor } from "./actor.js";
export class Enemy extends Actor {
    constructor(stage) {
        const position = { x: 0, y: 0 };
        const size = { width: 32, height: 32 };
        super(stage, position, size, 'assets/enemy.png');
    }
}
