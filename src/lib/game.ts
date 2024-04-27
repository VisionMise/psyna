import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Input, KeyboardAndMouseInput, GamepadInput, InputDispatcher, InputType } from "./input.js";

export class Game {

    private gameStage:Stage                 = null;
    private controller:Input[]              = [];
    private dispatcher:InputDispatcher[]    = [];
    private eventTarget:EventTarget         = new EventTarget();

    public players:Player[] = [];
    public x:number = 0;

    public constructor() {
        
        // Log the game
        this.log('Game loaded');

    }

    public get stage() : Stage {
        return this.gameStage;
    }

    public get events() : EventTarget {
        return this.eventTarget;
    }

    public get player() : Player {
        return this.players[0];
    }

    public start() {

        // Setup the game
        this.setup();

        // Start animation loop
        this.animate();

        // Log the game
        this.log('Game started');
    }

    private setup() {

        // init input control
        this.initKeyboardInput();
        this.initGamepadInput();
        
        // create game stage
        this.gameStage = new Stage("01", this);

        // create the player
        const player1:Player = new Player(this.gameStage);
        this.players.push(player1);

    }

    private initKeyboardInput() {
        // input control
        const KeyboardAndMouse = new KeyboardAndMouseInput();
        this.controller.push(KeyboardAndMouse);

        // setup the dispatcher
        const dispatcher = new InputDispatcher(KeyboardAndMouse);
        this.dispatcher.push(dispatcher);
    }

    private initGamepadInput() {
        
        // Check for gamepad
        const gamepads = navigator.getGamepads();

        // Check for gamepad
        if (gamepads.length > 0) {

            // Create the gamepad input
            const gamepad:GamepadInput = new GamepadInput(gamepads[0]);
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

            // Log the gamepad
            this.log('Gamepad connected');
        });

        // hook up the gamepad disconnected event
        window.addEventListener('gamepaddisconnected', (event) => {

            // Get the gamepad
            const gamepad = event.gamepad;

            // Find the gamepad input
            const index = this.controller.findIndex(input => input.type == InputType.Gamepad && (input as GamepadInput).gamepad.index == gamepad.index);

            // Remove the gamepad input
            if (index >= 0) {
                this.controller.splice(index, 1);
                this.dispatcher.splice(index, 1);
            }

            // Log the gamepad
            this.log('Gamepad disconnected');
        });
    }

    private animate() {

        // dispatch an event
        this.eventTarget.dispatchEvent(new Event('animate'));

        // Request the next animation frame
        requestAnimationFrame(() => this.animate());
    }

    public log(message:string, error?:boolean) {

        if (error) {
            console.error(message);
            return;
        }

        console.log(message);
    }

}