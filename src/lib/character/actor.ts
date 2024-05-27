import { Position, Property, Direction, Hurtbox, Hitbox  } from "../engine.js";
import { World } from "../world/world.js";
import { SpriteAnimation } from "../rendering/spriteAnimation.js";

export enum ActorState {
    Idle    = 'idle',
    Walking = 'walking'
}

export enum ActorType {
    Player = 'player',
    Enemy  = 'enemy'
}

export interface ActorStateAnimation {
    state:ActorState;
    animation:SpriteAnimation;
}

export abstract class Actor {

    // Position
    protected currentPostion:Position;
    protected targetPosition:Position;

    // Hitbox and Hurtbox
    protected actorHurtbox:Hurtbox;
    protected actorHitbox:Hitbox;

    // Properties
    protected actorType:ActorType;
    protected currentState:ActorState;
    protected animations:ActorStateAnimation[];
    protected currentAnimation:SpriteAnimation;
    protected props:Property[];

    // World / Map
    protected world:World;

    public constructor(type:ActorType, world:World) {

        // Set the type name
        this.actorType = type;

        // Set the world
        this.world = world;

        // Set up the actor
        this.setup();

    }

    public get angle() : number {
        
        // Calculate the angle
        let dx = this.targetPosition.x - this.currentPostion.x;
        let dy = this.targetPosition.y - this.currentPostion.y;

        return Math.atan2(dy, dx);
    }

    public get direction() : Direction {

        // Calculate the angle
        let angle = this.angle;

        // 1/8 of a circle
        const step = Math.PI / 8;

        // Calculate the direction
        if (angle > -step && angle <= step) {
            return Direction.East;
        } else if (angle > step && angle <= 3 * step) {
            return Direction.SouthEast;
        } else if (angle > 3 * step && angle <= 5 * step) {
            return Direction.South;
        } else if (angle > 5 * step && angle <= 7 * step) {
            return Direction.SouthWest;
        } else if (angle > 7 * step || angle <= -7 * step) {
            return Direction.West;
        } else if (angle > -7 * step && angle <= -5 * step) {
            return Direction.NorthWest;
        } else if (angle > -5 * step && angle <= -3 * step) {
            return Direction.North;
        } else if (angle > -3 * step && angle <= -step) {
            return Direction.NorthEast;
        }

        return Direction.North;
    }

    public get position() : Position {
        return this.currentPostion;
    }

    public set position(position:Position) {
        this.moveTo(position);
    }

    public get hitbox() : Hitbox {
        return this.actorHitbox;
    }

    public get hurtbox() : Hurtbox {
        return this.actorHurtbox;
    }

    public get type() : ActorType {
        return this.actorType;
    }

    public get state() : ActorState {
        return this.currentState;
    }

    public set state(state:ActorState) {
        this.currentState = state;
        this.setAnimation(state);
    }

    public property(name:string) : number {
        return this.props.find((p) => p.name === name).value ?? 0;
    }

    public setProperty(name:string, value:number) {
        this.props.find((p) => p.name === name).value = value;
    }

    public properties() : string[] {
        return this.props.map((p) => p.name);
    }

    public addAnimation(state:ActorState, animation:SpriteAnimation) {
        this.animations.push({state, animation});
    }

    public removeAnimation(state:ActorState) {
        // Find the index of the animation
        let index = this.animations.findIndex((a) => a.state === state);
        if (index >= 0) this.animations.splice(index, 1);
    }


    public render() {
    }

    protected setAnimation(state:ActorState) {
        this.currentAnimation = this.animations.find((a) => a.state === state).animation;
    }

    protected moveTo(position:Position) {
        this.targetPosition = position;
    }

    protected setup() {

        // Set the current position
        this.position       = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };

        // Set the properties
        this.props          = [
            { name: 'speed', value: 1 } // Speed of the actor
        ];

        // Event Target
        const events:EventTarget = this.world.engine.Events;

        // Hook the update event
        events.addEventListener('frame_update', (e:CustomEvent) => this.update(e.detail.delta));
    }

    protected update(delta:number) {

        // Move the actor
        this.move(delta);

    }

    protected move(delta:number) {
        
        // Calculate the distance to the target
        let dx = this.targetPosition.x - this.currentPostion.x;
        let dy = this.targetPosition.y - this.currentPostion.y;

        // Calculate the distance to move
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the speed
        let speed = this.property('speed');

        // Calculate the movement
        let move = speed * delta;

        // Check if we have reached the target
        if (distance <= move) {   

            // Set the current position
            this.currentPostion = this.targetPosition;

        } else {

            // Move the actor
            this.currentPostion.x += dx / distance * move;
            this.currentPostion.y += dy / distance * move;

        }
    }

}