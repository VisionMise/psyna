//#region Imports

    import { Engine } from "../engine.js";
    import { Viewport } from "../ui/viewport.js";
    import { Stage } from "./stage.js";

//#endregion



//#region World Class


    export class World {

        private currentStage:Stage;
        private gameEngine:Engine;
        private viewport:Viewport;

        public constructor(gameEngine:Engine) {

            // Set the game engine
            this.gameEngine = gameEngine;

            // Log the setup
            this.gameEngine.console('Creating the world');

            // Setup the world
            this.setup().then(() => {

                // Log the setup
                this.gameEngine.console('World created');

            });
        }

        public get stage() : Stage {
            return this.currentStage;
        }

        public get engine() : Engine {
            return this.gameEngine;
        }

        public async loadStage(stageName: string) {

            // Load the stage
            this.currentStage = new Stage(stageName, this);

            // wait for the stage to load
            await this.currentStage.loaded();
        }

        private async setup() : Promise<void> {

            // create the viewport
            this.viewport = new Viewport();

        }

    }

//#endregion