import { Engine } from "../engine.js";
import { UILayer, UILayerType } from "../rendering/uiLayer.js";

export class Menu extends UILayer {

    private waitingForSelection:boolean = false;
    private waiting:number;
    private currentSelection:number = 0;
    private currentSelectionValue:string = '';

    constructor(engine:Engine) {

        super(UILayerType.Menu, engine, 100);

        // setup the menu
        this.setup();
        
    }

    public async show() : Promise<string> {

        // set the waiting flag
        this.waitingForSelection = true;

        // return a promise
        return new Promise(resolve => {

            const menuSelectHandler = () : void => {
                if (this.waitingForSelection == false) {
                    clearInterval(this.waiting);
                    resolve(this.currentSelectionValue);
                }
            };

            // wait for the user to make a selection
            this.waiting = setInterval(() => menuSelectHandler(), 500);
                
        });
    }

    private setup() {

        //listen for game control events
        this.initEventHandlers();
        
    }
        
    private initEventHandlers() : void {

        // Initialize Event Listeners
        this.engine.events.addEventListener('up', (event:CustomEvent) => this.handleEvent('up', event));
        this.engine.events.addEventListener('down', (event:CustomEvent) => this.handleEvent('down', event));
        this.engine.events.addEventListener('left', (event:CustomEvent) => this.handleEvent('left', event));
        this.engine.events.addEventListener('right', (event:CustomEvent) => this.handleEvent('right', event));
        this.engine.events.addEventListener('action1', (event:CustomEvent) => this.handleEvent('action1', event));
        this.engine.events.addEventListener('action2', (event:CustomEvent) => this.handleEvent('action2', event));
    }

    private handleEvent(eventName:string, event:CustomEvent) : void {
        
        switch (eventName) {
            case 'up':
            case 'left':
                this.events.dispatchEvent(new CustomEvent('menu_previous'));
                break;

            case 'down':
            case 'right':
                this.events.dispatchEvent(new CustomEvent('menu_next'));
                break;

            case 'action1':
                this.events.dispatchEvent(new CustomEvent('menu_select'));
                break;

            case 'action2':
                this.events.dispatchEvent(new CustomEvent('menu_back'));
                break;
        }

    }

}