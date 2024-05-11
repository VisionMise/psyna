const VIEWPORT_RATIO = { width: 11, height: 9 };
export class Viewport {
    constructor() {
        // Create the canvas
        this.viewportCanvas = document.createElement('canvas');
        this.viewportContext = this.canvas.getContext('2d');
        // get the viewport element
        const viewport = document.getElementById('viewport');
        // Set the canvas size
        const ratio = VIEWPORT_RATIO;
        // Set the canvas size
        this.setCanvasSize(ratio);
        // resize event
        window.addEventListener('resize', () => this.setCanvasSize(ratio));
        // Append the canvas to the viewport
        viewport.appendChild(this.canvas);
    }
    set size(size) {
        this.viewportCanvas.width = size.width;
        this.viewportCanvas.height = size.height;
    }
    get size() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    get context() {
        return this.viewportContext;
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    get canvas() {
        return this.viewportCanvas;
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    get center() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }
    setCanvasSize(ratioDimensions) {
        // set the size on the canvas
        // to the largest size possible
        // while maintaining the ratio
        const width = window.innerWidth;
        const height = window.innerHeight;
        // get the ratio
        const ratio = Math.min(width / ratioDimensions.width, height / ratioDimensions.height);
        // set the size
        this.canvas.width = (ratio * ratioDimensions.width) - 20;
        this.canvas.height = (ratio * ratioDimensions.height) - 20;
    }
}
