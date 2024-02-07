import { Actor } from "./actor.js";
export class Stage {
    constructor(stageName, game) {
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDown = false;
        this.actors = [];
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
    get name() {
        return this.stageName;
    }
    get context() {
        return this.stageContext;
    }
    get canvas() {
        return this.stageCanvas;
    }
    //#endregion
    //#region Public Methods
    log(message, error) {
        this.gameEngine.log(message, error);
    }
    addActor() {
        const x = this.mousePosition.x - 25;
        const y = this.mousePosition.y - 25;
        const actor = new Actor(this, { x, y }, { width: 50, height: 50 }, 'https://via.placeholder.com/50');
        this.actors.push(actor);
        return actor;
    }
    //#endregion
    //#region Private Methods
    bindEvents() {
        // Bind the animate event
        this.gameEngine.events.addEventListener('animate', () => this.draw());
        // Bind mouse move event
        this.stageCanvas.addEventListener('mousemove', (event) => {
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
    loadStage() {
        // Create a canvas
        const canvas = document.createElement('canvas');
        // Set the canvas width and height
        // to match the window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Resize the canvas when the window is resized
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        // Get the viewport
        const viewport = document.getElementById('viewport');
        // Clear the viewport
        viewport.innerHTML = '';
        // Append the canvas to the viewport
        viewport.appendChild(canvas);
        // Set the stage canvas
        this.stageCanvas = canvas;
        // Set the stage context
        this.stageContext = canvas.getContext('2d');
    }
    draw() {
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
}
