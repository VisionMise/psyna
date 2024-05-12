//#region Imports

    import { Engine } from "../engine.js";
    import { Viewport } from "../ui/viewport.js";
    import { Map } from "./map.js";

//#endregion



//#region World Class


    export class World {

        private currentMap:Map;
        private gameEngine:Engine;
        private worldTicks:number = 0;

        private flag_ready:boolean = false;

        public constructor(gameEngine:Engine) {

            // Set the game engine
            this.gameEngine = gameEngine;

            // Setup the world
            this.setup().then(() => {
                    
                // Set the ready flag
                this.flag_ready = true;

                // Log the setup
                this.gameEngine.console('Game world ready');
            });;
        }

        public get ready() : boolean {
            return this.flag_ready;
        }

        public get map() : Map {
            return this.currentMap;
        }

        public get engine() : Engine {
            return this.gameEngine;
        }

        public get ticks() : number {
            return this.worldTicks;
        }

        public async loaded() : Promise<void> {    
            return new Promise<void>(resolve => {
                const interval = setInterval(() => {
                    if (this.ready) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
        

        public async loadMap(mapName: string = 'main') : Promise<void> {

            // Load the map
            this.currentMap = new Map(mapName, this);

            // wait for the stage to load
            await this.currentMap.loaded();
        }

        private async setup() : Promise<void> {

            // hook in to the clock update event
            this.gameEngine.Events.addEventListener('clock_update', () => this.worldTicks++);

            // Load the map
            await this.loadMap();
        }

    }

//#endregion