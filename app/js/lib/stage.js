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
export class Stage {
    constructor(stageName, game) {
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
        this.currentLevel = new Level('level1');
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
        this.stageContext.imageSmoothingEnabled = false;
    }
    update() {
        // Update the current level
        this.currentLevel.update();
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
    //#region Rendering
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
        // Clear the canvas
        this.stageContext.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);
        // Draw the current level
        this.currentLevel.draw(this.stageContext);
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
