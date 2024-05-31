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
                
                // Create a new div element
                const div:HTMLDivElement = document.createElement('div') as HTMLDivElement;

                // Set the style
                div.style.position      = 'fixed';
                div.style.width         = '100%';
                div.style.height        = '100%';
                div.style.top           = '0px';
                div.style.left          = '0px';
                div.style.zIndex        = this.layerZIndex.toString();
                div.style.display       = 'none';

                // Add the classes
                div.classList.add('ui-layer', 'ui-layer-menu');

                // Add the element
                this.layerElement       = div as HTMLElement;
                document.body.appendChild(div);
                break;

            case UILayerType.HUD:
                const canvas:HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;

                canvas.style.position   = 'fixed';
                canvas.width            = this.engine.viewport.width;
                canvas.height           = this.engine.viewport.height;
                canvas.style.top        = '0px';
                canvas.style.left       = '0px';
                canvas.style.zIndex     = this.layerZIndex.toString();
                canvas.style.display    = 'none';

                this.layerElement       = canvas as HTMLElement;
                break;

            case UILayerType.Dialog:
                break;

            case UILayerType.Notification:
                break;
        }

    }
    
}