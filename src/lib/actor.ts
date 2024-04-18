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
    protected velocity:{x:number, y:number} = {x:0, y:0};
    protected acceleration:number           = 1;
    protected maxVelocity:number            = 2;
    protected friction:number               = 1;

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

    private setup() {

        // Set the state
        this.state = State.Idle;

        // Set the hurtbox
        this.actorHurtbox = {
            parent:this,
            shape:Shape.Rectagle,
            active:true,
            box:{
                x:this.position.x,
                y:this.position.y,
                width:this.size.width,
                height:this.size.height
            }
        };

        // Set the hitbox


        // if the actor is not on the stage
        // add it to the stage
        if (!this.stage.actors.includes(this)) this.stage.actors.push(this);
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
        // as a red circle
        // debug
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
                
            
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
        const distX = Math.abs(actor.x - circle.x - circle.radius);
        const distY = Math.abs(actor.y - circle.y - circle.radius);

        if (distX > (circle.radius + actor.width)) { return false; }
        if (distY > (circle.radius + actor.height)) { return false; }

        if (distX <= (actor.width)) { return true; }
        if (distY <= (actor.height)) { return true; }

        const dx = distX - actor.width;
        const dy = distY - actor.height;

        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    private move() : void {




    }
    
    

}