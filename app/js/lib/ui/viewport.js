export class Viewport {
    constructor() {
        const opt = {
            alpha: true,
            desynchronized: false,
            willReadFrequently: true
        };
        // Create the canvas
        this.viewportCanvas = document.createElement('canvas');
        this.viewportContext = this.viewportCanvas.getContext('2d', opt);
        this.viewportContext.imageSmoothingEnabled = false;
        this.viewportContext.globalCompositeOperation = 'source-over';
        // get the viewport element
        const viewport = document.getElementById('viewport');
        // Set the canvas size
        this.setCanvasSize();
        // resize event
        window.addEventListener('resize', () => this.setCanvasSize());
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
    setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
    }
}
