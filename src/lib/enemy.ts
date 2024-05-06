import { Actor, State } from "./actor.js";
import { Position, Size, Stage } from "./stage.js";

export enum EnemyType {
    Stalker = 'stalker'
}

export enum MovementType {
    Swarm   = 'swarm',
    Stalk   = 'stalk',
    Avoid   = 'avoid',
    Jitter  = 'jitter'
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
    private movementType:MovementType = null;
    
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

            // Set the movement type
            this.movementType   = this.config.movement;

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

        // Draw the actor as a circle
        context.beginPath();
        // context.fillRect(box.x, box.y, box.width, box.height);
        context.arc(box.x + box.width / 2, box.y + box.height / 2, box.width / 2, 0, 2 * Math.PI);
        context.fill();
        context.closePath();      
    }

    protected swarm() {

        
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

    protected stalk_v1() {

        // get player and enemy center
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
        if (distance < 250) {
            // Slow down as approaching
            this.velocity.x = Math.cos(angle) * speed / 2;
            this.velocity.y = Math.sin(angle) * speed / 2;
        } else {
            // Move at normal speed
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }

        // positive movement
        let xPos:boolean = (this.velocity.x > 0);
        let yPos:boolean = (this.velocity.y > 0);

        // check if the actor is in the walkable area
        let inArea:{x:boolean, y:boolean} = this.inWalkableArea(xPos, yPos);

        // check for collision with other enemies
        for (let other of this.stage.level.enemies) {
            if (other == this) continue;
            this.checkAndResolveCollision(other);
        }

        // check for collision with the player
        this.checkAndResolveCollision(player);

        // If the actor is not in the walkable area, stop movement
        if (!inArea.x) {
            this.curVelocity.x = 0;
            this.position.x = this.lastPosition.x;
        } else {
            this.lastPosition.x = this.position.x;
            this.position.x += this.curVelocity.x;
        }

        if (!inArea.y) {
            this.curVelocity.y = 0;
            this.position.y = this.lastPosition.y;
        } else {
            this.lastPosition.y = this.position.y;
            this.position.y += this.curVelocity.y;
        }

    }

    protected stalk() {

        // Get player and enemy center
        const player = this.stage.level.player;
        const playerCenterX = player.position.x + player.size.width / 2;
        const playerCenterY = player.position.y + player.size.height / 2;
        const enemyCenterX = this.position.x + this.size.width / 2;
        const enemyCenterY = this.position.y + this.size.height / 2;

        // Calculate the angle
        const angle = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);

        // Calculate the distance
        const distance = Math.sqrt((playerCenterX - enemyCenterX) ** 2 + (playerCenterY - enemyCenterY) ** 2);

        // Calculate the speed
        let speed = Math.max(Math.random(), Math.min(1, distance / 100)); // Keep speed between 0.5 and 1

        // increase the speed a random amount
        speed += Math.random() * 0.5;

        // Move based on the distance
        if (distance < 250) {
            // Slow down as approaching
            this.velocity.x = Math.cos(angle) * speed / 2;
            this.velocity.y = Math.sin(angle) * speed / 2;
        } else {
            // Move at normal speed
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }

        // Positive movement
        let xPos = this.velocity.x > 0;
        let yPos = this.velocity.y > 0;

        // Check if the actor is in the walkable area
        let inArea = this.inWalkableArea(xPos, yPos);

        // Check for collision with other enemies
        for (let other of this.stage.level.enemies) {
            if (other !== this) {
                // Circular collision detection
                const dx = (other.position.x - this.position.x) + this.velocity.x;
                const dy = (other.position.y - this.position.y) + this.velocity.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const combinedRadius = this.radius + other.radius;

                if (distance < combinedRadius) {
                    // If they overlap, nudge them apart
                    const overlap = combinedRadius - distance;
                    const angle = Math.atan2(dy, dx);

                    this.position.x -= Math.cos(angle) * overlap;
                    this.position.y -= Math.sin(angle) * overlap;
                    other.position.x += Math.cos(angle) * overlap;
                    other.position.y += Math.sin(angle) * overlap;

                    // // Optional: update velocities to prevent sticking
                    // this.velocity.x += -Math.cos(angle);
                    // this.velocity.y += -Math.sin(angle);
                    // other.velocity.x += Math.cos(angle);
                    // other.velocity.y += Math.sin(angle);
                }
            }
        }

        // Check for collision with the player
        this.checkAndResolveCollision(player);

        // If the actor is not in the walkable area, stop movement
        if (!inArea.x) {
            this.curVelocity.x = 0;
            this.position.x = this.lastPosition.x;
        } else {
            this.lastPosition.x = this.position.x;
            this.position.x += this.curVelocity.x;
        }

        if (!inArea.y) {
            this.curVelocity.y = 0;
            this.position.y = this.lastPosition.y;
        } else {
            this.lastPosition.y = this.position.y;
            this.position.y += this.curVelocity.y;
        }

    }

    protected jitter() {

        // Get player and enemy center
        const player = this.stage.level.player;
        const playerCenterX = player.position.x + player.size.width / 2;
        const playerCenterY = player.position.y + player.size.height / 2;
        const enemyCenterX = this.position.x + this.size.width / 2;
        const enemyCenterY = this.position.y + this.size.height / 2;

        // Calculate the angle
        const angle = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);

        // Calculate the distance
        const distance = Math.sqrt((playerCenterX - enemyCenterX) ** 2 + (playerCenterY - enemyCenterY) ** 2);

        // Calculate the speed
        let speed = Math.max(Math.random(), Math.min(1, distance / 100)); // Keep speed between 0.5 and 1

        // Increase the speed a random amount
        speed += Math.random() * 0.5;

        // Move based on the distance
        if (distance < 250) {
            // Slow down as approaching
            this.velocity.x = Math.cos(angle) * speed / 2;
            this.velocity.y = Math.sin(angle) * speed / 2;
        } else {
            // Move at normal speed
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }

        // Apply random velocity changes if near other enemies
        for (let other of this.stage.level.enemies) {
            if (other === this) continue;

            // Circular collision detection
            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const combinedRadius = this.radius + other.radius;

            if (distance < combinedRadius) {
                // If they overlap, nudge them apart
                const overlap = combinedRadius - distance;
                const angle = Math.atan2(dy, dx);

                this.velocity.x += -Math.cos(angle) * overlap;
                this.velocity.y += -Math.sin(angle) * overlap;
                other.velocity.x += Math.cos(angle) * overlap;
                other.velocity.y += Math.sin(angle) * overlap;
            }

            // Randomly change velocity
            // using cos and sin to get a random angle
            
            this.velocity.x += Math.cos(Math.random() * Math.PI * 2) * 0.1;
            this.velocity.y += Math.sin(Math.random() * Math.PI * 2) * 0.1;                
        

            // Check for collision with the player
            this.checkAndResolveCollision(player);

            // Positive movement
            let xPos = this.velocity.x > 0;
            let yPos = this.velocity.y > 0;

            // Check if the actor is in the walkable area
            let inArea = this.inWalkableArea(xPos, yPos);

            // If the actor is not in the walkable area, stop movement
            if (!inArea.x) {
                this.curVelocity.x = 0;
                this.position.x = this.lastPosition.x;
            } else {
                this.lastPosition.x = this.position.x;
                this.position.x += this.curVelocity.x;
            }

            if (!inArea.y) {
                this.curVelocity.y = 0;
                this.position.y = this.lastPosition.y;
            } else {
                this.lastPosition.y = this.position.y;
                this.position.y += this.curVelocity.y;
            }



        }

        // Check if the actor is in the walkable area
        let xPos = this.velocity.x > 0;
        let yPos = this.velocity.y > 0;
        let inArea = this.inWalkableArea(xPos, yPos);

        // If the actor is not in the walkable area, stop movement
        if (!inArea.x) {
            this.curVelocity.x = 0;
            this.position.x = this.lastPosition.x;
        } else {
            this.lastPosition.x = this.position.x;
            this.position.x += this.curVelocity.x;
        }

        if (!inArea.y) {
            this.curVelocity.y = 0;
            this.position.y = this.lastPosition.y;
        } else {
            this.lastPosition.y = this.position.y;
            this.position.y += this.curVelocity.y;
        }
    }

    protected avoid() {
    }


    public update() {

        if (!this.flag_ready) return;

        // Call the movement function
        switch (this.movementType) {
            case MovementType.Swarm:
                this.swarm();
                break;
            case MovementType.Stalk:
                this.stalk();
                break;
            case MovementType.Avoid:
                this.avoid();
                break;
            case MovementType.Jitter:
                this.jitter();
                break;
        }


        // Update the actor
        super.update();
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