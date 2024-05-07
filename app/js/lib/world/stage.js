//#region Enums
export var LayerType;
(function (LayerType) {
    LayerType["TileLayer"] = "tilelayer";
    LayerType["Object"] = "objectgroup";
    LayerType["Image"] = "imagelayer";
})(LayerType || (LayerType = {}));
export var ObjectShape;
(function (ObjectShape) {
    ObjectShape["Polygon"] = "polygon";
    ObjectShape["Rectangle"] = "rectangle";
    ObjectShape["Circle"] = "circle";
})(ObjectShape || (ObjectShape = {}));
//#endregion
//#region Stage Class
export class Stage {
    constructor(stageName, world) {
        // set the stage name
        this.stageName = stageName;
        // set the world
        this.world = world;
        // load the stage configuration
        this.setup();
    }
    get name() {
        return this.stageName;
    }
    get configuration() {
        return this.stageConfiguration;
    }
    async setup() {
        // load the stage configuration
        this.stageConfiguration = await this.loadConfiguration();
        // add update event listener
        this.world.engine.Events.addEventListener('update', this.update.bind(this));
        // import the stage map
        this.importStageMap();
    }
    async loadConfiguration() {
        // path of configuration file
        const path = `./assets/world/${this.stageName}/${this.stageName}.json`;
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
    importStageMap() {
        this.stageMap = {
            dimensions: {
                width: this.stageConfiguration.width,
                height: this.stageConfiguration.height
            },
            tilesize: {
                width: this.stageConfiguration.tilewidth,
                height: this.stageConfiguration.tileheight
            },
            layers: []
        };
        // get layers
        this.stageMap.layers = this.stageConfiguration.layers;
    }
    update() {
    }
    render() {
        // render each layer
        this.stageMap.layers.forEach(layer => this.renderLayer(layer));
    }
    renderLayer(layer) {
        switch (layer.type) {
            case LayerType.TileLayer:
                this.renderTileLayer(layer);
                break;
            case LayerType.Object:
                this.renderObjectLayer(layer);
                break;
            case LayerType.Image:
                this.renderImageLayer(layer);
                break;
        }
    }
    renderTileLayer(layer) {
    }
    renderObjectLayer(layer) {
    }
    renderImageLayer(layer) {
    }
    renderObject(object) {
    }
}
//#endregion
