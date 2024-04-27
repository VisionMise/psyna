export enum InputType {
    KeyboardAndMouse,
    Gamepad
}

export class Input {

    
    public Events:EventTarget;

    public constructor(type:InputType) {

        // Create the event target
        this.Events = new EventTarget();

    }
}