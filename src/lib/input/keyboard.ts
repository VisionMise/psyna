import { Controller, ControllerType, ControllerAction } from './gameControls.js';

export class KeyboardController extends Controller {
    constructor() {
        super(ControllerType.Keyboard);
        this.initializeListeners();
    }

    private initializeListeners(): void {
        window.addEventListener('keydown', (event) => this.handleKey(event, true));
        window.addEventListener('keyup', (event) => this.handleKey(event, false));
    }

    private handleKey(event: KeyboardEvent, value: boolean): void {
        switch (event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.setAction(ControllerAction.Up, value);
                break;
            case 'arrowdown':
            case 's':
                this.setAction(ControllerAction.Down, value);
                break;
            case 'arrowleft':
            case 'a':
                this.setAction(ControllerAction.Left, value);
                break;
            case 'arrowright':
            case 'd':
                this.setAction(ControllerAction.Right, value);
                break;
            case 'space':
                this.setAction(ControllerAction.Action1, value);
                break;
            case 'e':
                this.setAction(ControllerAction.Action2, value);
                break;
            case 'r':
                this.setAction(ControllerAction.Action3, value);
                break;
            case 'f':
                this.setAction(ControllerAction.Action4, value);
                break;
            case 'enter':
                this.setAction(ControllerAction.Start, value);
                break;
            case 'escape':
                this.setAction(ControllerAction.Select, value);
                break;
        }
    }

    public update(): void {}
}