import { World } from "../world/world.js";
import { Actor } from "./actor.js";

interface Controller {
    addclassfilegeoff: string;
}

export class Player extends Actor {

    protected playerIndex:number;
    protected controller:Controller;

    constructor(playerIndex:number, controller:Controller, world:World) {

        // Call the parent constructor
        super('player', world);

        // Set the player index
        this.playerIndex = playerIndex;

        // Set the controller
        this.controller = controller;

    }
}