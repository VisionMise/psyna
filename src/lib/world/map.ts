//#region Imports

    import { Position, Size } from "../engine";
import { Camera } from "../ui/camera";
import { Viewport } from "../ui/viewport";
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
        layers:     MapLayer[];
    }

    export interface MapLayer {
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
        image:      ImageBitmap;
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

        public async tileToImage(tile: TilesetTile): Promise<ImageBitmap>{
            return await createImageBitmap(tile.image);
        }

        protected world:World;

        protected mapName:string;
        protected mapConfig:MapConfiguration;
        protected mapSpritesheet:ImageData;
        protected layerTilesets:TilesetTile[][] = [];

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

        public get size() : Size {
            return this.mapConfig.dimensions;
        }

        public get tileSize() : Size {
            return this.mapConfig.tilesize;
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

            // create tileset for each layer
            this.mapConfig.layers.forEach(async layer => {
                if (layer.type === LayerType.TileLayer) {
                    this.layerTilesets[layer.id] = await this.createTilesetForLayer(layer);
                }
            });

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

            this.world.engine.console("Loading map configuration");

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
            this.mapConfig.layers = jsonConfig.layers as MapLayer[];

            // structure layer data
            this.mapConfig.layers.forEach(layer => {
                if (layer.type === LayerType.TileLayer) {
                    layer.data = this.structureLayerData(layer);
                }
            });

        }

        private structureLayerData(layer:MapLayer) : [][] {
            
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
                    structuredData[y][x] = linearData[index] ?? -1;

                    // increment the index
                    index++;

                }

            }

            // return the structured data
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
            const context = canvas.getContext('2d', {alpha: true} );
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
            this.mapSpritesheet = imageData
        }


        private async createTilesetForLayer(layer: MapLayer): Promise<TilesetTile[]> {

            this.world.engine.console(`Creating tileset for layer ${layer.name}`);

            // Get the tileset image
            const spritesheet: ImageData = this.mapSpritesheet;
            const tileSize = this.mapConfig.tilesize;

            // Calculate the number of tiles in the spritesheet
            const tilesX: number = spritesheet.width / tileSize.width;
            const tilesY: number = spritesheet.height / tileSize.height;

            // Create tileset array
            const tileset: TilesetTile[] = [];

            // Loop through the layer data which contains indices to the tiles used in this layer
            for (let y = 0; y < layer.data.length; y++) {
                for (let x = 0; x < layer.data[y].length; x++) {

                    const tileId = layer.data[y][x];

                    // get the tile position
                    const tileX = (tileId % tilesX) * tileSize.width - tileSize.width;
                    const tileY = Math.floor(tileId / tilesX) * tileSize.height;

                    // Get the tile image data
                    const position: Position = { x: tileX, y: tileY };
                    const tileImageData: ImageData = this.getTileImageData(position, tileSize, spritesheet);

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


        private getTileImageData(position:Position, tileSize:Size, spritesheet:ImageData) : ImageData {

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
            const imageData:ImageData = context.getImageData(position.x, position.y, tileSize.width, tileSize.height);

            // convert the image data to a canvas image source
            return imageData;
        }


        public tile(layer:MapLayer, tileId:number) : TilesetTile {

            // get the tileset for the layer
            const tileset:TilesetTile[] = this.layerTilesets[layer.id];

            // get the tile
            return tileset[tileId] ?? null;
        }

        public getTileData(layerId:number, x:number, y:number) : number {
            return this.mapConfig.layers[layerId].data[y][x];
        }

        public layer(layerId:number) : MapLayer {
            return this.mapConfig.layers[layerId] ?? null;
        }


        public area(x1: number, y1: number, x2: number, y2: number): { layers: any } {

            // create an area
            // make sure the area is within bounds
            const area = {
                x1: Math.max(0, Math.min(x1, x2)),
                y1: Math.max(0, Math.min(y1, y2)),
                x2: Math.max(x1, x2),
                y2: Math.max(y1, y2)
            }

            // make sure the area are integers
            area.x1 = Math.floor(area.x1);
            area.y1 = Math.floor(area.y1);
            area.x2 = Math.ceil(area.x2);
            area.y2 = Math.ceil(area.y2);

            // Prepare the tile data structure
            const tileData: { layers: any } = { layers: [] };

            // Iterate through all layers
            this.mapConfig.layers.forEach((layer, layerIndex) => {

                // Only process layers that have tile data
                if (!layer || !layer.data) return;

                //development todo
                //right not only tile layers are supported
                if (layer.type !== LayerType.TileLayer) return;
                
                // Get the layer data
                const layerData = layer.data as number[][];
                tileData.layers[layerIndex] = [];

                // Iterate through the specified rows and columns within bounds
                for (let y = area.y1; y < area.y2 && y < layerData.length; y++) {

                    // Create a new row
                    const row: any[] = [];
                    tileData.layers[layerIndex].push(row);

                    for (let x = area.x1; x < area.x2 && x < layerData[y].length; x++) {
                        const tileId = layerData[y][x];
                        const tile = this.tile(layer, tileId);
                        row.push(tile); 
                    }
                }
            
            });

            return tileData;
        }

        public scale(camera:Camera, tileSize:Size): Size {
            const zoomFactor = (camera.zoom / 10);
            const baseTileSize = tileSize.width;
            const scaleWidth = Math.floor(baseTileSize * zoomFactor);
            const scaleHeight = Math.floor(baseTileSize * zoomFactor);
            return { width: scaleWidth, height: scaleHeight };
        }

    }

//#endregion