import { Engine, Size } from "../engine";

export enum UILayerRenderMethod {
    Direct = 0,
    Frame = 1,
    Clock = 2
}

export class UILayer {

    private canvas:HTMLCanvasElement;
    private context:CanvasRenderingContext2D;
    private renderMethod:UILayerRenderMethod;
    private size:Size;
    private engine:Engine;

    protected eventTarget:EventTarget;

    public constructor(engine:Engine, size:Size, renderMethod:UILayerRenderMethod = UILayerRenderMethod.Direct) {
        this.engine         = engine;
        this.size           = size;
        this.renderMethod   = renderMethod;
        this.canvas         = document.createElement('canvas');
        this.context        = this.canvas.getContext('2d');
        this.eventTarget    = new EventTarget();

        if (this.renderMethod === UILayerRenderMethod.Frame) {
            this.engine.Events.addEventListener('frame_update', () => this.render());
        } else if (this.renderMethod === UILayerRenderMethod.Clock) {
            this.engine.Events.addEventListener('clock_update', () => this.render());
        }
    }

    public get type() : UILayerRenderMethod {
        return this.renderMethod;
    }

    public get events() : EventTarget {
        return this.eventTarget;
    }

    public getCanvas() : HTMLCanvasElement {
        return this.canvas;
    }

    public getContext() : CanvasRenderingContext2D {
        return this.context;
    }

    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public render() {
        this.clear();
    }
}