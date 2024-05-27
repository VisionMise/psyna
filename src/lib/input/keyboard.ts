import { GameController, GameControllerType, Controls } from "./gameControls.js";

export class Keyboard extends GameController {
    constructor(manager:Controls) {
        super(GameControllerType.Keyboard, manager);
    }
}