//#region Imports
//#endregion
//#region enums
export var Shape;
(function (Shape) {
    Shape[Shape["Rectangle"] = 0] = "Rectangle";
    Shape[Shape["Circle"] = 1] = "Circle";
    Shape[Shape["Polygon"] = 2] = "Polygon";
})(Shape || (Shape = {}));
export var LayerType;
(function (LayerType) {
    LayerType["TileLayer"] = "tilelayer";
    LayerType["Object"] = "objectgroup";
    LayerType["Image"] = "imagelayer";
})(LayerType || (LayerType = {}));
//#endregion
//#region Map Class
export class Map {
    constructor(mapName, world) {
        this.flag_ready = false;
        // set the map name
        this.mapName = mapName;
        // set the world
        this.world = world;
        // load the map configuration
        this.setup().then(() => {
            // Set ready flag
            this.flag_ready = true;
        });
    }
    get name() {
        return this.mapName;
    }
    get configuration() {
        return this.mapConfig;
    }
    async loaded() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.flag_ready) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    async setup() {
        // console log the stage name
        this.world.engine.console(`Loading stage: ${this.mapName}`);
        // load the stage configuration
        const jsonConfig = await this.loadConfiguration();
        // create the map configuration
        this.createMapConfiguration(jsonConfig);
        // preload tileset
        await this.preloadTileSpriteSheet();
        // create tileset
        await this.createTilesetFromSpriteSheet();
    }
    async loadConfiguration() {
        // path of configuration file
        const path = `./game/stage/${this.mapName}/${this.mapName}.json`;
        // load the configuration file
        const response = await fetch(path);
        // check if the configuration file was loaded successfully
        if (!response.ok)
            throw new Error(`Failed to load world ${this.mapName}`);
        // parse the configuration file
        const data = await response.json();
        // return the configuration data
        return data;
    }
    createMapConfiguration(jsonConfig) {
        this.mapConfig = {
            dimensions: {
                width: jsonConfig.width,
                height: jsonConfig.height
            },
            tilesize: {
                width: jsonConfig.tilewidth,
                height: jsonConfig.tileheight
            },
            layers: []
        };
        // get layers
        this.mapConfig.layers = jsonConfig.layers;
        // structure layer data
        this.mapConfig.layers.forEach(layer => {
            if (layer.type === LayerType.TileLayer) {
                layer.data = this.structureLayerData(layer);
            }
        });
    }
    structureLayerData(layer) {
        // linear data
        const linearData = layer.data;
        // layer height and width
        const width = layer.width;
        const height = layer.height;
        let index = 0;
        // 2d tile data
        const structuredData = [];
        // loop through the linear data
        for (let y = 0; y < height; y++) {
            // create a new row
            structuredData[y] = [];
            // loop through the row
            for (let x = 0; x < width; x++) {
                // add the tile to the row
                structuredData[y][x] = linearData[index] ?? 0;
                index++;
            }
        }
        return structuredData;
    }
    async preloadTileSpriteSheet() {
        // get the tileset image
        const image = new Image();
        image.src = `./game/stage/${this.mapName}/${this.mapName}.tileset.png`;
        // wait for the image to load
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });
        // get image data
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        // set the canvas size
        canvas.width = image.width;
        canvas.height = image.height;
        // draw the image
        context.drawImage(image, 0, 0);
        // get the image data
        const imageData = context.getImageData(0, 0, image.width, image.height);
        // add the image to the assets
        this.mapSpritesheet = imageData;
    }
    async createTilesetFromSpriteSheet() {
        // get tile size from configuration
        const tileSize = {
            width: this.mapConfig.tilesize.width,
            height: this.mapConfig.tilesize.height
        };
        // get the tileset image
        const spritesheet = this.mapSpritesheet;
        // get the number of tiles in the spritesheet
        const tilesX = spritesheet.width / tileSize.width;
        const tilesY = spritesheet.height / tileSize.height;
        // create tileset
        const tileset = [];
        // loop through the spritesheet
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                // get the tile position
                const position = {
                    x: x * tileSize.width,
                    y: y * tileSize.height
                };
                // get the tile image data
                const tileImageData = this.getTileImageData(position, tileSize, spritesheet);
                // add the tile to the tileset
                tileset.push({
                    id: tileset.length,
                    position: position,
                    size: tileSize,
                    image: tileImageData
                });
            }
        }
        // set the tileset
        this.mapTileset = tileset;
    }
    getTileImageData(position, size, spritesheet) {
        // create a canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        // set the canvas size
        canvas.width = size.width;
        canvas.height = size.height;
        // draw the image
        context.putImageData(spritesheet, 0, 0);
        // get the image data
        return context.getImageData(position.x, position.y, size.width, size.height);
    }
}
//#endregion
