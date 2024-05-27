import { GameController, GameControllerType, Controls } from "./gameControls.js";

export class Gamepad extends GameController {
    constructor(manager:Controls) {
        super(GameControllerType.Gamepad, manager);
    }
}