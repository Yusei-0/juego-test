// gameState will be passed as an argument to functions needing it from main.js
import { BOARD_ROWS, BOARD_COLS, TILE_SIZE, UNIT_TYPES, UNIT_CANVAS_SIZE, RIVER_START_ROW, RIVER_END_ROW, BRIDGE_COL_1, BRIDGE_COL_2 } from './constants.js';
// unitDrawFunctions is imported in ui.js where createUnitElement is now located
import { playSound } from './sound.js';
import { addLogEntry, renderHighlightsAndInfo, renderUnitRosterLocal, gameBoardElement, unitLayerElement, aiTurnIndicator, showEndGameModal, createUnitElement, surrenderBtn } from './ui.js';
import { aiTakeTurn } from './ai.js';
import { calculatePossibleMovesAndAttacksForUnit, clearHighlightsAndSelection } from './gameActions.js';
import { getTileType, createUnitData, generateTerrainFeatures, TILE_TYPE_MOUNTAIN, TILE_TYPE_FOREST, TILE_TYPE_SWAMP, TILE_TYPE_BRIDGE, TILE_TYPE_PRAIRIE } from './boardUtils.js'; // Updated imports
import { updateVisibility } from './visibility.js';
import { drawPrairieTile, drawMountainTile, drawForestTile, drawSwampTile, drawRiverTile } from './graphics.js'; // Import terrain drawing functions

export function initializeLocalBoardAndUnits(gameState, onTileClickCallback) {
    gameState.board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
    gameState.units = {};
    gameState.riverCanvases = [];

    // Generate terrain features
    const features = generateTerrainFeatures(BOARD_ROWS, BOARD_COLS, [], BOARD_ROWS - 2, 1, RIVER_START_ROW, RIVER_END_ROW, BRIDGE_COL_1, BRIDGE_COL_2);
    gameState.terrainFeatures = features;

    // 1. Clear gameBoardElement first. This removes unitLayer if it was a child.
    if (gameBoardElement) gameBoardElement.innerHTML = '';

    // 2. Ensure unitLayerElement (from ui.js, assumed to be the one from index.html)
    //    is a child of gameBoardElement.
    //    (unitLayerElement is already defined in the scope via import from ui.js)
    if (gameBoardElement && unitLayerElement) {
        if (!gameBoardElement.contains(unitLayerElement)) {
            gameBoardElement.appendChild(unitLayerElement);
        }
    }

    // 3. Now that unitLayerElement is confirmed to be in the DOM and attached to gameBoard,
    //    clear its contents (old units).
    if (unitLayerElement) unitLayerElement.innerHTML = '';

    // 4. Apply styles (these can remain here or be moved after unitLayer re-attachment)
    if (unitLayerElement) {
        unitLayerElement.style.width = `${BOARD_COLS * TILE_SIZE}px`;
        unitLayerElement.style.height = `${BOARD_ROWS * TILE_SIZE}px`;
    }
    if (gameBoardElement) {
        gameBoardElement.style.gridTemplateColumns = `repeat(${BOARD_COLS}, ${TILE_SIZE}px)`;
        gameBoardElement.style.gridTemplateRows = `repeat(${BOARD_ROWS}, ${TILE_SIZE}px)`;
    }

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const tile = document.createElement('div');
            // Pass terrainFeatures to getTileType
            const tileType = getTileType(r, c, gameState.terrainFeatures);
            tile.className = 'tile ' + tileType; // Use className to reset and apply specific type
            tile.dataset.row = r;
            tile.dataset.col = c;

            const canvas = document.createElement('canvas');
            canvas.width = TILE_SIZE;
            canvas.height = TILE_SIZE;
            const tileCtx = canvas.getContext('2d');

            if (tileType === 'player1-spawn') {
                tileCtx.fillStyle = '#ADD8E6'; // Light Blue
                tileCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            } else if (tileType === 'player2-spawn') {
                tileCtx.fillStyle = '#F08080'; // Light Red
                tileCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            } else {
                // Only use the switch for non-spawn area terrain types
                switch (tileType) {
                    case 'river':
                        drawRiverTile(tileCtx, TILE_SIZE, TILE_SIZE, gameState.riverAnimationTime || 0); // Pass animation time
                        canvas.classList.add('river-canvas'); // Keep for animation updates
                        gameState.riverCanvases.push(tileCtx);
                        break;
                    case TILE_TYPE_MOUNTAIN:
                        drawMountainTile(tileCtx, TILE_SIZE, TILE_SIZE);
                        break;
                    case TILE_TYPE_FOREST:
                        drawForestTile(tileCtx, TILE_SIZE, TILE_SIZE);
                        break;
                    case TILE_TYPE_SWAMP:
                        drawSwampTile(tileCtx, TILE_SIZE, TILE_SIZE);
                        break;
                    case TILE_TYPE_PRAIRIE:
                        drawPrairieTile(tileCtx, TILE_SIZE, TILE_SIZE);
                        break;
                    case 'bridge':
                        // Style bridge directly or create a drawBridgeTile function
                        tileCtx.fillStyle = '#D2B48C'; // Tan color for bridge
                        tileCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                        tileCtx.strokeStyle = '#8B4513'; // Darker brown for wood grain/outline
                        tileCtx.lineWidth = 2;
                        for (let i = 0; i < TILE_SIZE; i += 10) { // Wood planks
                            tileCtx.moveTo(i, 0); tileCtx.lineTo(i, TILE_SIZE);
                            tileCtx.moveTo(0, i); tileCtx.lineTo(TILE_SIZE, i);
                        }
                        tileCtx.stroke();
                        break;
                    // player1-spawn and player2-spawn are handled above, so they won't hit the default
                    default:
                        drawPrairieTile(tileCtx, TILE_SIZE, TILE_SIZE); // Default to prairie for any other unhandled types
                        break;
                }
            }
            tile.appendChild(canvas);
            tile.addEventListener('click', () => onTileClickCallback(r, c));
            if (gameBoardElement) gameBoardElement.appendChild(tile);
        }
    }

    const placeUnit = (unitData, r, c) => {
        unitData.row = r; unitData.col = c;
        gameState.board[r][c] = unitData;
        createUnitElement(gameState, unitData); // From ui.js
    };

    // Player 1 Units (IDs 0-4)
    placeUnit(createUnitData('BASE', 1, 0), BOARD_ROWS - 1, Math.floor(BOARD_COLS / 2));
    placeUnit(createUnitData('GUERRERO', 1, 1), BOARD_ROWS - 2, Math.floor(BOARD_COLS / 2) - 1);
    placeUnit(createUnitData('ARQUERO', 1, 2), BOARD_ROWS - 2, Math.floor(BOARD_COLS / 2) + 1);
    placeUnit(createUnitData('GIGANTE', 1, 3), BOARD_ROWS - 3, Math.floor(BOARD_COLS / 2));
    // Coloca unidades adicionales (Sanador y Unidad Voladora) para el Jugador 1
    placeUnit(createUnitData('SANADOR', 1, 4), BOARD_ROWS - 2, Math.floor(BOARD_COLS / 2) - 2); // New ID 4
    placeUnit(createUnitData('UNIDAD_VOLADORA', 1, 5), BOARD_ROWS - 2, Math.floor(BOARD_COLS / 2) + 2); // New ID 5

    // Player 2 Units (IDs 0-4, unique per player but can overlap with P1's IDs as they are prefixed p1- p2-)
    // For consistency with previous structure, using 0,1,2,3,4,5 as IDs
    placeUnit(createUnitData('BASE', 2, 0), 0, Math.floor(BOARD_COLS / 2));
    placeUnit(createUnitData('GUERRERO', 2, 1), 1, Math.floor(BOARD_COLS / 2) - 1);
    placeUnit(createUnitData('ARQUERO', 2, 2), 1, Math.floor(BOARD_COLS / 2) + 1);
    placeUnit(createUnitData('GIGANTE', 2, 3), 2, Math.floor(BOARD_COLS / 2));
    // Coloca unidades adicionales (Sanador y Unidad Voladora) para el Jugador 2
    placeUnit(createUnitData('SANADOR', 2, 4), 1, Math.floor(BOARD_COLS / 2) - 2); // New ID 4
    placeUnit(createUnitData('UNIDAD_VOLADORA', 2, 5), 1, Math.floor(BOARD_COLS / 2) + 2); // New ID 5

    // Store base locations
    let p1BaseUnit = null;
    let p2BaseUnit = null;
    for (const unitId in gameState.units) {
        const unitElement = gameState.units[unitId];
        const unitData = unitElement.__unitData; // Access the unit data stored on the element
        if (unitData) {
            if (unitData.type === 'BASE' && unitData.player === 1) {
                p1BaseUnit = unitData;
            } else if (unitData.type === 'BASE' && unitData.player === 2) {
                p2BaseUnit = unitData;
            }
        }
    }

    if (p1BaseUnit) {
        gameState.player1Base = { row: p1BaseUnit.row, col: p1BaseUnit.col, id: p1BaseUnit.id };
    } else {
        console.error("Player 1 Base not found after placement!");
        gameState.player1Base = { row: -1, col: -1, id: null }; // Fallback
    }
    if (p2BaseUnit) {
        gameState.player2Base = { row: p2BaseUnit.row, col: p2BaseUnit.col, id: p2BaseUnit.id };
    } else {
        console.error("Player 2 Base not found after placement!");
        gameState.player2Base = { row: -1, col: -1, id: null }; // Fallback
    }

    gameState.currentPlayer = 1;
    gameState.localPlayerNumber = 1;
    gameState.selectedUnit = null;
    gameState.highlightedMoves = [];
    gameState.gameActive = true;
    gameState.isAnimating = false;
    gameState.gameLog = [];

    if (surrenderBtn) {
        // If a bound handler for this gameState already exists, remove it first
        if (gameState.boundHandleSurrenderLocal) {
            surrenderBtn.removeEventListener('click', gameState.boundHandleSurrenderLocal);
        }
        // Create a new bound handler function for the current gameState
        gameState.boundHandleSurrenderLocal = () => handleSurrenderLocal(gameState);
        surrenderBtn.addEventListener('click', gameState.boundHandleSurrenderLocal);
    }

    addLogEntry(gameState, "Nueva partida " + (gameState.gameMode || 'Local') + " iniciada.", "system");

    updateVisibility(gameState); // Initial visibility calculation

    renderUnitRosterLocal(gameState);
     if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiPlayerNumber) {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'block';
        setTimeout(() => aiTakeTurn(gameState), 1000);
    } else {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';
    }
}

export async function moveUnitAndAnimateLocal(gameState, unitData, toR, toC) {
    gameState.isAnimating = true;
    clearHighlightsAndSelection(gameState);
    renderHighlightsAndInfo(gameState);
    const unitElement = gameState.units[unitData.id];
    const fromR = unitData.row; const fromC = unitData.col;
    addLogEntry(gameState, `Unidad ${UNIT_TYPES[unitData.type].name} (J${unitData.player}) se mueve de (${fromR},${fromC}) a (${toR},${toC}).`, 'move');
    playSound('move', 'E4');
    const targetTransform = `translate(${toC * TILE_SIZE}px, ${toR * TILE_SIZE}px)`;
    unitElement.style.transform = targetTransform;
    await new Promise(resolve => unitElement.addEventListener('transitionend', resolve, {once: true}));
    gameState.board[toR][toC] = unitData;
    gameState.board[fromR][fromC] = null;
    unitData.row = toR; unitData.col = toC;
    gameState.isAnimating = false;
    if (gameState.gameActive) switchTurnLocal(gameState);
}

export async function attackUnitAndAnimateLocal(gameState, attackerData, targetData) {
    if (!attackerData || !targetData || attackerData.player === targetData.player) {
        gameState.isAnimating = false; return;
    }
    gameState.isAnimating = true;
    clearHighlightsAndSelection(gameState);
    renderHighlightsAndInfo(gameState);
    const attackerElement = gameState.units[attackerData.id];
    const targetElement = gameState.units[targetData.id];
    addLogEntry(gameState, `Unidad ${UNIT_TYPES[attackerData.type].name} (J${attackerData.player}) ataca a ${UNIT_TYPES[targetData.type].name} (J${targetData.player}).`, 'attack');
    playSound('attack');
    const originalAttackerTransform = `translate(${attackerData.col*TILE_SIZE}px, ${attackerData.row*TILE_SIZE}px)`;
    const lungeDx = (targetData.col-attackerData.col)*TILE_SIZE/4;
    const lungeDy = (targetData.row-attackerData.row)*TILE_SIZE/4;
    attackerElement.style.transform = `translate(${attackerData.col*TILE_SIZE+lungeDx}px, ${attackerData.row*TILE_SIZE+lungeDy}px)`;
    await new Promise(r=>setTimeout(r,150));
    attackerElement.style.transform=originalAttackerTransform;
    await new Promise(r=>setTimeout(r,150));

    // Shield and Damage Calculation
    const defenderTileType = getTileType(targetData.row, targetData.col, gameState.terrainFeatures);
    const baseShield = UNIT_TYPES[targetData.type].shield !== undefined ? UNIT_TYPES[targetData.type].shield : 0;
    let effectiveShield = baseShield;

    if (defenderTileType === TILE_TYPE_MOUNTAIN) {
        effectiveShield += 2;
    } else if (defenderTileType === TILE_TYPE_FOREST) {
        effectiveShield += 2;
    } else if (defenderTileType === TILE_TYPE_BRIDGE) { // Assuming TILE_TYPE_BRIDGE is exported from boardUtils
        effectiveShield -= 1;
    } else if (defenderTileType === TILE_TYPE_SWAMP) {
        effectiveShield -= 1;
    }
    effectiveShield = Math.max(0, effectiveShield); // Ensure shield doesn't go below 0

    const damage = Math.max(0, attackerData.attack - effectiveShield);
    targetData.hp -= damage;

    addLogEntry(gameState, `${UNIT_TYPES[targetData.type].name} (J${targetData.player}) recibe ${damage} daño (escudo: ${effectiveShield}). PV: ${Math.max(0,targetData.hp)}.`, 'damage');
    playSound('damage', targetData.hp<=0 ? 'A2' : 'A3');
    if (targetElement) {
        targetElement.classList.add('unit-damaged');
        updateUnitHPDisplay(gameState, targetData);
        renderUnitRosterLocal(gameState);
        await new Promise(r=>targetElement.addEventListener('animationend',r,{once:true}));
        targetElement.classList.remove('unit-damaged');
    }

    if(targetData.hp<=0){
        addLogEntry(gameState, `¡${UNIT_TYPES[targetData.type].name} (J${targetData.player}) destruido!`, 'death');
        playSound('death');
        if (targetElement) {
            const currentTransform = targetElement.style.transform;
            targetElement.style.transform = `${currentTransform} scale(0.3) rotate(720deg)`;
            targetElement.style.opacity = '0';
            await new Promise(r=>{
                const endHandler = (e) => {
                    if(e.propertyName==='opacity'||e.propertyName==='transform'){
                        targetElement.removeEventListener('transitionend',endHandler);
                        if(targetElement.parentElement)targetElement.remove();
                        r();
                    }
                };
                targetElement.addEventListener('transitionend',endHandler);
            });
        }
        gameState.board[targetData.row][targetData.col]=null;
        delete gameState.units[targetData.id];
        renderUnitRosterLocal(gameState);
        if(targetData.type==='BASE'){
            endGameLocal(gameState, attackerData.player,"Base Destruida");
            gameState.isAnimating=false; return;
        }
    }
    gameState.isAnimating=false;
    if(gameState.gameActive) switchTurnLocal(gameState);
}

export function switchTurnLocal(gameState) {
    clearHighlightsAndSelection(gameState);
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    addLogEntry(gameState, `Turno del Jugador ${gameState.currentPlayer}.`, 'turn');
    playSound('turn', gameState.currentPlayer === 1 ? 'G5' : 'A5');

    updateVisibility(gameState); // Update visibility for the new current player

    if (gameState.gameActive && !canPlayerMakeAnyMoveLocal(gameState)) {
        endGameLocal(gameState, gameState.currentPlayer === 1 ? 2 : 1, "Sin Movimientos"); return;
    }
    renderHighlightsAndInfo(gameState); // Render highlights AFTER visibility is updated
    renderUnitRosterLocal(gameState);
    if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiPlayerNumber && gameState.gameActive) {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'block';
        setTimeout(() => aiTakeTurn(gameState), 1200);
    } else {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';
    }
}

export function endGameLocal(gameState, winner, reason = "Condición de Victoria") {
    gameState.gameActive = false;
    if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';
    showEndGameModal(winner, reason);
    addLogEntry(gameState, `¡JUEGO TERMINADO! Jugador ${winner} ha ganado. Razón: ${reason}.`, 'death');
    clearHighlightsAndSelection(gameState);
    renderHighlightsAndInfo(gameState);
}

export function canPlayerMakeAnyMoveLocal(gameState) {
    const playerNumber = gameState.currentPlayer; // In local/AI, current player is the one to check
    for (const unitId in gameState.units) {
        const unitElement = gameState.units[unitId];
        const unitData = unitElement.__unitData;
        if (unitData && unitData.player === playerNumber && UNIT_TYPES[unitData.type].isMobile) {
            const possibleActions = calculatePossibleMovesAndAttacksForUnit(gameState, unitData, false);
            if (possibleActions.length > 0) return true;
        }
    }
    return false;
}

// Realiza la acción de curar a una unidad aliada.
export async function performHealLocal(gameState, healerData, targetData, healAmount) {
    gameState.isAnimating = true;
    clearHighlightsAndSelection(gameState);
    renderHighlightsAndInfo(gameState);

    addLogEntry(gameState, `Unidad ${UNIT_TYPES[healerData.type].name} (J${healerData.player}) cura a ${UNIT_TYPES[targetData.type].name} (J${targetData.player}) por ${healAmount} PV.`, 'heal');

    const oldHp = targetData.hp;
    // Aplica la curación, sin exceder los PV máximos.
    targetData.hp = Math.min(targetData.maxHp, targetData.hp + healAmount);
    addLogEntry(gameState, `${UNIT_TYPES[targetData.type].name} (J${targetData.player}) PV: ${oldHp} -> ${targetData.hp}.`, 'info');

    playSound('heal', 'C5'); // Placeholder sound

    // Feedback visual simple para la curación.
    const targetElement = gameState.units[targetData.id];
    if (targetElement) {
        targetElement.classList.add('unit-healed');
        updateUnitHPDisplay(gameState, targetData);
        renderUnitRosterLocal(gameState);

        await new Promise(r => setTimeout(r, 300)); // Duration for the 'healed' effect
        if (targetElement) targetElement.classList.remove('unit-healed');
    }

    gameState.isAnimating = false;
    if (gameState.gameActive) switchTurnLocal(gameState);
}

function handleSurrenderLocal(gameState) {
    if (!gameState || !gameState.gameActive) return;

    const surrenderingPlayer = gameState.currentPlayer;
    const winningPlayer = surrenderingPlayer === 1 ? 2 : 1;
    addLogEntry(gameState, `Jugador ${surrenderingPlayer} se ha rendido.`, 'system');
    endGameLocal(gameState, winningPlayer, "Rendición");
}

export function updateUnitHPDisplay(gameState, unitData) {
    if (unitData && gameState.selectedUnit && gameState.selectedUnit.data && gameState.selectedUnit.data.id === unitData.id) {
        const unitHealthText = document.getElementById('unitHealth');
        if (unitHealthText) {
            unitHealthText.textContent = `${Math.max(0, unitData.hp)}/${unitData.maxHp}`;
        }
    }
}
