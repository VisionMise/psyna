import { Shape } from "./stage.js";
// Actor State
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
        // Flags
        this.flag_ready = false;
        this.flag_render_hurtbox = false;
        this.flag_render_hitbox = false;
        this.flag_draw_hurtbox = false;
        this.flag_draw_hitbox = false;
        this.flag_draw_image = false;
        this.flag_can_be_hurt = false;
        this.flag_can_attack = false;
        this.flag_can_die = false;
        this.flag_can_move = false;
        // Movement
        this.velocity = 0;
        this.acceleration = 0;
        this.maxVelocity = 0;
        this.friction = 0;
        // Health
        this.health = 100;
        this.maxHealth = 100;
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
        // if the image URL is not set, do not load the image
        if (!this.actorImageURL) {
            this.stage.log(`Actor Loaded: ${this.id}`);
            this.flag_ready = true;
            return;
        }
        // Load the image
        this.loadImage().then(() => {
            this.stage.log(`Actor Loaded: ${this.id}`);
            this.flag_ready = true;
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
    setup() {
        // Set the state
        this.state = State.Idle;
        // Set the hurtbox
        this.actorHurtbox = {
            parent: this,
            shape: Shape.Rectagle,
            active: true,
            box: {
                x: this.position.x,
                y: this.position.y,
                width: this.size.width,
                height: this.size.height
            }
        };
        // Set the hitbox
        // if the actor is not on the stage
        // add it to the stage
        if (!this.stage.actors.includes(this))
            this.stage.actors.push(this);
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
    draw(context) {
        // if the actor is not ready, do not draw
        if (!this.flag_ready)
            return;
        // Apply scale and offset to get the canvas position
        let x = this.position.x * this.stage.level.scale + this.stage.level.xOffset;
        let y = this.position.y * this.stage.level.scale + this.stage.level.yOffset;
        let radius = this.size.width * this.stage.level.scale;
        // debug
        // change color based on state
        switch (this.state) {
            case State.Idle:
                context.fillStyle = 'blue';
                break;
            case State.Walking:
                context.fillStyle = 'green';
                break;
            case State.Attacking:
                context.fillStyle = 'yellow';
                break;
            case State.Hurt:
                context.fillStyle = 'purple';
                break;
            case State.Dead:
                context.fillStyle = 'black';
                break;
        }
        // Draw the actor
        // as a red circle
        // debug
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
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
        if (!this.flag_ready)
            return false;
        // if the actor is not ready, do not draw
        if (!actor.flag_ready)
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
        if (!this.flag_ready)
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
