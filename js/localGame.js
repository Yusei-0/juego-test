// gameState will be passed as an argument to functions needing it from main.js
import { BOARD_ROWS, BOARD_COLS, TILE_SIZE, UNIT_TYPES, UNIT_CANVAS_SIZE } from './constants.js';
// unitDrawFunctions is imported in ui.js where createUnitElement is now located
import { playSound } from './sound.js';
// Removed unitLayerElement from this import
import { addLogEntry, renderHighlightsAndInfo, renderUnitRosterLocal, gameBoardElement, aiTurnIndicator, showEndGameModal, createUnitElement } from './ui.js';
import { aiTakeTurn } from './ai.js';
import { calculatePossibleMovesAndAttacksForUnit, clearHighlightsAndSelection } from './gameActions.js';
import { getTileType, createUnitData } from './boardUtils.js'; // Updated imports

export function initializeLocalBoardAndUnits(gameState, onTileClickCallback) {
    gameState.board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
    gameState.units = {};
    gameState.riverCanvases = [];

    // 1. Clear gameBoardElement first. This removes unitLayer if it was a child.
    if (gameBoardElement) gameBoardElement.innerHTML = '';

    // 2. Ensure unitLayerElement (fetched dynamically)
    //    is a child of gameBoardElement.
    let uLayer = document.getElementById('unitLayer');
    if (gameBoardElement && uLayer) {
        if (!gameBoardElement.contains(uLayer)) {
            // If unitLayer is not a child of gameBoard, it might be an error
            // or it might be elsewhere in the DOM (e.g. if HTML structure changed).
            // For now, we'll attempt to append it as the original logic did.
            // However, the original HTML places it correctly.
            gameBoardElement.appendChild(uLayer);
        }
    } else if (!uLayer) {
        console.error("initializeLocalBoardAndUnits: 'unitLayer' element not found in DOM during re-parenting check.");
    }


    // 3. Now that unitLayerElement is confirmed to be in the DOM and ideally attached to gameBoard,
    //    clear its contents (old units).
    uLayer = document.getElementById('unitLayer'); // Re-fetch, especially if it was just appended.
    if (uLayer) {
        uLayer.innerHTML = '';
    } else {
        console.error("initializeLocalBoardAndUnits: 'unitLayer' element not found in DOM before clearing contents.");
    }

    // 4. Apply styles
    uLayer = document.getElementById('unitLayer'); // Re-fetch for styling.
    if (uLayer) {
        uLayer.style.width = `${BOARD_COLS * TILE_SIZE}px`;
        uLayer.style.height = `${BOARD_ROWS * TILE_SIZE}px`;
    } else {
        console.error("initializeLocalBoardAndUnits: 'unitLayer' element not found in DOM before applying styles.");
    }

    if (gameBoardElement) {
        gameBoardElement.style.gridTemplateColumns = `repeat(${BOARD_COLS}, ${TILE_SIZE}px)`;
        gameBoardElement.style.gridTemplateRows = `repeat(${BOARD_ROWS}, ${TILE_SIZE}px)`;
    }

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const tile = document.createElement('div');
            const tileType = getTileType(r, c); // From boardUtils.js
            tile.classList.add('tile', tileType);
            tile.dataset.row = r;
            tile.dataset.col = c;
            if (tileType === 'river') {
                const canvas = document.createElement('canvas');
                canvas.width = TILE_SIZE; canvas.height = TILE_SIZE;
                canvas.classList.add('river-canvas');
                tile.appendChild(canvas);
                gameState.riverCanvases.push(canvas.getContext('2d'));
            }
            tile.addEventListener('click', () => onTileClickCallback(r, c));
            if(gameBoardElement) gameBoardElement.appendChild(tile);
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

    gameState.currentPlayer = 1;
    gameState.localPlayerNumber = 1;
    gameState.selectedUnit = null;
    gameState.highlightedMoves = [];
    gameState.gameActive = true;
    gameState.isAnimating = false;
    gameState.gameLog = [];
    addLogEntry(gameState, "Nueva partida " + (gameState.gameMode || 'Local') + " iniciada.", "system");
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

    targetData.hp -= attackerData.attack;
    addLogEntry(gameState, `${UNIT_TYPES[targetData.type].name} (J${targetData.player}) recibe ${attackerData.attack} daño. PV: ${Math.max(0,targetData.hp)}.`, 'damage');
    playSound('damage', targetData.hp<=0?'A2':'A3');
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
    if (gameState.gameActive && !canPlayerMakeAnyMoveLocal(gameState)) {
        endGameLocal(gameState, gameState.currentPlayer === 1 ? 2 : 1, "Sin Movimientos"); return;
    }
    renderHighlightsAndInfo(gameState);
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

export function updateUnitHPDisplay(gameState, unitData) {
    if (unitData && gameState.selectedUnit && gameState.selectedUnit.data && gameState.selectedUnit.data.id === unitData.id) {
        const unitHealthText = document.getElementById('unitHealth');
        if (unitHealthText) {
            unitHealthText.textContent = `${Math.max(0, unitData.hp)}/${unitData.maxHp}`;
        }
    }
}
