// gameState will be passed as an argument to functions needing it from main.js
import { calculatePossibleMovesAndAttacksForUnit } from './gameActions.js';
import { attackUnitAndAnimateLocal, moveUnitAndAnimateLocal, switchTurnLocal } from './localGame.js';
import { aiTurnIndicator } from './ui.js'; // Assuming aiTurnIndicator is exported from ui.js

export function aiTakeTurn(gameState) {
    if (!gameState.gameActive || gameState.currentPlayer !== gameState.aiPlayerNumber) return;
    if(aiTurnIndicator) aiTurnIndicator.textContent = "IA ("+ gameState.aiDifficulty +") pensando...";

    let allPossibleActions = [];
    for (const unitId in gameState.units) {
        const unitElement = gameState.units[unitId];
        const unitData = unitElement.__unitData; // Assuming unit data is stored on the element
        if (unitData && unitData.player === gameState.aiPlayerNumber) {
            const actions = calculatePossibleMovesAndAttacksForUnit(gameState, unitData, false);
            allPossibleActions.push(...actions);
        }
    }

    if (allPossibleActions.length === 0) {
        switchTurnLocal(gameState);
        return;
    }

    const attackActions = allPossibleActions.filter(a => a.type === 'attack');
    if (attackActions.length > 0) {
        // Basic AI: Prioritize attacks. Could be enhanced by difficulty.
        const randomAttack = attackActions[Math.floor(Math.random() * attackActions.length)];
        const attackerData = gameState.board[randomAttack.fromR][randomAttack.fromC];
        const targetData = gameState.board[randomAttack.row][randomAttack.col];
        if (attackerData && targetData) {
            attackUnitAndAnimateLocal(gameState, attackerData, targetData);
        } else {
            // Fallback if something is wrong with the chosen attack
            aiChooseRandomMoveLocal(gameState, allPossibleActions);
        }
    } else {
        aiChooseRandomMoveLocal(gameState, allPossibleActions);
    }
}

export function aiChooseRandomMoveLocal(gameState, allPossibleActions) {
    const moveActions = allPossibleActions.filter(a => a.type === 'move');
    if (moveActions.length > 0) {
        // Basic AI: Choose a random move. Could be enhanced by difficulty.
        const randomMove = moveActions[Math.floor(Math.random() * moveActions.length)];
        const unitToMove = gameState.board[randomMove.fromR][randomMove.fromC];
        if (unitToMove) {
            moveUnitAndAnimateLocal(gameState, unitToMove, randomMove.row, randomMove.col);
        } else {
            switchTurnLocal(gameState); // Fallback if unit not found (should not happen)
        }
    } else {
        switchTurnLocal(gameState); // No moves possible
    }
}
