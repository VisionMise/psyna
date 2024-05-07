//#region Enums

import { Position, Size } from "../engine";
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

            // load the stage configuration
            this.stageConfiguration = await this.loadConfiguration();

            // add update event listener
            this.world.engine.Events.addEventListener('update', this.update.bind(this));

            // import the stage map
            this.importStageMap();

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
        }

        private render() {

            // render each layer
            this.stageMap.layers.forEach(layer => this.renderLayer(layer));


        }

        private renderLayer(layer:StageLayer) {

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

        private renderTileLayer(layer:StageLayer) {
            
        }

        private renderObjectLayer(layer:StageLayer) {
        }

        private renderImageLayer(layer:StageLayer) {
        }

        private renderObject(object:StageObject) {
        }
    }

//#endregion