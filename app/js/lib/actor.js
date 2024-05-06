//#region Imports
import { InputKey } from "./input.js";
import { Shape } from "./stage.js";
//#endregion
//#region Enumerators
export var StatusEffect;
(function (StatusEffect) {
    StatusEffect[StatusEffect["None"] = 0] = "None";
    StatusEffect[StatusEffect["Poisoned"] = 1] = "Poisoned";
    StatusEffect[StatusEffect["Burning"] = 2] = "Burning";
    StatusEffect[StatusEffect["Frozen"] = 3] = "Frozen";
    StatusEffect[StatusEffect["Stunned"] = 4] = "Stunned";
    StatusEffect[StatusEffect["Slowed"] = 5] = "Slowed";
    StatusEffect[StatusEffect["Hasted"] = 6] = "Hasted";
    StatusEffect[StatusEffect["Regen"] = 7] = "Regen";
    StatusEffect[StatusEffect["Shielded"] = 8] = "Shielded";
    StatusEffect[StatusEffect["Invincible"] = 9] = "Invincible";
})(StatusEffect || (StatusEffect = {}));
// Actor State
export var State;
(function (State) {
    State[State["Idle"] = 0] = "Idle";
    State[State["Walking"] = 1] = "Walking";
    State[State["Attacking"] = 2] = "Attacking";
    State[State["Hurt"] = 3] = "Hurt";
    State[State["Dead"] = 4] = "Dead";
})(State || (State = {}));
//#endregion
//#region Actor Class
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
        this.flag_draw_direction = false;
        this.flag_draw_velocity = false;
        this.flag_draw_image = false;
        this.flag_can_be_hurt = false;
        this.flag_can_attack = false;
        this.flag_can_die = true;
        this.flag_can_move = true;
        // Movement
        this.curVelocity = { x: 0, y: 0 };
        this.lastVelocity = { x: 0, y: 10 };
        this.acceleration = { x: 0, y: 0 };
        this.lastPosition = { x: 0, y: 0 };
        this.maxAcceleration = 4;
        this.accelerationRate = 1.2;
        this.maxVelocity = 8;
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
        // log
        this.stage.log(`Created ${this.constructor.name}: ${this.id}`);
    }
    //#endregion
    //#region Getters and Setters
    get state() {
        return this.currentState;
    }
    set state(newState) {
        this.currentState = newState;
    }
    get radius() {
        return this.size.width / 2;
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
        if (this.curVelocity.x > 0)
            return 'right';
        if (this.curVelocity.x < 0)
            return 'left';
        if (this.curVelocity.y > 0)
            return 'down';
        if (this.curVelocity.y < 0)
            return 'up';
        return 'none';
    }
    get angle() {
        if (this.curVelocity.x === 0 && this.curVelocity.y === 0) {
            // Use the last non-zero velocity to maintain the previous direction
            return Math.atan2(this.lastVelocity.y, this.lastVelocity.x);
        }
        else {
            // Calculate the angle based on the current velocity
            return Math.atan2(this.curVelocity.y, this.curVelocity.x);
        }
    }
    get waitingOnDelayedState() {
        return (this.stateTimer != 0 && typeof this.stateTimer != 'undefined');
    }
    get speed() {
        return Math.sqrt(this.curVelocity.x ** 2 + this.curVelocity.y ** 2);
    }
    get velocity() {
        return this.curVelocity;
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
        this.curVelocity = { x: 0, y: 0 };
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
        // Calculate position on the canvas adjusted for scale and offset
        let x = this.position.x * this.stage.level.scale + this.stage.level.xOffset;
        let y = this.position.y * this.stage.level.scale + this.stage.level.yOffset;
        let radius = this.size.width * this.stage.level.scale * 0.5;
        // Set fill style based on the state
        switch (this.state) {
            case State.Idle:
                context.fillStyle = '#0088ffaa';
                break;
            case State.Walking:
                context.fillStyle = '#00ff44aa';
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
            context.fillStyle = '#ffea0044';
            context.beginPath();
            context.arc(x, y, circle.radius * this.stage.level.scale, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
        }
        // Drawing the hitbox
        if (this.flag_draw_hitbox && this.actorHitbox.shape == Shape.Circle) {
            let circle = this.actorHitbox.box;
            context.strokeStyle = '#ff000044';
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
            context.fillText(`xV: ${this.curVelocity.x.toFixed(2)}`, x, y + 70);
            context.fillText(`yV: ${this.curVelocity.y.toFixed(2)}`, x, y + 80);
        }
    }
    update() {
        // if the actor is not ready, do not draw
        if (!this.flag_ready)
            return;
        // move
        this.move();
        // Update state based on current velocity
        this.updateMovementState();
        // Update hitbox and hurtbox positions accordingly
        this.updateCollision();
    }
    //#endregion
    //#region Actions
    attack(actor) {
    }
    //#endregion
    //#region Collision
    inWalkableArea(xPos = true, yPos = true) {
        // Get the walkable area
        const area = this.stage.level.walkableArea;
        // scaled position
        let x = this.position.x * this.stage.level.scale + this.stage.level.xOffset;
        let y = this.position.y * this.stage.level.scale + this.stage.level.yOffset;
        // allow for actor size
        x = (xPos) ? x + this.size.width * 0.5 : x - this.size.width * 0.5;
        y = (yPos) ? y + this.size.height * 0.5 : y - this.size.height * 0.5;
        // check if the actor is in the walkable area
        const xOkay = x >= area.x && x <= area.x + area.width;
        const yOkay = y >= area.y && y <= area.y + area.height;
        return { x: xOkay, y: yOkay };
    }
    resolveCollision(other) {
        // Get the overlap on both the X and Y axes
        const overlapX = Math.min(this.position.x + this.size.width, other.position.x + other.size.width) -
            Math.max(this.position.x, other.position.x);
        const overlapY = Math.min(this.position.y + this.size.height, other.position.y + other.size.height) -
            Math.max(this.position.y, other.position.y);
        // Resolve collision on the axis with the smallest overlap
        if (overlapX < overlapY) {
            if (this.position.x < other.position.x) {
                this.position.x -= overlapX / 2;
                other.position.x += overlapX / 2;
            }
            else {
                this.position.x += overlapX / 2;
                other.position.x -= overlapX / 2;
            }
        }
        else {
            if (this.position.y < other.position.y) {
                this.position.y -= overlapY / 2;
                other.position.y += overlapY / 2;
            }
            else {
                this.position.y += overlapY / 2;
                other.position.y -= overlapY / 2;
            }
        }
        // Slightly nudge in the previous direction
        const nudgedX = this.position.x + this.curVelocity.x;
        const nudgedY = this.position.y + this.curVelocity.y;
        const otherNudgedX = other.position.x + other.curVelocity.x;
        const otherNudgedY = other.position.y + other.curVelocity.y;
        // Calculate the new overlap
        const newOverlapX = Math.min(nudgedX + this.size.width, otherNudgedX + other.size.width) -
            Math.max(nudgedX, otherNudgedX);
        const newOverlapY = Math.min(nudgedY + this.size.height, otherNudgedY + other.size.height) -
            Math.max(nudgedY, otherNudgedY);
        // If nudging in the previous direction still overlaps, then stop
        if (newOverlapX > 0 && newOverlapY > 0) {
            this.curVelocity = { x: 0, y: 0 };
            other.curVelocity = { x: 0, y: 0 };
            return;
        }
        // Otherwise, nudge in the previous direction
        this.position.x += this.curVelocity.x;
        this.position.y += this.curVelocity.y;
        other.position.x += other.curVelocity.x;
        other.position.y += other.curVelocity.y;
    }
    isOverlapping(other) {
        return !(this.position.x + this.size.width <= other.position.x ||
            this.position.y + this.size.height <= other.position.y ||
            this.position.x >= other.position.x + other.size.width ||
            this.position.y >= other.position.y + other.size.height);
    }
    checkAndResolveCollision(other) {
        if (this.isOverlapping(other)) {
            this.resolveCollision(other);
        }
    }
    //#endregion
    //#region Movement
    move() {
        // Do not move if not ready, dead, or not in the stage
        if (!this.flag_ready || !this.flag_can_move || this.state === State.Dead || !this.stage.actors.includes(this)) {
            return;
        }
        // if last position is not set
        // set it to the current position
        if (this.lastPosition.x === 0 && this.lastPosition.y === 0) {
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
        }
        // Calculate velocity based on acceleration
        this.calculateVelocity();
        // positive movement
        let xPos = (this.curVelocity.x > 0);
        let yPos = (this.curVelocity.y > 0);
        // check if the actor is in the walkable area
        let inArea = this.inWalkableArea(xPos, yPos);
        // if the actor is not in the walkable area
        // stop movement
        if (!inArea.x) {
            this.curVelocity.x = 0;
            this.position.x = this.lastPosition.x;
        }
        else {
            this.lastPosition.x = this.position.x;
            this.position.x += this.curVelocity.x;
        }
        // if the actor is not in the walkable area
        // stop movement
        if (!inArea.y) {
            this.curVelocity.y = 0;
            this.position.y = this.lastPosition.y;
        }
        else {
            this.lastPosition.y = this.position.y;
            this.position.y += this.curVelocity.y;
        }
    }
    applyDampingAndFriction() {
        const damping = 1 - 0.0001;
        this.curVelocity.x *= damping;
        this.curVelocity.y *= damping;
        if (Math.abs(this.acceleration.x) < 0.01) {
            this.curVelocity.x *= (1 - this.friction / 100);
        }
        if (Math.abs(this.acceleration.y) < 0.01) {
            this.curVelocity.y *= (1 - this.friction / 100);
        }
    }
    updateMovementState() {
        if (this.curVelocity.x !== 0 || this.curVelocity.y !== 0) {
            if (this.state !== State.Walking)
                this.delayStateChange(State.Walking, 2);
        }
        if (this.state !== State.Idle)
            this.delayStateChange(State.Idle, 2);
    }
    clampVelocity() {
        if (Math.abs(this.curVelocity.x) < this.minVelocity) {
            this.curVelocity.x = 0;
        }
        if (Math.abs(this.curVelocity.y) < this.minVelocity) {
            this.curVelocity.y = 0;
        }
    }
    calculateVelocity() {
        // if the actor is not ready
        // do not move
        if (!this.flag_ready)
            return;
        // Apply acceleration to velocity
        this.curVelocity.x += this.acceleration.x;
        this.curVelocity.y += this.acceleration.y;
        if (this.speed > this.maxVelocity) {
            const normalizationFactor = this.maxVelocity / this.speed;
            this.curVelocity.x *= normalizationFactor;
            this.curVelocity.y *= normalizationFactor;
        }
        // Update the last non-zero velocity before applying damping
        if (this.curVelocity.x !== 0 || this.curVelocity.y !== 0) {
            this.lastVelocity.x = this.curVelocity.x;
            this.lastVelocity.y = this.curVelocity.y;
        }
        // Apply damping to slow down smoothly and friction if no input acceleration
        this.applyDampingAndFriction();
        // Ensure stopping movement at very low velocity
        this.clampVelocity();
    }
    updateCollision() {
        this.actorHurtbox.box.x = this.position.x;
        this.actorHurtbox.box.y = this.position.y;
        this.actorHitbox.box.x = this.position.x;
        this.actorHitbox.box.y = this.position.y;
    }
    //#endregion
    //#region Input
    setActionState(action, pressed = false) {
        // Update the state of the key
        this.keyState[InputKey[action]] = pressed;
        // Horizontal movement logic
        const left = this.keyState[InputKey.Left] && !this.keyState[InputKey.Right];
        const right = this.keyState[InputKey.Right] && !this.keyState[InputKey.Left];
        const deltaX = (left ? -1 : 0) + (right ? 1 : 0);
        this.acceleration.x = deltaX * this.accelerationRate;
        // Vertical movement logic
        const up = this.keyState[InputKey.Up] && !this.keyState[InputKey.Down];
        const down = this.keyState[InputKey.Down] && !this.keyState[InputKey.Up];
        const deltaY = (up ? -1 : 0) + (down ? 1 : 0);
        this.acceleration.y = deltaY * this.accelerationRate;
    }
}
//#endregion
