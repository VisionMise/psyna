import { InputKey } from "./input.js";
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
    //#endregion
    //#region Constructor
    constructor(stage, position, size, imageURL) {
        this.stateDelay = 100;
        // Flags
        this.flag_ready = false;
        this.flag_render_hurtbox = false;
        this.flag_render_hitbox = false;
        this.flag_draw_hurtbox = true;
        this.flag_draw_hitbox = false;
        this.flag_draw_direction = true;
        this.flag_draw_velocity = true;
        this.flag_draw_image = false;
        this.flag_can_be_hurt = false;
        this.flag_can_attack = false;
        this.flag_can_die = true;
        this.flag_can_move = true;
        // Movement
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.maxAcceleration = 8;
        this.accelerationRate = 4;
        this.lastPosition = { x: 0, y: 0 };
        this.lastVelocity = { x: 0, y: 10 };
        this.maxVelocity = 10;
        this.minVelocity = 0.1;
        this.friction = 45;
        // Input
        this.keyState = {};
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
    //#endregion
    //#region Getters and Setters
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
    get direction() {
        // convert the current angle to degrees
        let degrees = this.angle * (180 / Math.PI) + 90;
        // add 360 to the degrees if the value is negative
        if (degrees < 0)
            degrees += 360;
        // return the degrees
        return degrees;
    }
    get cardinalDirection() {
        // get the direction
        // subtract 90 to get the correct direction
        let direction = this.direction;
        // check the direction
        if (direction < 0)
            direction += 360;
        // get the cardinal direction
        if (direction >= 0 && direction < 22.5)
            return 'N';
        if (direction >= 22.5 && direction < 67.5)
            return 'NE';
        if (direction >= 67.5 && direction < 112.5)
            return 'E';
        if (direction >= 112.5 && direction < 157.5)
            return 'SE';
        if (direction >= 157.5 && direction < 202.5)
            return 'S';
        if (direction >= 202.5 && direction < 247.5)
            return 'SW';
        if (direction >= 247.5 && direction < 292.5)
            return 'W';
        if (direction >= 292.5 && direction < 337.5)
            return 'NW';
        if (direction >= 337.5)
            return 'N';
        return 'N';
    }
    get movementDirection() {
        //return up, down, left, right
        if (this.velocity.x > 0)
            return 'right';
        if (this.velocity.x < 0)
            return 'left';
        if (this.velocity.y > 0)
            return 'down';
        if (this.velocity.y < 0)
            return 'up';
        return 'none';
    }
    get angle() {
        if (this.velocity.x === 0 && this.velocity.y === 0) {
            // Use the last non-zero velocity to maintain the previous direction
            return Math.atan2(this.lastVelocity.y, this.lastVelocity.x);
        }
        else {
            // Calculate the angle based on the current velocity
            return Math.atan2(this.velocity.y, this.velocity.x);
        }
    }
    get waitingOnDelayedState() {
        return (this.stateTimer != 0 && typeof this.stateTimer != 'undefined');
    }
    //#endregion
    //#region Methods
    delayStateChange(state, delay) {
        // if waiting on a delayed state change
        // do not change the state
        if (this.waitingOnDelayedState)
            return;
        // set the state delay
        this.stateTimer = setTimeout(() => {
            // set the state
            this.state = state;
            // clear the state timer
            clearTimeout(this.stateTimer);
            this.stateTimer = 0;
        }, delay ?? this.stateDelay);
    }
    setup() {
        // Set the state
        this.state = State.Idle;
        // Set velocity
        this.velocity = { x: 0, y: 0 };
        // Set the hurtbox
        // same size and shape as the actor
        // active
        this.actorHurtbox = {
            parent: this,
            shape: Shape.Circle,
            active: true,
            box: {
                x: this.position.x,
                y: this.position.y,
                radius: this.size.width / 2,
            }
        };
        // Set the hitbox
        // temporary position
        // inactive
        this.actorHitbox = {
            parent: this,
            shape: Shape.Circle,
            active: false,
            box: {
                x: this.position.x,
                y: this.position.y,
                radius: this.size.width / 2,
            }
        };
        // Initialize key states for directional controls
        this.keyState = {
            [InputKey.Up]: false,
            [InputKey.Down]: false,
            [InputKey.Left]: false,
            [InputKey.Right]: false
        };
        // if the actor is not on the stage
        // add it to the stage
        if (this.stage.actors.includes(this) == false)
            this.stage.actors.push(this);
    }
    uniqueID() {
        return Math.random().toString(36).substring(2, 9);
    }
    async loadImage() {
        return new Promise((resolve, reject) => {
            this.actorImage = new Image();
            this.actorImage.src = this.actorImageURL;
            this.actorImage.addEventListener('load', () => resolve());
            this.actorImage.addEventListener('error', () => reject());
        });
    }
    //#endregion
    //#region Drawing
    draw(context) {
        if (!this.flag_ready)
            return;
        // Calculate the actual center position on the canvas
        let x = this.position.x * this.stage.level.scale + this.stage.level.xOffset;
        let y = this.position.y * this.stage.level.scale + this.stage.level.yOffset;
        let radius = this.size.width * this.stage.level.scale / 2; // Assuming size.width is the diameter
        // Set fill style based on the state
        switch (this.state) {
            case State.Idle:
                context.fillStyle = '#0088ff44';
                break;
            case State.Walking:
                context.fillStyle = '#00ff4444';
                break;
            case State.Attacking:
                context.fillStyle = '#aaff0044';
                break;
            case State.Hurt:
                context.fillStyle = '#dd00ff44';
                break;
            case State.Dead:
                context.fillStyle = '#00000044';
                break;
        }
        // Draw the actor as a circle
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
        // Drawing the hurtbox
        if (this.flag_draw_hurtbox && this.actorHurtbox.shape == Shape.Circle) {
            let circle = this.actorHurtbox.box;
            context.fillStyle = 'rgba(255, 234, 0, 0.22)';
            context.beginPath();
            context.arc(x, y, circle.radius * this.stage.level.scale, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
        }
        // Drawing the hitbox
        if (this.flag_draw_hitbox && this.actorHitbox.shape == Shape.Circle) {
            let circle = this.actorHitbox.box;
            context.strokeStyle = 'rgba(255, 0, 0, 0.27)';
            context.beginPath();
            context.arc(x, y, circle.radius * this.stage.level.scale, 0, Math.PI * 2, true);
            context.stroke();
            context.closePath();
        }
        // Additional debug visuals like direction, velocity, etc.
        if (this.flag_draw_direction) {
            const angle = this.angle;
            const length = 20;
            const x2 = x + Math.cos(angle) * length;
            const y2 = y + Math.sin(angle) * length;
            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x2, y2);
            context.stroke();
            context.closePath();
            // Additional debug text
            context.fillStyle = 'white';
            context.font = '10px Arial';
            context.textAlign = 'center';
            context.fillText(`${this.direction.toFixed(2)}°`, x, y + 40);
            context.fillText(this.cardinalDirection, x, y + 50);
            context.fillText(this.movementDirection, x, y + 60);
        }
        if (this.flag_draw_velocity) {
            context.fillText(`Vx: ${this.velocity.x.toFixed(2)}`, x, y + 70);
            context.fillText(`Vy: ${this.velocity.y.toFixed(2)}`, x, y + 80);
        }
    }
    update() {
        // if the actor is not ready, do not draw
        if (!this.flag_ready)
            return;
        // move
        this.move();
    }
    //#endregion
    //#region Actions
    attack(actor) {
    }
    //#endregion
    //#region Collision
    collidingWithLevel(nextX, nextY) {
        // walls
        const walls = this.stage.level.walls;
        // actor box
        // Calculate the actual center position on the canvas
        let posX = nextX * this.stage.level.scale + this.stage.level.xOffset;
        let posY = nextY * this.stage.level.scale + this.stage.level.yOffset;
        // size
        let sizeX = (this.size.width * this.stage.level.scale) / 2;
        let sizeY = (this.size.height * this.stage.level.scale) / 2;
        // check for collision
        for (let wall of walls) {
            // wall box
            let { x, y, width, height } = wall.box;
            // check for collision
            if (posX + sizeX > x && posX - sizeX < x + width && posY + sizeY > y && posY - sizeY < y + height) {
                return true;
            }
        }
        return false;
    }
    //#endregion
    //#region Movement
    move() {
        // Do not move if not ready, dead, or not in the stage
        if (!this.flag_ready || !this.flag_can_move || this.state === State.Dead || !this.stage.actors.includes(this)) {
            return;
        }
        // Calculate velocity based on acceleration
        this.calculateVelocity();
        // Check for wall collisions
        this.checkForWallCollisions();
        // Apply damping to slow down smoothly and friction if no input acceleration
        this.applyDampingAndFriction();
        // Update state based on current velocity
        this.updateStateBasedOnMovement();
        // Ensure stopping movement at very low velocity
        this.stopMovementAtLowVelocity();
        // Update hitbox and hurtbox positions accordingly
        this.updateBoxes();
    }
    applyDampingAndFriction() {
        const damping = 1 - 0.0001;
        this.velocity.x *= damping;
        this.velocity.y *= damping;
        if (Math.abs(this.acceleration.x) < 0.01) {
            this.velocity.x *= (1 - this.friction / 100);
        }
        if (Math.abs(this.acceleration.y) < 0.01) {
            this.velocity.y *= (1 - this.friction / 100);
        }
    }
    updateStateBasedOnMovement() {
        if (this.state == State.Hurt || this.state == State.Dead)
            return;
        // make sure the position is changing
        if (this.position.x !== this.lastPosition.x || this.position.y !== this.lastPosition.y) {
            // if the actor is not walking
            // set the state to walking
            this.state = State.Walking;
            return;
        }
        if (this.state !== State.Idle)
            this.delayStateChange(State.Idle, 2);
    }
    stopMovementAtLowVelocity() {
        if (Math.abs(this.velocity.x) < this.minVelocity) {
            this.velocity.x = 0;
        }
        if (Math.abs(this.velocity.y) < this.minVelocity) {
            this.velocity.y = 0;
        }
    }
    checkForWallCollisions() {
        // Predict the next position based on current velocity
        // Used for collision detection
        const nextX = this.position.x + this.velocity.x;
        const nextY = this.position.y + this.velocity.y;
        // Collisions
        // Check for collisions on both x and y axis
        let collisionX = this.collidingWithLevel(nextX, this.position.y);
        let collisionY = this.collidingWithLevel(this.position.x, nextY);
        // if there is a collision on x axis
        // stop movement on x axis
        if (collisionX) {
            this.velocity.x = 0;
            this.acceleration.x = 0;
            this.position.x = this.lastPosition.x;
        }
        else {
            this.lastPosition.x = this.position.x;
            this.position.x = nextX;
        }
        // if there is a collision on y axis
        // stop movement on y axis
        if (collisionY) {
            this.velocity.y = 0;
            this.acceleration.y = 0;
            this.position.y = this.lastPosition.y;
        }
        else {
            this.lastPosition.y = this.position.y;
            this.position.y = nextY;
        }
        // if there is a collision on x or y axis
        // return true
        return collisionX || collisionY;
    }
    calculateVelocity() {
        // Apply acceleration to velocity
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        // Normalize velocity to maintain consistent speed in all directions
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxVelocity) {
            const normalizationFactor = this.maxVelocity / speed;
            this.velocity.x *= normalizationFactor;
            this.velocity.y *= normalizationFactor;
        }
        // Update the last non-zero velocity before applying damping
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.lastVelocity.x = this.velocity.x;
            this.lastVelocity.y = this.velocity.y;
        }
    }
    updateBoxes() {
        this.actorHurtbox.box.x = this.position.x;
        this.actorHurtbox.box.y = this.position.y;
        this.actorHitbox.box.x = this.position.x;
        this.actorHitbox.box.y = this.position.y;
    }
    //#endregion
    //#region Input
    doAction(action, pressed = false) {
        // Update the state of the key
        this.keyState[InputKey[action]] = pressed;
        // Horizontal movement logic
        if (this.keyState[InputKey.Left] && !this.keyState[InputKey.Right]) {
            this.acceleration.x = -this.accelerationRate;
        }
        else if (this.keyState[InputKey.Right] && !this.keyState[InputKey.Left]) {
            this.acceleration.x = this.accelerationRate;
        }
        else {
            this.acceleration.x = 0;
        }
        // Vertical movement logic
        if (this.keyState[InputKey.Up] && !this.keyState[InputKey.Down]) {
            this.acceleration.y = -this.accelerationRate;
        }
        else if (this.keyState[InputKey.Down] && !this.keyState[InputKey.Up]) {
            this.acceleration.y = this.accelerationRate;
        }
        else {
            this.acceleration.y = 0;
        }
    }
}
