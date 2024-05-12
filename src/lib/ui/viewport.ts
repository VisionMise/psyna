import { Size } from "../engine";

const VIEWPORT_RATIO:Size = {width:11, height:9};

export class Viewport {

    private viewportCanvas:HTMLCanvasElement;
    private viewportContext:CanvasRenderingContext2D;

    public constructor() {

        const opt:CanvasRenderingContext2DSettings = {
            alpha: true,
            desynchronized: true,
            willReadFrequently: true
        }

        // Create the canvas
        this.viewportCanvas = document.createElement('canvas');
        this.viewportContext = this.canvas.getContext('2d', opt);
        this.viewportContext.imageSmoothingEnabled = false;

        // get the viewport element
        const viewport = document.getElementById('viewport');

        // Set the canvas size
        const ratio:Size = VIEWPORT_RATIO;

        // Set the canvas size
        this.setCanvasSize(ratio);

        // resize event
        window.addEventListener('resize', () => this.setCanvasSize(ratio));

        // Append the canvas to the viewport
        viewport.appendChild(this.canvas);
    }

    public set size(size:Size) {
        this.viewportCanvas.width = size.width;
        this.viewportCanvas.height = size.height;
    }

    public get size() : Size {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    public get context() : CanvasRenderingContext2D {
        return this.viewportContext;
    }

    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public get canvas() : HTMLCanvasElement {
        return this.viewportCanvas;
    }

    public get width() : number {
        return this.canvas.width;
    }

    public get height() : number {
        return this.canvas.height;
    }

    public get center() : {x:number, y:number} {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }

    public setCanvasSize(ratioDimensions:Size) {

        // set the size on the canvas
        // to the largest size possible
        // while maintaining the ratio
        const width:number = window.innerWidth;
        const height:number = window.innerHeight;

        // get the ratio
        const ratio:number = Math.min(width / ratioDimensions.width, height / ratioDimensions.height);

        // set the size
        this.canvas.width   = (ratio * ratioDimensions.width) - 20;
        this.canvas.height  = (ratio * ratioDimensions.height) - 20;
    }


}