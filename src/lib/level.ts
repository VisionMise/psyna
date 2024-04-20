import { Circle, Collider, Rect, Shape, Stage } from "./stage.js";

interface Config {
    atlas?: any;
    map?: any;
    background?: string;
    tiles?: string;
}

export class Level {

    // Stage
    private stage:Stage;

    // Images
    private levelBackgroundURL:string           = null;
    private levelTilesetURL:string              = null;
    private levelBackground:HTMLImageElement    = null;
    private levelTileset:HTMLImageElement       = null;

    // Map
    private mapName:string = null;
    private map:number[][] = [];
    public mapSize:{width:number, height:number};

    // Tileset
    private tileAtlas:any = {};
    private tileMapSize:{width:number, height:number};
    public tileSize:{width:number, height:number};

    // Colliders
    private colliders:Collider[] = [];

    // Flags
    private flag_ready:boolean              = false;
    private flag_draw_colliders:boolean     = false;
    private flag_scale_extrusion:boolean    = true;    

    // Scale and Offset
    public scale:number     = 1;
    public xOffset:number   = 0;
    public yOffset:number   = 0;

    public constructor(name:string, stage:Stage) {

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

    public get walls() : Collider[] {
        return this.colliders;
    }

    public get drawWallColliders() : boolean {
        return this.flag_draw_colliders;
    }

    public set drawWallColliders(value:boolean) {
        this.flag_draw_colliders = value;
    }

    public update() {

        // if the level is not ready
        if (!this.flag_ready) {return;}

        // calculate the scale
        this.calcScale();

        // update the colliders
        
    }

    public draw(context:CanvasRenderingContext2D) : void {

        // if the level is not ready
        if (!this.flag_ready) {return;}

        // draw the background
        // context.drawImage(this.levelBackground, 0, 0, context.canvas.width, context.canvas.height);

        // draw the map
        this.drawMap(context);

        // if the flag is set to draw colliders
        if (this.flag_draw_colliders) {

            // loop through the colliders
            for (let i = 0; i < this.colliders.length; i++) {

                // get the collider
                const collider:Collider = this.colliders[i];

                // draw the collider
                context.beginPath();
                context.strokeStyle = '#adff0088';
                context.fillStyle   = '#ad000054';

                if (collider.shape === Shape.Rectagle) {

                    // draw the rectangle
                    const rect = collider.box as Rect;
                    context.rect(collider.box.x, collider.box.y, rect.width, rect.height);

                } else {

                    // draw the circle
                    const circle = collider.box as Circle;
                    context.arc(collider.box.x, collider.box.y, circle.radius, 0, Math.PI * 2);

                }

                context.stroke();
                context.fill();
                context.closePath();
            }

        }

    }

    public whenReady() : Promise<void> {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (this.flag_ready) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    private calcScale() : void {

        // context
        const context:CanvasRenderingContext2D = this.stage.context;
        
        // tile size
        const tileSize:{width:number, height:number} = this.tileSize;

        // get total number of tiles in pixel
        let xPixels:number = this.mapSize.width * tileSize.width;
        let yPixels:number = this.mapSize.height * tileSize.height;

        let scale: number;

        // Calculate the scale required to fit the map into the canvas
        // Ensuring uniform scaling (same for both axes)
        const scaleX = context.canvas.width / xPixels;
        const scaleY = context.canvas.height / yPixels;

        // Use the smaller scale to ensure the entire map fits into the canvas
        scale = Math.min(scaleX, scaleY);
        
        // vertical offset
        let yOffset:number = (context.canvas.height - (this.mapSize.height * tileSize.height * scale)) / 2;

        // horizontal offset
        let xOffset:number = (context.canvas.width - (this.mapSize.width * tileSize.width * scale)) / 2;

        // set the scale and offset
        this.scale      = scale;
        this.xOffset    = xOffset;
        this.yOffset    = yOffset;
    }

    private async loadConfiguration() : Promise<void> {

        // url
        const url:string = `./assets/levels/${this.mapName}/config.json`;

        // fetch the config
        const response:Response = await fetch(url);

        // config
        const data:Config = await response.json();

        // set the background url
        this.levelBackgroundURL = data?.background ?? null; 

        // set the tileset url
        this.levelTilesetURL = data?.tiles ?? null;

        // set the atlas
        this.tileAtlas = data?.atlas ?? {};

        // set the tile size
        this.tileSize = {
            width:  data?.atlas?.tile_size[0] ?? 32,
            height: data?.atlas?.tile_size[1] ?? 32
        };

        // set the tile map size
        this.tileMapSize = {
            width:  data?.atlas?.tile_map_size[0] ?? 6,
            height: data?.atlas?.tile_map_size[1] ?? 6
        };

        // set the map size
        this.mapSize = {
            width:  data?.map?.size[0] ?? 32,
            height: data?.map?.size[1] ?? 32
        };
    }

    private async loadBackground() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.levelBackground            = new Image();
            this.levelBackground.src        = `./assets/levels/${this.mapName}/${this.levelBackgroundURL}`;
            this.levelBackground.onload     = () => resolve();
            this.levelBackground.onerror    = error => reject(error);
        });
    }

    private async loadTileset() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.levelTileset           = new Image();
            this.levelTileset.src       = `./assets/levels/${this.mapName}/${this.levelTilesetURL}`;
            this.levelTileset.onload    = () => resolve();
            this.levelTileset.onerror   = error => reject(error);
        });
    }

    private async loadImages() : Promise<void> {

        // load the background image
        await this.loadBackground();

        // load the tileset image
        await this.loadTileset();
    }

    private generateMapFromAtlas(atlas:any) : number[][] {

        // level size
        const levelSize:{width:number, height:number} = this.mapSize;

        // get the corners
        const corners:any = atlas?.corners ?? {};

        // get the edges
        const edges:any = atlas?.edges ?? {};

        // get the floor
        const floor:any = atlas?.floor ?? [];

        // create the map
        const map:number[][] = [];

        // Index
        let index:number = 0;

        // loop through the rows
        for (let y = 0; y < levelSize.height; y++) {

            // create a row
            const row:number[] = [];

            // loop through the columns
            for (let x = 0; x < levelSize.width; x++) {

                // get the tile
                let tile:number = -1;

                //Corners
                // if x and y are 0 // top-left
                if (x === 0 && y === 0) {
                    tile = corners['top-left'];

                // if x is the width and y is 0 // top-right
                } else if (x === levelSize.width - 1 && y === 0) {
                    tile = corners['top-right'];
                    
                // if x is 0 and y is the height // bottom-left
                } else if (x === 0 && y === levelSize.height - 1) {
                    tile = corners['bottom-left'];

                // if x is the width and y is the height // bottom-right
                } else if (x === levelSize.width - 1 && y === levelSize.height - 1) {
                    tile = corners['bottom-right'];

                }


                //Edges
                if (tile === -1) {

                    // if y is 0 // top
                    if (y === 0) {
                        tile = edges['top'][Math.floor(Math.random() * edges['top'].length)];

                    // if x is the width // right
                    } else if (x === levelSize.width - 1) {
                        tile = edges['right'][Math.floor(Math.random() * edges['right'].length)];

                    // if y is the height // bottom
                    } else if (y === levelSize.height - 1) {
                        tile = edges['bottom'][Math.floor(Math.random() * edges['bottom'].length)];

                    // if x is 0 // left
                    } else if (x === 0) {
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

    private generateColliders(map:number[][], xOffset:number = 0, yOffset:number = 0, tileWidth:number = 32, tileHeight:number = 32) : Collider[] {

        const colliders:Collider[] = [];

        // create the wall colliders
        const leftWall:Collider     = Stage.createRectCollider(xOffset, yOffset, tileWidth, map.length * tileHeight);
        const rightWall:Collider    = Stage.createRectCollider(xOffset + (map[0].length * tileWidth) - tileWidth, yOffset, tileWidth, map.length * tileHeight);
        const topWall:Collider      = Stage.createRectCollider(xOffset, yOffset, map[0].length * tileWidth, tileHeight);
        const bottomWall:Collider   = Stage.createRectCollider(xOffset, yOffset + (map.length * tileHeight) - tileHeight, map[0].length * tileWidth, tileHeight);

        // add the wall colliders
        colliders.push(leftWall, rightWall, topWall, bottomWall);

        // return the colliders
        return colliders;
    }

    private drawMap(context:CanvasRenderingContext2D) : void {

        // if the level is not ready
        if (!this.flag_ready) {return;}

        // generate the colliders
        this.colliders = this.generateColliders(
            this.map,                           // map
            this.xOffset,                       // x offset
            this.yOffset,                       // y offset
            this.tileSize.width * this.scale,   // tile width
            this.tileSize.height * this.scale   // tile height
        );

        // extrusion
        // this is used to prevent gaps between tiles
        let extrusion:number = (this.flag_scale_extrusion) ? 1 : 0;

        // loop through the rows
        for (let y = 0; y < this.map.length; y++) {

            // loop through the columns
            for (let x = 0; x < this.map[y].length; x++) {

                // get the tile
                const tile:number = this.map[y][x];

                // get the tile canvas location
                const tileX:number = x * this.tileSize.width * this.scale + this.xOffset;
                const tileY:number = y * this.tileSize.height * this.scale + this.yOffset;

                // get the tile image position
                const tileRow:number = Math.floor(tile / this.tileMapSize.width);
                const tileCol:number = tile % this.tileMapSize.width;

                // draw the tile
                context.drawImage(
                    this.levelTileset,                  // image
                    (tileCol * this.tileSize.width),    // source X
                    (tileRow * this.tileSize.height),   // source Y
                    this.tileSize.width,                // source width
                    this.tileSize.height,               // source height
                    tileX - extrusion,                  // destination X
                    tileY - extrusion,                  // destination Y
                    Math.ceil(this.tileSize.width * this.scale) + (extrusion * 2), // destination width
                    Math.ceil(this.tileSize.height * this.scale) + (extrusion * 2) // destination height
                );

            }

        }

    }

}