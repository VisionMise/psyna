//#region Stage Class

    export class Stage {

        protected stageName:string;
        protected stageConfiguration:any;

        public constructor(stageName:string) {

            // set the stage name
            this.stageName = stageName;

            // load the stage configuration
            this.setup();
        }

        public get name() : string {
            return this.stageName;
        }

        private async setup() {

            // load the stage configuration
            this.stageConfiguration = await this.loadConfiguration();

            // load the stage assets
            await this.loadStageAssets();
        }

        private async loadConfiguration() {

            // path of configuration file
            const path:string = `./assets/world/${this.stageName}/config.json`;

            // load the configuration file
            const response = await fetch(path);

            // check if the configuration file was loaded successfully
            if (!response.ok) throw new Error(`Failed to load world ${this.stageName}`);

            // parse the configuration file
            const data = await response.json();

            // return the configuration data
            return data;
        }

        private async loadStageAssets() {

            // path of tileset
            const path:string = `./assets/world/${this.stageName}/tilesheet.png`;

            // load the tileset
            const image = new Image();

            // load the image
            image.src = path;

            // wait for the image to load
            await new Promise<void>(resolve => image.onload = () => resolve());

        }

    }

//#endregion