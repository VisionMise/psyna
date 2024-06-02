import { Engine } from "../engine.js";
import { UILayer, UILayerType } from "../rendering/uiLayer.js";

export interface MenuItem {
    label:string;
    value:string;
    command:string;
    index:number;
    element?:HTMLElement;
}

export class Menu extends UILayer {

    private waitingForSelection:boolean = false;
    private waiting:number;
    private currentSelection:number = 0;
    private menuItems:MenuItem[] = [];

    constructor(engine:Engine, url:string) {

        super(UILayerType.Menu, engine, 100);

        // setup the menu
        this.setup(url);
        
    }

    public get waitForSelection() : boolean {
        return this.waitingForSelection;
    }

    public set waitForSelection(value:boolean) {
        this.waitingForSelection = value;
    }

    public get currentItem() : MenuItem {
        // remove the selected class from all menu items
        this.menuItems.forEach((item:MenuItem) => item.element.classList.remove('selected'));

        // get the current item
        const item:MenuItem = this.menuItems[this.currentSelection];
        if (!item) return null;

        // add the selected class to the current item
        item.element.classList.add('selected');

        // return the current item
        return item;
    }

    public get previousItem() : MenuItem {
        // decrement the current selection
        this.currentSelection--;

        // if the current selection is less than 0, set it to the last item
        if (this.currentSelection < 0) {
            this.currentSelection = this.menuItems.length - 1;
        }

        // return the current item
        return this.currentItem;
    }

    public get nextItem() : MenuItem {
        // increment the current selection
        this.currentSelection++;

        // if the current selection is greater than the number of items, set it to the first item
        if (this.currentSelection > this.menuItems.length - 1) {
            this.currentSelection = 0;
        }

        // return the current item
        return this.currentItem;
    }
    
    public async show() : Promise<MenuItem> {

        // set the current selection
        this.currentSelection = 0;
        
        // show the menu
        this.element.style.display = 'block';


        // if we are not waiting for a selection, return the current item
        if (this.waitingForSelection == false) {
            return new Promise(resolve => {
                setTimeout(() => resolve(this.currentItem), 1000);
            });
        }

        // return a promise
        return new Promise(resolve => {

            const menuSelectHandler = () : void => {
                if (this.waitingForSelection == false) {
                    clearInterval(this.waiting);
                    resolve(this.currentItem);
                }
            };

            // wait for the user to make a selection
            this.waiting = setInterval(() => menuSelectHandler(), 500);
                
        });
    }    

    private async fetchHTML(url:string) : Promise<string> {
        const response:Response = await fetch(url);
        if (response.ok) return await response.text();
        return `Menu not found at ${url}`;
    }

    private async setup(url:string) {

        // fetch the menu html
        let html:string = await this.fetchHTML(url);      

        // init the links
        html = (await this.initLinks(html)).innerHTML;

        // init the scripts
        html = (await this.initScripts(html)).innerHTML;

        // set the inner html
        this.element.innerHTML = html;

        // init the menu items
        this.initMenuItems();

        // listen for game control events
        this.initEventHandlers();
        
    }

    private async initScripts(html:string) : Promise<HTMLElement> {

        // create a new div element
        const div:HTMLDivElement = document.createElement('div');
        div.innerHTML = html;

        // get the scripts
        const scripts:NodeListOf<HTMLScriptElement> = div.querySelectorAll('script');

        // return a promise
        return new Promise(resolve => {

            // if there are no scripts, resolve
            if (!scripts || scripts.length <= 0) resolve(div);

            // script promises
            const promises:Promise<void>[] = [];
            
            // loop through the scripts
            scripts.forEach((script:HTMLScriptElement) => {

                // create a new script element
                const newScript:HTMLScriptElement = document.createElement('script');

                // set the script src
                newScript.src = script.src;

                // remove the script from the original element
                script.remove();

                // set wait for load
                const promise:Promise<void> = new Promise(resolve => newScript.addEventListener('load', () => resolve()));

                // add the promise to the promises array
                promises.push(promise);

                // append the script to the body
                document.head.appendChild(newScript);
            });


            // wait for all promises to resolve
            Promise.all(promises).then(() => resolve(div));
        });
    }

    private async initLinks(html:string) : Promise<HTMLElement> {

        // create a new div element
        const div:HTMLDivElement = document.createElement('div');
        div.innerHTML = html;

        // get the links
        const links:NodeListOf<HTMLLinkElement> = div.querySelectorAll('link');

        // return a promise
        return new Promise(resolve => {

            // if there are no links, resolve
            if (!links || links.length <= 0) resolve(div);

            // promise array
            const promises:Promise<void>[] = [];

            // loop through the links
            links.forEach((link:HTMLLinkElement) => {

                // create a new link element
                const newLink:HTMLLinkElement = document.createElement('link');

                // set the link rel
                newLink.rel = link.rel;

                // set the link href
                newLink.href = link.href;

                // set the link type
                newLink.type = link.type;

                // remove the link from the original element
                link.remove();

                // set wait for load
                const promise:Promise<void> = new Promise(resolve => newLink.addEventListener('load', () => resolve()));

                // add the promise to the promises array
                promises.push(promise);

                // append the link to the head
                document.head.appendChild(newLink);

            });

            // wait for all promises to resolve
            Promise.all(promises).then(() => resolve(div));
        });
    }

    private initMenuItems() : void {

        // get the menu items
        const items:NodeListOf<HTMLElement> = this.element.querySelectorAll('.menu-item');        
        if (!items || items.length <= 0) return;

        // loop through the menu items
        items.forEach((element:HTMLElement, index:number) => {

            // get the label
            const label:string = element.getAttribute('data-label') ?? '';

            // get the value
            const value:string = element.getAttribute('data-value') ?? '';

            // get the command
            const command:string = element.getAttribute('data-command') ?? '';

            // add the menu item
            this.menuItems.push({label, value, command, index, element});

        });

        // set the current selection
        this.currentSelection = 0;

        // set the waiting flag
        this.waitingForSelection = true;

        // add the selected class to the current item
        this.currentItem;
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

    private handleEvent(eventName:string, _event:CustomEvent) : void {
        
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