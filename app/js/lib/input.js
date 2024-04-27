export var InputType;
(function (InputType) {
    InputType[InputType["KeyboardAndMouse"] = 0] = "KeyboardAndMouse";
    InputType[InputType["Gamepad"] = 1] = "Gamepad";
})(InputType || (InputType = {}));
export var InputKey;
(function (InputKey) {
    InputKey["Up"] = "Up";
    InputKey["Down"] = "Down";
    InputKey["Left"] = "Left";
    InputKey["Right"] = "Right";
    InputKey["Attack"] = "Attack";
    InputKey["UseItem"] = "UseItem";
    InputKey["Action3"] = "Action3";
    InputKey["Action4"] = "Action4";
})(InputKey || (InputKey = {}));
export class Input {
    constructor(type) {
        // Set the input type
        this.inputType = type;
        // Create the event target
        this.Events = new EventTarget();
    }
    get type() {
        return this.inputType;
    }
}
export class KeyboardAndMouseInput extends Input {
    constructor() {
        super(InputType.KeyboardAndMouse);
        this.keyBindings = new Map();
        this.keyStates = new Map();
        this.initKeyMap();
        this.initKeyEvents();
    }
    initKeyMap() {
        // Up
        this.keyBindings.set(InputKey.Up, 'w');
        // Down
        this.keyBindings.set(InputKey.Down, 's');
        // Left
        this.keyBindings.set(InputKey.Left, 'a');
        // Right
        this.keyBindings.set(InputKey.Right, 'd');
        // Attack
        this.keyBindings.set(InputKey.Attack, ' ');
        // Use Item
        this.keyBindings.set(InputKey.UseItem, 'Shift');
        // Action 3
        this.keyBindings.set(InputKey.Action3, 'Control');
        // Action 4
        this.keyBindings.set(InputKey.Action4, 'Alt');
    }
    initKeyEvents() {
        window.addEventListener('keydown', (event) => {
            // Get the action from the key
            const action = this.getActionFromKey(event.key);
            if (action && !this.keyStates.get(action)) {
                this.keyStates.set(action, true);
                this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action, state: 'pressed' } }));
            }
        });
        window.addEventListener('keyup', (event) => {
            // Get the action from the key
            const action = this.getActionFromKey(event.key);
            if (action && this.keyStates.get(action)) {
                this.keyStates.set(action, false);
                this.Events.dispatchEvent(new CustomEvent('released', { detail: { action, state: 'released' } }));
            }
        });
    }
    getActionFromKey(key) {
        // Find the key in the key bindings
        for (const [action, binding] of this.keyBindings) {
            if (binding == key)
                return action;
        }
    }
    getKeyState(key) {
        return this.keyStates.get(key) || false;
    }
}
export class GamepadInput extends Input {
    constructor(gamepad) {
        super(InputType.Gamepad);
        this.keyStates = new Map();
        this.axisThreshold = 0.3;
        this.buttonMappings = new Map([
            [0, InputKey.Attack],
            [1, InputKey.UseItem],
            [2, InputKey.Action3],
            [3, InputKey.Action4]
        ]);
        this.pollGamepad = () => {
            if (!this.gamepadInput)
                return;
            const gp = navigator.getGamepads()[this.gamepadInput.index];
            if (gp) {
                this.handleAxis(gp.axes[0], gp.axes[1]);
                this.handleButtons(Array.from(gp.buttons)); // Convert readonly GamepadButton[] to GamepadButton[]
            }
            else {
                this.resetAllGamepadInputs();
            }
            requestAnimationFrame(this.pollGamepad);
        };
        this.gamepadInput = gamepad;
        if (!this.gamepadInput)
            return;
        this.initGamepadEvents();
    }
    get gamepad() {
        return this.gamepadInput;
    }
    initGamepadEvents() {
        requestAnimationFrame(this.pollGamepad);
    }
    resetAllGamepadInputs() {
        // Iterate over each button mapping entry
        this.buttonMappings.forEach((inputKey, _) => {
            // Reset the state for each mapped InputKey
            if (this.keyStates.get(inputKey)) {
                this.keyStates.set(inputKey, false);
                // Dispatch a 'released' event for the reset InputKey
                this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: inputKey, state: 'released' } }));
            }
        });
    }
    handleAxis(xAxis, yAxis) {
        this.updateDirection(InputKey.Right, InputKey.Left, xAxis);
        this.updateDirection(InputKey.Down, InputKey.Up, yAxis);
    }
    updateDirection(positiveKey, negativeKey, value) {
        // Threshold check to decide if movement is significant enough to be considered intentional
        if (Math.abs(value) > this.axisThreshold) {
            const key = value > 0 ? positiveKey : negativeKey;
            const oppositeKey = value > 0 ? negativeKey : positiveKey;
            // Set the intended direction active
            if (!this.keyStates.get(key)) {
                this.keyStates.set(key, true);
                this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action: key, key, state: 'pressed' } }));
            }
            // Ensure the opposite direction is inactive
            if (this.keyStates.get(oppositeKey)) {
                this.keyStates.set(oppositeKey, false);
                this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: oppositeKey, key: oppositeKey, state: 'released' } }));
            }
        }
        else {
            // Reset both directions if the stick is in the neutral zone
            this.resetDirection(positiveKey);
            this.resetDirection(negativeKey);
        }
    }
    resetDirection(key) {
        if (this.keyStates.get(key)) {
            this.keyStates.set(key, false);
            this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: key, key, state: 'released' } }));
        }
    }
    handleButtons(buttons) {
        buttons.forEach((button, index) => {
            if (this.buttonMappings.has(index)) {
                const key = this.buttonMappings.get(index);
                const previouslyPressed = this.keyStates.get(key) || false;
                if (button.pressed && !previouslyPressed) {
                    const action = InputKey[key];
                    this.keyStates.set(key, true);
                    this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action, key, state: 'pressed' } }));
                }
                else if (!button.pressed && previouslyPressed) {
                    const action = InputKey[key];
                    this.keyStates.set(key, false);
                    this.Events.dispatchEvent(new CustomEvent('released', { detail: { action, key, state: 'released' } }));
                }
            }
        });
    }
    getKeyState(key) {
        return this.keyStates.get(key) || false;
    }
}
export class InputDispatcher {
    constructor(input) {
        this.keyStates = new Map();
        this.input = input;
        this.initInputEvents();
    }
    get events() {
        return this.input.Events;
    }
    initInputEvents() {
        this.input.Events.addEventListener('pressed', (event) => {
            const key = event.detail.action;
            this.keyStates.set(key, true);
            //dispatch the event
            const actionEventName = InputKey[key];
            const actionEvent = new CustomEvent(actionEventName, { detail: { key, state: 'pressed' } });
            this.input.Events.dispatchEvent(actionEvent);
        });
        this.input.Events.addEventListener('released', (event) => {
            const key = event.detail.action;
            this.keyStates.set(key, false);
            //dispatch the event
            const actionEventName = InputKey[key];
            const actionEvent = new CustomEvent(actionEventName, { detail: { key, state: 'released' } });
            this.input.Events.dispatchEvent(actionEvent);
        });
    }
    getKeyState(key) {
        return this.keyStates.get(key) || false;
    }
}
