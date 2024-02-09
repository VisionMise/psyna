export class Actor {
    constructor(stage, position, size, imageURL) {
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
    setup() {
    }
    uniqueID() {
        return Math.random().toString(36).substr(2, 9);
    }
    async loadImage() {
        return new Promise((resolve, reject) => {
            this.actorImage = new Image();
            this.actorImage.src = this.actorImageURL;
            this.actorImage.addEventListener('load', () => resolve());
            this.actorImage.addEventListener('error', () => reject());
        });
    }
    draw() {
        this.stage.context.drawImage(this.actorImage, this.position.x, this.position.y, this.size.width, this.size.height);
    }
    update() {
        // Move
        this.move();
    }
    move() {
        //change the position of the actor
        this.position.x += Math.sin(this.position.x) * (Math.PI * 2);
        this.position.y += Math.cos(this.position.y) * (Math.PI * 2);
    }
}
