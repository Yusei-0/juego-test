import { BOARD_ROWS, BOARD_COLS, RIVER_START_ROW, RIVER_END_ROW, BRIDGE_COL_1, BRIDGE_COL_2, UNIT_TYPES } from './constants.js';

export function getTileType(row, col) {
    if (row >= RIVER_START_ROW && row <= RIVER_END_ROW) {
        if (col === BRIDGE_COL_1 || col === BRIDGE_COL_2) return 'bridge';
        return 'river';
    }
    if (row >= BOARD_ROWS - 2) return 'player1-spawn';
    if (row <= 1) return 'player2-spawn';
    return 'grass';
}

export function createUnitData(type, player, id) {
    const unitTypeDetails = UNIT_TYPES[type];
    return {
        id: `p${player}-${type.toLowerCase()}-${id}`, type: type, player: player,
        hp: unitTypeDetails.hp, maxHp: unitTypeDetails.hp, attack: unitTypeDetails.attack,
        movement: unitTypeDetails.movement, range: unitTypeDetails.range,
        class: unitTypeDetails.class, isMobile: unitTypeDetails.isMobile,
        drawFuncKey: unitTypeDetails.drawFunc, row: -1, col: -1
    };
}
