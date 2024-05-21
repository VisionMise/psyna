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
        this.layerTilesets = [];
        this.flag_ready = false;
        // set the map name
        this.mapName = mapName;
        // set the world
        this.mapWorld = world;
        // load the map configuration
        this.setup().then(() => {
            // Set ready flag
            this.flag_ready = true;
        });
    }
    async tileToImage(tile) {
        return await createImageBitmap(tile.image);
    }
    get name() {
        return this.mapName;
    }
    get world() {
        return this.mapWorld;
    }
    get size() {
        return this.mapConfig.dimensions;
    }
    get bounds() {
        return {
            x1: 0,
            y1: 0,
            x2: this.size.width,
            y2: this.size.height
        };
    }
    get tileSize() {
        return this.mapConfig.tilesize;
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
        this.mapWorld.engine.console(`Loading stage: ${this.mapName}`);
        // load the stage configuration
        const jsonConfig = await this.loadConfiguration();
        // create the map configuration
        this.createMapConfiguration(jsonConfig);
        // preload tileset
        await this.preloadTileSpriteSheet();
        // create tileset for each layer
        this.mapConfig.layers.forEach(async (layer) => {
            if (layer.type === LayerType.TileLayer) {
                this.layerTilesets[layer.id] = await this.createTilesetForLayer(layer);
            }
        });
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
        this.mapWorld.engine.console("Loading map configuration");
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
                structuredData[y][x] = linearData[index] ?? -1;
                // increment the index
                index++;
            }
        }
        // return the structured data
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
        const context = canvas.getContext('2d', { alpha: true });
        context.imageSmoothingEnabled = false;
        context.globalCompositeOperation = 'source-over';
        // set the canvas size
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.style.imageRendering = 'pixelated';
        canvas.style.width = `${image.width}px`;
        canvas.style.height = `${image.height}px`;
        // draw the image
        context.drawImage(image, 0, 0);
        // get the image data
        const imageData = context.getImageData(0, 0, image.width, image.height);
        // add the image to the assets
        this.mapSpritesheet = imageData;
    }
    async createTilesetForLayer(layer) {
        this.mapWorld.engine.console(`Creating tileset for layer ${layer.name}`);
        // Get the tileset image
        const spritesheet = this.mapSpritesheet;
        const tileSize = this.mapConfig.tilesize;
        // Calculate the number of tiles in the spritesheet
        const tilesX = spritesheet.width / tileSize.width;
        const tilesY = spritesheet.height / tileSize.height;
        // Create tileset array
        const tileset = [];
        // Loop through the layer data which contains indices to the tiles used in this layer
        for (let y = 0; y < layer.data.length; y++) {
            for (let x = 0; x < layer.data[y].length; x++) {
                const tileId = layer.data[y][x];
                // get the tile position
                const tileX = (tileId % tilesX) * tileSize.width - tileSize.width;
                const tileY = Math.floor(tileId / tilesX) * tileSize.height;
                // Get the tile image data
                const position = { x: tileX, y: tileY };
                const tileImageData = this.getTileImageData(position, tileSize, spritesheet);
                tileset[tileId] = {
                    id: tileId,
                    position: position,
                    size: tileSize,
                    image: await createImageBitmap(tileImageData)
                };
            }
        }
        // Return the tileset
        return tileset;
    }
    getTileImageData(position, tileSize, spritesheet) {
        // create a canvas
        const canvas = document.createElement('canvas');
        canvas.style.imageRendering = 'pixelated';
        const context = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true
        });
        context.imageSmoothingEnabled = false;
        context.globalCompositeOperation = 'copy';
        // set the canvas size
        canvas.width = spritesheet.width;
        canvas.height = spritesheet.height;
        // draw the image
        context.putImageData(spritesheet, 0, 0);
        // get the image data
        const imageData = context.getImageData(position.x, position.y, tileSize.width, tileSize.height);
        // convert the image data to a canvas image source
        return imageData;
    }
    tile(layer, tileId) {
        // get the tileset for the layer
        const tileset = this.layerTilesets[layer.id];
        // get the tile
        return tileset[tileId] ?? null;
    }
    getTileData(layerId, x, y) {
        return this.mapConfig.layers[layerId].data[y][x];
    }
    layer(layerId) {
        return this.mapConfig.layers[layerId] ?? null;
    }
    area(area) {
        // Prepare the tile data structure
        const tileData = { layers: [] };
        // Iterate through all layers
        this.mapConfig.layers.forEach((layer, layerIndex) => {
            // Only process layers that have tile data
            if (!layer || !layer.data)
                return;
            //development todo
            //right not only tile layers are supported
            if (layer.type !== LayerType.TileLayer)
                return;
            // Get the layer data
            const layerData = layer.data;
            tileData.layers[layerIndex] = [];
            // Iterate through the specified rows and columns within bounds
            for (let y = area.y1; y < area.y2 && y < layerData.length; y++) {
                // Skip if the row doesn't exist
                if (!layerData[y])
                    continue;
                // Create the row if it doesn't exist                    
                if (!tileData.layers[layerIndex][y])
                    tileData.layers[layerIndex][y] = [];
                // Iterate through the specified columns within bounds
                for (let x = area.x1; x < area.x2 && x < layerData[y].length; x++) {
                    // Skip if the column doesn't exist
                    if (!layerData[y][x])
                        continue;
                    // Get the tile id
                    const tileId = layerData[y][x];
                    // Get the tile
                    const tile = this.tile(layer, tileId);
                    // Add the tile to the tile data
                    tileData.layers[layerIndex][y][x] = tile;
                }
            }
        });
        return tileData;
    }
    scale(camera, tileSize) {
        const zoomFactor = (camera.zoom / 10);
        const baseTileSize = tileSize.width;
        const scaleWidth = Math.floor(baseTileSize * zoomFactor);
        const scaleHeight = Math.floor(baseTileSize * zoomFactor);
        return { width: scaleWidth, height: scaleHeight };
    }
}
//#endregion
