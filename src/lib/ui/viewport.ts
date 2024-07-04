import { Size } from "../engine";

export class Viewport {

    private viewportCanvas:HTMLCanvasElement;
    private viewportContext:CanvasRenderingContext2D;


    public constructor() {

        const opt:CanvasRenderingContext2DSettings = {
            alpha: true,
            desynchronized: false,
            willReadFrequently: true
        };

        
        // Create the canvas
        this.viewportCanvas = document.createElement('canvas');
        this.viewportContext = this.viewportCanvas.getContext('2d', opt);
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



    public setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
    }




}