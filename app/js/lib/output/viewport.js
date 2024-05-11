//#region Imports
export {};
//#endregion
//#region Viewport Class
// export class Viewport {
//     private currentViewport:HTMLElement
//     private currentCanvas:HTMLCanvasElement;
//     private currentContext:CanvasRenderingContext2D;
//     private currentWorld:World;
//     private currentCamera:Camera;
//     public constructor() {
//         this.setup();
//     }
//     public get world() : World {
//         return this.currentWorld;
//     }
//     public get camera() : Camera {
//         return this.currentCamera;
//     }
//     public set camera(camera:Camera) {
//         this.currentCamera = camera;
//     }
//     public get context() : CanvasRenderingContext2D {
//         return this.currentContext;
//     }
//     public get canvas() : HTMLCanvasElement {
//         return this.currentCanvas;
//     }
//     public get viewport() : HTMLElement {
//         return this.currentViewport;
//     }
//     public get windowSize() : Size {
//         return {
//             width:window.innerWidth,
//             height:window.innerHeight
//         };
//     }
//     public get size() : Size {
//         return {
//             width:this.currentViewport.clientWidth,
//             height:this.currentViewport.clientHeight
//         };
//     }
//     public get scaledSize() : Size {
//         // aspect ratio of 16:9
//         const aspectRatio:Size = { width:12, height:9 };
//         // get the scaled size
//         const scaledSize:Size = this.scaleToAspect(this.size, aspectRatio);
//         // return the scaled size
//         return scaledSize;
//     }
//     public get scaleFactor() : number {
//         // get the scaled size
//         const scaledSize:Size = this.scaledSize;
//         // get the scale factor
//         const scaleFactor:number = scaledSize.width / this.size.width;
//         // return the scale factor
//         return scaleFactor;
//     }
//     private async setup() {
//         // get the viewport element
//         this.currentViewport = document.getElementById('viewport');
//         // create the canvas element
//         this.currentCanvas = document.createElement('canvas');
//         // set the canvas size
//         this.setCanvasSize();
//         // append the canvas to the viewport
//         this.currentViewport.appendChild(this.currentCanvas);
//         // context settings
//         const contextSettings:CanvasRenderingContext2DSettings = {
//             willReadFrequently: true,
//             alpha: true,
//             desynchronized: false
//         };
//         // get the canvas context
//         this.currentContext = this.currentCanvas.getContext('2d', contextSettings);
//         // resize the canvas when the window resizes
//         window.addEventListener('resize', () => this.setCanvasSize());
//     }
//     private setCanvasSize() : void {
//         // get the scaled size
//         const scaledSize:Size = this.scaledSize;
//         // set the canvas size
//         this.currentCanvas.width = scaledSize.width;
//         this.currentCanvas.height = scaledSize.height;
//     }
//     private scaleToAspect(size:Size, ratio:Size, margin:Size = {width: 4, height: 4}) : Size {
//         // get the aspect ratio
//         const currentRatio:number = size.width / size.height;
//         // find the closest ratio
//         // to given x and y ratios
//         const closestRatio:number = ratio.width / ratio.height;
//         // new width and height buffer
//         // to add margin to the size
//         let newWidth:number = size.width;
//         let newHeight:number = size.height;
//         // set the new width and height
//         // as close to the aspect ratio as possible
//         if (currentRatio > closestRatio) {
//             newWidth = Math.floor(size.height * closestRatio);
//         } else {
//             newHeight = Math.floor(size.width / closestRatio);
//         }
//         // return the new width and height
//         return { width: newWidth, height: newHeight };
//     }
// }
//#endregion
