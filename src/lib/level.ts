interface Config {
    atlas?: any;
    map?: any;
    background?: string;
    tiles?: string;
}



export class Level {


    // Images
    private levelBackgroundURL:string = null;
    private levelTilesetURL:string = null;
    private levelBackground:HTMLImageElement = null;
    private levelTileset:HTMLImageElement = null;

    // Map
    private map:number[][];
    private mapSize:{width:number, height:number};
    private mapName:string = null;

    // Tileset
    private tileAtlas:any = {};
    private tileMapSize:{width:number, height:number};
    private tileSize:{width:number, height:number};

    // Flags
    private ready:boolean = false;

    public constructor(name:string) {

        // Set the level name
        this.mapName = name;

        // Load the level configuration
        this.loadConfiguration().then(() => {

            // Generate the map
            this.map = this.generateMapFromAtlas(this.tileAtlas);

            // Load the images
            this.loadImages().then(() => this.ready = true);

        });

    }

    private async loadConfiguration() : Promise<void> {

        // url
        const url:string = `./map/${this.mapName}/atlas.json`;

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
            this.levelBackground.src        = `./map/${this.mapName}/${this.levelBackgroundURL}`;
            this.levelBackground.onload     = () => resolve();
            this.levelBackground.onerror    = error => reject(error);
        });
    }

    private async loadTileset() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.levelTileset           = new Image();
            this.levelTileset.src       = `./map/${this.mapName}/${this.levelTilesetURL}`;
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

    private drawMap(context:CanvasRenderingContext2D) : void {

        // if the level is not ready
        if (!this.ready) {return;}

        // tile size
        const tileSize:{width:number, height:number} = this.tileSize;

        // get total number of tiles in pixel
        let xPixels:number = this.mapSize.width * tileSize.width;
        let yPixels:number = this.mapSize.height * tileSize.height;

        // scale
        let scale:number = 1;

        // if the map is larger than the canvas
        // scale the map down
        if (xPixels > context.canvas.width) {
            scale = context.canvas.width / xPixels;
        } else if (xPixels < context.canvas.width) {
            scale = xPixels / context.canvas.width;
        } 
        
        if (yPixels > context.canvas.height) {
            scale = context.canvas.height / yPixels;
        } else if (yPixels < context.canvas.height) {
            scale = yPixels / context.canvas.height;
        }
        
        // vertical offset
        let yOffset:number = (context.canvas.height - (this.mapSize.height * tileSize.height * scale)) / 2;

        // horizontal offset
        let xOffset:number = (context.canvas.width - (this.mapSize.width * tileSize.width * scale)) / 2;

        // loop through the rows
        for (let y = 0; y < this.map.length; y++) {

            // loop through the columns
            for (let x = 0; x < this.map[y].length; x++) {

                // get the tile
                const tile:number = this.map[y][x];

                // get the tile position
                const tileX:number = x * tileSize.width * scale + xOffset;
                const tileY:number = y * tileSize.height * scale + yOffset;

                // get the tile position
                const tileRow:number = Math.floor(tile / this.tileMapSize.width);
                const tileCol:number = tile % this.tileMapSize.width;

                // draw the tile
                context.drawImage(
                    this.levelTileset,
                    tileCol * tileSize.width,
                    tileRow * tileSize.height,
                    tileSize.width,
                    tileSize.height,
                    tileX,
                    tileY,
                    tileSize.width * scale,
                    tileSize.height * scale
                );

            }

        }


    }

    public update() {

        // if the level is not ready
        if (!this.ready) {return;}
    }

    public draw(context:CanvasRenderingContext2D) : void {

        // if the level is not ready
        if (!this.ready) {return;}

        // draw the background
        // context.drawImage(this.levelBackground, 0, 0, context.canvas.width, context.canvas.height);

        // draw the map
        this.drawMap(context);
    }


}