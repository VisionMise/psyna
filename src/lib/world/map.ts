//#region Imports

    import { Position, Size } from "../engine";
    import { World } from "./world";

//#endregion



//#region enums

    export enum Shape {
        Rectangle,
        Circle,
        Polygon
    }

    export enum LayerType {
        TileLayer   = 'tilelayer',
        Object      = 'objectgroup',
        Image       = 'imagelayer'
    }

//#endregion



//#region Interfaces

    export interface MapObject {
        id:         number;
        name:       string;
        type:       string;
        size:       Size;
        position:   Position;
        rotation:   number;
        visible:    boolean;
        ellipse?:   boolean;
        polygon?:   Position[];
    }

    export interface MapConfiguration {
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

    export interface TilesetTile {
        id:         number;
        position:   Position;
        size:       Size;
        image:      ImageData;
    }
    
    export interface ShapeRect {
        x1:number;
        y1:number;
        x2:number;
        y2:number;
    }

    export interface ShapeCircle {
        position:Position;
        radius:number;
    }

    export interface ShapePolygon {
        position:Position;
        points:Position[];
    }

    export interface GameObject {
        position:Position;
        shape:Shape;
        boundry:ShapeRect|ShapeCircle|ShapePolygon;
    }

//#endregion



//#region Map Class

    export class Map {

        protected world:World;

        protected mapName:string;
        protected mapConfig:MapConfiguration;
        protected mapSpritesheet:ImageData;
        protected mapTileset:TilesetTile[];

        private flag_ready:boolean = false;

        public constructor(mapName:string, world:World) {
            
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

        public get name() : string {
            return this.mapName;
        }

        public get configuration() : any {
            return this.mapConfig;
        }

        public async loaded(): Promise<void> {
            return new Promise<void>(resolve => {
                const interval = setInterval(() => {
                    if (this.flag_ready) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }

        private async setup() : Promise<void> {

            // console log the stage name
            this.world.engine.console(`Loading stage: ${this.mapName}`);

            // load the stage configuration
            const jsonConfig:{} = await this.loadConfiguration();

            // create the map configuration
            this.createMapConfiguration(jsonConfig);

            // preload tileset
            await this.preloadTileSpriteSheet();

            // create tileset
            await this.createTilesetFromSpriteSheet();
        }

        private async loadConfiguration() {

            // path of configuration file
            const path:string = `./game/stage/${this.mapName}/${this.mapName}.json`;

            // load the configuration file
            const response = await fetch(path);

            // check if the configuration file was loaded successfully
            if (!response.ok) throw new Error(`Failed to load world ${this.mapName}`);

            // parse the configuration file
            const data = await response.json();

            // return the configuration data
            return data;
        }

        private createMapConfiguration(jsonConfig:any) {

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
            this.mapConfig.layers = jsonConfig.layers as StageLayer[];

            // structure layer data
            this.mapConfig.layers.forEach(layer => {
                if (layer.type === LayerType.TileLayer) {
                    layer.data = this.structureLayerData(layer);
                }
            });

        }

        private structureLayerData(layer:StageLayer) : [][] {
            
            // linear data
            const linearData:number[] = layer.data;

            // layer height and width
            const width = layer.width;
            const height = layer.height;
            let index:number = 0;

            // 2d tile data
            const structuredData:any = [];

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

        private async preloadTileSpriteSheet() : Promise<void> {

            // get the tileset image
            const image = new Image();
            image.src   = `./game/stage/${this.mapName}/${this.mapName}.tileset.png`;

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
            this.mapSpritesheet = imageData
        }

        private async createTilesetFromSpriteSheet() : Promise<void> {

            // get tile size from configuration
            const tileSize:Size = {
                width: this.mapConfig.tilesize.width,
                height: this.mapConfig.tilesize.height
            };

            // get the tileset image
            const spritesheet:ImageData = this.mapSpritesheet;

            // get the number of tiles in the spritesheet
            const tilesX:number = spritesheet.width / tileSize.width;
            const tilesY:number = spritesheet.height / tileSize.height;

            // create tileset
            const tileset:TilesetTile[] = [];

            // loop through the spritesheet
            for (let y = 0; y < tilesY; y++) {
                for (let x = 0; x < tilesX; x++) {

                    // get the tile position
                    const position:Position = {
                        x: x * tileSize.width,
                        y: y * tileSize.height
                    };

                    // get the tile image data
                    const tileImageData:ImageData = this.getTileImageData(position, tileSize, spritesheet);

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

        private getTileImageData(position:Position, size:Size, spritesheet:ImageData) : ImageData {

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