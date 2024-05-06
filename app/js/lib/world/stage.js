//#region Stage Class
export class Stage {
    constructor(stageName) {
        // set the stage name
        this.stageName = stageName;
        // load the stage configuration
        this.setup();
    }
    get name() {
        return this.stageName;
    }
    async setup() {
        // load the stage configuration
        this.stageConfiguration = await this.loadConfiguration();
        // load the stage assets
        await this.loadStageAssets();
    }
    async loadConfiguration() {
        // path of configuration file
        const path = `./assets/world/${this.stageName}/config.json`;
        // load the configuration file
        const response = await fetch(path);
        // check if the configuration file was loaded successfully
        if (!response.ok)
            throw new Error(`Failed to load world ${this.stageName}`);
        // parse the configuration file
        const data = await response.json();
        // return the configuration data
        return data;
    }
    async loadStageAssets() {
        // path of tileset
        const path = `./assets/world/${this.stageName}/tilesheet.png`;
        // load the tileset
        const image = new Image();
        // load the image
        image.src = path;
        // wait for the image to load
        await new Promise(resolve => image.onload = () => resolve());
    }
}
//#endregion
