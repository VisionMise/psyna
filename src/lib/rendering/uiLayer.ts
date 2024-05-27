import { Engine, Position, Size } from "../engine";

export enum UILayerRenderMethod {
    Direct = 0,
    Frame = 1,
    Clock = 2
}

export enum UILayerType {
    Menu            = 0,
    HUD             = 1,
    Dialog          = 2,
    Notification    = 3
}

export class UILayer {

    private element:HTMLElement;
    private renderMethod:UILayerRenderMethod;
    private layerType:UILayerType;

    public readonly engine:Engine;
    public readonly events:EventTarget;

    public constructor(type:UILayerType, engine:Engine, renderMethod:UILayerRenderMethod = UILayerRenderMethod.Frame) {
        this.engine         = engine;
        this.renderMethod   = renderMethod;
        this.layerType      = type;
        this.events         = new EventTarget();

        this.setup();

        if (this.renderMethod === UILayerRenderMethod.Frame) {
            this.engine.events.addEventListener('frame_update', () => this.render());
        } else if (this.renderMethod === UILayerRenderMethod.Clock) {
            this.engine.events.addEventListener('clock_update', () => this.render());
        }
    }

    public get type() : UILayerRenderMethod {
        return this.renderMethod;
    }

    public render() {
        
    }

    private setup() {

        switch (this.layerType) {

            case UILayerType.Menu:
                const div:HTMLDivElement = document.createElement('div') as HTMLDivElement;
                div.style.width         = this.engine.viewport.width + 'px';
                div.style.height        = this.engine.viewport.height + 'px';
                div.style.position      = 'absolute';
                div.style.top           = '0';
                div.style.left          = '0';
                this.element            = div as HTMLElement;
                break;

            case UILayerType.HUD:
                const canvas:HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
                canvas.width            = this.engine.viewport.width;
                canvas.height           = this.engine.viewport.height;
                canvas.style.position   = 'absolute';
                canvas.style.top        = '0';
                canvas.style.left       = '0';
                this.element            = canvas as HTMLElement;
                break;

            case UILayerType.Dialog:
                break;

            case UILayerType.Notification:
                break;
        }

    }
    
}