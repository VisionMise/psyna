//#region Imports
//#endregion
//#region Viewport Class
export class Viewport {
    constructor() {
        this.setup();
    }
    get world() {
        return this.currentWorld;
    }
    get camera() {
        return this.currentCamera;
    }
    set camera(camera) {
        this.currentCamera = camera;
    }
    get context() {
        return this.currentContext;
    }
    get canvas() {
        return this.currentCanvas;
    }
    get viewport() {
        return this.currentViewport;
    }
    get windowSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    get size() {
        return {
            width: this.currentViewport.clientWidth,
            height: this.currentViewport.clientHeight
        };
    }
    get scaledSize() {
        // aspect ratio of 16:9
        const aspectRatio = { width: 12, height: 9 };
        // get the scaled size
        const scaledSize = this.scaleToAspect(this.size, aspectRatio);
        // return the scaled size
        return scaledSize;
    }
    get scaleFactor() {
        // get the scaled size
        const scaledSize = this.scaledSize;
        // get the scale factor
        const scaleFactor = scaledSize.width / this.size.width;
        // return the scale factor
        return scaleFactor;
    }
    async setup() {
        // get the viewport element
        this.currentViewport = document.getElementById('viewport');
        // create the canvas element
        this.currentCanvas = document.createElement('canvas');
        // set the canvas size
        this.setCanvasSize();
        // append the canvas to the viewport
        this.currentViewport.appendChild(this.currentCanvas);
        // context settings
        const contextSettings = {
            willReadFrequently: true,
            alpha: true,
            desynchronized: false
        };
        // get the canvas context
        this.currentContext = this.currentCanvas.getContext('2d', contextSettings);
        // resize the canvas when the window resizes
        window.addEventListener('resize', () => this.setCanvasSize());
    }
    setCanvasSize() {
        // get the scaled size
        const scaledSize = this.scaledSize;
        // set the canvas size
        this.currentCanvas.width = scaledSize.width;
        this.currentCanvas.height = scaledSize.height;
    }
    scaleToAspect(size, ratio, margin = { width: 4, height: 4 }) {
        // get the aspect ratio
        const currentRatio = size.width / size.height;
        // find the closest ratio
        // to given x and y ratios
        const closestRatio = ratio.width / ratio.height;
        // new width and height buffer
        // to add margin to the size
        let newWidth = size.width;
        let newHeight = size.height;
        // set the new width and height
        // as close to the aspect ratio as possible
        if (currentRatio > closestRatio) {
            newWidth = Math.floor(size.height * closestRatio);
        }
        else {
            newHeight = Math.floor(size.width / closestRatio);
        }
        // return the new width and height
        return { width: newWidth, height: newHeight };
    }
}
//#endregion
