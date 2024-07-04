import { World } from "../world/world.js";
import { Actor, ActorType } from "./actor.js";

interface Controller {
    addclassfilegeoff: string;
}

export class Player extends Actor {

    protected playerIndex:number;
    protected controller:Controller;

    constructor(playerIndex:number, world:World) {

        // Call the parent constructor
        super(ActorType.Player, world);

        // Set the player index
        this.playerIndex = playerIndex;
    }

    public setController(controller:Controller) {
        this.controller = controller;
    }
}