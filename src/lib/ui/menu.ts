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
    }

}