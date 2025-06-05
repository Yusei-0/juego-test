// gameState will be passed as an argument to functions needing it from main.js
import { BOARD_ROWS, BOARD_COLS, TILE_SIZE, UNIT_TYPES, UNIT_CANVAS_SIZE } from './constants.js';
// unitDrawFunctions is imported in ui.js where createUnitElement is now located
import { playSound } from './sound.js';
import { addLogEntry, renderHighlightsAndInfo, renderUnitRosterLocal, gameBoardElement, unitLayerElement, aiTurnIndicator, showEndGameModal, createUnitElement, surrenderBtn, showNotification, updateUnitHPDisplay } from './ui.js'; // Added showNotification, updateUnitHPDisplay
import { aiTakeTurn } from './ai.js';
import { calculatePossibleMovesAndAttacksForUnit, clearHighlightsAndSelection } from './gameActions.js';
import { getTileType, createUnitData } from './boardUtils.js'; // Updated imports

export function initializeLocalBoardAndUnits(gameState, onTileClickCallback) {
    gameState.board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
    gameState.units = {};
    gameState.riverCanvases = [];

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

    // Player 1 Units - Start with only the Base
    placeUnit(createUnitData('BASE', 1, 0), BOARD_ROWS - 1, Math.floor(BOARD_COLS / 2));

    // Player 2 Units - Start with only the Base
    placeUnit(createUnitData('BASE', 2, 0), 0, Math.floor(BOARD_COLS / 2));

    gameState.currentPlayer = 1;
    gameState.player1MagicPoints = 50;
    gameState.player2MagicPoints = 50;
    gameState.localPlayerNumber = 1;
    gameState.selectedUnit = null;
    gameState.highlightedMoves = [];
    gameState.gameActive = true;
    gameState.isAnimating = false;
    gameState.gameLog = [];
    gameState.isSummoning = false;
    gameState.unitToSummonType = null;
    gameState.nextSummonedUnitId = 100; // Initial ID for summoned units

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
    const POINTS_PER_KILL = 10; // Points awarded for a kill

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

        // Award points for the kill
        const attackerMagicPointsKey = attackerData.player === 1 ? 'player1MagicPoints' : 'player2MagicPoints';
        gameState[attackerMagicPointsKey] += POINTS_PER_KILL;
        addLogEntry(gameState, `Jugador ${attackerData.player} ganó ${POINTS_PER_KILL} puntos de magia por eliminar un ${UNIT_TYPES[targetData.type].name}.`, 'info');

        // Update UI to reflect changes (roster and magic points)
        renderUnitRosterLocal(gameState);
        renderHighlightsAndInfo(gameState); // This will call updateInfoDisplay which should show new magic points

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
    const abilityCost = UNIT_TYPES.SANADOR.abilityCost;
    const currentMagicPointsKey = gameState.currentPlayer === 1 ? 'player1MagicPoints' : 'player2MagicPoints';

    if (gameState[currentMagicPointsKey] < abilityCost) {
        showNotification("Habilidad Fallida", "No hay suficientes puntos de magia para curar.");
        addLogEntry(gameState, `Jugador ${gameState.currentPlayer} intentó curar pero no tiene suficientes puntos de magia (${abilityCost} requeridos).`, 'error');
        gameState.isAnimating = false; // Ensure animation state is reset
        clearHighlightsAndSelection(gameState); // Clear selection and action highlights
        renderHighlightsAndInfo(gameState); // Update UI
        return; // Prevent healing and turn switch
    }

    // Deduct cost if sufficient points
    gameState[currentMagicPointsKey] -= abilityCost;
    addLogEntry(gameState, `Jugador ${gameState.currentPlayer} gastó ${abilityCost} puntos de magia para curar.`, 'info');

    // Set isAnimating true after cost deduction and before async operations
    gameState.isAnimating = true;
    clearHighlightsAndSelection(gameState); // Clear selection after action is confirmed
    // renderHighlightsAndInfo will be called by switchTurnLocal, or explicitly if needed for magic points update sooner

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
        updateUnitHPDisplay(gameState, targetData); // Update HP display for selected unit if it's the target
        renderUnitRosterLocal(gameState); // Update roster

        await new Promise(r => setTimeout(r, 300)); // Duration for the 'healed' effect
        if (targetElement) targetElement.classList.remove('unit-healed');
    }

    // Explicitly call renderHighlightsAndInfo to update magic points display immediately
    // This is important because switchTurnLocal also calls it, but we want the current player's magic points updated *before* the turn switches.
    renderHighlightsAndInfo(gameState);

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

export function summonUnitLocal(gameState, unitType, row, col) {
    if (!UNIT_TYPES[unitType]) {
        console.error(`LOCAL_GAME: Invalid unit type "${unitType}" for summoning.`);
        addLogEntry(gameState, `Error: Intento de invocar tipo de unidad inválido: ${unitType}`, 'system');
        return;
    }
    const unitDetails = UNIT_TYPES[unitType];
    const currentMagicPointsKey = gameState.currentPlayer === 1 ? 'player1MagicPoints' : 'player2MagicPoints';

    if (gameState[currentMagicPointsKey] < unitDetails.summonCost) {
        console.error('LOCAL_GAME: Not enough magic points for summon (final check failed).');
        addLogEntry(gameState, `Error: Puntos mágicos insuficientes para invocar ${unitDetails.name} (falló chequeo final).`, 'system');
        // This case should ideally be prevented by UI disabling buttons,
        // but as a safeguard, we don't proceed.
        return;
    }

    // Deduct cost
    gameState[currentMagicPointsKey] -= unitDetails.summonCost;

    // Generate new unit ID
    const newUnitId = 's' + gameState.nextSummonedUnitId++; // 's' for summoned, e.g., "s100", "s101"

    // Create unit data
    const newUnitData = createUnitData(unitType, gameState.currentPlayer, newUnitId);
    newUnitData.row = row;
    newUnitData.col = col;

    // Place on board (logical state)
    if (!gameState.board[row]) gameState.board[row] = []; // Should not happen if board is pre-initialized fully
    gameState.board[row][col] = newUnitData;

    // Create UI element and add to gameState.units
    createUnitElement(gameState, newUnitData);
    playSound('summon', 'A4'); // Example summon sound

    addLogEntry(gameState, `Jugador ${gameState.currentPlayer} invocó a ${unitDetails.name} en (${row}, ${col}) por ${unitDetails.summonCost} puntos.`, 'summon');

    // Update UI (magic points, roster, etc.)
    // renderHighlightsAndInfo also calls updateInfoDisplay and updateSelectedUnitInfoPanel
    renderHighlightsAndInfo(gameState);
    renderUnitRosterLocal(gameState); // Explicitly update roster to show new unit count/HP

    // Switch turn
    switchTurnLocal(gameState);
}
