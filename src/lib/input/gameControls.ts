export enum GameControllerType {
    Keyboard,
    Gamepad
}

export class GameControls {
    
    controllers:GameController[];

    public Events:EventTarget;

    constructor() {
        this.controllers = [];
        this.Events = new EventTarget();
    }

}

export abstract class GameController {

    protected controllerType:GameControllerType;

    constructor(type:GameControllerType) {
        this.controllerType = type;
    }

    public get type() : GameControllerType {
        return this.controllerType;
    }
}