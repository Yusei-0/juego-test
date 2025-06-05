// gameState will be passed as an argument to functions needing it from main.js
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS } from './constants.js';
import { getTileType } from './boardUtils.js';
import { calculatePossibleMovesAndAttacksForUnit } from './gameActions.js';
import { attackUnitAndAnimateLocal, moveUnitAndAnimateLocal, switchTurnLocal, summonUnitLocal } from './localGame.js';
import { aiTurnIndicator, addLogEntry } from './ui.js'; // Assuming aiTurnIndicator and addLogEntry are exported from ui.js


// AI Difficulty settings (could be moved to constants or a config file)
const AI_SETTINGS = {
    easy: { SUMMON_THRESHOLD_POINTS: 30, AGGRESSION_FACTOR: 0.3 }, // Less likely to summon unless many points, less aggressive
    medium: { SUMMON_THRESHOLD_POINTS: 20, AGGRESSION_FACTOR: 0.6 },
    hard: { SUMMON_THRESHOLD_POINTS: 15, AGGRESSION_FACTOR: 0.8 } // More likely to summon, more aggressive
};


export function aiTakeTurn(gameState) {
    if (!gameState.gameActive || gameState.currentPlayer !== gameState.aiPlayerNumber) return;

    const difficultySettings = AI_SETTINGS[gameState.aiDifficulty] || AI_SETTINGS.medium; // Default to medium if difficulty not found
    if(aiTurnIndicator) aiTurnIndicator.textContent = "IA ("+ gameState.aiDifficulty +") pensando...";

    // AI Summoning Logic
    // Assuming AI is Player 2 for magic points access. Adapt if AI can be P1.
    const aiMagicPoints = gameState.player2MagicPoints;
    // Check if AI should try to summon based on difficulty-specific threshold or a general desire to summon
    // Example: Hard AI might try to summon more readily.
    if (aiMagicPoints >= difficultySettings.SUMMON_THRESHOLD_POINTS) {
        // Add a random factor or more complex condition for summoning if desired
        // For now, if points are above threshold, try to summon.
        if (Math.random() < (difficultySettings.AGGRESSION_FACTOR * 0.5 + 0.1) ) { // e.g. Hard AI has higher chance
            let didSummon = aiAttemptSummon(gameState, aiMagicPoints);
            if (didSummon) {
                // summonUnitLocal now handles turn switching, so AI turn is done.
                return;
            }
        }
    }

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

function aiAttemptSummon(gameState, aiMagicPoints) {
    const affordableUnits = [];
    for (const typeKey in UNIT_TYPES) {
        if (typeKey === 'BASE') continue; // Cannot summon BASE
        const unitDetails = UNIT_TYPES[typeKey];
        if (unitDetails.summonCost && aiMagicPoints >= unitDetails.summonCost) {
            affordableUnits.push({ type: typeKey, cost: unitDetails.summonCost, details: unitDetails });
        }
    }

    if (affordableUnits.length === 0) {
        return false; // No units AI can afford
    }

    // AI Strategy: Prefer more expensive units, or units that fill a need (e.g., more attackers if outnumbered)
    // For now, pick the most expensive one it can afford.
    affordableUnits.sort((a, b) => b.cost - a.cost);
    const unitToSummon = affordableUnits[0];

    const validSpawnPoints = [];
    // AI is Player 2, spawn rows are 0 and 1
    const spawnRows = [0, 1];
    for (const r of spawnRows) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (!gameState.board[r][c] && getTileType(r, c) !== 'river') {
                validSpawnPoints.push({ r, c });
            }
        }
    }

    if (validSpawnPoints.length === 0) {
        return false; // No valid place to summon
    }

    // Choose a random valid spawn point
    const spawnPoint = validSpawnPoints[Math.floor(Math.random() * validSpawnPoints.length)];

    addLogEntry(gameState, `IA (Jugador ${gameState.aiPlayerNumber}) intenta invocar ${unitToSummon.details.name} en (${spawnPoint.r}, ${spawnPoint.c}).`, 'ai-decision');
    summonUnitLocal(gameState, unitToSummon.type, spawnPoint.r, spawnPoint.c);
    // summonUnitLocal now switches the turn.
    return true;
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
