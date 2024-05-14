//#region imports

    import { Renderer } from "./rendering/renderer.js";
import { Camera } from "./ui/camera.js";
import { Viewport } from "./ui/viewport.js";
import { World } from "./world/world.js";

//#endregion



//#region constants

    // Psyna Engine version
    const PSYNA_VERSION = '0.0.2';

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


//#endregion



//#region Game Engine

    export class Engine {

        private world:World;
        private worldClock:number;
        private camera:Camera;        
        private renderer:Renderer;
        private lastFrameTime:number = Date.now();
        
        public readonly Events = new EventTarget();

        public constructor() {

            this.console('Welcome to Psyna');

            // Setup the world
            // then start the game
            this.setup().then(() => {

                // Run the game
                this.run()

                // Log the setup
                this.console('Game Engine running');

            });
        }

        public startClock() {
            this.worldClock = setInterval(() => this.Events.dispatchEvent(new CustomEvent('clock_update')), 1000);
        }

        public stopClock() {
            clearInterval(this.worldClock);
        }

        private async setup() {

            // create a new viewport
            const viewport:Viewport = new Viewport();

            // Create the world
            this.world = new World(this);

            // Wait for the world to be ready
            await this.world.loaded();

            // create a new camera
            this.camera = new Camera(this.world.map, this);

            // create a renderer
            this.renderer = new Renderer(this, viewport, this.world.map, this.camera);

            // Create a clock event
            this.startClock();
        }

        private async run() {
            // calculate the delta time
            const now:number = Date.now();
            const deltaTime:number = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime = now;

            // raise the update event
            // every frame
            await this.renderer.render();
            this.Events.dispatchEvent(new CustomEvent('frame_update', {detail:deltaTime}));

            // request the next frame
            requestAnimationFrame(async () => await this.run());
        }

        public console(message:string) {
            const title = "color: #08f; font-weight: bold;"
            const app   = "color: #0084ff; font-size: 7px;"
            const style = "color: #9ab;"
            console.log(`%cPsyna %cv${PSYNA_VERSION}\n%c${message}`, title, app, style);
        }

    }

//#endregion