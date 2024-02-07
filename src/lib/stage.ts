import { Game } from "./game";
import { Actor } from "./actor.js";

export class Stage {

    //#region Constructor

        private gameEngine:Game;
        private stageName:string;
        private stageCanvas:HTMLCanvasElement;
        private stageContext:CanvasRenderingContext2D;

        private mousePosition: { x:number, y:number } = { x: 0, y: 0 };
        private mouseDown:boolean = false;

        private actors:Actor[] = [];

        public constructor(stageName:string, game:Game) {
            
            // Set the game
            this.gameEngine = game;

            // Set the stage name
            this.stageName = stageName;

            // Load the stage
            this.loadStage();

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

        public addActor() : Actor {
            const x:number = this.mousePosition.x - 25;
            const y:number = this.mousePosition.y - 25;
            const actor:Actor = new Actor(this, {x, y}, { width: 50, height: 50 }, 'https://via.placeholder.com/50');
            this.actors.push(actor);
            return actor;
        }

    //#endregion


    //#region Private Methods

        private bindEvents() : void {

            // Bind the animate event
            this.gameEngine.events.addEventListener('animate', () => this.draw());

            // Bind mouse move event
            this.stageCanvas.addEventListener('mousemove', (event:MouseEvent) => {
                // Set the mouse position
                this.mousePosition.x = event.clientX;
                this.mousePosition.y = event.clientY;
            });

            // Bind mouse down event
            this.stageCanvas.addEventListener('mousedown', () => {
                this.mouseDown = true;
            });

            // Bind mouse up event
            this.stageCanvas.addEventListener('mouseup', () => {
                this.mouseDown = false;
            });

            // Bind mouse click event
            this.stageCanvas.addEventListener('click', () => {
                this.addActor();
            });
        }

        private loadStage() : void {

            // Create a canvas
            const canvas:HTMLCanvasElement = document.createElement('canvas');

            // Set the canvas width and height
            // to match the window
            canvas.width    = window.innerWidth;
            canvas.height   = window.innerHeight;

            // Resize the canvas when the window is resized
            window.addEventListener('resize', () => {
                canvas.width    = window.innerWidth;
                canvas.height   = window.innerHeight;
            });

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
            // this.stageContext.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);

            // Draw the actors
            for (let actor of this.actors) {
                actor.draw();

                //change the position of the actor
                actor.position.x += Math.sin(actor.position.x) * 5;
                actor.position.y += Math.cos(actor.position.y) * 5;
            }

            // Draw a circle at the mouse position
            if (this.mouseDown) {
                this.stageContext.beginPath();
                this.stageContext.arc(this.mousePosition.x, this.mousePosition.y, 25, 0, Math.PI * 2);
                this.stageContext.fillStyle = 'red';
                this.stageContext.strokeStyle = 'red';
                this.stageContext.stroke();
            }

            


        }

    //#endregion

}