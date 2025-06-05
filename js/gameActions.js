// gameState will be passed as an argument to functions needing it.
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS, MAX_TURNS } from './constants.js';
import { getTileType } from './boardUtils.js'; // Updated import
import { performMoveOnline, performAttackOnline, FIRESTORE_GAME_PATH_PREFIX } from './onlineGame.js';
import { moveUnitAndAnimateLocal, attackUnitAndAnimateLocal, endGameLocal } from './localGame.js';
import { renderHighlightsAndInfo, showEndGameModal } from './ui.js';
import { firestoreDB, doc, runTransaction } from './firebase.js';

export function checkTurnLimit(gameState) {
    const currentTurn = gameState.gameMode === 'online' ? gameState.currentFirebaseGameData.currentTurn : gameState.currentTurn;

    if (currentTurn < MAX_TURNS) {
        return;
    }

    let player1TotalHp = 0;
    let player2TotalHp = 0;
    const units = gameState.gameMode === 'online' ? gameState.currentFirebaseGameData.units : gameState.units;

    if (gameState.gameMode === 'online') {
        for (const unitId in units) {
            const unit = units[unitId];
            if (unit.player === 1) {
                player1TotalHp += unit.hp;
            } else if (unit.player === 2) {
                player2TotalHp += unit.hp;
            }
        }
    } else { // Local or vsAI
        for (const unitId in units) {
            const unitElement = units[unitId]; // These are HTMLElements
            const unitData = unitElement.__unitData;
            if (unitData.player === 1) {
                player1TotalHp += unitData.hp;
            } else if (unitData.player === 2) {
                player2TotalHp += unitData.hp;
            }
        }
    }

    let winner = null;
    let reason = `Límite de ${MAX_TURNS} turnos alcanzado`;

    if (player1TotalHp > player2TotalHp) {
        winner = 1;
    } else if (player2TotalHp > player1TotalHp) {
        winner = 2;
    } else {
        reason += ", ¡Empate en HP!";
    }

    gameState.gameActive = false; // Set game as inactive

    if (gameState.gameMode === 'online') {
        if (!gameState.currentGameId || !firestoreDB) {
            console.error("Turn limit reached but gameId or Firestore DB not available for online game.");
            showEndGameModal(gameState, winner, reason + " (Error al finalizar online)"); // Show local modal as fallback
            return;
        }
        const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
        runTransaction(firestoreDB, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) throw "Game DNE!";
            const gd = gameDoc.data();
            let newStatus = gd.status;
            if (winner === 1) newStatus = 'player1_wins';
            else if (winner === 2) newStatus = 'player2_wins';
            else newStatus = 'draw';
            // gameActive: false is not a field in Firestore, status dictates activity.
            transaction.update(gameRef, { status: newStatus, winnerReason: reason });
        }).catch(error => {
            console.error("Error updating game state for turn limit:", error);
            // Fallback to local modal if transaction fails
            showEndGameModal(gameState, winner, reason + " (Error en transacción)");
        });
        // The onSnapshot listener in onlineGame.js will handle calling showEndGameModal
        // once it receives the updated game state. We don't call it directly here for online.
    } else {
        endGameLocal(gameState, winner, reason);
    }
}

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
