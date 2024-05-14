export class Renderer {
    constructor(engine, viewport, map, camera) {
        this.flag_ready = false;
        // Set the engine
        this.engine = engine;
        // Set the viewport
        this.viewport = viewport;
        // Set the map
        this.map = map;
        // Set the camera
        this.camera = camera;
        // Setup the renderer
        this.setup();
    }
    async setup() {
        // hook into the frame_update event
        this.engine.Events.addEventListener('frame_update', () => this.render());
        // Set the ready flag
        this.flag_ready = true;
    }
    // public render() {
    //     // Calculate the viewable area
    //     const tiles = this.camera.viewableTiles(this.viewport);
    //     // Calculate the area of the map to render
    //     const area = {
    //         x:      Math.floor(this.camera.position.x),
    //         y:      Math.floor(this.camera.position.y),
    //         width:  tiles.width,
    //         height: tiles.height
    //     };
    //     // Get the tile size and calculate scale
    //     const tileSize      = this.map.tileSize;
    //     const scale:Size    = this.map.scale(this.camera, tileSize);
    //     // Calculate scaled tile size as an integer multiple
    //     const scaledTileSize = {
    //         width:  tileSize.width * scale.width,
    //         height: tileSize.height * scale.width
    //     };
    //     // Adjust the size of the offscreen canvas to match the scaled tile size
    //     const offscreenCanvas   = document.createElement('canvas');
    //     const offscreenContext  = offscreenCanvas.getContext('2d', { alpha: true });
    //     offscreenCanvas.width = tileSize.width;
    //     offscreenCanvas.height = tileSize.height;
    //     // Set the image smoothing to false on the main canvas
    //     this.viewport.context.imageSmoothingEnabled = false;
    //     this.viewport.context.globalCompositeOperation = 'source-over';
    //     this.viewport.clear();
    //     // Fetch tile data considering the entire visible area plus one extra row and column if possible
    //     const tileData = this.map.area(area.x - 1, area.y - 1, area.x + area.width + 2, area.y + area.height + 2);
    //     const layers = tileData.layers;
    //     for (const layer of layers) {
    //         for (let y = 0; y <= area.height + 1; y++) {  
    //             for (let x = 0; x <= area.width + 1; x++) {
    //                 if (!layer[y] || !layer[y][x]) continue;
    //                 // Get the tile data
    //                 const tile: TilesetTile = layer[y][x];                    
    //                 // Draw tile image data onto offscreen canvas
    //                 offscreenContext.clearRect(0, 0, tileSize.width, tileSize.height);  // Clear previous image
    //                 offscreenContext.putImageData(tile.image, 0, 0);
    //                 // Calculate position without rounding too early
    //                 const posX = (x + this.camera.position.x - area.x - 1) * scaledTileSize.width;
    //                 const posY = (y + this.camera.position.y - area.y - 1) * scaledTileSize.height;
    //                 // Draw the image from offscreen canvas to the main viewport at scaled size
    //                 // this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
    //                 this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
    //             }
    //         }            
    //     }
    // }
    // public render() {
    //     const tiles = this.camera.viewableTiles(this.viewport);
    //     const area = {
    //         x: Math.floor(this.camera.position.x),
    //         y: Math.floor(this.camera.position.y),
    //         width: tiles.width,
    //         height: tiles.height
    //     };
    //     const tileSize = this.map.tileSize;
    //     const scale: Size = this.map.scale(this.camera, tileSize);
    //     // Calculate scaled tile size as an integer multiple
    //     const scaledTileSize = {
    //         width: Math.ceil(tileSize.width * scale.width),
    //         height: Math.ceil(tileSize.height * scale.height)
    //     };
    //     const offscreenCanvas = document.createElement('canvas');
    //     const offscreenContext = offscreenCanvas.getContext('2d', { alpha: true });
    //     offscreenCanvas.width = tileSize.width;
    //     offscreenCanvas.height = tileSize.height;
    //     this.viewport.context.imageSmoothingEnabled = false;
    //     this.viewport.clear();
    //     const tileData = this.map.area(area.x - 1, area.y - 1, area.x + area.width + 1, area.y + area.height + 1);
    //     const layers = tileData.layers;
    //     for (const layer of layers) {
    //         for (let y = 0; y <= area.height; y++) {
    //             for (let x = 0; x <= area.width; x++) {
    //                 if (!layer[y] || !layer[y][x]) continue;
    //                 const tile: TilesetTile = layer[y][x];
    //                 offscreenContext.clearRect(0, 0, scaledTileSize.width, scaledTileSize.height);
    //                 offscreenContext.putImageData(tile.image, 0, 0);
    //                 // Calculate position and ensure it aligns with pixel grid
    //                 const posX = Math.floor((x + this.camera.position.x - area.x) * scaledTileSize.width);
    //                 const posY = Math.floor((y + this.camera.position.y - area.y) * scaledTileSize.height);
    //                 this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
    //             }
    //         }
    //     }
    // }
    // public render() {
    //     const tiles = this.camera.viewableTiles(this.viewport);
    //     const area = {
    //         x: Math.floor(this.camera.position.x),
    //         y: Math.floor(this.camera.position.y),
    //         width: tiles.width,
    //         height: tiles.height
    //     };
    //     const tileSize = this.map.tileSize;
    //     const scale: Size = this.map.scale(this.camera, tileSize);
    //     const scaledTileSize = {
    //         width: Math.ceil(tileSize.width * scale.width),
    //         height: Math.ceil(tileSize.height * scale.height)
    //     };
    //     const offscreenCanvas = document.createElement('canvas');
    //     const offscreenContext = offscreenCanvas.getContext('2d', { alpha: true });
    //     offscreenCanvas.width = tileSize.width;
    //     offscreenCanvas.height = tileSize.height;
    //     this.viewport.context.imageSmoothingEnabled = false;
    //     this.viewport.clear();
    //     // Adjusted area to include partial tiles
    //     const tileData = this.map.area(area.x - 1, area.y - 1, area.x + area.width + 2, area.y + area.height + 2);
    //     const layers = tileData.layers;
    //     for (const layer of layers) {
    //         for (let y = 0; y <= area.height + 1; y++) {
    //             for (let x = 0; x <= area.width + 1; x++) {
    //                 if (!layer[y] || !layer[y][x]) continue;
    //                 const tile: TilesetTile = layer[y][x];
    //                 offscreenContext.clearRect(0, 0, scaledTileSize.width, scaledTileSize.height);
    //                 offscreenContext.putImageData(tile.image, 0, 0);
    //                 // Calculate position and ensure it aligns with pixel grid
    //                 const posX = Math.floor((x + this.camera.position.x - area.x - 1) * scaledTileSize.width);
    //                 const posY = Math.floor((y + this.camera.position.y - area.y - 1) * scaledTileSize.height);
    //                 this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
    //             }
    //         }
    //     }
    // }
    // public render() {
    //     const tiles = this.camera.viewableTiles(this.viewport);
    //     const area = {
    //         x: Math.floor(this.camera.position.x),
    //         y: Math.floor(this.camera.position.y),
    //         width: tiles.width,
    //         height: tiles.height
    //     };
    //     const tileSize = this.map.tileSize;
    //     const scale: Size = this.map.scale(this.camera, tileSize);
    //     const scaledTileSize = {
    //         width: tileSize.width * scale.width,
    //         height: tileSize.height * scale.height
    //     };
    //     const offscreenCanvas = document.createElement('canvas');
    //     const offscreenContext = offscreenCanvas.getContext('2d', { alpha: true });
    //     offscreenCanvas.width = tileSize.width;
    //     offscreenCanvas.height = tileSize.height;
    //     this.viewport.context.imageSmoothingEnabled = false;
    //     this.viewport.clear();
    //     // Adjusted area to include partial tiles
    //     const tileData = this.map.area(area.x, area.y, area.x + area.width, area.y + area.height);
    //     const layers = tileData.layers;
    //     for (const layer of layers) {
    //         for (let y = 0; y <= area.height + 1; y++) {
    //             for (let x = 0; x <= area.width + 1; x++) {
    //                 if (!layer[y] || !layer[y][x]) continue;
    //                 const tile: TilesetTile = layer[y][x];
    //                 offscreenContext.clearRect(0, 0, scaledTileSize.width, scaledTileSize.height);
    //                 offscreenContext.putImageData(tile.image, 0, 0);
    //                 // Calculate position using exact floating-point values
    //                 const posX = (x + this.camera.position.x - area.x - 1) * scaledTileSize.width;
    //                 const posY = (y + this.camera.position.y - area.y - 1) * scaledTileSize.height;
    //                 // Draw the tile at the exact floating-point position
    //                 this.viewport.context.drawImage(offscreenCanvas, posX, posY, scaledTileSize.width, scaledTileSize.height);
    //             }
    //         }
    //     }
    // }
    render() {
        const tiles = this.camera.viewableTiles(this.viewport);
        const area = {
            x: Math.floor(this.camera.position.x),
            y: Math.floor(this.camera.position.y),
            width: tiles.width,
            height: tiles.height
        };
        const tileSize = this.map.tileSize;
        const scale = this.map.scale(this.camera, tileSize);
        const scaledTileSize = {
            width: tileSize.width * scale.width,
            height: tileSize.height * scale.height
        };
        const offscreenCanvas = document.createElement('canvas');
        const offscreenContext = offscreenCanvas.getContext('2d', { alpha: true });
        offscreenCanvas.width = tileSize.width;
        offscreenCanvas.height = tileSize.height;
        this.viewport.context.imageSmoothingEnabled = false;
        this.viewport.clear();
        // Adjusted area to include partial tiles
        const tileData = this.map.area(area.x - 1, area.y - 1, area.x + area.width + 2, area.y + area.height + 2);
        const layers = tileData.layers;
        for (const layer of layers) {
            for (let y = 0; y <= area.height + 1; y++) {
                for (let x = 0; x <= area.width + 1; x++) {
                    if (!layer[y] || !layer[y][x])
                        continue;
                    const tile = layer[y][x];
                    offscreenContext.clearRect(0, 0, scaledTileSize.width, scaledTileSize.height);
                    offscreenContext.putImageData(tile.image, 0, 0);
                    // Calculate position using exact floating-point values
                    const posX = (x - this.camera.position.x + area.x) * scaledTileSize.width;
                    const posY = (y - this.camera.position.y + area.y) * scaledTileSize.height;
                    // Draw the tile at the exact floating-point positio
                    this.viewport.context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height, posX, posY, scaledTileSize.width + 1, scaledTileSize.height + 1);
                }
            }
        }
    }
}
