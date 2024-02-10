import { Stage } from "./stage";

export interface Position {
    x:number;
    y:number;
}

export interface Size {
    width:number;
    height:number;
}

export interface Rect {
    x:number;
    y:number;
    width:number;
    height:number;
}

export interface Circle {
    x:number;
    y:number;
    radius:number;
}

export enum Shape {
    Rectagle,
    Circle
}

export interface Hurtbox {
    parent:Actor;
    shape:Shape;
    active:boolean;
    box?:Rect|Circle;
}

export interface Hitbox {
    parent:Actor;
    shape:Shape;
    active:boolean;
    box?:Rect|Circle;
}

export interface Collider {
    shape:Shape;
    box:Rect|Circle;
    active:boolean;
}

export enum State {
    Idle        = 0,
    Walking     = 1,
    Attacking   = 2,
    Hurt        = 3,
    Dead        = 4 
}

export abstract class Actor {

    public stage:Stage;
    public position:Position;
    public size:Size;
    public id:string;

    private actorImage:HTMLImageElement;
    private actorImageURL:string;

    private actorHurtbox:Hurtbox;
    private actorHitbox:Hitbox;

    private currentState:State;
    private ready:boolean = false;

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

        // Load the image
        this.loadImage().then(() => {

            this.stage.log(`Actor Loaded: ${this.id}`);
            this.ready = true;

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

        // if the actor is not ready, do not draw
        if (!this.ready) return;

        // Draw the actor
        this.stage.context.drawImage(
            this.actorImage,
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );

    }

    public update() : void {


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
        if (!this.ready) return false;

        // if the actor is not ready, do not draw
        if (!actor.ready) return false;

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
        if (!this.ready) return false;

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

    
    

}