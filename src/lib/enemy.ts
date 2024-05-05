import { Actor, State } from "./actor.js";
import { Position, Size, Stage } from "./stage.js";

export enum EnemyType {
    Stalker = 'stalker'
}

export enum MovementType {
    Swarm = 'swarm',
    Stalk = 'stalk',
    Avoid = 'avoid'
}

export interface EnemyConfiguration {
    name:string;
    size:{width:number, height:number};
    color:string;
    movement:MovementType;
}

export class Enemy extends Actor {

    private enemyType:EnemyType = null;
    private enemyColor:string = '#ff0000';
    
    private config:EnemyConfiguration;

    public constructor(type:EnemyType, stage:Stage, position:Position, size:Size = { width: 64, height: 64 } as Size) {    
        super(stage, position, size);
        this.enemyType = type;

        this.loadConfiguration().then(async () => {
    
            // Set the size
            this.size.width     = this.config.size.width;
            this.size.height    = this.config.size.height;

            // Set the color
            this.enemyColor     = this.config.color;

            // Set ready flag
            this.flag_ready = true;
        });
    }

    public get type() : EnemyType {
        return this.enemyType;
    }

    public draw(context: CanvasRenderingContext2D) {
        if (!this.flag_ready) return;

        // Calculate position on the canvas adjusted for scale and offset
        const box = {
            x: (this.position.x - this.size.width / 2) * this.stage.level.scale + this.stage.level.xOffset,
            y: (this.position.y - this.size.height / 2) * this.stage.level.scale + this.stage.level.yOffset,
            width: this.size.width * this.stage.level.scale,
            height: this.size.height * this.stage.level.scale
        };

        // Set the color
        context.fillStyle = this.enemyColor;

        // change the color if walking
        if (this.state == State.Walking) {
            context.fillStyle = '#fffb00';
        }

        // Draw the actor as a rectangle
        context.beginPath();
        context.fillRect(box.x, box.y, box.width, box.height);
        context.fill();
        context.closePath();      
    }

    protected swarm() {

        // move towards the player
        // until within 10 pixels
        // then bounce back
        // the further away the faster
        // the closer the slower
        const player = this.stage.level.player;
        const playerCenterX = player.position.x + player.size.width / 2;
        const playerCenterY = player.position.y + player.size.height / 2;
        const enemyCenterX = this.position.x + this.size.width / 2;
        const enemyCenterY = this.position.y + this.size.height / 2;


        // calculate the angle
        const angle = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);

        // calculate the distance
        const distance = Math.sqrt((playerCenterX - enemyCenterX) ** 2 + (playerCenterY - enemyCenterY) ** 2);

        // Calculate the speed
        const speed = Math.max(0.5, Math.min(1, distance / 100));  // Keep speed between 0.5 and 1

        // Move based on the distance
        if (distance < player.size.width) {
            // Bounce back
            this.velocity.x -= Math.cos(angle) * speed;
            this.velocity.y -= Math.sin(angle) * speed;

        } else if (distance < 100) {
            // Slow down as approaching
            this.velocity.x -= Math.cos(angle) * speed;
            this.velocity.y -= Math.sin(angle) * speed;
        } else {
            // Move at normal speed
            this.velocity.x += Math.cos(angle) * speed;
            this.velocity.y += Math.sin(angle) * speed;
        }


        // positive movement
        let xPos:boolean = (this.velocity.x > 0);
        let yPos:boolean = (this.velocity.y > 0);


        // check if the actor is in the walkable area
        let inArea:{x:boolean, y:boolean} = this.inWalkableArea(xPos, yPos);

        // if the actor is not in the walkable area
        // stop movement
        if (!inArea.x) {
            this.curVelocity.x = 0;
            this.position.x = this.lastPosition.x;
        } else {
            this.lastPosition.x = this.position.x;
            this.position.x += this.curVelocity.x;
        }

        // if the actor is not in the walkable area
        // stop movement
        if (!inArea.y) {
            this.curVelocity.y = 0;
            this.position.y = this.lastPosition.y;
        } else {
            this.lastPosition.y = this.position.y;
            this.position.y += this.curVelocity.y;
        }

    }

    protected stalk() {

    }

    protected avoid() {
    }



    public update() {

        this.move();
    }

    private async loadConfiguration() : Promise<void> {

        // Load the configuration file
        const configPath:string = `./assets/enemy/${this.type}/config.json`;

        // Fetch the configuration file
        const response      = await fetch(configPath);
        if (!response.ok)   return;

        // Parse the configuration file
        this.config         = await response.json();
    }

}