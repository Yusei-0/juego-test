import { BOARD_ROWS, BOARD_COLS, RIVER_START_ROW, RIVER_END_ROW, BRIDGE_COL_1, BRIDGE_COL_2, UNIT_TYPES } from './constants.js';

export const TILE_TYPE_MOUNTAIN = 'mountain';
export const TILE_TYPE_FOREST = 'forest';
export const TILE_TYPE_SWAMP = 'swamp';
export const TILE_TYPE_PRAIRIE = 'prairie';
export const TILE_TYPE_BRIDGE = 'bridge';

export function getTileType(row, col, terrainFeatures) {
    // Check for specific terrain features first
    if (terrainFeatures) {
        const feature = terrainFeatures.find(f => f.row === row && f.col === col);
        if (feature) {
            return feature.type;
        }
    }

    // Existing logic for river, bridge, and spawn areas
    if (row >= RIVER_START_ROW && row <= RIVER_END_ROW) {
        if (col === BRIDGE_COL_1 || col === BRIDGE_COL_2) return TILE_TYPE_BRIDGE;
        return 'river'; // TILE_TYPE_RIVER could be defined if needed elsewhere
    }
    // Player 1 spawn area (bottom of the board)
    if (row >= BOARD_ROWS - 2) return 'player1-spawn';
    // Player 2 spawn area (top of the board)
    if (row <= 1) return 'player2-spawn';

    // Default tile type
    return TILE_TYPE_PRAIRIE;
}

export function generateTerrainFeatures(boardRows, boardCols, terrainFeaturesToAvoid, basePlayer1SpawnRow, basePlayer2SpawnRow, riverStartRow, riverEndRow, bridgeCol1, bridgeCol2) {
    const features = [];
    const numberOfFeatures = Math.floor(Math.random() * 3) + 4; // 4 to 6 features
    const availableTypes = [TILE_TYPE_MOUNTAIN, TILE_TYPE_FOREST, TILE_TYPE_SWAMP];
    let attempts = 0; // To prevent infinite loops in sparse boards or tight constraints

    while (features.length < numberOfFeatures && attempts < 100) {
        const row = Math.floor(Math.random() * boardRows);
        const col = Math.floor(Math.random() * boardCols);
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Validation checks
        // 1. Already a feature?
        if (features.some(f => f.row === row && f.col === col)) {
            attempts++;
            continue;
        }

        // 2. In player 1 spawn area (bottom)? (e.g., rows 10, 11 for 12-row board)
        if (row >= basePlayer1SpawnRow) {
            attempts++;
            continue;
        }

        // 3. In player 2 spawn area (top)? (e.g., rows 0, 1)
        if (row <= basePlayer2SpawnRow) {
            attempts++;
            continue;
        }

        // 4. Is it a bridge tile?
        const isBridge = (col === bridgeCol1 || col === bridgeCol2) && (row >= riverStartRow && row <= riverEndRow);
        if (isBridge) {
            attempts++;
            continue;
        }

        // 5. In the river (but not a bridge)?
        if (row >= riverStartRow && row <= riverEndRow) {
            attempts++;
            continue;
        }

        // Check against terrainFeaturesToAvoid (though currently passed as [], good for future)
        // This can check against specific coordinates {row, col} or tile types string
        if (terrainFeaturesToAvoid && terrainFeaturesToAvoid.some(avoid => {
            if (typeof avoid === 'string') {
                // This case is not fully utilized by current getTileType logic for avoidance
                // but if getTileType was enhanced to check avoid types, it would be useful.
                // For now, direct coordinate check is more practical with current setup.
                return false; // Or implement a check if 'avoid' is a type string
            } else if (typeof avoid === 'object' && avoid.row === row && avoid.col === col) {
                return true;
            }
            return false;
        })) {
            attempts++;
            continue;
        }

        features.push({ row, col, type });
    }
    if (attempts >= 100) {
        console.warn("generateTerrainFeatures: Reached max attempts, may not have generated all desired features.");
    }
    return features;
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
