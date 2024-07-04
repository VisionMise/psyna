export class SpriteAnimation {

    protected animationName:string;
    protected spriteSheet:string;
    protected frameWidth:number;
    protected frameHeight:number;
    protected frameDuration:number;
    protected frames:any[];
    protected loop:boolean;
    protected totalTime:number;

    constructor(name:string, spriteSheet:string, frameWidth:number, frameHeight:number, frameDuration:number, loop:boolean) {
        this.animationName  = name;
        this.spriteSheet    = spriteSheet;
        this.frameWidth     = frameWidth;
        this.frameHeight    = frameHeight;
        this.frameDuration  = frameDuration;
        this.loop           = loop;
        this.totalTime      = frameDuration * frames.length;
    }

    public get name() : string {
        return this.animationName;
    }
    
}