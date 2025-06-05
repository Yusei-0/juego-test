import { UNIT_TYPES, TILE_SIZE, UNIT_CANVAS_SIZE } from './constants.js';
import { playSound } from './sound.js';
import { unitDrawFunctions } from './graphics.js';
import { tutorialHTMLContent } from './tutorial_content.js'; // New

// DOM Element References
export const authLoadingScreen = document.getElementById('authLoadingScreen');
export const mainMenuScreen = document.getElementById('mainMenuScreen');
export const difficultyScreen = document.getElementById('difficultyScreen');
export const onlineLobbyScreen = document.getElementById('onlineLobbyScreen');
export const tutorialScreen = document.getElementById('tutorialScreen'); // New
export const tutorialContentElement = document.getElementById('tutorialContent'); // New
export const backToMainMenuBtn_Tutorial = document.getElementById('backToMainMenuBtn_Tutorial'); // New
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
export const surrenderGameBtn = document.getElementById('surrenderGameBtn');

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
        { name: "tutorialScreen", el: tutorialScreen }
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
    }

    if (playerTurnDisplayElement) {
        playerTurnDisplayElement.setAttribute('player-name', currentPlayerName);
        playerTurnDisplayElement.setAttribute('player-role', playerRoleText);
        playerTurnDisplayElement.setAttribute('player-number', currentPlayerNumberString);
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

export function showEndGameModal(winner, reason) { // gameState parameter removed as it's not used
    if(aiTurnIndicator) aiTurnIndicator.style.display = 'none';

    let winnerText = "¡Empate!"; // Default text for draw or if winner is null/undefined
    let winnerClassBase = ''; // No specific class for draw by default

    if (winner && (winner === 1 || winner === 2)) {
        winnerText = `¡Jugador ${winner} Gana!`;
        winnerClassBase = winner === 1 ? 'winner-player1' : 'winner-player2';
    } else if (winner) { // Catch cases where winner might be truthy but not 1 or 2
        console.warn(`showEndGameModal called with unexpected winner value: ${winner}`);
        // Fallback to a generic message or keep "Empate"
    }
    // If reason is not provided, ensure it's an empty string or a default.
    const displayReason = reason || "Partida Terminada";

    if(gameOverMessage) {
        gameOverMessage.innerHTML = `${winnerText}<br><span style="font-size:0.8em;color:#a0aec0;">(${displayReason})</span>`;
        gameOverMessage.className = ''; // Clear existing classes
        if (winnerClassBase) {
            gameOverMessage.classList.add(winnerClassBase);
        }
    }

    if(gameOverModal) gameOverModal.style.display='flex';
    playSound('death','C4'); // Consider varying sound based on win/loss/draw if desired
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
    document.querySelectorAll('.tile.selected-unit-tile, .tile.possible-move, .tile.possible-attack')
        .forEach(el => el.classList.remove('selected-unit-tile', 'possible-move', 'possible-attack'));
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
                    tileEl.classList.add(move.type === 'move' ? 'possible-move' : 'possible-attack');
                    if (move.type === 'attack' && gameState.board[move.row] && gameState.board[move.row][move.col]) {
                        const targetUnitData = gameState.board[move.row][move.col];
                        if(targetUnitData && gameState.units[targetUnitData.id]) {
                            gameState.units[targetUnitData.id].classList.add('pulse-target');
                        }
                    }
                }
            }
        });
    }
    updateInfoDisplay(gameState);
    updateSelectedUnitInfoPanel(gameState);
}
