import { InputKey } from "./input.js";
import { Circle, Collider, Position, Rect, Shape, Size, Stage } from "./stage.js";

// Hurtbox
// Collision Box for taking damage
export interface Hurtbox {
    parent:Actor;
    shape:Shape;
    active:boolean;
    box?:Rect|Circle;
}

// Hitbox
// Collision Box for dealing damage
export interface Hitbox {
    parent:Actor;
    shape:Shape;
    active:boolean;
    box?:Rect|Circle;
}

// Actor State
export enum State {
    Idle        = 0,
    Walking     = 1,
    Attacking   = 2,
    Hurt        = 3,
    Dead        = 4 
}

export class Actor {

    // Stage Properties
    public stage:Stage;
    public position:Position;
    public size:Size;

    // Actor Properties
    public id:string;
    protected actorImage:HTMLImageElement;
    protected actorImageURL:string;

    // Hurtbox and Hitbox
    protected actorHurtbox:Hurtbox;
    protected actorHitbox:Hitbox;

    // State
    protected currentState:State;

    // Flags
    protected flag_ready:boolean          = false;
    protected flag_render_hurtbox:boolean = false;
    protected flag_render_hitbox:boolean  = false;
    protected flag_draw_hurtbox:boolean   = false;
    protected flag_draw_hitbox:boolean    = false;
    protected flag_draw_image:boolean     = false;
    protected flag_can_be_hurt:boolean    = false;
    protected flag_can_attack:boolean     = false;
    protected flag_can_die:boolean        = true;
    protected flag_can_move:boolean       = true;


    // Movement
    protected velocity:{x:number, y:number}     = {x:0, y:0};
    protected acceleration:{x:number, y:number} = {x:0, y:0};
    protected maxAcceleration:number            = 3;
    protected accelerationRate:number           = 3;
    protected lastPosition:Position             = {x:0, y:0};
    protected maxVelocity:number                = 12;
    protected friction:number                   = 2;

    // Input
    protected keyState: { [key: string]: boolean } = {};

    // Health
    protected health:number               = 100;
    protected maxHealth:number            = 100;


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

    public get state() : State {
        return this.currentState;
    }

    public set state(newState:State) {
        this.currentState = newState;
    }

    public get hurtbox() : Hurtbox {
        return this.actorHurtbox;
    }

    public get hitbox() : Hitbox {
        return this.actorHitbox;
    }

    public get direction() : number {
        // convert the current angle to degrees
        return this.angle * (180 / Math.PI);
    }

    public get angle() : number {
        // get the angle from the tangent
        // of the two points
        return Math.atan2(this.position.y - this.lastPosition.y, this.position.x - this.lastPosition.x);
    }

    private setup() {

        // Set the state
        this.state = State.Idle;

        // Set velocity
        this.velocity = {x:0, y:0};

        // Set the hurtbox
        // same size and shape as the actor
        // active
        this.actorHurtbox = {
            parent: this,
            shape:  Shape.Rectagle,
            active: true,
            box: {
                x:      this.position.x,
                y:      this.position.y,
                width:  this.size.width,
                height: this.size.height
            }
        };

        // Set the hitbox
        // temporary position
        // inactive
        this.actorHitbox = {
            parent: this,
            shape:  Shape.Rectagle,
            active: false,
            box: {
                x:      this.position.x,
                y:      this.position.y,
                width:  this.size.width,
                height: this.size.height
            }


        }
        
        // Initialize key states for directional controls
        this.keyState = {
            [InputKey.Up]: false,
            [InputKey.Down]: false,
            [InputKey.Left]: false,
            [InputKey.Right]: false
        };


        // if the actor is not on the stage
        // add it to the stage
        if (this.stage.actors.includes(this) == false) this.stage.actors.push(this);
    }

    private uniqueID() : string {
        return Math.random().toString(36).substring(2, 9);
    }

    private async loadImage() : Promise<void> {
        return new Promise((resolve, reject) => {
            this.actorImage     = new Image();
            this.actorImage.src = this.actorImageURL;
            this.actorImage.addEventListener('load', () => resolve());
            this.actorImage.addEventListener('error', () => reject());
        });
    }

    public draw(context:CanvasRenderingContext2D) : void {

        // if the actor is not ready, do not draw
        if (!this.flag_ready) return;

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
        // as a circle
        // debug
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();


        // Draw the hurtbox
        // if the flag is set
        if (this.flag_draw_hurtbox) {
            
            // Apply scale and offset to get the canvas position
            let x = this.actorHurtbox.box.x * this.stage.level.scale + this.stage.level.xOffset;
            let y = this.actorHurtbox.box.y * this.stage.level.scale + this.stage.level.yOffset;

            // debug
            context.strokeStyle = 'yellow';

            if (this.actorHurtbox.shape == Shape.Circle) {
                let circle = this.actorHurtbox.box as Circle;
                context.beginPath();
                context.arc(x, y, circle.radius * this.stage.level.scale, 0, Math.PI * 2, true);
                context.closePath();
                context.stroke();
            } else if (this.actorHurtbox.shape == Shape.Rectagle) {
                let rect = this.actorHurtbox.box as Rect;
                context.strokeRect(x, y, rect.width * this.stage.level.scale, rect.height * this.stage.level.scale);
            }
            
        }


        // Draw the hitbox
        // if the flag is set
        if (this.flag_draw_hitbox) {
            
            // Apply scale and offset to get the canvas position
            let x = this.actorHitbox.box.x * this.stage.level.scale + this.stage.level.xOffset;
            let y = this.actorHitbox.box.y * this.stage.level.scale + this.stage.level.yOffset;

            // debug
            context.strokeStyle = 'red';

            if (this.actorHitbox.shape == Shape.Circle) {
                let circle = this.actorHitbox.box as Circle;
                context.beginPath();
                context.arc(x, y, circle.radius * this.stage.level.scale, 0, Math.PI * 2, true);
                context.closePath();
                context.stroke();
            } else if (this.actorHitbox.shape == Shape.Rectagle) {
                let rect = this.actorHitbox.box as Rect;
                context.strokeRect(x, y, rect.width * this.stage.level.scale, rect.height * this.stage.level.scale);
            }
            
        }
                
            
    }

    public update() : void {


        // if the actor is not ready, do not draw
        if (!this.flag_ready) return;

        // move
        this.move();

    }

    public attack(actor:Actor) : void {

        if (actor.hitBy(this)) {
         
            // Damage

        } else {

            // No Damage
        }

    }

    public collidesWithActor(actor:Actor) : boolean {
            
        // if the actor is not ready, do not draw
        if (!this.flag_ready) return false;

        // if the actor is not ready, do not draw
        if (!actor.flag_ready) return false;

        // Check for collision
        return this.collidesWith(actor.hurtbox);
        
    }

    public collidesWithCollider(collider:Collider) : boolean {
        return this.collidesWith(collider);
    }

    public hitBy(actor:Actor) : boolean {
        return this.collidesWith(actor.hitbox);
    }

    private collidesWith(collider:Hurtbox|Hitbox|Collider) : boolean {

        // if the actor is not ready, do not draw
        if (!this.flag_ready) return false;

        // if the actor is not ready, do not draw
        if (!collider) return false;

        // Get the actor's box
        const actorBox:Rect = {
            x:this.position.x,
            y:this.position.y,
            width:this.size.width,
            height:this.size.height
        };

        // check the shape of the box
        switch (collider.shape) {
            case Shape.Rectagle:
                return this.collidesWithRect(actorBox, collider.box as Rect);
            case Shape.Circle:
                return this.collidesWithCircle(actorBox, collider.box as Circle);
        }

    }

    private collidesWithRect(actor:Rect, box:Rect) : boolean {
        return actor.x < box.x + box.width &&
               actor.x + actor.width > box.x &&
               actor.y < box.y + box.height &&
               actor.y + actor.height > box.y;
    }


    private collidesWithCircle(actor:Rect, circle:Circle) : boolean {

        // Get the distance between the actor and the circle
        // absolute value of the horizontal distance between the actor and the circle
        const distX = Math.abs(actor.x - circle.x - circle.radius);
        // absolute value of the vertical distance between the actor and the circle
        const distY = Math.abs(actor.y - circle.y - circle.radius);

        // if the horizontal distance is greater than the radius of the circle
        if (distX > (circle.radius + actor.width)) { return false; }
        // if the vertical distance is greater than the radius of the circle
        if (distY > (circle.radius + actor.height)) { return false; }

        // if the horizontal distance is less than the width of the actor
        if (distX <= (actor.width)) { return true; }
        // if the vertical distance is less than the height of the actor
        if (distY <= (actor.height)) { return true; }

        // get the distance between the actor and the circle
        const dx = distX - actor.width;
        const dy = distY - actor.height;

        // return true if the distance is less than the radius of the circle
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    private move(): void {
        if (!this.flag_ready || !this.flag_can_move || this.state === State.Dead || !this.stage.actors.includes(this)) return;

        // Apply acceleration to velocity
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Normalize velocity if moving in any direction
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            const length = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

            // Check if the current speed exceeds maxVelocity
            if (length > this.maxVelocity) {
                this.velocity.x = (this.velocity.x / length) * this.maxVelocity;
                this.velocity.y = (this.velocity.y / length) * this.maxVelocity;
            }
        }

        // Apply friction
        if (this.acceleration.x === 0) {
            this.velocity.x -= this.velocity.x * (this.friction / 10);
        }
        if (this.acceleration.y === 0) {
            this.velocity.y -= this.velocity.y * (this.friction / 10);
        }

        // Clamp the velocity to ensure it does not exceed maxVelocity due to floating-point arithmetic
        this.velocity.x = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.x));
        this.velocity.y = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.y));

        // // Clamp the position to ensure it does not exceed the bounds of the stage
        // this.position.x = Math.max(0, Math.min(this.stage.level.width - this.size.width, this.position.x));
        // this.position.y = Math.max(0, Math.min(this.stage.level.height - this.size.height, this.position.y));
    

        // Stop movement if velocity is very low
        if (Math.abs(this.velocity.x) < 0.5) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.5) this.velocity.y = 0;


        // Update last position
        this.lastPosition.x = this.position.x;
        this.lastPosition.y = this.position.y;

        // Update position based on velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Set the state to walking if moving
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.state = State.Walking;
        } else {
            this.state = State.Idle;
        }

        // Update hitbox and hurtbox positions
        this.updateBoxes();

    }


    private updateBoxes() : void {
        this.actorHurtbox.box.x = this.position.x;
        this.actorHurtbox.box.y = this.position.y;
        this.actorHitbox.box.x = this.position.x;
        this.actorHitbox.box.y = this.position.y;
    }
    
    public doAction(action:InputKey, pressed:boolean = false) {
        // Update the state of the key
        this.keyState[InputKey[action]] = pressed;

        // Horizontal movement logic
        if (this.keyState[InputKey.Left] && !this.keyState[InputKey.Right]) {
            this.acceleration.x = -this.accelerationRate;
        } else if (this.keyState[InputKey.Right] && !this.keyState[InputKey.Left]) {
            this.acceleration.x = this.accelerationRate;
        } else {
            this.acceleration.x = 0;
        }

        // Vertical movement logic
        if (this.keyState[InputKey.Up] && !this.keyState[InputKey.Down]) {
            this.acceleration.y = -this.accelerationRate;
        } else if (this.keyState[InputKey.Down] && !this.keyState[InputKey.Up]) {
            this.acceleration.y = this.accelerationRate;
        } else {
            this.acceleration.y = 0;
        }
    }

}