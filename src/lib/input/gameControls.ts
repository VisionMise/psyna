export enum ControllerType {
    Keyboard,
    Gamepad
}

export enum ControllerAction {
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

export interface ControllerEventDetail {
    action: ControllerAction;
    value: boolean;
}

export abstract class Controller {
    protected controllerType: ControllerType;
    protected controllerActions: Map<ControllerAction, boolean> = new Map();

    constructor(type: ControllerType) {
        this.controllerType = type;
    }

    public get type(): ControllerType {
        return this.controllerType;
    }

    public get actions(): Map<ControllerAction, boolean> {
        return this.controllerActions;
    }

    public setAction(action: ControllerAction, value: boolean): void {
        const currentValue = this.controllerActions.get(action) ?? false;
        if (currentValue !== value) {
            this.controllerActions.set(action, value);
            this.dispatchEvent(action, value);
        }
    }

    public getAction(action: ControllerAction): boolean {
        return this.controllerActions.get(action) ?? false;
    }

    public clearActions(): void {
        this.controllerActions.clear();
    }

    protected dispatchEvent(action: ControllerAction, value: boolean): void {
        const event = new CustomEvent<ControllerEventDetail>('controllerAction', {
            detail: { action, value }
        });
        window.dispatchEvent(event);
    }

    public abstract update(): void;
}

export class GameControllerManager {
    private controllers: Controller[] = [];

    public addController(controller: Controller): void {
        this.controllers.push(controller);
    }

    public update(): void {
        this.controllers.forEach(controller => controller.update());
    }
}