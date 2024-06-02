import { Controller, ControllerType, ControllerAction } from './gameControls.js';

export class GamepadController extends Controller {
    private gamepadIndex: number;

    constructor(index: number) {
        super(ControllerType.Gamepad);
        this.gamepadIndex = index;
    }

    public update(): void {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (gamepad) {
            this.setAction(ControllerAction.Up, gamepad.buttons[12].pressed);
            this.setAction(ControllerAction.Down, gamepad.buttons[13].pressed);
            this.setAction(ControllerAction.Left, gamepad.buttons[14].pressed);
            this.setAction(ControllerAction.Right, gamepad.buttons[15].pressed);
            this.setAction(ControllerAction.Action1, gamepad.buttons[0].pressed);
            this.setAction(ControllerAction.Action2, gamepad.buttons[1].pressed);
            this.setAction(ControllerAction.Action3, gamepad.buttons[2].pressed);
            this.setAction(ControllerAction.Action4, gamepad.buttons[3].pressed);
            this.setAction(ControllerAction.Start, gamepad.buttons[9].pressed);
            this.setAction(ControllerAction.Select, gamepad.buttons[8].pressed);
        }
    }
}
