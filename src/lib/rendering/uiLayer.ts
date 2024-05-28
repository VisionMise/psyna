import { Engine } from "../engine";

export enum UILayerType {
    Menu            = 0,
    HUD             = 1,
    Dialog          = 2,
    Notification    = 3
}

export abstract class UILayer {

    private layerElement:HTMLElement;
    private layerType:UILayerType;
    private layerZIndex:number = 0;

    public readonly engine:Engine;
    public readonly events:EventTarget;

    public constructor(type:UILayerType, engine:Engine, zIndex:number = 100) {
        this.engine         = engine;
        this.layerType      = type;
        this.events         = new EventTarget();
        this.layerZIndex    = zIndex;

        this.setupUILayer();
    }

    public get element() : HTMLElement {
        return this.layerElement;
    }

    public get zIndex() : number {
        return this.layerZIndex;
    }

    public set zIndex(value:number) {
        this.layerZIndex = value;
        this.layerElement.style.zIndex = value.toString();
    }

    private setupUILayer() {

        switch (this.layerType) {

            case UILayerType.Menu:
                const div:HTMLDivElement = document.createElement('div') as HTMLDivElement;
                div.style.width         = `${this.engine.viewport.width}px`;
                div.style.height        = `${this.engine.viewport.height}px`;
                div.style.position      = 'fixed';
                div.style.top           = '0px';
                div.style.left          = '0px';
                div.style.zIndex        = this.layerZIndex.toString();
                this.layerElement       = div as HTMLElement;
                break;

            case UILayerType.HUD:
                const canvas:HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
                canvas.width            = this.engine.viewport.width;
                canvas.height           = this.engine.viewport.height;
                canvas.style.position   = 'fixed';
                canvas.style.top        = '0px';
                canvas.style.left       = '0px';
                canvas.style.zIndex     = this.layerZIndex.toString();
                this.layerElement       = canvas as HTMLElement;
                break;

            case UILayerType.Dialog:
                break;

            case UILayerType.Notification:
                break;
        }

    }
    
}