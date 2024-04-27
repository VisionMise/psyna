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
        this.keyBindings.set(InputKey.Up, ['w', 'ArrowUp']);
        // Down
        this.keyBindings.set(InputKey.Down, ['s', 'ArrowDown']);
        // Left
        this.keyBindings.set(InputKey.Left, ['a', 'ArrowLeft']);
        // Right
        this.keyBindings.set(InputKey.Right, ['d', 'ArrowRight']);
        // Attack
        this.keyBindings.set(InputKey.Attack, [' ', 'Enter']);
        // Use Item
        this.keyBindings.set(InputKey.UseItem, ['Shift', 'q']);
        // Action 3
        this.keyBindings.set(InputKey.Action3, ['Control', 'e']);
        // Action 4
        this.keyBindings.set(InputKey.Action4, ['Alt', 'r']);
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
            // Check if the key is in the bindings
            if (binding.includes(key))
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
            //Face buttons
            [0, InputKey.Attack],
            [1, InputKey.UseItem],
            [2, InputKey.Action3],
            [3, InputKey.Action4],
            //D-pad
            [12, InputKey.Up],
            [13, InputKey.Down],
            [14, InputKey.Left],
            [15, InputKey.Right]
        ]);
        this.pollGamepad = () => {
            // Check if the gamepad is connected
            if (!this.gamepadInput)
                return;
            // get the gamepad
            const gp = navigator.getGamepads()[this.gamepadInput.index];
            // Check if no gamepad return
            if (!gp)
                return;
            // Handle the axes
            const movement = this.handleAxis(gp.axes[0], gp.axes[1]);
            // Handle the buttons
            this.handleButtons(Array.from(gp.buttons), movement);
            // Request the next animation frame
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
    handleAxis(xAxis, yAxis) {
        // Handle horizontal movement
        const xd = this.handleAxisDirection(InputKey.Right, InputKey.Left, xAxis);
        // Handle vertical movement
        const yd = this.handleAxisDirection(InputKey.Down, InputKey.Up, yAxis);
        return (xd || yd);
    }
    handleAxisDirection(positiveKey, negativeKey, value) {
        // Check if the value is greater than the threshold
        if (Math.abs(value) > this.axisThreshold) {
            // Set the key state
            const key = value > 0 ? positiveKey : negativeKey;
            // Set the opposite key state
            const oppositeKey = value > 0 ? negativeKey : positiveKey;
            // Set the key state
            this.setKeyState(key, true);
            this.setKeyState(oppositeKey, false);
            // Return true
            return true;
            // Reset the key state
        }
        else {
            this.resetDirection(positiveKey);
            this.resetDirection(negativeKey);
            return false;
        }
    }
    setKeyState(key, pressed) {
        // Get the current state
        const currentState = this.keyStates.get(key) || false;
        // Check if the state has changed
        if (pressed === currentState)
            return;
        // Set the new state
        this.keyStates.set(key, pressed);
        // Dispatch the event
        const eventType = pressed ? 'pressed' : 'released';
        this.Events.dispatchEvent(new CustomEvent(eventType, { detail: { action: key, key, state: eventType } }));
    }
    resetDirection(key) {
        if (this.keyStates.get(key)) {
            this.keyStates.set(key, false);
            this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: key, key, state: 'released' } }));
        }
    }
    handleButtons(buttons, movement = false) {
        // Loop through the buttons
        buttons.forEach((button, index) => {
            // Check if the button is mapped
            if (!this.buttonMappings.has(index))
                return;
            // Get the key
            const key = this.buttonMappings.get(index);
            // Set the previous state
            const previouslyPressed = this.keyStates.get(key) || false;
            // Check if the button is pressed
            if (button.pressed && !previouslyPressed) {
                // Get the action
                const action = InputKey[key];
                // Check if the key is a movement key
                // If it is, we only want to dispatch the event if no other movement key is pressed
                // This prevents diagonal movement
                // and ensures that only one movement key is pressed at a time
                if (movement && (key == InputKey.Up || key == InputKey.Down || key == InputKey.Left || key == InputKey.Right))
                    return;
                // Set the key state
                this.keyStates.set(key, true);
                // Dispatch the event
                this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action, key, state: 'pressed' } }));
                // Check if the button is released
            }
            else if (!button.pressed && previouslyPressed) {
                // Get the action
                const action = InputKey[key];
                // Check if the key is a movement key
                // If it is, we only want to dispatch the event if no other movement key is pressed
                // This prevents diagonal movement
                // and ensures that only one movement key is pressed at a time
                if (movement && (key == InputKey.Up || key == InputKey.Down || key == InputKey.Left || key == InputKey.Right))
                    return;
                // Set the key state
                this.keyStates.set(key, false);
                // Dispatch the event
                this.Events.dispatchEvent(new CustomEvent('released', { detail: { action, key, state: 'released' } }));
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
