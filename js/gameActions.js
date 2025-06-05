// gameState will be passed as an argument to functions needing it.
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS, POINTS_PER_KILL } from './constants.js';
import { getTileType, createUnitData } from './boardUtils.js'; // Updated import
import { performMoveOnline, performAttackOnline } from './onlineGame.js';
import { moveUnitAndAnimateLocal, attackUnitAndAnimateLocal, switchTurnLocal } from './localGame.js';
import { renderHighlightsAndInfo, createUnitElement, addLogEntry, renderUnitRosterLocal, showNotification } from './ui.js';
import { playSound } from './sound.js'; // Added for invocation sound

export function onTileClick(gameState, row, col) {
    if (!gameState.gameActive || gameState.isAnimating) return;

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
                performMoveOnline(gameState, actingUnitData, row, col);
            } else if (highlightedAction.type === 'attack') {
                performAttackOnline(gameState, actingUnitData, gameState.board[row][col]);
            }
        } else {
            if (highlightedAction.type === 'move') {
                moveUnitAndAnimateLocal(gameState, actingUnitData, row, col);
            } else if (highlightedAction.type === 'attack') {
                attackUnitAndAnimateLocal(gameState, actingUnitData, gameState.board[row][col]);
            }
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
    if (!unitData || !UNIT_TYPES[unitData.type]) return possibleActions; // Guard against undefined unit type
    const { movement, range, isMobile } = UNIT_TYPES[unitData.type]; // Destructure isMobile
    const startR = unitData.row; const startC = unitData.col;

    if (movement > 0 && isMobile) { // Check isMobile before calculating moves
        let q=[{r:startR,c:startC,dist:0}],v=new Set([`${startR},${startC}`]);
        while(q.length>0){
            let curr=q.shift();
            if(curr.dist<movement){
                const n=[[-1,0],[1,0],[0,-1],[0,1]];
                for(const [dr,dc] of n){
                    const nr=curr.r+dr,nc=curr.c+dc,pk=`${nr},${nc}`;
                    if(nr>=0&&nr<BOARD_ROWS&&nc>=0&&nc<BOARD_COLS&&!v.has(pk)){
                        const tt=getTileType(nr,nc);
                        if(tt!=='river'&& (!gameState.board[nr] || !gameState.board[nr][nc])){ // Check board bounds and if tile is empty
                            const a={unitId:unitData.id,fromR:startR,fromC:startC,row:nr,col:nc,type:'move'};
                            possibleActions.push(a);
                            if(updateGlobalHighlights)gameState.highlightedMoves.push(a);
                            v.add(pk);
                            q.push({r:nr,c:nc,dist:curr.dist+1});
                        }
                    }
                }
            }
        }
    }
    if (range > 0) {
        for(let ro=-range;ro<=range;ro++){
            for(let co=-range;co<=range;co++){
                if(Math.abs(ro)+Math.abs(co)>range||(ro===0&&co===0))continue;
                const tr=startR+ro,tc=startC+co;
                if(tr>=0&&tr<BOARD_ROWS&&tc>=0&&tc<BOARD_COLS){
                    const tudob= gameState.board[tr] ? gameState.board[tr][tc] : null; // Check board bounds
                    if(tudob&&tudob.player!==unitData.player){
                        const a={unitId:unitData.id,fromR:startR,fromC:startC,row:tr,col:tc,type:'attack',targetId:tudob.id};
                        possibleActions.push(a);
                        if(updateGlobalHighlights)gameState.highlightedMoves.push(a);
                    }
                }
            }
        }
    }
    return possibleActions;
}

export function invokeUnit(gameState, unitTypeKey, row, col) {
    // Determine playerId (assuming local game for now, where currentPlayer is the one acting)
    const playerId = gameState.currentPlayer;
    const unitToInvokeData = UNIT_TYPES[unitTypeKey];

    if (!unitToInvokeData) {
        console.error(`Invalid unitTypeKey: ${unitTypeKey}`);
        showNotification("Error de Invocación", `Tipo de unidad inválido: ${unitTypeKey}`);
        return;
    }

    // Check if tile is occupied
    if (gameState.board[row][col]) {
        showNotification("Error de Invocación", `La casilla (${row},${col}) ya está ocupada.`);
        return;
    }

    // TODO: Add checks for valid invocation zones if necessary

    const currentMagicPoints = playerId === 1 ? gameState.player1MagicPoints : gameState.player2MagicPoints;

    if (currentMagicPoints < unitToInvokeData.magicCost) {
        showNotification("Puntos Insuficientes", `No tienes suficientes puntos mágicos para invocar a ${unitToInvokeData.name}.`);
        return;
    }

    // Deduct points
    if (playerId === 1) {
        gameState.player1MagicPoints -= unitToInvokeData.magicCost;
    } else {
        gameState.player2MagicPoints -= unitToInvokeData.magicCost;
    }

    // Create the unit
    const generatedId = unitTypeKey.toLowerCase() + Date.now(); // Simple unique ID
    const unitData = createUnitData(unitTypeKey, playerId, generatedId);
    unitData.row = row;
    unitData.col = col;

    // Add to board and units list
    gameState.board[row][col] = unitData;
    createUnitElement(gameState, unitData); // This also adds to gameState.units

    addLogEntry(gameState, `Jugador ${playerId} invocó a ${unitToInvokeData.name} en (${row},${col}) por ${unitToInvokeData.magicCost} puntos.`, 'invoke');
    playSound('invoke', 'C5'); // Example sound for invocation

    // Update UI
    renderUnitRosterLocal(gameState); // To update magic points display and unit roster
    renderHighlightsAndInfo(gameState); // To clear any selections and update general info

    // Switch turns (assuming local game context)
    switchTurnLocal(gameState);
}
