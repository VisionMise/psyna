import { World } from "../world/world.js";
import { Actor } from "./actor.js";

export class Enemy extends Actor {
    constructor(world:World) {
        super('enemy', world);
    }
}