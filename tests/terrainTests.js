import Terrain from '../js/terrain/Terrain.js';
import Grass from '../js/terrain/Grass.js';
import River from '../js/terrain/River.js';
import Bridge from '../js/terrain/Bridge.js';
import Player1Spawn from '../js/terrain/Player1Spawn.js';
import Player2Spawn from '../js/terrain/Player2Spawn.js';

function runTerrainTests() {
    console.log("--- Running Terrain Tests ---");

    // Test Grass
    try {
        const grass = new Grass();
        console.assert(grass.type === 'grass', "Test Failed: Grass type");
        console.assert(grass instanceof Grass, "Test Failed: Grass instanceof Grass");
        console.assert(grass instanceof Terrain, "Test Failed: Grass instanceof Terrain");
        console.log("Grass tests passed.");
    } catch (e) {
        console.error("Error in Grass tests:", e);
    }

    // Test River
    try {
        const river = new River();
        console.assert(river.type === 'river', "Test Failed: River type");
        console.assert(river instanceof River, "Test Failed: River instanceof River");
        console.assert(river instanceof Terrain, "Test Failed: River instanceof Terrain");
        console.log("River tests passed.");
    } catch (e) {
        console.error("Error in River tests:", e);
    }

    // Test Bridge
    try {
        const bridge = new Bridge();
        console.assert(bridge.type === 'bridge', "Test Failed: Bridge type");
        console.assert(bridge instanceof Bridge, "Test Failed: Bridge instanceof Bridge");
        console.assert(bridge instanceof Terrain, "Test Failed: Bridge instanceof Terrain");
        console.log("Bridge tests passed.");
    } catch (e) {
        console.error("Error in Bridge tests:", e);
    }

    // Test Player1Spawn
    try {
        const p1Spawn = new Player1Spawn();
        console.assert(p1Spawn.type === 'player1-spawn', "Test Failed: Player1Spawn type");
        console.assert(p1Spawn instanceof Player1Spawn, "Test Failed: Player1Spawn instanceof Player1Spawn");
        console.assert(p1Spawn instanceof Terrain, "Test Failed: Player1Spawn instanceof Terrain");
        console.log("Player1Spawn tests passed.");
    } catch (e) {
        console.error("Error in Player1Spawn tests:", e);
    }

    // Test Player2Spawn
    try {
        const p2Spawn = new Player2Spawn();
        console.assert(p2Spawn.type === 'player2-spawn', "Test Failed: Player2Spawn type");
        console.assert(p2Spawn instanceof Player2Spawn, "Test Failed: Player2Spawn instanceof Player2Spawn");
        console.assert(p2Spawn instanceof Terrain, "Test Failed: Player2Spawn instanceof Terrain");
        console.log("Player2Spawn tests passed.");
    } catch (e) {
        console.error("Error in Player2Spawn tests:", e);
    }

    console.log("--- Terrain Tests Finished ---");
}

runTerrainTests();
