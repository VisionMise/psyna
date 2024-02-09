import { Game } from "./game";
import { Actor } from "./actor.js";
import { Level } from "./level.js";


export class Stage {

    //#region Constructor

        private gameEngine:Game;
        private stageName:string;
        private stageCanvas:HTMLCanvasElement;
        private stageContext:CanvasRenderingContext2D;
        private currentLevel:Level;
    
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

    //#endregion


    //#region Public Methods

        public log(message:string, error?:boolean) {
            this.gameEngine.log(message, error);
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

        }

        private getScreenSize() : { width:number, height:number} {

            // Get the screen width and height
            const width:number  = window.innerWidth;
            const height:number = window.innerHeight;

            // if the height is greater than the width
            // portrait mode
            if (height > width) return { width: height, height: width };

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
                newWidth = Math.floor(height * ratio);
            } else {
                newHeight = Math.floor(width / ratio);
            }

            // return the new width and height
            return { width: newWidth, height: newHeight };        
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
        }

        private draw() : void {

            // Clear the canvas
            this.stageContext.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);

        }

        private update() : void {

        }

    //#endregion



    //#region Rendering

    //#endregion

}