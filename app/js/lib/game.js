import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { KeyboardAndMouseInput, GamepadInput, InputDispatcher, InputType, InputKey } from "./input.js";
export class Game {
    constructor() {
        this.gameStage = null;
        this.controller = [];
        this.dispatcher = [];
        this.eventTarget = new EventTarget();
        this.players = [];
        this.x = 0;
        // Log the game
        this.log('Game loaded');
    }
    get stage() {
        return this.gameStage;
    }
    get events() {
        return this.eventTarget;
    }
    get player() {
        return this.players[0];
    }
    start() {
        // Setup the game
        this.setup();
        // Start animation loop
        this.animate();
        // Log the game
        this.log('Game started');
    }
    setup() {
        // init input control
        this.initKeyboardInput();
        this.initGamepadInput();
        // create game stage
        this.gameStage = new Stage("01", this);
        // create the player
        const player1 = new Player(this.gameStage);
        this.players.push(player1);
        // bind the controls
        this.bindControls(this.dispatcher, player1);
    }
    initKeyboardInput() {
        // input control
        const KeyboardAndMouse = new KeyboardAndMouseInput();
        this.controller.push(KeyboardAndMouse);
        // setup the dispatcher
        const dispatcher = new InputDispatcher(KeyboardAndMouse);
        this.dispatcher.push(dispatcher);
    }
    initGamepadInput() {
        // Check for gamepad
        const gamepads = navigator.getGamepads();
        // Check for gamepad
        if (gamepads.length > 0) {
            // Create the gamepad input
            const gamepad = new GamepadInput(gamepads[0]);
            this.controller.push(gamepad);
            // setup the dispatcher
            const dispatcher = new InputDispatcher(gamepad);
            this.dispatcher.push(dispatcher);
            // Log the gamepad
            this.log('Gamepad connected');
        }
        // hook up the gamepad connected event
        window.addEventListener('gamepadconnected', (event) => {
            // Get the gamepad
            const gamepad = event.gamepad;
            // Create the gamepad input
            const gamepadInput = new GamepadInput(gamepad);
            this.controller.push(gamepadInput);
            // setup the dispatcher
            const dispatcher = new InputDispatcher(gamepadInput);
            this.dispatcher.push(dispatcher);
            // bind the controls
            this.bindControls([dispatcher], this.player);
            // Log the gamepad
            this.log('Gamepad connected');
        });
        // hook up the gamepad disconnected event
        window.addEventListener('gamepaddisconnected', (event) => {
            // Get the gamepad
            const gamepad = event.gamepad;
            // Find the gamepad input
            const index = this.controller.findIndex(controller => controller.type == InputType.Gamepad);
            // Remove the gamepad input
            if (index >= 0) {
                this.controller.splice(index, 1);
                this.dispatcher.splice(index, 1);
            }
            // Log the gamepad
            this.log('Gamepad disconnected');
        });
    }
    bindControls(dispatchers, actor) {
        // actions
        const actions = [
            InputKey.Up,
            InputKey.Down,
            InputKey.Left,
            InputKey.Right,
            InputKey.Attack,
            InputKey.UseItem
        ];
        // Bind the controls
        dispatchers.forEach(dispatcher => {
            for (const action of actions) {
                dispatcher.events.addEventListener(action, (event) => {
                    actor.setActionState(action, event.detail.state == 'pressed');
                });
            }
        });
    }
    animate() {
        // dispatch an event
        this.eventTarget.dispatchEvent(new Event('animate'));
        // Request the next animation frame
        requestAnimationFrame(() => this.animate());
    }
    log(message, error) {
        if (error) {
            console.error(message);
            return;
        }
        console.log(message);
    }
}
