//#region imports

    import { Renderer } from "./rendering/renderer.js";
import { UILayer, UILayerType } from "./rendering/uiLayer.js";
    import { Camera } from "./ui/camera.js";
import { Menu } from "./ui/menu.js";
    import { Viewport } from "./ui/viewport.js";
    import { World } from "./world/world.js";

//#endregion



//#region constants

    // Psyna Engine version
    const PSYNA_VERSION = '0.0.2';

//#endregion



//#region enums

    export enum ShapeType {
        Rectangle   = 'rectangle',
        Circle      = 'circle',
        Polygon     = 'polygon'
    }

    export enum Direction {
        North       = 'north',
        NorthEast   = 'north_east',
        East        = 'east',
        SouthEast   = 'south_east',
        South       = 'south',
        SouthWest   = 'south_west',
        West        = 'west',
        NorthWest   = 'north_west'
    }

//#endregion



//#region interfaces

    export interface Position {
        x:number;
        y:number;
    }

    export interface Size {
        width:number;
        height:number;
    }

    export interface Property {
        name:string;
        value:any;
    }

    export interface GameItem {
        name:string;
        properties:Property[];
    }

    export interface GameItemSlot {
        item:GameItem;
        quantity:number;
        index:number;
    }

    export interface GameItemInventory {
        items:GameItemSlot[];
        capacity:number;
    }

    export interface Shape {
        type:ShapeType;
        position:Position;
    }

    export interface Rectangle extends Shape {
        type:ShapeType.Rectangle;
        size:Size;
    }

    export interface Circle extends Shape {
        type:ShapeType.Circle;
        radius:number;
    }

    export interface Polygon extends Shape {
        type:ShapeType.Polygon;
        points:Position[];
    }

    export interface Hurtbox {
        shape:Shape;
        active:boolean;
    }

    export interface Hitbox {
        shape:Shape;
        active:boolean;
    }



//#endregion



//#region Game Engine

    export class Engine {

        // World
        private world:World;

        // World Clock
        private worldClock:boolean = false;
        private worldClockSpeed:number = 1;
        private worldClockTick:number = 0;
        private worldClockSeconds:number = 0;

        // Camera
        private camera:Camera;        

        // Renderer
        private renderer:Renderer;

        // Viewport
        public readonly viewport:Viewport;
        
        // Event Handler
        public readonly events = new EventTarget();

        // Runtime
        private startTime:Date;
        private lastFrameTime:number = Date.now();
        private frameDelay:number = 0;
        private frameCounter:number = 0;

        public constructor() {

            this.console('Welcome to Psyna');

            // create a new viewport
            this.viewport = new Viewport();

            // Setup the world
            // then start the game
            this.setup().then(() => {

                // Run the game
                this.run();

                // Set the start time
                this.startTime = new Date();

                // Log the setup
                this.console('Game Engine running');

            });
        }

        public get World() : World {
            return this.world;
        }

        public get runtime() : number {
            // return the runtime in seconds
            return (Date.now() - this.startTime.getTime()) / 1000;
        }

        public get clock() : number {
            return this.worldClockSeconds;
        }

        public startClock() {
            this.worldClock = true;
            this.console('World clock started');
        }

        public stopClock() {
            this.worldClock = false;
            this.console('World clock stopped');
        }

        private async setup() {

            // Create the world
            this.world = new World(this);

            // Wait for the world to be ready
            await this.world.loaded();

            // create a new camera
            this.camera = new Camera(this.world.map, this.viewport, this);

            // create a renderer
            this.renderer = new Renderer(this, this.world.map, this.viewport, this.camera);

            // Create the menu ui layer
            const menuLayer:UILayer = new UILayer(UILayerType.Menu , this);
            this.renderer.addUILayer(menuLayer);

            // Create the menu and show it
            const menu:Menu = new Menu(menuLayer);
            await menu.show();

            // Create a clock event
            this.startClock();
        }

        private run() {

            // calculate the delta time
            let now:number          = Date.now();
            let deltaTime:number    = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime      = now;

            // increment the frame counter
            this.frameCounter += deltaTime

            // update delta time with the world clock speed
            deltaTime *= this.worldClockSpeed;


            // if the frame delay is less than 
            // the frame counter, reset the counter
            if (this.frameCounter >= (this.frameDelay / 1000)) {
                this.frameCounter = 0;
            } else {
                // request the next frame
                requestAnimationFrame(() => this.run());
                return;
            }

            // call the renderer
            // call this directly to avoid the async/await
            // delay or the frame rate will be affected
            // all graphics rendering should be done here
            // or be called from here
            this.renderer.render();

            // raise the update event every frame
            // this is not for rendering graphics
            // but for updating the game state only
            // such as camera position, player position, etc.
            this.events.dispatchEvent(new CustomEvent('frame_update', {detail:deltaTime}));

            // update the world clock
            // every 1 second
            if (this.worldClock) {

                // update the world clock tick
                this.worldClockTick += deltaTime;

                // when the world clock tick reaches 1
                if (this.worldClockTick >= 1) {

                    // raise the world clock event
                    this.events.dispatchEvent(new CustomEvent('clock_update', {detail:this.worldClockTick}));

                    // reset the world clock tick
                    this.worldClockTick = 0;

                    // increment the world clock seconds
                    this.worldClockSeconds++;
                }

            }

            // request the next frame
            requestAnimationFrame(() => this.run());
        }

        public console(message:string) {
            const title = "color: #08f; font-weight: bold;"
            const app   = "color: #0084ff; font-size: 7px;"
            const style = "color: #9ab;"
            console.log(`%cPsyna %cv${PSYNA_VERSION}\n%c${message}`, title, app, style);
        }

    }

//#endregion