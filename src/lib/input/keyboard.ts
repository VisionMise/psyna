import { GameController, GameControllerType } from "./gameControls.js";

export class Keyboard extends GameController {
    constructor() {
        super(GameControllerType.Keyboard);
    }
}