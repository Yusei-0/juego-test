import { BOARD_ROWS, BOARD_COLS, UNIT_TYPES } from './constants.js';
import { TILE_TYPE_MOUNTAIN, TILE_TYPE_FOREST, getTileType } from './boardUtils.js';

/**
 * Updates the visibility grid based on the current player's units and base locations.
 * @param {object} gameState - The current state of the game.
 */
export function updateVisibility(gameState) {
    if (!gameState) {
        console.error("updateVisibility: gameState is undefined");
        return;
    }

    const currentPlayer = gameState.currentPlayer;
    gameState.visibilityGrid = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(0)); // 0: hidden, 1: explored, 2: visible

    // Base Visibility
    if (gameState.player1Base && gameState.player1Base.row !== undefined && gameState.player1Base.col !== undefined) {
        if (gameState.player1Base.row >= 0 && gameState.player1Base.row < BOARD_ROWS && gameState.player1Base.col >= 0 && gameState.player1Base.col < BOARD_COLS) {
            gameState.visibilityGrid[gameState.player1Base.row][gameState.player1Base.col] = 2;
        }
    }
    if (gameState.player2Base && gameState.player2Base.row !== undefined && gameState.player2Base.col !== undefined) {
         if (gameState.player2Base.row >= 0 && gameState.player2Base.row < BOARD_ROWS && gameState.player2Base.col >= 0 && gameState.player2Base.col < BOARD_COLS) {
            gameState.visibilityGrid[gameState.player2Base.row][gameState.player2Base.col] = 2;
        }
    }

    // Unit Vision
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const unit = gameState.board[r] ? gameState.board[r][c] : null;
            if (unit && unit.player === currentPlayer) {
                const unitTypeDetails = UNIT_TYPES[unit.type];
                if (!unitTypeDetails || unitTypeDetails.vision === undefined) {
                    console.warn(`Unit type ${unit.type} has no vision property or is undefined.`);
                    continue;
                }
                let baseVision = unitTypeDetails.vision;

                // Get terrain type at unit's location
                const unitTerrainType = getTileType(unit.row, unit.col, gameState.terrainFeatures);
                let effectiveVision = baseVision;

                if (unitTerrainType === TILE_TYPE_MOUNTAIN) {
                    effectiveVision += 2;
                } else if (unitTerrainType === TILE_TYPE_FOREST) {
                    effectiveVision -= 1;
                }
                effectiveVision = Math.max(1, effectiveVision); // Ensure minimum vision of 1

                // Spread vision
                for (let tr = 0; tr < BOARD_ROWS; tr++) {
                    for (let tc = 0; tc < BOARD_COLS; tc++) {
                        if (Math.abs(tr - unit.row) + Math.abs(tc - unit.col) <= effectiveVision) {
                            // Check bounds again just in case, though tr/tc are from loop
                            if (tr >= 0 && tr < BOARD_ROWS && tc >= 0 && tc < BOARD_COLS) {
                                gameState.visibilityGrid[tr][tc] = 2; // Mark as visible
                            }
                        }
                    }
                }
            }
        }
    }
}
