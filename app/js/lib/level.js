import { Shape, Stage } from "./stage.js";
export class Level {
    constructor(name, stage) {
        // Images
        this.levelBackgroundURL = null;
        this.levelTilesetURL = null;
        this.levelBackground = null;
        this.levelTileset = null;
        // Map
        this.mapName = null;
        this.map = [];
        // Tileset
        this.tileAtlas = {};
        // Colliders
        this.colliders = [];
        // Flags
        this.flag_ready = false;
        this.flag_draw_colliders = false;
        this.flag_scale_extrusion = true;
        // Scale and Offset
        this.scale = 1;
        this.xOffset = 0;
        this.yOffset = 0;
        // Set the level name
        this.mapName = name;
        // Set the stage
        this.stage = stage;
        // Load the level configuration
        this.loadConfiguration().then(() => {
            // Calculate the scale
            this.calcScale();
            // Generate the map
            this.map = this.generateMapFromAtlas(this.tileAtlas);
            // Load the images
            this.loadImages().then(() => this.flag_ready = true);
        });
    }
    get walls() {
        return this.colliders;
    }
    get drawWallColliders() {
        return this.flag_draw_colliders;
    }
    set drawWallColliders(value) {
        this.flag_draw_colliders = value;
    }
    update() {
        // if the level is not ready
        if (!this.flag_ready) {
            return;
        }
        // calculate the scale
        this.calcScale();
    }
    draw(context) {
        // if the level is not ready
        if (!this.flag_ready) {
            return;
        }
        // draw the background
        // context.drawImage(this.levelBackground, 0, 0, context.canvas.width, context.canvas.height);
        // draw the map
        this.drawMap(context);
        // if the flag is set to draw colliders
        if (this.flag_draw_colliders) {
            // loop through the colliders
            for (let i = 0; i < this.colliders.length; i++) {
                // get the collider
                const collider = this.colliders[i];
                // draw the collider
                context.beginPath();
                context.strokeStyle = '#adff0088';
                context.fillStyle = '#ad000054';
                if (collider.shape === Shape.Rectagle) {
                    // draw the rectangle
                    const rect = collider.box;
                    context.rect(collider.box.x, collider.box.y, rect.width, rect.height);
                }
                else {
                    // draw the circle
                    const circle = collider.box;
                    context.arc(collider.box.x, collider.box.y, circle.radius, 0, Math.PI * 2);
                }
                context.stroke();
                context.fill();
                context.closePath();
            }
        }
    }
    whenReady() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.flag_ready) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    calcScale() {
        // context
        const context = this.stage.context;
        // tile size
        const tileSize = this.tileSize;
        // get total number of tiles in pixel
        let xPixels = this.mapSize.width * tileSize.width;
        let yPixels = this.mapSize.height * tileSize.height;
        let scale;
        // Calculate the scale required to fit the map into the canvas
        // Ensuring uniform scaling (same for both axes)
        const scaleX = context.canvas.width / xPixels;
        const scaleY = context.canvas.height / yPixels;
        // Use the smaller scale to ensure the entire map fits into the canvas
        scale = Math.min(scaleX, scaleY);
        // vertical offset
        let yOffset = (context.canvas.height - (this.mapSize.height * tileSize.height * scale)) / 2;
        // horizontal offset
        let xOffset = (context.canvas.width - (this.mapSize.width * tileSize.width * scale)) / 2;
        // set the scale and offset
        this.scale = scale;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }
    async loadConfiguration() {
        // url
        const url = `./assets/levels/${this.mapName}/config.json`;
        // fetch the config
        const response = await fetch(url);
        // config
        const data = await response.json();
        // set the background url
        this.levelBackgroundURL = data?.background ?? null;
        // set the tileset url
        this.levelTilesetURL = data?.tiles ?? null;
        // set the atlas
        this.tileAtlas = data?.atlas ?? {};
        // set the tile size
        this.tileSize = {
            width: data?.atlas?.tile_size[0] ?? 32,
            height: data?.atlas?.tile_size[1] ?? 32
        };
        // set the tile map size
        this.tileMapSize = {
            width: data?.atlas?.tile_map_size[0] ?? 6,
            height: data?.atlas?.tile_map_size[1] ?? 6
        };
        // set the map size
        this.mapSize = {
            width: data?.map?.size[0] ?? 32,
            height: data?.map?.size[1] ?? 32
        };
    }
    async loadBackground() {
        return new Promise((resolve, reject) => {
            this.levelBackground = new Image();
            this.levelBackground.src = `./assets/levels/${this.mapName}/${this.levelBackgroundURL}`;
            this.levelBackground.onload = () => resolve();
            this.levelBackground.onerror = error => reject(error);
        });
    }
    async loadTileset() {
        return new Promise((resolve, reject) => {
            this.levelTileset = new Image();
            this.levelTileset.src = `./assets/levels/${this.mapName}/${this.levelTilesetURL}`;
            this.levelTileset.onload = () => resolve();
            this.levelTileset.onerror = error => reject(error);
        });
    }
    async loadImages() {
        // load the background image
        await this.loadBackground();
        // load the tileset image
        await this.loadTileset();
    }
    generateMapFromAtlas(atlas) {
        // level size
        const levelSize = this.mapSize;
        // get the corners
        const corners = atlas?.corners ?? {};
        // get the edges
        const edges = atlas?.edges ?? {};
        // get the floor
        const floor = atlas?.floor ?? [];
        // create the map
        const map = [];
        // Index
        let index = 0;
        // loop through the rows
        for (let y = 0; y < levelSize.height; y++) {
            // create a row
            const row = [];
            // loop through the columns
            for (let x = 0; x < levelSize.width; x++) {
                // get the tile
                let tile = -1;
                //Corners
                // if x and y are 0 // top-left
                if (x === 0 && y === 0) {
                    tile = corners['top-left'];
                    // if x is the width and y is 0 // top-right
                }
                else if (x === levelSize.width - 1 && y === 0) {
                    tile = corners['top-right'];
                    // if x is 0 and y is the height // bottom-left
                }
                else if (x === 0 && y === levelSize.height - 1) {
                    tile = corners['bottom-left'];
                    // if x is the width and y is the height // bottom-right
                }
                else if (x === levelSize.width - 1 && y === levelSize.height - 1) {
                    tile = corners['bottom-right'];
                }
                //Edges
                if (tile === -1) {
                    // if y is 0 // top
                    if (y === 0) {
                        tile = edges['top'][Math.floor(Math.random() * edges['top'].length)];
                        // if x is the width // right
                    }
                    else if (x === levelSize.width - 1) {
                        tile = edges['right'][Math.floor(Math.random() * edges['right'].length)];
                        // if y is the height // bottom
                    }
                    else if (y === levelSize.height - 1) {
                        tile = edges['bottom'][Math.floor(Math.random() * edges['bottom'].length)];
                        // if x is 0 // left
                    }
                    else if (x === 0) {
                        tile = edges['left'][Math.floor(Math.random() * edges['left'].length)];
                    }
                }
                // Floor
                // if not a corner or edge
                if (tile === -1) {
                    tile = floor[Math.floor(Math.random() * floor.length)];
                }
                // add the tile to the row
                row.push(tile);
                // increment the index
                index++;
            }
            // add the row to the map
            map.push(row);
        }
        // return the map
        return map;
    }
    generateColliders(map, xOffset = 0, yOffset = 0, tileWidth = 32, tileHeight = 32) {
        const colliders = [];
        // create the wall colliders
        const leftWall = Stage.createRectCollider(xOffset, yOffset, tileWidth, map.length * tileHeight);
        const rightWall = Stage.createRectCollider(xOffset + (map[0].length * tileWidth) - tileWidth, yOffset, tileWidth, map.length * tileHeight);
        const topWall = Stage.createRectCollider(xOffset, yOffset, map[0].length * tileWidth, tileHeight);
        const bottomWall = Stage.createRectCollider(xOffset, yOffset + (map.length * tileHeight) - tileHeight, map[0].length * tileWidth, tileHeight);
        // add the wall colliders
        colliders.push(leftWall, rightWall, topWall, bottomWall);
        // return the colliders
        return colliders;
    }
    drawMap(context) {
        // if the level is not ready
        if (!this.flag_ready) {
            return;
        }
        // generate the colliders
        this.colliders = this.generateColliders(this.map, this.xOffset, this.yOffset, this.tileSize.width * this.scale, this.tileSize.height * this.scale);
        // extrusion
        let extrusion = (this.flag_scale_extrusion) ? 1 : 0;
        // loop through the rows
        for (let y = 0; y < this.map.length; y++) {
            // loop through the columns
            for (let x = 0; x < this.map[y].length; x++) {
                // get the tile
                const tile = this.map[y][x];
                // get the tile canvas location
                const tileX = x * this.tileSize.width * this.scale + this.xOffset;
                const tileY = y * this.tileSize.height * this.scale + this.yOffset;
                // get the tile image position
                const tileRow = Math.floor(tile / this.tileMapSize.width);
                const tileCol = tile % this.tileMapSize.width;
                // draw the tile
                context.drawImage(this.levelTileset, (tileCol * this.tileSize.width), (tileRow * this.tileSize.height), this.tileSize.width, this.tileSize.height, tileX - extrusion, tileY - extrusion, Math.ceil(this.tileSize.width * this.scale) + (extrusion * 2), Math.ceil(this.tileSize.height * this.scale) + (extrusion * 2));
            }
        }
    }
}
