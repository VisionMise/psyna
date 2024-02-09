export class Level {
    constructor(name) {
        this.levelAtlas = null;
        this.levelName = null;
        this.levelBackgroundURL = null;
        this.levelTilesetURL = null;
        this.levelBackground = null;
        this.levelTileset = null;
        this.levelMap = null;
        // Set the level name
        this.levelName = name;
        // Initialize the level
        this.initialize();
    }
    get name() {
        return this.levelName;
    }
    get atlas() {
        return this.levelAtlas;
    }
    get map() {
        return this.levelMap;
    }
    generateMap() {
        return [];
    }
    async initialize() {
        // load the level config
        await this.loadConfig();
        // load the background image
        await this.loadBackground();
        // load the tileset image
        await this.loadTileset();
    }
    async loadBackground() {
        return new Promise((resolve, reject) => {
            this.levelBackground = new Image();
            this.levelBackground.src = this.levelBackgroundURL;
            this.levelBackground.onload = () => {
                resolve();
            };
            this.levelBackground.onerror = (error) => {
                reject(error);
            };
        });
    }
    async loadTileset() {
        return new Promise((resolve, reject) => {
            this.levelTileset = new Image();
            this.levelTileset.src = this.levelTilesetURL;
            this.levelTileset.onload = () => {
                resolve();
            };
            this.levelTileset.onerror = (error) => {
                reject(error);
            };
        });
    }
    async loadConfig() {
        return new Promise((resolve, reject) => {
            fetch(`./map/${this.levelName}/config.json`)
                .then(response => response.json())
                .then(data => {
                this.levelAtlas = data.atlas;
                this.levelBackgroundURL = data.background;
                this.levelTilesetURL = data.tileset;
                resolve();
            })
                .catch(error => reject(error));
        });
    }
}
