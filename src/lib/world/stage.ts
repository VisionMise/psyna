//#region Enums

import { BoxRect, Position, Size } from "../engine";
import { World } from "./world";

    export enum LayerType {
        TileLayer   = 'tilelayer',
        Object      = 'objectgroup',
        Image       = 'imagelayer'
    }

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

//#endregion

//#region Stage Class

    export class Stage {

        protected world:World;

        protected stageName:string;
        protected stageConfig:any;
        protected stageAssets:{} = {};

        protected mapConfig:MapConfiguration;
        protected mapObjects:MapObject[] = [];
        protected mapTileset:ImageData[] = [];

        public flag_ready:boolean = false;

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
            return this.stageConfig;
        }

        public async loaded(): Promise<void> {
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (this.flag_ready) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }

        private async setup() {

            // console log the stage name
            this.world.engine.console(`Loading stage ${this.stageName}`);

            // load the stage configuration
            this.stageConfig = await this.loadConfiguration();

            // import the stage map
            this.importStageMap();

            // preload assets
            await this.preloadAssets();

            // create the tileset
            this.mapTileset = this.createTilesetFromImage(this.stageAssets['tileset'], this.mapConfig.tilesize);


            // Set ready flag
            this.flag_ready = true;

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

            this.mapConfig = {
                dimensions: {
                    width: this.stageConfig.width,
                    height: this.stageConfig.height
                },
                tilesize: {
                    width: this.stageConfig.tilewidth,
                    height: this.stageConfig.tileheight
                },
                layers: []
            };

            // get layers
            this.mapConfig.layers = this.stageConfig.layers as StageLayer[];

            // structure layer data
            this.mapConfig.layers.forEach(layer => {
                if (layer.type === LayerType.TileLayer) {
                    layer.data = this.structureLayerData(layer);
                }
            });
            
        }

        private async preloadAssets() {
            
            // get the tileset image
            const image = new Image();
            image.src = `./game/stage/${this.stageName}/${this.stageName}.tileset.png`;

            // wait for the image to load
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });

            // add the image to the assets
            this.stageAssets['tileset'] = image;
        }

        private update() {

            // render the stage
            this.render();
            
        }

        private render() {

            // // render each layer
            // this.mapConfig.layers.forEach(layer => this.renderLayer(layer, viewableArea));

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

        private createTilesetFromImage(image:HTMLImageElement, tileSize:Size) : ImageData[] {
            
            // get the canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: true, willReadFrequently: true});
            context.globalCompositeOperation = 'source-over';

            // set the canvas size
            canvas.width = image.width;
            canvas.height = image.height;

            // draw the image
            context.drawImage(image, 0, 0);

            // create array to store the tiles
            const tiles = [];

            // get the starting tile id
            let tileId:number = this.configuration.tilesets[0].firstgid ?? 1;

            // loop through the image data
            for (let y = 0; y < image.height; y += tileSize.height) {
                for (let x = 0; x < image.width; x += tileSize.width) {

                    // get the image data
                    const imageData = context.getImageData(x, y, tileSize.width, tileSize.height);

                    // add the tile to the tileset
                    tiles[tileId] = imageData;

                    // increment the tile id
                    tileId++;
                }
            }

            return tiles;
        }

        private getTilesInView(layer:StageLayer, viewableArea:BoxRect, tileSize:Size) : [][] {
            
            // get the layer data
            const layerData = layer.data as number[][];

            // get tiles based on camera position
            // and zoom
            const tilesInView = [];

            // loop through the layer data
            for (let y = 0; y < layerData.length; y++) {

                // check if the row is in view
                if (y * tileSize.height < viewableArea.y1 || y * tileSize.height > viewableArea.y2) continue;

                // create a new row
                tilesInView[y] = [];

                // loop through the row
                for (let x = 0; x < layerData[y].length; x++) {

                    // check if the tile is in view
                    if (x * tileSize.width < viewableArea.x1 || x * tileSize.width > viewableArea.x2) continue;

                    // add the tile to the row
                    tilesInView[y][x] = layerData[y][x];

                }

            }

            return tilesInView;
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

            // get the tiles in view
            const viewableTiles = this.getTilesInView(layer, viewableArea, this.mapConfig.tilesize);

            // render the tiles
            for (let y = 0; y < viewableTiles.length; y++) {
                for (let x = 0; x < viewableTiles[y].length; x++) {
                    this.renderTile(viewableTiles[y][x], { x: x * this.mapConfig.tilesize.width, y: y * this.mapConfig.tilesize.height }, this.mapConfig.tilesize);        
                }
            }

        }

        private renderTile(tileId:number, position:Position, size:Size) {
            
            // get tile from tileset
            const tile:ImageData = this.mapTileset[tileId] ?? null;

            // if no tile found return
            if (!tile) return;

            // create a canvas to draw the tile
            const canvas = document.createElement('canvas');
            canvas.width = size.width;
            canvas.height = size.height;

            const context = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
            context.globalCompositeOperation = 'source-over';
            
            // draw the image
            context.putImageData(tile, 0, 0);
        }

    }

//#endregion