export var InputType;
(function (InputType) {
    InputType[InputType["KeyboardAndMouse"] = 0] = "KeyboardAndMouse";
    InputType[InputType["Gamepad"] = 1] = "Gamepad";
})(InputType || (InputType = {}));
export class Input {
    constructor(type) {
        // Create the event target
        this.Events = new EventTarget();
    }
}
