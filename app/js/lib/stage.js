import { Level } from "./level.js";
export var Filter;
(function (Filter) {
    Filter["Blur"] = "blur";
    Filter["Brightness"] = "brightness";
    Filter["Contrast"] = "contrast";
    Filter["Grayscale"] = "grayscale";
    Filter["HueRotate"] = "hue-rotate";
    Filter["Invert"] = "invert";
    Filter["Opacity"] = "opacity";
    Filter["Saturate"] = "saturate";
    Filter["Sepia"] = "sepia";
    Filter["None"] = "none";
})(Filter || (Filter = {}));
export var Shape;
(function (Shape) {
    Shape[Shape["Rectangle"] = 0] = "Rectangle";
    Shape[Shape["Circle"] = 1] = "Circle";
})(Shape || (Shape = {}));
export class Stage {
    constructor(stageName, game) {
        this.actorList = [];
        this.flag_antiAliasing = false;
        this.flag_subpixelRendering = false;
        this.flag_ready = false;
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
        //debug
        this.stageCanvas.addEventListener('click', (e) => {
            //log mouse position
            const rect = this.stageCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log('x', x, 'y', y);
        });
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
    get width() {
        return this.stageCanvas.width;
    }
    get height() {
        return this.stageCanvas.height;
    }
    get level() {
        return this.currentLevel;
    }
    get actors() {
        return this.actorList;
    }
    get subpixelRendering() {
        return this.flag_subpixelRendering;
    }
    set subpixelRendering(value) {
        this.flag_subpixelRendering = value;
    }
    //#endregion
    //#region Public Methods
    log(message, error) {
        this.gameEngine.log(message, error);
    }
    static createRectCollider(x, y, width, height) {
        return { shape: Shape.Rectangle, box: { x, y, width, height }, active: true };
    }
    static createCircleCollider(x, y, radius) {
        return { shape: Shape.Circle, box: { x, y, radius }, active: true };
    }
    addActor(actor) {
        this.actorList.push(actor);
    }
    async whenReady() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.flag_ready) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    //#endregion
    //#region Private Methods
    bindEvents() {
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
    initializeStage() {
        // Create a canvas
        const canvas = document.createElement('canvas');
        // width and height of the window
        const screenSize = this.getScreenSize();
        // aspect ratio
        const aspectRatio = this.findAspectRatio(screenSize.width, screenSize.height);
        // Set the canvas width and height
        canvas.width = aspectRatio.width;
        canvas.height = aspectRatio.height;
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
        // set image smoothing
        this.stageContext.imageSmoothingEnabled = this.flag_antiAliasing;
    }
    update() {
        // Update the current level
        this.currentLevel.update();
        // if subpixel rendering is enabled
        if (this.flag_subpixelRendering) {
            // Set a subpixel blur
            this.stageCanvas.style.imageRendering = 'auto';
            this.filter(Filter.Blur, '0.5px');
        }
        else {
            // Set the image rendering to pixelated
            this.stageCanvas.style.imageRendering = 'pixelated';
            this.filter(Filter.None);
        }
    }
    resize() {
        // Get the screen size
        const screenSize = this.getScreenSize();
        // Get the aspect ratio
        const aspectRatio = this.findAspectRatio(screenSize.width, screenSize.height);
        // Set the canvas width and height
        this.stageCanvas.width = aspectRatio.width;
        this.stageCanvas.height = aspectRatio.height;
    }
    //#endregion
    //#region Drawing
    filter(filter, value) {
        // if the filter is none
        if (filter === Filter.None) {
            // Clear the filter
            this.stageCanvas.style.filter = 'none';
            return;
        }
        // Set the filter
        this.stageCanvas.style.filter = `${filter}(${value})`;
    }
    draw() {
        // if the stage is not ready, do not draw
        if (!this.flag_ready)
            return;
        // Clear the canvas
        this.stageContext.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);
        // Draw the current level
        this.currentLevel.draw(this.stageContext);
        // Draw the actors
        this.actorList.forEach(actor => actor.draw(this.stageContext));
    }
    getScreenSize() {
        // Get the screen width and height
        const width = window.innerWidth;
        const height = window.innerHeight;
        // landscape mode
        return { width, height };
    }
    findAspectRatio(width, height) {
        // Get the aspect ratio
        const aspectRatio = width / height;
        //find closest with and height with a 16:9 aspect ratio
        const wr = 16;
        const hr = 9;
        const ratio = wr / hr;
        // Get the new width and height
        let newWidth = width;
        let newHeight = height;
        // set the new width and height
        // as close to the aspect ratio as possible
        if (aspectRatio > ratio) {
            newWidth = Math.floor(height * ratio);
        }
        else {
            newHeight = Math.floor(width / ratio);
        }
        // return the new width and height
        return { width: newWidth, height: newHeight };
    }
}
