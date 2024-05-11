//#region imports

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

            // Create the world
            this.world = new World(this);

            // Wait for the world to be ready
            await this.world.loaded();

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