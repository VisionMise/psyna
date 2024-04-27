export enum InputType {
    KeyboardAndMouse,
    Gamepad
}

export enum InputKey {
    Up      = 'Up',
    Down    = 'Down',
    Left    = 'Left',
    Right   = 'Right',
    Attack  = 'Attack',
    UseItem = 'UseItem',
    Action3 = 'Action3',
    Action4 = 'Action4'
}

export abstract class Input {

    public Events:EventTarget;
    private inputType:InputType;

    public constructor(type:InputType) {

        // Set the input type
        this.inputType = type;

        // Create the event target
        this.Events = new EventTarget();

    }

    public abstract getKeyState(key:InputKey):boolean;

    public get type():InputType {
        return this.inputType;
    }
}


export class KeyboardAndMouseInput extends Input {
    private keyBindings: Map<InputKey, string> = new Map();
    private keyStates: Map<InputKey, boolean> = new Map();

    public constructor() {
        super(InputType.KeyboardAndMouse);
        this.initKeyMap();
        this.initKeyEvents();
    }

    private initKeyMap(): void {

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

    private initKeyEvents(): void {
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

    private getActionFromKey(key: string): InputKey {
        // Find the key in the key bindings
        for (const [action, binding] of this.keyBindings) {
            if (binding == key) return action;
        }
    }

    public getKeyState(key: InputKey): boolean {
        return this.keyStates.get(key) || false;
    }
}

export class GamepadInput extends Input {
    private gamepadInput: Gamepad;
    private keyStates: Map<InputKey, boolean> = new Map();
    private axisThreshold = 0.3;
    private buttonMappings: Map<number, InputKey> = new Map([
        [0, InputKey.Attack],
        [1, InputKey.UseItem],
        [2, InputKey.Action3],
        [3, InputKey.Action4]
    ]);

    public constructor(gamepad: Gamepad) {
        super(InputType.Gamepad);
        this.gamepadInput = gamepad;

        if (!this.gamepadInput) return;

        this.initGamepadEvents();


    }

    public get gamepad(): Gamepad {
        return this.gamepadInput;
    }

    private initGamepadEvents(): void {
        requestAnimationFrame(this.pollGamepad);
    }

    private pollGamepad = () => {

        if (!this.gamepadInput) return;

        const gp = navigator.getGamepads()[this.gamepadInput.index];
        if (gp) {
            this.handleAxis(gp.axes[0], gp.axes[1]);
            this.handleButtons(Array.from(gp.buttons)); // Convert readonly GamepadButton[] to GamepadButton[]
        } else {
            this.resetAllGamepadInputs();
        }
        requestAnimationFrame(this.pollGamepad);
    };

        
    private resetAllGamepadInputs() {
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

    private handleAxis(xAxis: number, yAxis: number): void {
        this.updateDirection(InputKey.Right, InputKey.Left, xAxis);
        this.updateDirection(InputKey.Down, InputKey.Up, yAxis);
    }

    private updateDirection(positiveKey: InputKey, negativeKey: InputKey, value: number): void {
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
        } else {
            // Reset both directions if the stick is in the neutral zone
            this.resetDirection(positiveKey);
            this.resetDirection(negativeKey);
        }
    }

    private resetDirection(key: InputKey): void {
        if (this.keyStates.get(key)) {
            this.keyStates.set(key, false);
            this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: key, key, state: 'released' } }));
        }
    }


    private handleButtons(buttons: GamepadButton[]): void {
        buttons.forEach((button, index) => {
            if (this.buttonMappings.has(index)) {
                const key = this.buttonMappings.get(index);
                const previouslyPressed = this.keyStates.get(key) || false;
                if (button.pressed && !previouslyPressed) {
                    const action:string = InputKey[key];
                    this.keyStates.set(key, true);
                    this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action, key, state: 'pressed' } }));
                } else if (!button.pressed && previouslyPressed) {
                    const action:string = InputKey[key];
                    this.keyStates.set(key, false);
                    this.Events.dispatchEvent(new CustomEvent('released', { detail: { action, key, state: 'released' } }));
                }
            }
        });
    }

    public getKeyState(key: InputKey): boolean {
        return this.keyStates.get(key) || false;
    }
}

export class InputDispatcher {
    private input: Input;
    private keyStates: Map<InputKey, boolean> = new Map();

    public constructor(input: Input) {
        this.input = input;
        this.initInputEvents();
    }

    public get events() : EventTarget {
        return this.input.Events;
    }

    private initInputEvents(): void {
        this.input.Events.addEventListener('pressed', (event) => {
            const key = (event as CustomEvent).detail.action;
            this.keyStates.set(key, true);

            //dispatch the event
            const actionEventName:string = InputKey[key];
            const actionEvent = new CustomEvent(actionEventName, { detail: { key, state: 'pressed' } });
            this.input.Events.dispatchEvent(actionEvent);
        });

        this.input.Events.addEventListener('released', (event) => {
            const key = (event as CustomEvent).detail.action;
            this.keyStates.set(key, false);

            //dispatch the event
            const actionEventName:string = InputKey[key];
            const actionEvent = new CustomEvent(actionEventName, { detail: { key, state: 'released' } });
            this.input.Events.dispatchEvent(actionEvent);
        });
    }

    public getKeyState(key: InputKey): boolean {
        return this.keyStates.get(key) || false;
    }
}