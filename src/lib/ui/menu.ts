import { UILayer } from "../rendering/uiLayer.js";

export class Menu {

    protected uiLayer:UILayer;

    private waitingForSelection:boolean = true;
    private waiting:number;

    constructor(uiLayer:UILayer) {
        this.uiLayer = uiLayer;
        this.uiLayer.events.addEventListener("up", () => {})
    }

    public async show() : Promise<void> {
        return new Promise(resolve => {

            // wait for the user to make a selection
            this.waiting = setInterval(() => {
                if (!this.waitingForSelection) {
                    clearInterval(this.waiting);
                    resolve();
                }
            }, 500);

            // render the menu
            this.render();
        });
    }

    private render() {
    }

    private setup() {

        //listen for game control events
        this.initEventHandlers();
        
    }
        
    private initEventHandlers() : void {

        // Initialize Event Listeners
        this.uiLayer.engine.events.addEventListener('up', (event:CustomEvent) => this.handleEvent('up', event));
        this.uiLayer.engine.events.addEventListener('down', (event:CustomEvent) => this.handleEvent('down', event));
        this.uiLayer.engine.events.addEventListener('left', (event:CustomEvent) => this.handleEvent('left', event));
        this.uiLayer.engine.events.addEventListener('right', (event:CustomEvent) => this.handleEvent('right', event));
        this.uiLayer.engine.events.addEventListener('action1', (event:CustomEvent) => this.handleEvent('action1', event));
        this.uiLayer.engine.events.addEventListener('action2', (event:CustomEvent) => this.handleEvent('action2', event));
    }

    private handleEvent(eventName:string, event:CustomEvent) : void {
        
        switch (eventName) {
            case 'up':
            case 'left':
                this.uiLayer.events.dispatchEvent(new CustomEvent('menu_previous'));
                break;

            case 'down':
            case 'right':
                this.uiLayer.events.dispatchEvent(new CustomEvent('menu_next'));
                break;

            case 'action1':
                this.uiLayer.events.dispatchEvent(new CustomEvent('menu_select'));
                break;

            case 'action2':
                this.uiLayer.events.dispatchEvent(new CustomEvent('menu_back'));
                break;
        }

    }

}