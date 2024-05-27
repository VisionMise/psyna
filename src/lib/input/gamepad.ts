import { GameController, GameControllerType } from "./gameControls.js";

export class Gamepad extends GameController {
    constructor() {
        super(GameControllerType.Gamepad);
    }
}