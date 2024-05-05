import { Actor, State } from "./actor.js";
export class Enemy extends Actor {
    constructor(stage, position, size = { width: 64, height: 64 }) {
        super(stage, position, size, "./assets/enemy/enemy_normal_256.png");
    }
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
                context.fillStyle = '#ff000044';
                break;
            case State.Walking:
                context.fillStyle = '#ffaa0044';
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
    }
}
