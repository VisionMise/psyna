//#region Enums

import { BoxRect, Position, Size } from "../engine";
import { World } from "./world";

    export enum LayerType {
        TileLayer   = 'tilelayer',
        Object      = 'objectgroup',
        Image       = 'imagelayer'
    }

    export enum ObjectShape {
        Polygon     = 'polygon',
        Rectangle   = 'rectangle',
        Circle      = 'circle'
    }

    export interface StageObject {
        id:         number;
        name:       string;
        type:       string;
        size:       Size;
        position:   Position;
        rotation:   number;
        shape:      ObjectShape;
        polygon?:   Position[];
    }

    export interface StageMap {
        dimensions: Size;
        tilesize:   Size;
        layers:     StageLayer[];
    }

    export interface StageLayer {
        id:         number;
        name:       string;
        type:       LayerType;
        position:   Position;
        image?:     any;
        width?:     number;
        height?:    number;
        data?:      any;
        objects?:   any;
        opacity?:   number;
        visible?:   boolean;
    }

//#endregion

//#region Stage Class

    export class Stage {

        protected stageName:string;
        protected stageConfiguration:any;
        protected stageMap:StageMap;
        protected world:World;

        public constructor(stageName:string, world:World) {

            // set the stage name
            this.stageName = stageName;

            // set the world
            this.world = world;

            // load the stage configuration
            this.setup();
        }

        public get name() : string {
            return this.stageName;
        }

        public get configuration() : any {
            return this.stageConfiguration;
        }

        private async setup() {

            // console log the stage name
            this.world.engine.console(`Loading stage ${this.stageName}`);

            // load the stage configuration
            this.stageConfiguration = await this.loadConfiguration();

            // import the stage map
            this.importStageMap();

            // add update event listener
            this.world.engine.Events.addEventListener('frame_update', this.update.bind(this));

        }

        private async loadConfiguration() {

            // path of configuration file
            const path:string = `./game/stage/${this.stageName}/${this.stageName}.json`;

            // load the configuration file
            const response = await fetch(path);

            // check if the configuration file was loaded successfully
            if (!response.ok) throw new Error(`Failed to load world ${this.stageName}`);

            // parse the configuration file
            const data = await response.json();

            // return the configuration data
            return data;
        }

        private importStageMap() {

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
            this.stageMap.layers = this.stageConfiguration.layers as StageLayer[];
            
        }

        private update() {

            // render the stage
            this.render();
            
        }

        private render() {

            // get viewable area from world camera
            const viewableArea = this.world.viewableArea;

            // render each layer
            this.stageMap.layers.forEach(layer => this.renderLayer(layer, viewableArea));


        }

        private renderLayer(layer:StageLayer, viewableArea:BoxRect) {

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

        private renderTileLayer(layer:StageLayer, viewableArea:BoxRect) {

            // check if the layer is visible
            if (!layer.visible) return;

            // get the tileset image
            const image = new Image();
            image.src = `./game/stage/${this.stageName}/${this.stageName}.tileset.png`;

            // get the layer data
            const data:number[] = layer.data;

            // get the tile size
            const tileSize:Size = this.stageMap.tilesize;

            // viewable area
            const viewable:BoxRect = viewableArea;

            // get the number of columns
            const cols:number = this.stageMap.dimensions.width / tileSize.width;

            // get the number of rows
            const rows:number = this.stageMap.dimensions.height / tileSize.height;

            // get the starting row
            const startRow:number = Math.floor(viewable.y1 / tileSize.height);

            // get the starting column
            const startCol:number = Math.floor(viewable.x1 / tileSize.width);

            // get the ending row
            const endRow:number = Math.floor(viewable.y2 / tileSize.height);

            // get the ending column
            const endCol:number = Math.floor(viewable.x2 / tileSize.width);

            // loop through the rows
            for (let row = startRow; row < endRow; row++) {

                // loop through the columns
                for (let col = startCol; col < endCol; col++) {

                    // get the tile index
                    const index:number = row * cols + col;

                    // get the tile id
                    const tileId:number = data[index];

                    // get the tile position
                    const position:Position = {
                        x: col * tileSize.width,
                        y: row * tileSize.height
                    };

                    // render the tile
                    this.renderTile(tileId, position, tileSize, image);

                }

            }
        }

        private renderObjectLayer(layer:StageLayer, viewableArea:BoxRect)  {

            // check if the layer is visible
            if (!layer.visible) return;

            // get the objects
            const objects:StageObject[] = layer.objects;

            // loop through the objects
            objects.forEach(object => this.renderObject(object));

        }

        private renderImageLayer(layer:StageLayer, viewableArea:BoxRect) {

            // check if the layer is visible
            if (!layer.visible) return;

            // get the image
            const image = new Image();
            image.src = `./game/stage/${this.stageName}/${layer.image}`;

            // get the image size
            const size:Size = {
                width: layer.width,
                height: layer.height
            };

            // get the position
            const position:Position = {
                x: layer.position.x,
                y: layer.position.y
            };

            // render the image
            this.renderImage(image, position, size);

        }

        private renderTile(tileId:number, position:Position, size:Size, image:HTMLImageElement) {
            
            // get the tileset
            const tileset = this.stageConfiguration.tilesets[0];

            // get the tileset size
            const tilesetSize:Size = {
                width: tileset.tilewidth,
                height: tileset.tileheight
            };

            // get the number of columns
            const cols:number = tileset.imagewidth / tilesetSize.width;

            // get the tile position
            const tilePosition:Position = {
                x: (tileId % cols) * tilesetSize.width,
                y: Math.floor(tileId / cols) * tilesetSize.height
            };

            // render the tile
            this.renderImage(image, position, size, tilePosition, tilesetSize);            
        }

        private renderImage(image: HTMLImageElement, position: Position, size: Size, tilePosition?: Position, tilesetSize?: Size) {

            // get the canvas context
            const context = this.world.viewport.context;

            // draw the image
            context.drawImage(image, tilePosition.x, tilePosition.y, tilesetSize.width, tilesetSize.height, position.x, position.y, size.width, size.height);

        }

        private renderObject(object:StageObject) {

            // create a polygon for the object
            const polygon:Position[] = object.polygon.map(point => {
                return {
                    x: object.position.x + point.x,
                    y: object.position.y + point.y
                };
            });

            // render the object
            this.renderPolygon(polygon);
        }

        private renderPolygon(polygon:Position[]) {

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