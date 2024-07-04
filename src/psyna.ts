/**
 * Psyna
 * 
 * A simple game engine
 * 
 * @author VisionMise <visionmise@psyn.app>
 * @copyright 2024 Geoffrey L. Kuhl
 */



/**
 * Load Library
 * 
 * Load a library from the lib folder
 * @async
 * @param name Name of the library to load
 * @returns Module
 */
async function loadLibrary(name:string) : Promise<any> {
    const library:any = await import(`./lib/${name}.js`);
    return library;
}



/**
 * Main
 * 
 * Main function
 * @async
 * @returns void
 */
async function main() {

    // Load the game library
    const gameLibrary:any = await loadLibrary('engine');

    // Create a new game
    (window as any).psyna = new gameLibrary.Engine();
}



// Run the main function
main();