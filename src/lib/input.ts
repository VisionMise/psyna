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
    private keyBindings: Map<InputKey, string[]> = new Map();
    private keyStates: Map<InputKey, boolean> = new Map();

    public constructor() {
        super(InputType.KeyboardAndMouse);
        this.initKeyMap();
        this.initKeyEvents();
    }

    private initKeyMap(): void {

        // Up
        this.keyBindings.set(InputKey.Up, ['w', 'ArrowUp']);

        // Down
        this.keyBindings.set(InputKey.Down, ['s', 'ArrowDown']);

        // Left
        this.keyBindings.set(InputKey.Left, ['a', 'ArrowLeft']);

        // Right
        this.keyBindings.set(InputKey.Right, ['d', 'ArrowRight']);

        // Attack
        this.keyBindings.set(InputKey.Attack,[' ', 'Enter']);

        // Use Item
        this.keyBindings.set(InputKey.UseItem, ['Shift', 'q']);
        
        // Action 3
        this.keyBindings.set(InputKey.Action3, ['Control', 'e']);

        // Action 4
        this.keyBindings.set(InputKey.Action4, ['Alt', 'r']);
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

            // Check if the key is in the bindings
            if (binding.includes(key)) return action;
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

        // Check if the gamepad is connected
        if (!this.gamepadInput) return;

        // get the gamepad
        const gp = navigator.getGamepads()[this.gamepadInput.index];

        // Check if no gamepad return
        if (!gp) return;

        // Handle the axes
        const movement:boolean = this.handleAxis(gp.axes[0], gp.axes[1]);

        // Handle the buttons
        this.handleButtons(Array.from(gp.buttons), movement);
        
        // Request the next animation frame
        requestAnimationFrame(this.pollGamepad);
    };

        


    private handleAxis(xAxis: number, yAxis: number): boolean {
        // Handle horizontal movement
        const xd:boolean = this.handleAxisDirection(InputKey.Right, InputKey.Left, xAxis);

        // Handle vertical movement
        const yd:boolean = this.handleAxisDirection(InputKey.Down, InputKey.Up, yAxis);

        return (xd || yd);
    }

    private handleAxisDirection(positiveKey: InputKey, negativeKey: InputKey, value: number): boolean {

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
        } else {            
            this.resetDirection(positiveKey);
            this.resetDirection(negativeKey);
            return false;
        }
    }

        
    private setKeyState(key: InputKey, pressed: boolean): void {

        // Get the current state
        const currentState = this.keyStates.get(key) || false;

        // Check if the state has changed
        if (pressed === currentState) return;

        // Set the new state
        this.keyStates.set(key, pressed);

        // Dispatch the event
        const eventType = pressed ? 'pressed' : 'released';
        this.Events.dispatchEvent(new CustomEvent(eventType, { detail: { action: key, key, state: eventType } }));
    }

    private resetDirection(key: InputKey): void {
        if (this.keyStates.get(key)) {
            this.keyStates.set(key, false);
            this.Events.dispatchEvent(new CustomEvent('released', { detail: { action: key, key, state: 'released' } }));
        }
    }


    private handleButtons(buttons: GamepadButton[], movement:boolean = false): void {

        // Loop through the buttons
        buttons.forEach((button, index) => {

            // Check if the button is mapped
            if (!this.buttonMappings.has(index)) return;

            // Get the key
            const key = this.buttonMappings.get(index);

            // Set the previous state
            const previouslyPressed = this.keyStates.get(key) || false;

            // Check if the button is pressed
            if (button.pressed && !previouslyPressed) {

                // Get the action
                const action:string = InputKey[key];

                // Check if the key is a movement key
                // If it is, we only want to dispatch the event if no other movement key is pressed
                // This prevents diagonal movement
                // and ensures that only one movement key is pressed at a time
                if (movement && (key == InputKey.Up || key == InputKey.Down || key == InputKey.Left || key == InputKey.Right)) return;

                // Set the key state
                this.keyStates.set(key, true);

                // Dispatch the event
                this.Events.dispatchEvent(new CustomEvent('pressed', { detail: { action, key, state: 'pressed' } }));

            // Check if the button is released
            } else if (!button.pressed && previouslyPressed) {

                // Get the action
                const action:string = InputKey[key];

                // Check if the key is a movement key
                // If it is, we only want to dispatch the event if no other movement key is pressed
                // This prevents diagonal movement
                // and ensures that only one movement key is pressed at a time
                if (movement && (key == InputKey.Up || key == InputKey.Down || key == InputKey.Left || key == InputKey.Right)) return;

                // Set the key state
                this.keyStates.set(key, false);

                // Dispatch the event
                this.Events.dispatchEvent(new CustomEvent('released', { detail: { action, key, state: 'released' } }));

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