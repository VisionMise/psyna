import { Actor } from "../character/actor.js";
import { GameController, GameControllerType, Controls } from "./gameControls.js";

export class Gamepad extends GameController {
    constructor(actor:Actor, manager:Controls) {
        super(actor, GameControllerType.Gamepad, manager);
    }
}