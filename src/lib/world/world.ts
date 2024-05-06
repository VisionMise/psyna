//#region Imports

    import { Stage } from "./stage";

//#endregion



//#region World Class


    export class World {

        private currentStage:Stage;

        public constructor() {
        }

        public get stage() : Stage {
            return this.currentStage;
        }        

        public loadStage(stageName:string) {
        }

    }

//#endregion