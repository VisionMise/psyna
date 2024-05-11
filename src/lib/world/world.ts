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

        private flag_ready:boolean = false;

        public constructor(gameEngine:Engine) {

            // Set the game engine
            this.gameEngine = gameEngine;

            // Setup the world
            this.setup().then(() => {
                    
                // Set the ready flag
                this.flag_ready = true;

                // Log the setup
                this.gameEngine.console('Game world ready');
            });;
        }

        public get ready() : boolean {
            return this.flag_ready;
        }

        public get stage() : Stage {
            return this.currentStage;
        }

        public get engine() : Engine {
            return this.gameEngine;
        }

        public async loaded() : Promise<void> {    
            // Wait for the world to be ready
            while (!this.ready) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        

        public async loadStage(stageName: string = 'main') : Promise<void> {

            // Load the stage
            this.currentStage = new Stage(stageName, this);

            // wait for the stage to load
            await this.currentStage.loaded();
        }

        private async setup() : Promise<void> {

            // create the viewport
            this.viewport = new Viewport();

            // Load the stage
            await this.loadStage();
        }

    }

//#endregion