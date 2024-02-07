import { Stage } from "./stage";

export interface Position {
    x:number;
    y:number;
}

export interface Size {
    width:number;
    height:number;
}

export class Actor {

    public stage:Stage;
    public position:Position;
    public size:Size;
    public id:string;

    private actorImage:HTMLImageElement;
    private actorImageURL:string;

    public constructor(stage:Stage, position:Position, size:Size, imageURL?:string) {

        // Set the stage
        this.stage = stage;

        // Set the position
        this.position = position;

        // Set the size
        this.size = size;

        // Set the id
        this.id = this.uniqueID();

        // Set the image URL
        this.actorImageURL = imageURL;

        // Setup the actor
        this.setup();

        // Load the image
        this.loadImage();

        // Log the actor
        this.stage.log(`Actor loaded: ${this.id}`);
    }

    private setup() : void {

    }

    private uniqueID() : string {
        return Math.random().toString(36).substr(2, 9);
    }

    private async loadImage() : Promise<void> {
        return new Promise((resolve, reject) => {
            this.actorImage     = new Image();
            this.actorImage.src = this.actorImageURL;
            this.actorImage.addEventListener('load', () => resolve());
            this.actorImage.addEventListener('error', () => reject());
        });
    }

    public draw() : void {
        this.stage.context.drawImage(this.actorImage, this.position.x, this.position.y, this.size.width, this.size.height);
    }

}