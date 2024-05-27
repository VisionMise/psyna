export enum GameControllerType {
    Keyboard,
    Gamepad
}

export enum ControlType {
    Up      = 'up',
    Down    = 'down',
    Left    = 'left',
    Right   = 'right',
    Action1 = 'action1',
    Action2 = 'action2',
    Action3 = 'action3',
    Action4 = 'action4',
    Start   = 'start',
    Select  = 'select'
}

export class Controls {
    
    controllers:GameController[];

    public Events:EventTarget;

    constructor() {
        this.controllers = [];
        this.Events = new EventTarget();
    }


}

export abstract class GameController {

    protected controllerType:GameControllerType;
    protected manager:Controls;

    constructor(type:GameControllerType, manager:Controls) {
        this.controllerType = type;
        this.manager = manager;
    }

    public get type() : GameControllerType {
        return this.controllerType;
    }
}