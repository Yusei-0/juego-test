// gameState will be passed as an argument to functions needing it.
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS } from './constants.js';
import { getTileType, TILE_TYPE_SWAMP, TILE_TYPE_FOREST, TILE_TYPE_MOUNTAIN, TILE_TYPE_BRIDGE } from './boardUtils.js'; // Updated import with terrain types
import { performMoveOnline, performAttackOnline } from './onlineGame.js';
import { moveUnitAndAnimateLocal, attackUnitAndAnimateLocal, performHealLocal } from './localGame.js';
import { renderHighlightsAndInfo } from './ui.js';
import { updateVisibility } from './visibility.js';

export function onTileClick(gameState, row, col) {
    if (!gameState.gameActive || gameState.isAnimating) return;

    // Visibility Check
    const isBaseTileP1 = gameState.player1Base && gameState.player1Base.row === row && gameState.player1Base.col === col;
    const isBaseTileP2 = gameState.player2Base && gameState.player2Base.row === row && gameState.player2Base.col === col;
    const isBaseTile = isBaseTileP1 || isBaseTileP2;

    let isVisible = false;
    if (gameState.visibilityGrid && gameState.visibilityGrid[row] && gameState.visibilityGrid[row][col] !== undefined) {
        isVisible = gameState.visibilityGrid[row][col] === 2;
    }

    if (!isVisible && !isBaseTile) {
        // console.log("Clicked on a non-visible, non-base tile. Action ignored.");
        // Optionally, provide feedback to the user, e.g., a subtle sound or visual cue.
        // For now, just clearing selection if any and returning.
        clearHighlightsAndSelection(gameState);
        renderHighlightsAndInfo(gameState); // Re-render to clear any visual cues from previous selection
        return;
    }

    if (gameState.gameMode === 'online') {
        if (!gameState.currentFirebaseGameData || gameState.currentFirebaseGameData.currentPlayerId !== gameState.localPlayerId) return;
    } else {
        if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiPlayerNumber) return;
    }

    const unitDataOnTile = gameState.board[row] ? gameState.board[row][col] : null;  // Added bounds check for row
    const highlightedAction = gameState.highlightedMoves.find(m => m.row === row && m.col === col);

    if (highlightedAction && gameState.selectedUnit) {
        const actingUnitData = gameState.selectedUnit.data;
        if (gameState.gameMode === 'online') {
            if (highlightedAction.type === 'move') {
                performMoveOnline(gameState, actingUnitData, row, col).then(() => updateVisibility(gameState));
            } else if (highlightedAction.type === 'attack') {
                performAttackOnline(gameState, actingUnitData, gameState.board[row][col]).then(() => updateVisibility(gameState));
            }
            // Note: Online heal not implemented yet, but if it were, it would need .then(() => updateVisibility(gameState))
        } else {
            // For local game actions, they are async, so we await them then update.
            (async () => {
                if (highlightedAction.type === 'move') {
                    await moveUnitAndAnimateLocal(gameState, actingUnitData, row, col);
                } else if (highlightedAction.type === 'attack') {
                    await attackUnitAndAnimateLocal(gameState, actingUnitData, gameState.board[row][col]);
                } else if (highlightedAction.type === 'heal') {
                    const targetUnitDataOnTile = gameState.board[row][col];
                    if (targetUnitDataOnTile && targetUnitDataOnTile.id === highlightedAction.targetId) {
                        await performHealLocal(gameState, actingUnitData, targetUnitDataOnTile, highlightedAction.healAmount);
                    } else {
                        console.error("Heal target mismatch or not found on tile!");
                    }
                }
                updateVisibility(gameState);
            })();
        }
    }
    else if (unitDataOnTile) {
        let canSelect = false;
        if (gameState.gameMode === 'online') {
            canSelect = unitDataOnTile.player === gameState.localPlayerNumber;
        } else {
            canSelect = unitDataOnTile.player === gameState.currentPlayer;
        }

        if (canSelect) {
            selectUnit(gameState, unitDataOnTile);
            // renderHighlightsAndInfo is called inside selectUnit if updateGlobalHighlights is true
        } else {
            clearHighlightsAndSelection(gameState);
            gameState.selectedUnit = { data: unitDataOnTile }; // Select for info display only
            renderHighlightsAndInfo(gameState); // Re-render to show selection without action highlights
        }
    }
    else {
        clearHighlightsAndSelection(gameState);
        renderHighlightsAndInfo(gameState);
    }
}

export function selectUnit(gameState, unitData) {
    clearHighlightsAndSelection(gameState);
    gameState.selectedUnit = { data: unitData };
    calculatePossibleMovesAndAttacksForUnit(gameState, unitData, true); // This will update highlightedMoves
    renderHighlightsAndInfo(gameState); // Explicitly call render after calculation
}

export function clearHighlightsAndSelection(gameState) {
    gameState.selectedUnit = null;
    gameState.highlightedMoves = [];
    // No direct render call here, calling function should decide if render is needed
}

export function calculatePossibleMovesAndAttacksForUnit(gameState, unitData, updateGlobalHighlights = false) {
    const possibleActions = [];
    if (!unitData || !UNIT_TYPES[unitData.type]) return possibleActions;

    const unitFullType = UNIT_TYPES[unitData.type];
    const { movement, range, isMobile, class: unitClass } = unitFullType;
    const startR = unitData.row;
    const startC = unitData.col;

    // Movement Calculation (BFS)
    if (movement > 0 && isMobile) {
        const q = [{ r: startR, c: startC, dist: 0 }];
        const visited = new Set([`${startR},${startC}`]); // Keep track of visited cells to avoid cycles and redundant checks

        while (q.length > 0) {
            const curr = q.shift();

            // Explore neighbors: up, down, left, right
            const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of neighbors) {
                const nr = curr.r + dr;
                const nc = curr.c + dc;
                const newPosKey = `${nr},${nc}`;

                if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS && !visited.has(newPosKey)) {
                    visited.add(newPosKey); // Mark as visited early

                    const targetTileType = getTileType(nr, nc, gameState.terrainFeatures);
                    const unitOnTargetTile = gameState.board[nr] ? gameState.board[nr][nc] : null;

                    let costToEnter = 1;
                    if (targetTileType === TILE_TYPE_SWAMP && unitData.type !== 'UNIDAD_VOLADORA') { // Flying units are not affected by swamp
                        costToEnter = 2;
                    }

                    if (curr.dist + costToEnter <= movement) {
                        let canMoveToTile = false;
                        if (unitData.type === 'UNIDAD_VOLADORA') {
                            canMoveToTile = !unitOnTargetTile; // Flying units can only be blocked by another unit at the destination
                        } else {
                            // Standard ground unit movement rules
                            canMoveToTile = targetTileType !== 'river' && !unitOnTargetTile;

                            // Forest Movement Rule (Blocking by enemy)
                            if (targetTileType === TILE_TYPE_FOREST && unitOnTargetTile && unitOnTargetTile.player !== unitData.player) {
                                canMoveToTile = false;
                            }
                        }

                        if (canMoveToTile) {
                            const moveAction = { unitId: unitData.id, fromR: startR, fromC: startC, row: nr, col: nc, type: 'move' };
                            possibleActions.push(moveAction);
                            if (updateGlobalHighlights) gameState.highlightedMoves.push(moveAction);
                            q.push({ r: nr, c: nc, dist: curr.dist + costToEnter });
                        }
                    }
                }
            }
        }
    }

    // Attack Calculation
    if (range > 0) {
        const attackingUnitTileType = getTileType(startR, startC, gameState.terrainFeatures);
        let effectiveRange = range;

        if (attackingUnitTileType === TILE_TYPE_MOUNTAIN && unitClass === 'arquero') {
            effectiveRange += 1;
        }

        for (let ro = -effectiveRange; ro <= effectiveRange; ro++) {
            for (let co = -effectiveRange; co <= effectiveRange; co++) {
                if (Math.abs(ro) + Math.abs(co) > effectiveRange || (ro === 0 && co === 0)) continue;

                const tr = startR + ro; // Target row
                const tc = startC + co; // Target col

                if (tr >= 0 && tr < BOARD_ROWS && tc >= 0 && tc < BOARD_COLS) {
                    const targetUnitOnTile = gameState.board[tr] ? gameState.board[tr][tc] : null;

                    if (targetUnitOnTile && targetUnitOnTile.player !== unitData.player) {
                        const targetTileType = getTileType(tr, tc, gameState.terrainFeatures);
                        let canTarget = true;

                        // Forest Targeting Rule (Visibility for Attack)
                        if (targetTileType === TILE_TYPE_FOREST) {
                            const isAdjacent = Math.abs(startR - tr) + Math.abs(startC - tc) === 1;
                            if (!isAdjacent) {
                                canTarget = false;
                            }
                        }

                        if (canTarget) {
                            const attackAction = { unitId: unitData.id, fromR: startR, fromC: startC, row: tr, col: tc, type: 'attack', targetId: targetUnitOnTile.id };
                            possibleActions.push(attackAction);
                            if (updateGlobalHighlights) gameState.highlightedMoves.push(attackAction);
                        }
                    }
                }
            }
        }
    }

    // Heal Calculation (existing logic, ensure it's not affected adversely)
    if (unitData.type === 'SANADOR') { // Assuming UNIT_TYPES.SANADOR exists
        const healAbility = UNIT_TYPES.SANADOR; // Or unitFullType if SANADOR details are there
        if (healAbility && healAbility.healRange > 0 && healAbility.healAmount > 0) {
            for (let ro = -healAbility.healRange; ro <= healAbility.healRange; ro++) {
                for (let co = -healAbility.healRange; co <= healAbility.healRange; co++) {
                    if (Math.abs(ro) + Math.abs(co) > healAbility.healRange || (ro === 0 && co === 0)) continue;
                    const tr = startR + ro;
                    const tc = startC + co;
                    if (tr >= 0 && tr < BOARD_ROWS && tc >= 0 && tc < BOARD_COLS) {
                        const targetUnitDataOnTile = gameState.board[tr] ? gameState.board[tr][tc] : null;
                        if (targetUnitDataOnTile &&
                            targetUnitDataOnTile.player === unitData.player &&
                            targetUnitDataOnTile.id !== unitData.id &&
                            targetUnitDataOnTile.hp < targetUnitDataOnTile.maxHp) {
                            const healAction = {
                                unitId: unitData.id,
                                fromR: startR,
                                fromC: startC,
                                row: tr,
                                col: tc,
                                type: 'heal',
                                targetId: targetUnitDataOnTile.id,
                                healAmount: healAbility.healAmount
                            };
                            possibleActions.push(healAction);
                            if (updateGlobalHighlights) gameState.highlightedMoves.push(healAction);
                        }
                    }
                }
            }
        }
    }
    return possibleActions;
}
