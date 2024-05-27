import { World } from "../world/world.js";
import { Actor, ActorType } from "./actor.js";

export class Enemy extends Actor {
    constructor(world:World) {
        super(ActorType.Enemy, world);
    }
}