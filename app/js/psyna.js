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
async function loadLibrary(name) {
    const library = await import(`./lib/${name}.js`);
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
    const gameLibrary = await loadLibrary('game');
    // Create a new game
    const game = new gameLibrary.Game();
    // Start the game
    game.start();
    // Add the game to the window object
    window.game = game;
}
// Run the main function
main();
