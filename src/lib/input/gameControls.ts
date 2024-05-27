import { Actor, ActorType } from "../character/actor";

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
        this.controllers    = [];
        this.Events         = new EventTarget();
    }

}

export abstract class GameController {

    protected controllerType:GameControllerType;
    protected manager:Controls;
    protected actor:Actor;
    
    constructor(actor:Actor, type:GameControllerType, manager:Controls) {

        // Set the properties
        this.actor          = actor;
        this.controllerType = type;
        this.manager        = manager; 

        // Add the controller to the manager
        // if the actor is a player
        if (actor.type === ActorType.Player) this.manager.controllers.push(this);
    }

    public get type() : GameControllerType {
        return this.controllerType;
    }
}