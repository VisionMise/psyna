import { UILayer } from "../rendering/uiLayer.js";

export class Menu {

    protected uiLayer:UILayer;

    constructor(uiLayer:UILayer) {
        this.uiLayer = uiLayer;
        this.uiLayer.events.addEventListener("up", () => {})
    }
}