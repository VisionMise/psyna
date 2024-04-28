import { Actor } from "./actor.js";
import { Game } from "./game.js";
import { Level } from "./level.js";

export enum Filter {
    Blur        = 'blur',
    Brightness  = 'brightness',
    Contrast    = 'contrast',
    Grayscale   = 'grayscale',
    HueRotate   = 'hue-rotate',
    Invert      = 'invert',
    Opacity     = 'opacity',
    Saturate    = 'saturate',
    Sepia       = 'sepia',
    None        = 'none'
}


export interface Position {
    x:number;
    y:number;
}

export interface Size {
    width:number;
    height:number;
}

export interface BoxRect {
    x:number;
    y:number;
    width:number;
    height:number;
}

export interface BoxCircle {
    x:number;
    y:number;
    radius:number;
}

export enum Shape {
    Rectangle,
    Circle
}


export interface Collider {
    shape:Shape;
    box:BoxRect|BoxCircle;
    active:boolean;
}


export class Stage {

    //#region Constructor

        private gameEngine:Game;
        private stageName:string;
        private stageCanvas:HTMLCanvasElement;
        private stageContext:CanvasRenderingContext2D;
        private currentLevel:Level;
        private actorList:Actor[] = [];


        private flag_antiAliasing:boolean = false;
        private flag_subpixelRendering:boolean = false;
        private flag_ready:boolean = false;
    
        public constructor(stageName:string, game:Game) {
            
            // Set the game
            this.gameEngine = game;

            // Set the stage name
            this.stageName = stageName;

            // Load the stage
            this.initializeStage();

            // Initialize event handlers
            this.bindEvents();

            // Log the stage
            this.gameEngine.log(`Stage loaded: ${this.stageName}`);

            // Create the current level
            this.currentLevel = new Level(this.stageName, this);

            // Set the stage as ready
            this.currentLevel.whenReady().then(() => this.flag_ready = true);

        }

    //#endregion


    //#region Properties

        public get name() : string {
            return this.stageName;
        }

        public get context() : CanvasRenderingContext2D {
            return this.stageContext;
        }

        public get canvas() : HTMLCanvasElement {
            return this.stageCanvas;
        }

        public get width() : number {
            return this.stageCanvas.width;
        }

        public get height() : number {
            return this.stageCanvas.height;
        }

        public get level() : Level {
            return this.currentLevel;
        }

        public get actors() : Actor[] {
            return this.actorList;
        }

        public get subpixelRendering() : boolean {
            return this.flag_subpixelRendering;
        }

        public set subpixelRendering(value:boolean) {
            this.flag_subpixelRendering = value;
        }

    //#endregion


    //#region Public Methods

        public log(message:string, error?:boolean) {
            this.gameEngine.log(message, error);
        }

        public static createRectCollider(x:number, y:number, width:number, height:number) : Collider {
            return { shape: Shape.Rectangle, box: { x, y, width, height }, active: true };
        }

        public static createCircleCollider(x:number, y:number, radius:number) : Collider {
            return { shape: Shape.Circle, box: { x, y, radius }, active: true };
        }

        public addActor(actor:Actor) : void {
            this.actorList.push(actor);
        }

    //#endregion


    //#region Private Methods

        private bindEvents() : void {

            // Bind the animate event
            this.gameEngine.events.addEventListener('animate', () => {

                // Update the stage
                this.update();

                // Draw the stage
                this.draw();

            });

            // Bind the resize event
            window.addEventListener('resize', () => {

                // Resize the stage
                this.resize();

            });

        }

        private initializeStage() : void {

            // Create a canvas
            const canvas:HTMLCanvasElement = document.createElement('canvas');

            // width and height of the window
            const screenSize = this.getScreenSize();

            // aspect ratio
            const aspectRatio = this.findAspectRatio(screenSize.width, screenSize.height);

            // Set the canvas width and height
            canvas.width  = aspectRatio.width;
            canvas.height = aspectRatio.height;

            // Get the viewport
            const viewport:HTMLElement = document.getElementById('viewport');

            // Clear the viewport
            viewport.innerHTML = '';

            // Append the canvas to the viewport
            viewport.appendChild(canvas);

            // Set the stage canvas
            this.stageCanvas = canvas;

            // Set the stage context
            this.stageContext = canvas.getContext('2d');

            // set image smoothing
            this.stageContext.imageSmoothingEnabled = this.flag_antiAliasing;

        }

        private update() : void {

            // Update the current level
            this.currentLevel.update();

            // Update the actors
            this.actorList.forEach(actor => actor.update());

            // if subpixel rendering is enabled
            if (this.flag_subpixelRendering) {

                // Set a subpixel blur
                this.stageCanvas.style.imageRendering = 'auto';
                this.filter(Filter.Blur, '0.5px');

            } else {
                    
                // Set the image rendering to pixelated
                this.stageCanvas.style.imageRendering = 'pixelated';
                this.filter(Filter.None);
            }

        }

        private resize() : void {

            // Get the screen size
            const screenSize = this.getScreenSize();

            // Get the aspect ratio
            const aspectRatio = this.findAspectRatio(screenSize.width, screenSize.height);

            // Set the canvas width and height
            this.stageCanvas.width  = aspectRatio.width;
            this.stageCanvas.height = aspectRatio.height;
        }

    //#endregion



    //#region Rendering

        public filter(filter:Filter, value?:string) {

            // if the filter is none
            if (filter === Filter.None) {

                // Clear the filter
                this.stageCanvas.style.filter = 'none';
                return;
            }

            // Set the filter
            this.stageCanvas.style.filter = `${filter}(${value})`;
        }

        private draw() : void {

            // if the stage is not ready, do not draw
            if (!this.flag_ready) return;
            
            // Clear the canvas
            this.stageContext.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);

            // Draw the current level
            this.currentLevel.draw(this.stageContext);

            // Draw the actors
            this.actorList.forEach(actor => actor.draw(this.stageContext));

        }

        private getScreenSize() : { width:number, height:number } {

            // Get the screen width and height
            const width:number  = window.innerWidth;
            const height:number = window.innerHeight;

            // landscape mode
            return { width, height };
        }

        private findAspectRatio(width:number, height:number) : { width:number, height:number } {

            // Get the aspect ratio
            const aspectRatio:number = width / height;

            //find closest with and height with a 16:9 aspect ratio
            const wr:number     = 16;
            const hr:number     = 9;
            const ratio:number  = wr / hr;

            // Get the new width and height
            let newWidth:number  = width;
            let newHeight:number = height;

            // set the new width and height
            // as close to the aspect ratio as possible
            if (aspectRatio > ratio) {
                newWidth    = Math.floor(height * ratio);
            } else {
                newHeight   = Math.floor(width / ratio);
            }

            // return the new width and height
            return { width: newWidth, height: newHeight };        
        }

    //#endregion

}