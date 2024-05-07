//#region Enums

import { Position, Size } from "../engine";

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
    }

    export interface StageLayer {
        id:         number;
        name:       string;
        type:       LayerType;
        position:   Position;
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

        public constructor(stageName:string) {

            // set the stage name
            this.stageName = stageName;

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

            // load the stage configuration
            this.stageConfiguration = await this.loadConfiguration();

        }

        private async loadConfiguration() {

            // path of configuration file
            const path:string = `./assets/world/${this.stageName}/${this.stageName}.json`;

            // load the configuration file
            const response = await fetch(path);

            // check if the configuration file was loaded successfully
            if (!response.ok) throw new Error(`Failed to load world ${this.stageName}`);

            // parse the configuration file
            const data = await response.json();

            // return the configuration data
            return data;
        }

        private async loadTilesets() {

        }

        private parseTilemap() {

            // parse Tiled export file
            // json format
            
        }

        private loadLayer(layer:any) {

            // load the layer
            switch(layer.type) {
                case LayerType.TileLayer:
                    break;
                case LayerType.Object:
                    break;
                case LayerType.Image:
                    break;
            }
        }

    }

//#endregion