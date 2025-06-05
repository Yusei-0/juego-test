// gameState will be passed as an argument to functions needing it.
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS } from './constants.js';
import { getTileType } from './boardUtils.js'; // Updated import
import { performMoveOnline, performAttackOnline } from './onlineGame.js';
import { moveUnitAndAnimateLocal, attackUnitAndAnimateLocal, performHealLocal, summonUnitLocal } from './localGame.js'; // Added summonUnitLocal
// Import hideSummonUnitModal and showNotification from ui.js
import { renderHighlightsAndInfo, hideSummonUnitModal, showNotification } from './ui.js';

export function onTileClick(gameState, row, col) {
    if (!gameState.gameActive || gameState.isAnimating) return;

    // Summoning Action Check
    if (gameState.isSummoning) {
        const highlightedSummonSpot = gameState.highlightedMoves.find(m => m.row === row && m.col === col && m.type === 'summon_spawn_point');
        if (highlightedSummonSpot) {
            summonUnitLocal(gameState, gameState.unitToSummonType, row, col);

            // Deduct magic points (example, actual deduction should be in summonUnitLocal)
            // const unitToSummonDetails = UNIT_TYPES[gameState.unitToSummonType];
            // if (gameState.currentPlayer === 1) {
            //     gameState.player1MagicPoints -= unitToSummonDetails.summonCost;
            // } else {
            //     gameState.player2MagicPoints -= unitToSummonDetails.summonCost;
            // }

            gameState.isSummoning = false;
            gameState.unitToSummonType = null;
            clearHighlightsAndSelection(gameState); // Clear summon highlights
            renderHighlightsAndInfo(gameState); // Re-render board
            // The actual unit placement and game state update will be in summonUnitLocal
            return; // End turn or further action for summoning.
        } else {
            // Clicked on a non-highlighted tile during summoning mode
            console.log("GAME_ACTIONS: Invalid summon location. Click on a highlighted tile.");
            // Optionally, provide visual feedback like a screen shake or error sound.
            // For now, we just cancel summoning mode to prevent being stuck.
            gameState.isSummoning = false;
            gameState.unitToSummonType = null;
            clearHighlightsAndSelection(gameState);
            renderHighlightsAndInfo(gameState);
            showNotification("Invocación Cancelada", "Has hecho clic en una casilla no válida. La invocación ha sido cancelada.");
            return;
        }
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
                performMoveOnline(gameState, actingUnitData, row, col);
            } else if (highlightedAction.type === 'attack') {
                performAttackOnline(gameState, actingUnitData, gameState.board[row][col]);
            }
        } else {
            if (highlightedAction.type === 'move') {
                moveUnitAndAnimateLocal(gameState, actingUnitData, row, col);
            } else if (highlightedAction.type === 'attack') {
                attackUnitAndAnimateLocal(gameState, actingUnitData, gameState.board[row][col]);
            } else if (highlightedAction.type === 'heal') {
                // Maneja la acción de curación.
                // Ensure the target unit data is correctly passed
                const targetUnitDataOnTile = gameState.board[row][col];
                if (targetUnitDataOnTile && targetUnitDataOnTile.id === highlightedAction.targetId) {
                     // performHealLocal will be created in the next step.
                     // For now, this call implies its future existence.
                    performHealLocal(gameState, actingUnitData, targetUnitDataOnTile, highlightedAction.healAmount);
                } else {
                    console.error("Heal target mismatch or not found on tile!");
                }
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
    // However, if isSummoning was true, highlights should be cleared.
    if (gameState.highlightedMoves.some(m => m.type === 'summon_spawn_point')) {
        gameState.highlightedMoves = gameState.highlightedMoves.filter(m => m.type !== 'summon_spawn_point');
    }
}

export function initiateSummonAction(gameState, unitTypeToSummon) {
    if (!UNIT_TYPES[unitTypeToSummon]) {
        console.error(`GAME_ACTIONS: Invalid unit type "${unitTypeToSummon}" for summoning.`);
        showNotification("Error de Invocación", `Tipo de unidad inválido: ${unitTypeToSummon}.`);
        return;
    }

    const unitDetails = UNIT_TYPES[unitTypeToSummon];
    const currentPlayerMagic = gameState.currentPlayer === 1 ? gameState.player1MagicPoints : gameState.player2MagicPoints;

    if (currentPlayerMagic < unitDetails.summonCost) {
        console.error(`GAME_ACTIONS: Not enough magic points to summon ${unitTypeToSummon}. Required: ${unitDetails.summonCost}, Available: ${currentPlayerMagic}`);
        showNotification("Puntos Insuficientes", `No tienes suficientes puntos mágicos para invocar ${unitDetails.name}.`);
        hideSummonUnitModal(); // Close modal as summon cannot proceed
        return;
    }

    clearHighlightsAndSelection(gameState); // Clear any previous selections/highlights
    gameState.isSummoning = true;
    gameState.unitToSummonType = unitTypeToSummon;
    hideSummonUnitModal(); // Close the modal once summoning mode is initiated

    console.log(`GAME_ACTIONS: Player ${gameState.currentPlayer} entered summoning mode for ${unitTypeToSummon}. Click a valid tile to summon.`);

    const spawnRowsP1 = [BOARD_ROWS - 1, BOARD_ROWS - 2];
    const spawnRowsP2 = [0, 1];
    const validSpawnRows = gameState.currentPlayer === 1 ? spawnRowsP1 : spawnRowsP2;
    let foundSpawnPoint = false;

    for (const r of validSpawnRows) {
        for (let c = 0; c < BOARD_COLS; c++) {
            // Check if tile is within board, not river, and is empty
            const tileType = getTileType(r, c);
            if (tileType !== 'river' && (!gameState.board[r] || !gameState.board[r][c])) {
                 // Ensure board[r] exists before checking board[r][c]
                if (gameState.board[r] && gameState.board[r][c] === null) { // Explicitly check for null (empty)
                    gameState.highlightedMoves.push({ row: r, col: c, type: 'summon_spawn_point' });
                    foundSpawnPoint = true;
                } else if (!gameState.board[r]) { // If the row itself doesn't exist (shouldn't happen with pre-init board)
                    gameState.highlightedMoves.push({ row: r, col: c, type: 'summon_spawn_point' });
                    foundSpawnPoint = true;
                }
            }
        }
    }

    if (!foundSpawnPoint) {
        console.error("GAME_ACTIONS: No valid spawn points available for summoning.");
        showNotification("Invocación Fallida", "No hay casillas válidas disponibles para invocar unidades.");
        gameState.isSummoning = false;
        gameState.unitToSummonType = null;
        // No need to call renderHighlightsAndInfo if no highlights were added and state is reset
        return;
    }

    renderHighlightsAndInfo(gameState);
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
                        const tileIsEmpty = (!gameState.board[nr] || !gameState.board[nr][nc]);
                        let canMoveToTile = false;

                        // Comprueba si la unidad es voladora para aplicar reglas de movimiento especiales
                        if (unitData.type === 'UNIDAD_VOLADORA') {
                            canMoveToTile = tileIsEmpty; // Flying unit can only be blocked by another unit at the destination
                        } else {
                            // Reglas de movimiento estándar para unidades terrestres
                            const tt = getTileType(nr, nc); // Get tile type only if not a flyer
                            canMoveToTile = tt !== 'river' && tileIsEmpty; // Standard ground unit movement rules
                        }

                        if (canMoveToTile) {
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

    // Lógica para calcular acciones de curación para el Sanador.
    if (unitData.type === 'SANADOR') {
        const { healRange, healAmount } = UNIT_TYPES[unitData.type];
        if (healRange > 0 && healAmount > 0) { // Check if unit can heal
            // Comprueba las casillas adyacentes (según healRange) para unidades aliadas heridas.
            for (let ro = -healRange; ro <= healRange; ro++) {
                for (let co = -healRange; co <= healRange; co++) {
                    if (Math.abs(ro) + Math.abs(co) > healRange || (ro === 0 && co === 0)) continue; // Check Manhattan distance and ignore self tile

                    const tr = startR + ro;
                    const tc = startC + co;

                    if (tr >= 0 && tr < BOARD_ROWS && tc >= 0 && tc < BOARD_COLS) {
                        const targetUnitData = gameState.board[tr] ? gameState.board[tr][tc] : null;
                        if (targetUnitData &&
                            targetUnitData.player === unitData.player &&
                            targetUnitData.id !== unitData.id &&
                            targetUnitData.hp < targetUnitData.maxHp) {

                            const healAction = {
                                unitId: unitData.id,
                                fromR: startR,
                                fromC: startC,
                                row: tr,
                                col: tc,
                                type: 'heal',
                                targetId: targetUnitData.id,
                                healAmount: healAmount // Store heal amount for action
                            };
                            possibleActions.push(healAction);
                            if (updateGlobalHighlights) {
                                gameState.highlightedMoves.push(healAction);
                            }
                        }
                    }
                }
            }
        }
    }
    return possibleActions;
}
