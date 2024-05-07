//#region imports

    import { Viewport } from "./output/viewport.js";
    import { Camera } from "./world/camera.js";
    import { World } from "./world/world.js";

//#endregion



//#region constants

    // Psyna Engine version
    const PSYNA_VERSION = '0.0.1';

//#endregion



//#region enums

    export enum Shape {
        Rectangle,
        Circle
    }

//#endregion



//#region interfaces

    export interface Position {
        x:number;
        y:number;
    }

    export interface Size {
        width:number;
        height:number;
    }

    export interface BoxRect {
        x1:number;
        y1:number;
        x2:number;
        y2:number;
    }

    export interface BoxCircle {
        position:Position;
        radius:number;
    }

    export interface GameObject {
        position:Position;
        shape:Shape;
        boundry:BoxRect|BoxCircle;
    }

//#endregion



//#region Game Engine

    export class Engine {

        public viewport:Viewport;
        private world:World;
        private worldClock:number;

        public readonly Events = new EventTarget();

        public constructor() {

            // Log the setup
            this.console('Engine started');

            // Setup the world
            // then start the game
            this.setup().then(() => this.run());
        }

        public startClock() {
            this.worldClock = setInterval(() => this.Events.dispatchEvent(new CustomEvent('clock_update')), 1000);
        }

        public stopClock() {
            clearInterval(this.worldClock);
        }

        private async setup() {

            // create the viewport
            this.viewport = new Viewport();

            // Set the camera
            this.viewport.camera = new Camera(this.viewport);

            // Create the world
            this.world = new World(this);

            // Create a clock event
            this.startClock();
        }

        private run(delta?:number) {
            // raise the update event
            // every frame
            this.Events.dispatchEvent(new CustomEvent('frame_update', {detail:delta}));

            // request the next frame
            requestAnimationFrame(delta => this.run(delta));
        }

        public console(message:string) {
            const title = "color: #08f; font-weight: bold;"
            const app   = "color: #0084ff; font-size: 7px;"
            const style = "color: #9ab;"
            console.log(`%cPsyna %cv${PSYNA_VERSION}\n%c${message}`, title, app, style);
        }

    }

//#endregion