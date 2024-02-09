interface Config {
    atlas?: any;
    background?: string;
    tileset?: string;
}

export class Level {

    private levelAtlas:{} = {};
    private levelName:string = null;
    private levelBackgroundURL:string = null;
    private levelTilesetURL:string = null;
    private levelBackground:HTMLImageElement = null;
    private levelTileset:HTMLImageElement = null;
    private levelMap:number[][];

    private levelSize:number[] = [48, 32];
    private tileSize:number[] = [32, 32];
    private tileMapSize:number[] = [6, 6];

    public constructor(name:string) {

        // Set the level name
        this.levelName = name;

        // Initialize the level
        this.initialize();

    }

    public get name() : string {
        return this.levelName;
    }

    public get atlas() : {} {
        return this.levelAtlas;
    }

    public get map() : number[][] {
        return this.levelMap;
    }

    public generateMap() : [][] {
        return [];
    }
    
    private async initialize() : Promise<void> {

        // load the level config
        const config:any = await this.loadConfig();

        // load the background image
        await this.loadBackground();

        // load the tileset image
        await this.loadTileset();

        // generate the map
        this.levelMap = this.generateMapFromAtlas(config.atlas);
    }

    private async loadBackground() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.levelBackground            = new Image();
            this.levelBackground.src        = this.levelBackgroundURL;
            this.levelBackground.onload     = () => resolve();
            this.levelBackground.onerror    = error => reject(error);
        });
    }

    private async loadTileset() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.levelTileset           = new Image();
            this.levelTileset.src       = this.levelTilesetURL;
            this.levelTileset.onload    = () => resolve();
            this.levelTileset.onerror   = error => reject(error);
        });
    }

    private async loadConfig() : Promise<Config> {
    
        // url
        const url:string = `./map/${this.levelName}/atlas.json`;

        // fetch the config
        const response:Response = await fetch(url);

        // config
        const data:Config = await response.json();

        // set the background url
        this.levelBackgroundURL = data.background;

        // set the tileset url
        this.levelTilesetURL = data.tileset;

        // set the atlas
        this.levelAtlas = data.atlas;

        // set the level size
        this.levelSize = data.atlas?.level_size ?? [48, 32];

        // set the tile size
        this.tileSize = data.atlas?.tile_size ?? [32, 32];

        // set the tile map size
        this.tileMapSize = data.atlas?.tile_map_size ?? [6, 6];

        // return the data
        return data;
    }

    private generateMapFromAtlas(atlas:any) : number[][] {
        
        // level size
        const levelSize:number[] = this.levelSize;

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
        for (let y = 0; y < levelSize[1]; y++) {

            // create a row
            const row:number[] = [];

            // loop through the columns
            for (let x = 0; x < levelSize[0]; x++) {

                // get the tile
                let tile:number = 0;

                // if the tile is a corner
                if (
                    (index === corners['top-left'])     ||
                    (index === corners['top-right'])    ||
                    (index === corners['bottom-left'])  ||
                    (index === corners['bottom-right'])
                ) {tile = index;}

                // if the tile is an edge
                // pick a random edge from the set
                if (edges['top'].includes(index)) {
                    tile = edges['top'][Math.floor(Math.random() * edges['top'].length)];
                } else if (edges['right'].includes(index)) {
                    tile = edges['right'][Math.floor(Math.random() * edges['right'].length)];
                } else if (edges['bottom'].includes(index)) {
                    tile = edges['bottom'][Math.floor(Math.random() * edges['bottom'].length)];
                } else if (edges['left'].includes(index)) {
                    tile = edges['left'][Math.floor(Math.random() * edges['left'].length)];
                }

                // if the tile is a floor tile
                if (floor.includes(index)) {
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

        // tile size
        const tileSize:number[] = this.tileSize;

        // loop through the rows
        for (let y = 0; y < this.levelMap.length; y++) {

            // loop through the columns
            for (let x = 0; x < this.levelMap[y].length; x++) {

                // get the tile
                const tile:number = this.levelMap[y][x];

                // get the tile position
                const tileX:number = x * tileSize[0];
                const tileY:number = y * tileSize[1];

                // get the tile position
                const tileRow:number = Math.floor(tile / this.tileMapSize[0]);
                const tileCol:number = tile % this.tileMapSize[0];

                // draw the tile
                context.drawImage(
                    this.levelTileset,
                    tileCol * tileSize[0], tileRow * tileSize[1],
                    tileSize[0], tileSize[1],
                    tileX, tileY,
                    tileSize[0], tileSize[1]
                );

            }
        }
    }

    public draw(context:CanvasRenderingContext2D) : void {

        // draw the background
        context.drawImage(this.levelBackground, 0, 0, context.canvas.width, context.canvas.height);

        // draw the map
        this.drawMap(context);
    }

    public update() {
        // update the level
    }

}