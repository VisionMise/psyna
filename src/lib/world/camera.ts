//#region Imports

    import { Position } from "../engine";
    import { Viewport } from "../output/viewport";
    import { Stage } from "./stage";

//#endregion



//#region Camera Class

    export class Camera {

        private currentPosition:Position;
        private currentZoom:number;
        private viewport:Viewport;

        public constructor(viewport:Viewport) {

            // Set the viewport
            this.viewport = viewport;            

            // Set up the camera
            this.setup();
        }
        
        public get position() : Position {
            return this.currentPosition;
        }

        public get zoom() : number {
            return this.currentZoom;
        }

        private setup() {
            // Set the initial position and zoom
            this.currentPosition = {x: 0, y: 0};
            this.currentZoom     = 1;
        }

    }

//#endregion