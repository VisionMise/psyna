export var Shape;
(function (Shape) {
    Shape[Shape["Rectagle"] = 0] = "Rectagle";
    Shape[Shape["Circle"] = 1] = "Circle";
})(Shape || (Shape = {}));
export var State;
(function (State) {
    State[State["Idle"] = 0] = "Idle";
    State[State["Walking"] = 1] = "Walking";
    State[State["Attacking"] = 2] = "Attacking";
    State[State["Hurt"] = 3] = "Hurt";
    State[State["Dead"] = 4] = "Dead";
})(State || (State = {}));
export class Actor {
    constructor(stage, position, size, imageURL) {
        this.ready = false;
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
        // Load the image
        this.loadImage().then(() => {
            this.stage.log(`Actor Loaded: ${this.id}`);
            this.ready = true;
        }).catch(() => {
            this.stage.log(`Failed to load actor image [${this.id}]: ${this.actorImageURL}`);
        });
    }
    get state() {
        return this.currentState;
    }
    set state(newState) {
        this.currentState = newState;
    }
    get hurtbox() {
        return this.actorHurtbox;
    }
    get hitbox() {
        return this.actorHitbox;
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
        // if the actor is not ready, do not draw
        if (!this.ready)
            return;
        // Draw the actor
        this.stage.context.drawImage(this.actorImage, this.position.x, this.position.y, this.size.width, this.size.height);
    }
    update() {
    }
    attack(actor) {
        if (actor.hitBy(this)) {
            // Damage
        }
        else {
            // No Damage
        }
    }
    collidesWithActor(actor) {
        // if the actor is not ready, do not draw
        if (!this.ready)
            return false;
        // if the actor is not ready, do not draw
        if (!actor.ready)
            return false;
        // Check for collision
        return this.collidesWith(actor.hurtbox);
    }
    collidesWithCollider(collider) {
        return this.collidesWith(collider);
    }
    hitBy(actor) {
        return this.collidesWith(actor.hitbox);
    }
    collidesWith(collider) {
        // if the actor is not ready, do not draw
        if (!this.ready)
            return false;
        // if the actor is not ready, do not draw
        if (!collider)
            return false;
        // Get the actor's box
        const actorBox = {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height
        };
        // check the shape of the box
        switch (collider.shape) {
            case Shape.Rectagle:
                return this.collidesWithRect(actorBox, collider.box);
            case Shape.Circle:
                return this.collidesWithCircle(actorBox, collider.box);
        }
    }
    collidesWithRect(actor, box) {
        return actor.x < box.x + box.width &&
            actor.x + actor.width > box.x &&
            actor.y < box.y + box.height &&
            actor.y + actor.height > box.y;
    }
    collidesWithCircle(actor, circle) {
        const distX = Math.abs(actor.x - circle.x - circle.radius);
        const distY = Math.abs(actor.y - circle.y - circle.radius);
        if (distX > (circle.radius + actor.width)) {
            return false;
        }
        if (distY > (circle.radius + actor.height)) {
            return false;
        }
        if (distX <= (actor.width)) {
            return true;
        }
        if (distY <= (actor.height)) {
            return true;
        }
        const dx = distX - actor.width;
        const dy = distY - actor.height;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }
}
