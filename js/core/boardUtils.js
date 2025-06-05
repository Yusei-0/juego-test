import { BOARD_ROWS, BOARD_COLS, RIVER_START_ROW, RIVER_END_ROW, BRIDGE_COL_1, BRIDGE_COL_2, UNIT_CLASSES } from '../config/constants.js';
import Grass from '../terrain/Grass.js';
import River from '../terrain/River.js';
import Bridge from '../terrain/Bridge.js';
import Player1Spawn from '../terrain/Player1Spawn.js';
import Player2Spawn from '../terrain/Player2Spawn.js';

export function getTileType(row, col) {
    if (row >= RIVER_START_ROW && row <= RIVER_END_ROW) {
        if (col === BRIDGE_COL_1 || col === BRIDGE_COL_2) return new Bridge();
        return new River();
    }
    if (row >= BOARD_ROWS - 2) return new Player1Spawn();
    if (row <= 1) return new Player2Spawn();
    return new Grass();
}

export function createUnitData(type, player, id, row = -1, col = -1) {
    const UnitClass = UNIT_CLASSES[type];
    if (!UnitClass) {
        throw new Error(`Unknown unit type: ${type}`);
    }
    // The constructor of the unit classes expects (player, id, row, col)
    // The other properties (hp, attack, etc.) are set within the constructor of each specific unit class.
    return new UnitClass(player, id, row, col);
}
