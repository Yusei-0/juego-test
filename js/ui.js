import { UNIT_TYPES, TILE_SIZE, UNIT_CANVAS_SIZE } from './constants.js';
import { playSound } from './sound.js';
import { unitDrawFunctions } from './graphics.js';
import { tutorialHTMLContent } from './tutorial_content.js'; // New

// Module-level references for gameState and gameActions
let currentGameStateRef = null;
let gameActionsRef = null;

// DOM Element References
export const authLoadingScreen = document.getElementById('authLoadingScreen');
export const mainMenuScreen = document.getElementById('mainMenuScreen');
export const difficultyScreen = document.getElementById('difficultyScreen');
export const onlineLobbyScreen = document.getElementById('onlineLobbyScreen');
export const tutorialScreen = document.getElementById('tutorialScreen'); // New
export const tutorialContentElement = document.getElementById('tutorialContent'); // New
export const backToMainMenuBtn_Tutorial = document.getElementById('backToMainMenuBtn_Tutorial'); // New
export const patchNotesScreen = document.getElementById('patchNotesScreen');
export const patchVersionSelector = document.getElementById('patchVersionSelector');
export const patchNotesContent = document.getElementById('patchNotesContent');
export const backToMainMenuBtn_PatchNotes = document.getElementById('backToMainMenuBtn_PatchNotes');
export const gameContainer = document.getElementById('gameContainer');
export const localMultiplayerBtn = document.getElementById('localMultiplayerBtn');
export const vsAIBtn = document.getElementById('vsAIBtn');
export const onlineMultiplayerBtn = document.getElementById('onlineMultiplayerBtn');
export const aiEasyBtn = document.getElementById('aiEasyBtn');
export const aiMediumBtn = document.getElementById('aiMediumBtn');
export const aiHardBtn = document.getElementById('aiHardBtn');
export const backToMainMenuBtn_Diff = document.getElementById('backToMainMenuBtn_Diff');
export const playerUserIdDisplay_Lobby = document.getElementById('playerUserIdDisplay_Lobby');
export const createGameBtn_Lobby = document.getElementById('createGameBtn_Lobby');
export const joinGameIdInput_Lobby = document.getElementById('joinGameIdInput_Lobby');
export const joinGameBtn_Lobby = document.getElementById('joinGameBtn_Lobby');
export const backToMainMenuBtn_Lobby = document.getElementById('backToMainMenuBtn_Lobby');
export const waitingRoomScreen = document.getElementById('waitingRoomScreen');
export const waitingGameIdDisplay = document.getElementById('waitingGameIdDisplay');
export const waitingStatusText = document.getElementById('waitingStatusText');
export const playerListDiv = document.getElementById('playerList');
export const leaveWaitingRoomBtn = document.getElementById('leaveWaitingRoomBtn');
export const gameBoardElement = document.getElementById('gameBoard');
export const unitLayerElement = document.getElementById('unitLayer');
// export const currentPlayerText = document.getElementById('currentPlayerText'); // Removed
// export const playerRoleDisplay = document.getElementById('playerRoleDisplay'); // Removed
export const gameModeInfoDisplay = document.getElementById('gameModeInfoDisplay');
export const gameIdInfoDisplay = document.getElementById('gameIdInfoDisplay');
export const aiTurnIndicator = document.getElementById('aiTurnIndicator');
export const unitNameText = document.getElementById('unitName');
export const unitHealthText = document.getElementById('unitHealth');
export const unitAttackText = document.getElementById('unitAttack');
export const unitMovementText = document.getElementById('unitMovement');
// export const gameLogDisplay = document.getElementById('gameLogDisplay'); // Removed
export const unitRosterPanel = document.getElementById('unitRosterPanel');
export const generalLeaveGameBtn = document.getElementById('generalLeaveGameBtn');
export const gameOverModal = document.getElementById('gameOverModal');
export const gameOverMessage = document.getElementById('gameOverMessage');
export const modalLeaveGameBtn = document.getElementById('modalLeaveGameBtn');
export const notificationModal = document.getElementById('notificationModal');
export const notificationTitle = document.getElementById('notificationTitle');
export const notificationMessageText = document.getElementById('notificationMessageText');
export const notificationOkBtn = document.getElementById('notificationOkBtn');
export const surrenderBtn = document.getElementById('surrenderBtn');
export const summonUnitBtn = document.getElementById('summonUnitBtn');
export const summonUnitModal = document.getElementById('summonUnitModal');
export const closeSummonModal = document.getElementById('closeSummonModal');
export const summonModalMagicPoints = document.getElementById('summonModalMagicPoints');
export const summonUnitList = document.getElementById('summonUnitList');

// Moved from localGame.js
export function createUnitElement(gameState, unitData) {
    const unitElement = document.createElement('div');
    unitElement.id = unitData.id;
    unitElement.classList.add('unit', unitData.player === 1 ? 'unit-p1' : 'unit-p2');

    const canvas = document.createElement('canvas');
    canvas.width = UNIT_CANVAS_SIZE;
    canvas.height = UNIT_CANVAS_SIZE;
    unitElement.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const drawFunction = unitDrawFunctions[unitData.drawFuncKey];
    if (drawFunction) {
        drawFunction(ctx, UNIT_CANVAS_SIZE, unitData.player === 1);
    } else {
        ctx.fillStyle = 'magenta';
        ctx.fillRect(0,0, UNIT_CANVAS_SIZE, UNIT_CANVAS_SIZE);
    }

    unitElement.style.transform = `translate(${unitData.col * TILE_SIZE}px, ${unitData.row * TILE_SIZE}px)`;
    unitElement.__unitData = unitData;

    if (unitLayerElement) {
        unitLayerElement.appendChild(unitElement);
    } else {
        console.error("unitLayerElement is not available in createUnitElement");
    }

    gameState.units[unitData.id] = unitElement;
    return unitElement;
}

// UI Functions
export function showNotification(title, message) {
    if(notificationTitle) notificationTitle.textContent = title;
    if(notificationMessageText) notificationMessageText.textContent = message;
    if(notificationModal) notificationModal.style.display = "flex";
}

export function showScreen(screenId) {
    console.log(`showScreen called for: ${screenId}`);
    const screensToManage = [
        { name: "authLoadingScreen", el: authLoadingScreen },
        { name: "mainMenuScreen", el: mainMenuScreen },
        { name: "difficultyScreen", el: difficultyScreen },
        { name: "onlineLobbyScreen", el: onlineLobbyScreen },
        { name: "waitingRoomScreen", el: waitingRoomScreen },
        { name: "gameContainer", el: gameContainer },
        { name: "gameOverModal", el: gameOverModal },
        { name: "tutorialScreen", el: tutorialScreen },
        { name: "patchNotesScreen", el: patchNotesScreen }
    ];

    screensToManage.forEach(screen => {
        if (screen.el) {
            if (screen.el.id === screenId) {
                console.log(`Showing ${screen.name} (id: ${screen.el.id})`);
                screen.el.style.display = 'flex'; // Or 'block' if that's more appropriate for some. 'flex' is common for these screens.
            } else {
                // console.log(`Hiding ${screen.name} (id: ${screen.el.id})`); // This might be too verbose
                screen.el.style.display = 'none';
            }
        } else {
            console.warn(`Screen element "${screen.name}" is null or undefined.`);
        }
    });

    // Special case for gameContainer if its display needs to be 'flex' specifically
    // and it's different from other screens, though current CSS uses 'flex' for menu-screen too.
    // This might be redundant if gameContainer is handled correctly above.
    // For now, the loop above should handle it if screenId matches gameContainer.id.
    // Example: if (screenId === 'gameContainer' && gameContainer) gameContainer.style.display = 'flex';

    if (surrenderBtn) {
        if (screenId === 'gameContainer') {
            surrenderBtn.style.display = 'block';
            if (summonUnitBtn) summonUnitBtn.style.display = 'block'; // Show summon button too
        } else {
            surrenderBtn.style.display = 'none';
            if (summonUnitBtn) summonUnitBtn.style.display = 'none'; // Hide summon button too
        }
    }
}

export function showSummonUnitModal(gameState) {
    if (!summonUnitModal || !summonModalMagicPoints || !summonUnitList) {
        console.error("Summon modal elements not found for showing.");
        return;
    }

    summonUnitModal.style.display = 'flex';
    let currentMagicPoints = 0;
    if (gameState.currentPlayer === 1 && gameState.player1MagicPoints !== undefined) {
        currentMagicPoints = gameState.player1MagicPoints;
    } else if (gameState.currentPlayer === 2 && gameState.player2MagicPoints !== undefined) {
        currentMagicPoints = gameState.player2MagicPoints;
    }
    summonModalMagicPoints.textContent = currentMagicPoints;

    summonUnitList.innerHTML = ''; // Clear previous options

    Object.entries(UNIT_TYPES).forEach(([typeKey, unitDetails]) => {
        if (typeKey === 'BASE') {
            return; // Skip BASE unit
        }

        const unitOption = document.createElement('div');
        unitOption.classList.add('summon-unit-option');

        const infoSpan = document.createElement('span');
        infoSpan.innerHTML = `${unitDetails.name} (Costo: ${unitDetails.summonCost})<br>PV: ${unitDetails.hp}, ATK: ${unitDetails.attack}, MOV: ${unitDetails.movement}, RNG: ${unitDetails.range}`;

        const summonBtn = document.createElement('button');
        summonBtn.textContent = 'Invocar'; // "Summon"
        summonBtn.dataset.unitType = typeKey;

        if (currentMagicPoints < unitDetails.summonCost) {
            summonBtn.disabled = true;
            summonBtn.title = "No tienes suficientes puntos mágicos.";
        }

        summonBtn.addEventListener('click', (event) => {
            // Prevent the modal from closing if the click is on a disabled button,
            // or if we want to keep it open for other reasons.
            // event.stopPropagation();
            handleAttemptSummon(typeKey);
        });

        unitOption.appendChild(infoSpan);
        unitOption.appendChild(summonBtn);
        summonUnitList.appendChild(unitOption);
    });

    if (summonUnitList.children.length === 0) {
        summonUnitList.innerHTML = '<p><i>No hay unidades disponibles para invocar en este momento.</i></p>';
    }
}

function handleAttemptSummon(unitType) {
    if (gameActionsRef && typeof gameActionsRef.initiateSummonAction === 'function') {
        gameActionsRef.initiateSummonAction(currentGameStateRef, unitType);
        // hideSummonUnitModal is now called within initiateSummonAction in gameActions.js
        // If it weren't, it would be called here: hideSummonUnitModal();
    } else {
        console.error('UI: gameActionsRef or initiateSummonAction is not set up. Cannot attempt summon.');
        // Optionally, provide feedback to the user that the action cannot be performed.
    }
}

export function initializeSummonUI(gameState, gameActions) {
    currentGameStateRef = gameState;
    gameActionsRef = gameActions;
    console.log("Summon UI initialized with gameState and gameActions references.");
}

export function hideSummonUnitModal() {
    if (summonUnitModal) {
        summonUnitModal.style.display = 'none';
    } else {
        console.error("Summon modal not found for hiding.");
    }
}

export function updateInfoDisplay(gameState) {
    const playerTurnDisplayElement = document.querySelector('player-turn-display');
    if (!playerTurnDisplayElement) {
        console.error('PlayerTurnDisplay component not found in the DOM');
        // Attempt to update other elements even if player-turn-display is missing
    }

    let currentPlayerName = 'Jugador X'; // Default
    let playerRoleText = 'Rol: ---';    // Default
    let currentPlayerNumberString = '1'; // Default
    let currentMagicPoints = '--';

    if (gameState.gameMode === 'online' && gameState.currentFirebaseGameData) {
        const gd = gameState.currentFirebaseGameData;
        const currentTurnPlayerNumber = gd.currentPlayerId === gd.player1Id ? 1 : (gd.currentPlayerId === gd.player2Id ? 2 : 0);
        currentPlayerName = `Jugador ${currentTurnPlayerNumber}`;
        currentPlayerNumberString = currentTurnPlayerNumber.toString();
        if (gameState.localPlayerRole) {
            playerRoleText = `Eres: ${gameState.localPlayerRole} (Jugador ${gameState.localPlayerNumber})`;
        } else {
            playerRoleText = 'Espectador';
        }
    } else if (gameState.gameMode === 'local' || gameState.gameMode === 'vsAI') {
        currentPlayerName = `Jugador ${gameState.currentPlayer}`;
        currentPlayerNumberString = gameState.currentPlayer.toString();
        if (gameState.gameMode === 'vsAI') {
            playerRoleText = `Eres: Jugador 1`;
        } else { // Local multiplayer
            playerRoleText = `Turno Jugador ${gameState.currentPlayer}`;
        }
        // Get magic points for local or vsAI game
        currentMagicPoints = (gameState.currentPlayer === 1 ? gameState.player1MagicPoints : gameState.player2MagicPoints);
        if (typeof currentMagicPoints === 'undefined' || currentMagicPoints === null) {
            currentMagicPoints = '--'; // Handle undefined or null case
        }
    } else if (gameState.gameMode === 'online' && gameState.currentFirebaseGameData) {
        // Logic for online game magic points (assuming similar structure in Firebase)
        // This is a placeholder and might need adjustment based on actual Firebase data structure
        const gd = gameState.currentFirebaseGameData;
        if (gd.currentPlayerId === gd.player1Id && gd.player1Data) {
            currentMagicPoints = gd.player1Data.magicPoints !== undefined ? gd.player1Data.magicPoints : '--';
        } else if (gd.currentPlayerId === gd.player2Id && gd.player2Data) {
            currentMagicPoints = gd.player2Data.magicPoints !== undefined ? gd.player2Data.magicPoints : '--';
        } else {
            currentMagicPoints = '--';
        }
    }


    if (playerTurnDisplayElement) {
        playerTurnDisplayElement.setAttribute('player-name', currentPlayerName);
        playerTurnDisplayElement.setAttribute('player-role', playerRoleText);
        playerTurnDisplayElement.setAttribute('player-number', currentPlayerNumberString);
        playerTurnDisplayElement.setAttribute('magic-points', currentMagicPoints.toString());
    }

    if(gameModeInfoDisplay) gameModeInfoDisplay.textContent = `Modo: ${gameState.gameMode === 'vsAI' ? `VS IA (${gameState.aiDifficulty})` : (gameState.gameMode === 'online' ? 'Online' : 'Local')}`;
    if(gameIdInfoDisplay) gameIdInfoDisplay.textContent = gameState.currentGameId || "---";
    if(gameIdInfoDisplay) gameIdInfoDisplay.style.display = (gameState.gameMode === 'online' && gameState.currentGameId) ? 'block' : 'none';


    if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiPlayerNumber && gameState.gameActive) {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'block';
    } else {
        if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';
    }
}

// renderGameLog function removed as the component will handle its own rendering via addEntry or setEntries.

export function addLogEntry(gameState, message, type) {
    const newEntry = {
        text: message,
        type: type,
        timestamp: new Date().toISOString() // Keep ISOString for consistency
    };
    if (!gameState.gameLog) { // Ensure gameLog exists
        gameState.gameLog = [];
    }
    gameState.gameLog.unshift(newEntry);
    if (gameState.gameLog.length > 50) {
        gameState.gameLog.pop();
    }

    const gameLogComp = document.getElementById('gameLogElement');
    if (gameLogComp && typeof gameLogComp.addEntry === 'function') {
        gameLogComp.addEntry(message, type); // The component itself will format the timestamp for display
    } else {
        console.warn('game-log component or its addEntry method not found.');
    }
}

export function renderUnitRosterLocal(gameState) {
    if (!unitRosterPanel) return;
    unitRosterPanel.innerHTML = '';
    const title = document.createElement('p');
    title.classList.add('roster-title');
    title.textContent = `Unidades del Jugador ${gameState.currentPlayer}`;
    unitRosterPanel.appendChild(title);

    let unitsFound = false;
    if (gameState.units) { // Check if gameState.units is defined
        for (const unitId in gameState.units) {
            const unitElement = gameState.units[unitId];
            if (!unitElement || !unitElement.__unitData) continue; // Check if element and its data exist
            const unitData = unitElement.__unitData;

            if (unitData.player === gameState.currentPlayer) {
                unitsFound = true;
                const p = document.createElement('p');
                p.textContent = `${UNIT_TYPES[unitData.type].name}: ${unitData.hp}/${unitData.maxHp} PV`;
                p.classList.add(unitData.player === 1 ? 'unit-entry-p1' : 'unit-entry-p2');
                unitRosterPanel.appendChild(p);
            }
        }
    }
    if (!unitsFound) {
         const p = document.createElement('p');
         p.textContent = "Ninguna unidad activa.";
         p.classList.add("text-gray-500", "text-center");
         unitRosterPanel.appendChild(p);
    }
    unitRosterPanel.scrollTop = 0;
}

export function renderUnitRosterOnline(gameState) {
    if (!unitRosterPanel) return;
    unitRosterPanel.innerHTML = '';
    const title = document.createElement('p');
    title.classList.add('roster-title');

    let playerNumberForRoster = gameState.localPlayerNumber;
    if (gameState.currentFirebaseGameData && gameState.currentFirebaseGameData.currentPlayerId) {
         playerNumberForRoster = gameState.currentFirebaseGameData.currentPlayerId === gameState.currentFirebaseGameData.player1Id ? 1 : 2;
    }
    title.textContent = `Unidades del Jugador ${playerNumberForRoster}`;
    unitRosterPanel.appendChild(title);

    let unitsFound = false;
    const unitsToDisplay = gameState.currentFirebaseGameData ? gameState.currentFirebaseGameData.units : {};

    if (unitsToDisplay) { // Check if unitsToDisplay is defined
        for (const unitId in unitsToDisplay) {
            const unitData = unitsToDisplay[unitId];
            if (unitData && unitData.player === playerNumberForRoster) {
                unitsFound = true;
                const p = document.createElement('p');
                p.textContent = `${UNIT_TYPES[unitData.type].name}: ${unitData.hp}/${unitData.maxHp} PV`;
                p.classList.add(unitData.player === 1 ? 'unit-entry-p1' : 'unit-entry-p2');
                unitRosterPanel.appendChild(p);
            }
        }
    }
    if (!unitsFound) {
         const p = document.createElement('p');
         p.textContent = "Ninguna unidad activa.";
         p.classList.add("text-gray-500", "text-center");
         unitRosterPanel.appendChild(p);
    }
    unitRosterPanel.scrollTop = 0;
}

export function updateSelectedUnitInfoPanel(gameState) {
    if (gameState.selectedUnit && gameState.selectedUnit.data) {
        const unit = gameState.selectedUnit.data;
        const unitTypeData = UNIT_TYPES[unit.type];
        if(unitNameText) unitNameText.textContent = `${unitTypeData.name} (J${unit.player})`;
        if(unitHealthText) unitHealthText.textContent = `${unit.hp}/${unit.maxHp}`;
        if(unitAttackText) unitAttackText.textContent = unitTypeData.attack;
        if(unitMovementText) unitMovementText.textContent = unitTypeData.movement;
    } else {
        if(unitNameText) unitNameText.textContent = "Ninguna";
        if(unitHealthText) unitHealthText.textContent = "--";
        if(unitAttackText) unitAttackText.textContent = "--";
        if(unitMovementText) unitMovementText.textContent = "--";
    }
}

export function showEndGameModal(gameState, winner, reason) { // Added gameState for consistency, though not used directly
    if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';
    if (winner) {
        if(gameOverMessage) gameOverMessage.innerHTML = `¡Jugador ${winner} Gana!<br><span style="font-size:0.8em;color:#a0aec0;">(${reason})</span>`;
        if(gameOverMessage) gameOverMessage.className='';
        if(gameOverMessage) gameOverMessage.classList.add(winner===1?'winner-player1':'winner-player2');
    } else {
        if(gameOverMessage) gameOverMessage.innerHTML = `¡Empate!<br><span style="font-size:0.8em;color:#a0aec0;">(${reason})</span>`;
        if(gameOverMessage) gameOverMessage.className='';
    }
    if(gameOverModal) gameOverModal.style.display='flex';
    playSound('death','C4');
}

export function clearHighlightsAndSelection(gameState) {
    if (gameState) {
        gameState.selectedUnit = null;
        gameState.highlightedMoves = [];
        // The calling context (e.g., in onlineGame.js)
        // is responsible for calling renderHighlightsAndInfo if needed
        // after clearing these values.
    } else {
        console.warn('clearHighlightsAndSelection called without gameState');
    }
}

export function displayTutorial() {
    if (tutorialContentElement && tutorialScreen) {
        tutorialContentElement.innerHTML = tutorialHTMLContent;
        showScreen('tutorialScreen');
    } else {
        console.error("Tutorial screen or content element not found.");
        showNotification("Error", "No se pudo cargar el tutorial. Faltan elementos de la interfaz.");
    }
}

export function renderHighlightsAndInfo(gameState) {
    document.querySelectorAll('.tile.selected-unit-tile, .tile.possible-move, .tile.possible-attack, .tile.possible-heal, .tile.possible-summon-spawn-point')
        .forEach(el => el.classList.remove('selected-unit-tile', 'possible-move', 'possible-attack', 'possible-heal', 'possible-summon-spawn-point'));
    document.querySelectorAll('.unit.pulse-target').forEach(el => el.classList.remove('pulse-target'));

    if (gameState.selectedUnit && gameState.selectedUnit.data) { // Ensure selectedUnit and its data exist
        const unitData = gameState.selectedUnit.data;
        if(gameBoardElement) {
            const tileEl = gameBoardElement.querySelector(`.tile[data-row='${unitData.row}'][data-col='${unitData.col}']`);
            if (tileEl) tileEl.classList.add('selected-unit-tile');
        }
    }

    if (gameState.highlightedMoves) { // Ensure highlightedMoves exists
        gameState.highlightedMoves.forEach(move => {
            if(gameBoardElement) {
                const tileEl = gameBoardElement.querySelector(`.tile[data-row='${move.row}'][data-col='${move.col}']`);
                if (tileEl) {
                    if (move.type === 'move') {
                        tileEl.classList.add('possible-move');
                    } else if (move.type === 'attack') {
                        tileEl.classList.add('possible-attack');
                        // Pulse target logic for attack remains here
                        if (gameState.board[move.row] && gameState.board[move.row][move.col]) {
                            const targetUnitData = gameState.board[move.row][move.col];
                            if(targetUnitData && gameState.units[targetUnitData.id]) {
                                gameState.units[targetUnitData.id].classList.add('pulse-target');
                            }
                        }
                    } else if (move.type === 'heal') {
                        tileEl.classList.add('possible-heal'); // Resalta la casilla como un posible objetivo de curación.
                        // Optional: Pulse target logic for heal (e.g., make the heal target pulse green)
                        if (gameState.board[move.row] && gameState.board[move.row][move.col]) {
                            const targetUnitData = gameState.board[move.row][move.col];
                            if(targetUnitData && gameState.units[targetUnitData.id]) {
                                // Example: gameState.units[targetUnitData.id].classList.add('pulse-heal-target');
                            }
                        }
                    } else if (move.type === 'summon_spawn_point') {
                        tileEl.classList.add('possible-summon-spawn-point');
                    }
                }
            }
        });
    }
    updateInfoDisplay(gameState);
    updateSelectedUnitInfoPanel(gameState);
}

export function updateUnitHPDisplay(gameState, unitData) {
    // This function is called when a unit takes damage or is healed,
    // and it specifically updates the #unitHealth span in the #selectedUnitInfo panel
    // IF the affected unit is currently selected.
    if (unitData && gameState.selectedUnit && gameState.selectedUnit.data && gameState.selectedUnit.data.id === unitData.id) {
        // unitHealthText is a const defined at the top of ui.js
        if (unitHealthText) {
            unitHealthText.textContent = `${Math.max(0, unitData.hp)}/${unitData.maxHp}`;
        }
    }
    // Note: The overall unit roster display (renderUnitRosterLocal/Online) is updated separately
    // when units are added, removed, or their HP changes significantly (e.g., after an attack).
}

let allPatchNotes = {}; // Cache for parsed patch notes

async function fetchAndParsePatchNotes() {
    // Return cached if already fetched and not an error state, or if it's an error but we have no known versions to try.
    // This allows re-fetching if there was an error AND we have versions to try.
    const knownVersions = ['1.1.0', '1.0.0']; // Newest first for default selection
    if (Object.keys(allPatchNotes).length > 0 && !allPatchNotes["Error"]) {
        return allPatchNotes;
    }
    if (allPatchNotes["Error"] && knownVersions.length === 0) { // If error and no versions, don't retry
        return allPatchNotes;
    }

    allPatchNotes = {}; // Initialize/clear before fetching

    for (const version of knownVersions) {
        try {
            const response = await fetch(`patch_notes/${version}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for version ${version}`);
            }
            const markdownText = await response.text();
            allPatchNotes[version] = markdownText;
        } catch (error) {
            console.error(`Error fetching patch notes for version ${version}:`, error);
            // Optionally, store a specific error message for this version if needed,
            // or just let it be absent from allPatchNotes.
            // allPatchNotes[version] = `Error cargando notas para ${version}.`;
        }
    }

    if (Object.keys(allPatchNotes).length === 0) {
        console.warn("No patch notes could be loaded for any known version.");
        allPatchNotes = { "Error": "No se pudieron cargar las notas del parche o ninguna versión es conocida." };
    }

    return allPatchNotes;
}

function updatePatchNotesContent(version) {
    if (patchNotesContent && allPatchNotes[version]) {
        // Use innerHTML to render Markdown (assuming simple Markdown or future library use)
        // For security, if Markdown comes from untrusted sources, sanitize it.
        // For now, as it's from our own files, innerHTML is acceptable.
        // Consider using a Markdown library like 'marked' or 'showdown' for richer rendering.
        patchNotesContent.innerHTML = allPatchNotes[version].replace(/\n/g, '<br>'); // Basic conversion
    } else if (patchNotesContent) {
        patchNotesContent.innerHTML = "Notas no encontradas para esta versión."; // Use innerHTML here too
    }
}

export async function displayPatchNotes() {
    await fetchAndParsePatchNotes();

    if (patchVersionSelector) {
        patchVersionSelector.innerHTML = ''; // Clear existing options

        // The knownVersions array already has the desired order (newest first).
        // We will use this order, but only add versions that were successfully loaded.
        const availableVersions = Object.keys(allPatchNotes);

        if (availableVersions.includes("Error") && availableVersions.length === 1) {
            // Only "Error" is available
            const option = document.createElement('option');
            option.value = "Error";
            option.textContent = "Error al Cargar";
            patchVersionSelector.appendChild(option);
            updatePatchNotesContent("Error");
        } else {
            const knownVersions = ['1.1.0', '1.0.0']; // Must match fetchAndParsePatchNotes
            let defaultVersionSelected = false;

            knownVersions.forEach(version => {
                if (allPatchNotes[version]) { // Only add if this version was loaded
                    const option = document.createElement('option');
                    option.value = version;
                    option.textContent = `Versión ${version}`;
                    patchVersionSelector.appendChild(option);

                    if (!defaultVersionSelected) {
                        patchVersionSelector.value = version; // Select the first successfully loaded known version
                        updatePatchNotesContent(version);
                        defaultVersionSelected = true;
                    }
                }
            });

            // Fallback if no known versions loaded but other keys exist (e.g. old "General" or unexpected)
            if (!defaultVersionSelected && availableVersions.length > 0) {
                 const fallbackVersion = availableVersions.find(v => v !== "Error");
                 if (fallbackVersion) {
                    const option = document.createElement('option');
                    option.value = fallbackVersion;
                    option.textContent = fallbackVersion; // Display as is
                    patchVersionSelector.appendChild(option);
                    patchVersionSelector.value = fallbackVersion;
                    updatePatchNotesContent(fallbackVersion);
                 } else if (allPatchNotes["Error"]) { // If only error remains after filtering known
                    const option = document.createElement('option');
                    option.value = "Error";
                    option.textContent = "Error al Cargar";
                    patchVersionSelector.appendChild(option);
                    patchVersionSelector.value = "Error";
                    updatePatchNotesContent("Error");
                 }
            }

            if (patchVersionSelector.options.length === 0 && patchNotesContent) {
                // This case implies allPatchNotes was empty or only had "Error" which wasn't added if other versions were expected
                patchNotesContent.innerHTML = "No hay notas del parche disponibles o no se pudieron cargar.";
            }
        }
    }

    if (patchVersionSelector) {
        patchVersionSelector.removeEventListener('change', handleVersionChange);
        patchVersionSelector.addEventListener('change', handleVersionChange);
    }

    // Ensure the screen to show is correct
    const screenToShow = patchNotesScreen ? patchNotesScreen.id : 'patchNotesScreen';
    showScreen(screenToShow);
}

function handleVersionChange(event) {
    updatePatchNotesContent(event.target.value);
}

// Event Listeners for Summon Modal (ensure they are added once, e.g., in main.js or an initUI function)
// For now, adding them here for completeness of ui.js changes, but they might be better placed in main.js
// after gameState is initialized.
// if (summonUnitBtn) summonUnitBtn.addEventListener('click', () => showSummonUnitModal(window.currentGlobalGameState)); // Requires global gameState
// if (closeSummonModal) closeSummonModal.addEventListener('click', hideSummonUnitModal);
// The actual attachment of these listeners will be handled in a subsequent step/subtask, likely in main.js.
