//#region Imports

import { BoxRect, Position } from "../engine";
import { Viewport } from "../output/viewport";

//#endregion

//#region Camera Class Updates

export class Camera {

    private currentPosition: Position;
    private targetPosition: Position;
    private currentZoom: number;
    private targetZoom: number;
    private viewport: Viewport;
    private boundary: BoxRect;

    public constructor(viewport: Viewport, bounds?: BoxRect) {
        this.viewport = viewport;
        this.boundary = bounds ?? { x1: -Infinity, y1: -Infinity, x2: Infinity, y2: Infinity };
        this.setup();
    }

    public get position(): Position {
        return this.currentPosition;
    }

    public get zoom(): number {
        return this.currentZoom;
    }

    public set bounds(bounds: BoxRect) {
        this.boundary = bounds;
    }

    private setup() {
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.currentZoom = 1;
        this.targetZoom = 1;
    }

    public moveTo(x: number, y: number) {
        // Ensure the target position is within bounds
        const halfWidth = this.viewport.size.width / (2 * this.currentZoom);
        const halfHeight = this.viewport.size.height / (2 * this.currentZoom);
        const clampedX = Math.min(Math.max(x, this.boundary.x1 + halfWidth), this.boundary.x2 - halfWidth);
        const clampedY = Math.min(Math.max(y, this.boundary.y1 + halfHeight), this.boundary.y2 - halfHeight);
        this.targetPosition = { x: clampedX, y: clampedY };
    }

    public setZoom(zoomLevel: number) {
        this.targetZoom = Math.max(0.1, Math.min(zoomLevel, 5)); // Clamp zoom level between 0.1 and 5
    }

    public update() {
        // Apply lerp for smooth camera transitions
        this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * 0.1; // Smoothing factor
        this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * 0.1;
        this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;

        // Update the viewport's transformation
        this.viewport.context.setTransform(
            this.currentZoom, 0, 0, this.currentZoom,
            this.viewport.size.width / 2 - this.currentPosition.x * this.currentZoom,
            this.viewport.size.height / 2 - this.currentPosition.y * this.currentZoom
        );
    }

}

//#endregion