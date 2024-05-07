//#region Imports

    import { BoxRect, Engine, Position, Size } from "../engine";
    import { Viewport } from "../output/viewport";
    import { Stage } from "./stage";

//#endregion



//#region World Class


    export class World {

        private currentStage:Stage;
        private gameEngine:Engine;

        public constructor(gameEngine:Engine) {
            this.gameEngine = gameEngine;
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
            const cameraPos:Position = this.gameEngine.viewport.camera.position

            // get the viewport size
            const viewportSize:Size = this.gameEngine.viewport.size;

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