//#region Imports

    import { BoxRect, Engine, Position, Size } from "../engine.js";
    import { Viewport } from "../output/viewport.js";
    import { Stage } from "./stage.js";

//#endregion



//#region World Class


    export class World {

        private currentStage:Stage;
        private gameEngine:Engine;

        public constructor(gameEngine:Engine) {

            // Set the game engine
            this.gameEngine = gameEngine;

            // Log the setup
            this.gameEngine.console('World initialized');
        }

        public get stage() : Stage {
            return this.currentStage;
        }

        public get engine() : Engine {
            return this.gameEngine;
        }

        public get viewport() : Viewport {
            return this.gameEngine.viewport;
        }

        public get viewableArea() : BoxRect {

            // get the camera position
            const cameraPos:Position = this.viewport.camera.position

            // get the viewport size
            const viewportSize:Size = this.viewport.size;

            // calculate the viewable area
            // based on the camera position and the viewport size
            // pos is center of viewport
            return {
                x1: cameraPos.x - viewportSize.width / 2,
                y1: cameraPos.y - viewportSize.height / 2,
                x2: cameraPos.x + viewportSize.width / 2,
                y2: cameraPos.y + viewportSize.height / 2
            };

            
        }

        public loadStage(stageName:string) {
            this.currentStage = new Stage(stageName, this);
        }

    }

//#endregion