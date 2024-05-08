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
        // console log the stage name
        this.world.engine.console(`Loading stage ${this.stageName}`);
        // load the stage configuration
        this.stageConfiguration = await this.loadConfiguration();
        // import the stage map
        this.importStageMap();
        // add update event listener
        this.world.engine.Events.addEventListener('frame_update', this.update.bind(this));
    }
    async loadConfiguration() {
        // path of configuration file
        const path = `./game/stage/${this.stageName}/${this.stageName}.json`;
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
        // render the stage
        this.render();
    }
    render() {
        // get viewable area from world camera
        const viewableArea = this.world.viewableArea;
        // render each layer
        this.stageMap.layers.forEach(layer => this.renderLayer(layer, viewableArea));
    }
    renderLayer(layer, viewableArea) {
        switch (layer.type) {
            case LayerType.TileLayer:
                this.renderTileLayer(layer, viewableArea);
                break;
            case LayerType.Object:
                // this.renderObjectLayer(layer, viewableArea);
                break;
            case LayerType.Image:
                // this.renderImageLayer(layer, viewableArea);
                break;
        }
    }
    renderTileLayer(layer, viewableArea) {
        // check if the layer is visible
        if (!layer.visible)
            return;
        // get the tileset image
        const image = new Image();
        image.src = `./game/stage/${this.stageName}/${this.stageName}.tileset.png`;
        // get the layer data
        const data = layer.data;
        // get the tile size
        const tileSize = this.stageMap.tilesize;
        // viewable area
        const viewable = viewableArea;
        // get the number of columns
        const cols = this.stageMap.dimensions.width / tileSize.width;
        // get the number of rows
        const rows = this.stageMap.dimensions.height / tileSize.height;
        // get the starting row
        const startRow = Math.floor(viewable.y1 / tileSize.height);
        // get the starting column
        const startCol = Math.floor(viewable.x1 / tileSize.width);
        // get the ending row
        const endRow = Math.floor(viewable.y2 / tileSize.height);
        // get the ending column
        const endCol = Math.floor(viewable.x2 / tileSize.width);
        // loop through the rows
        for (let row = startRow; row < endRow; row++) {
            // loop through the columns
            for (let col = startCol; col < endCol; col++) {
                // get the tile index
                const index = row * cols + col;
                // get the tile id
                const tileId = data[index];
                // get the tile position
                const position = {
                    x: col * tileSize.width,
                    y: row * tileSize.height
                };
                // render the tile
                this.renderTile(tileId, position, tileSize, image);
            }
        }
    }
    renderObjectLayer(layer, viewableArea) {
        // check if the layer is visible
        if (!layer.visible)
            return;
        // get the objects
        const objects = layer.objects;
        // loop through the objects
        objects.forEach(object => this.renderObject(object));
    }
    renderImageLayer(layer, viewableArea) {
        // check if the layer is visible
        if (!layer.visible)
            return;
        // get the image
        const image = new Image();
        image.src = `./game/stage/${this.stageName}/${layer.image}`;
        // get the image size
        const size = {
            width: layer.width,
            height: layer.height
        };
        // get the position
        const position = {
            x: layer.position.x,
            y: layer.position.y
        };
        // render the image
        this.renderImage(image, position, size);
    }
    renderTile(tileId, position, size, image) {
        // get the tileset
        const tileset = this.stageConfiguration.tilesets[0];
        // get the tileset size
        const tilesetSize = {
            width: tileset.tilewidth,
            height: tileset.tileheight
        };
        // get the number of columns
        const cols = tileset.imagewidth / tilesetSize.width;
        // get the tile position
        const tilePosition = {
            x: (tileId % cols) * tilesetSize.width,
            y: Math.floor(tileId / cols) * tilesetSize.height
        };
        // render the tile
        this.renderImage(image, position, size, tilePosition, tilesetSize);
    }
    renderImage(image, position, size, tilePosition, tilesetSize) {
        // get the canvas context
        const context = this.world.viewport.context;
        // draw the image
        context.drawImage(image, tilePosition.x, tilePosition.y, tilesetSize.width, tilesetSize.height, position.x, position.y, size.width, size.height);
    }
    renderObject(object) {
        // create a polygon for the object
        const polygon = object.polygon.map(point => {
            return {
                x: object.position.x + point.x,
                y: object.position.y + point.y
            };
        });
        // render the object
        this.renderPolygon(polygon);
    }
    renderPolygon(polygon) {
        // get the canvas context
        const context = this.world.viewport.context;
        // start the path
        context.beginPath();
        // move to the first point
        context.moveTo(polygon[0].x, polygon[0].y);
        // loop through the points
        for (let i = 1; i < polygon.length; i++) {
            context.lineTo(polygon[i].x, polygon[i].y);
        }
        // close the path
        context.closePath();
        // stroke the path
        context.stroke();
    }
}
//#endregion
