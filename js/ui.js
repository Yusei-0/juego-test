import { UNIT_TYPES, TILE_SIZE, UNIT_CANVAS_SIZE, BOARD_ROWS, BOARD_COLS } from './constants.js';
import { playSound } from './sound.js';
import { unitDrawFunctions } from './graphics.js';
import { tutorialHTMLContent } from './tutorial_content.js'; // New
import { getTileType, TILE_TYPE_FOREST } from './boardUtils.js'; // Import TILE_TYPE_FOREST and getTileType

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
        } else {
            surrenderBtn.style.display = 'none';
        }
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
    // Clear existing visual highlights first
    document.querySelectorAll('.tile.selected-unit-tile, .tile.possible-move, .tile.possible-attack, .tile.possible-heal, .tile.fog-hidden, .tile.fog-explored')
        .forEach(el => {
            el.classList.remove('selected-unit-tile', 'possible-move', 'possible-attack', 'possible-heal', 'fog-hidden', 'fog-explored');
            el.style.backgroundColor = ''; // Reset any direct background color changes
        });
    document.querySelectorAll('.unit.pulse-target').forEach(el => el.classList.remove('pulse-target'));

    const visibilityGrid = gameState.visibilityGrid;
    const currentPlayer = gameState.gameMode === 'online' ? gameState.localPlayerNumber : gameState.currentPlayer;

    // Unit Rendering based on Visibility & Forest Stealth Rule
    if (gameState.units) {
        Object.values(gameState.units).forEach(unitElement => {
            if (!unitElement || !unitElement.__unitData) return;
            const unitData = unitElement.__unitData;
            let isVisibleTile = false;
            if (visibilityGrid && visibilityGrid[unitData.row] && visibilityGrid[unitData.row][unitData.col] !== undefined) {
                isVisibleTile = visibilityGrid[unitData.row][unitData.col] === 2;
            }

            const isPlayerBase = unitData.type === 'BASE';
            let shouldDrawUnit = isVisibleTile || isPlayerBase;

            if (unitData.player !== currentPlayer && isVisibleTile) {
                const unitTileType = getTileType(unitData.row, unitData.col, gameState.terrainFeatures);
                if (unitTileType === TILE_TYPE_FOREST) {
                    let isAdjacentToForestEnemy = false;
                    for (let r = 0; r < BOARD_ROWS; r++) {
                        for (let c = 0; c < BOARD_COLS; c++) {
                            const friendlyUnit = gameState.board[r] ? gameState.board[r][c] : null;
                            if (friendlyUnit && friendlyUnit.player === currentPlayer) {
                                if (Math.abs(friendlyUnit.row - unitData.row) + Math.abs(friendlyUnit.col - unitData.col) === 1) {
                                    isAdjacentToForestEnemy = true;
                                    break;
                                }
                            }
                        }
                        if (isAdjacentToForestEnemy) break;
                    }
                    if (!isAdjacentToForestEnemy) {
                        shouldDrawUnit = false;
                    }
                }
            }

            if (shouldDrawUnit) {
                unitElement.style.display = 'block';
            } else {
                unitElement.style.display = 'none';
            }
        });
    }

    // Selected unit and action highlights (only on visible tiles)
    if (gameState.selectedUnit && gameState.selectedUnit.data) {
        const unitData = gameState.selectedUnit.data;
        if (visibilityGrid && visibilityGrid[unitData.row] && visibilityGrid[unitData.row][unitData.col] === 2) {
            if (gameBoardElement) {
                const tileEl = gameBoardElement.querySelector(`.tile[data-row='${unitData.row}'][data-col='${unitData.col}']`);
                if (tileEl) tileEl.classList.add('selected-unit-tile');
            }
        }
    }

    if (gameState.highlightedMoves) {
        gameState.highlightedMoves.forEach(move => {
            if (visibilityGrid && visibilityGrid[move.row] && visibilityGrid[move.row][move.col] === 2) {
                if (gameBoardElement) {
                    const tileEl = gameBoardElement.querySelector(`.tile[data-row='${move.row}'][data-col='${move.col}']`);
                    if (tileEl) {
                        if (move.type === 'move') tileEl.classList.add('possible-move');
                        else if (move.type === 'attack') {
                            tileEl.classList.add('possible-attack');
                            if (gameState.board[move.row] && gameState.board[move.row][move.col]) {
                                const targetUnitData = gameState.board[move.row][move.col];
                                if (targetUnitData && gameState.units[targetUnitData.id] && gameState.units[targetUnitData.id].style.display !== 'none') {
                                    gameState.units[targetUnitData.id].classList.add('pulse-target');
                                }
                            }
                        } else if (move.type === 'heal') tileEl.classList.add('possible-heal');
                    }
                }
            }
        });
    }

    // Fog of War Overlay
    if (visibilityGrid && gameBoardElement) {
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const tileEl = gameBoardElement.querySelector(`.tile[data-row='${r}'][data-col='${c}']`);
                if (tileEl) {
                    const status = visibilityGrid[r] ? visibilityGrid[r][c] : 0;
                    if (status === 0) { // Hidden
                        // tileEl.classList.add('fog-hidden'); // CSS class would be better
                        tileEl.style.backgroundColor = 'rgba(200, 200, 200, 0.6)'; // New light grey semi-transparent overlay
                        // Ensure no other highlights are showing on hidden tiles
                        tileEl.classList.remove('possible-move', 'possible-attack', 'possible-heal', 'selected-unit-tile');
                    } else if (status === 1) { // Explored (not used yet, but could be for grayed out)
                        // tileEl.classList.add('fog-explored');
                        // tileEl.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Example for explored
                    } else { // Visible (status === 2)
                        // If it's visible and not highlighted for action, ensure its background is clear
                        // The terrain drawing functions already set the base background.
                        // If a highlight class for move/attack is present, it will override this.
                        if (!tileEl.classList.contains('possible-move') &&
                            !tileEl.classList.contains('possible-attack') &&
                            !tileEl.classList.contains('possible-heal') &&
                            !tileEl.classList.contains('selected-unit-tile')) {
                            tileEl.style.backgroundColor = ''; // Let canvas show through or default CSS
                        }
                    }
                }
            }
        }
    }

    updateInfoDisplay(gameState);
    updateSelectedUnitInfoPanel(gameState);
}

let allPatchNotes = {}; // Cache for parsed patch notes

async function fetchAndParsePatchNotes() {
    if (Object.keys(allPatchNotes).length > 0 && !allPatchNotes["Error"]) { // Check for error to allow re-fetch
        return allPatchNotes; // Return cached if already fetched and no error
    }
    try {
        const response = await fetch('PATCH_NOTES.md');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdownText = await response.text();

        allPatchNotes = {}; // Clear before repopulating

        // Regex to find versions like "## Versión X.Y.Z" or "## Versión X.Y"
        // It captures the version number and the content until the next version or EOF
        const versionRegex = /^## Versión\s+([^\n]+)\n([\s\S]*?)(?=\n## Versión|\Z)/gm;
        let match;
        while ((match = versionRegex.exec(markdownText)) !== null) {
            const versionNumber = match[1].trim();
            const content = match[2].trim();
            if (versionNumber) {
                allPatchNotes[versionNumber] = content;
            }
        }

        // Fallback if the above regex yields no versions, but the file has content
        // This might happen if the main title "# Notas del Parche" is the only H1/H2 level heading
        // or if versions are formatted differently, e.g., "## 1.0" instead of "## Versión 1.0"
        if (Object.keys(allPatchNotes).length === 0 && markdownText.trim() !== "") {
            console.warn("Primary patch notes parsing found no versions. Attempting fallback.");
            // Attempt to split by "## " which might be generic titles or versions
            const sections = markdownText.split(/\n## /);
            let potentialContent = "";
            if (sections.length > 0) {
                // Check if the first section (before any "## ") contains meaningful content
                // This could be the case if the file doesn't start with "## Versión" but has a preamble
                const preamble = sections[0].trim();
                if (!preamble.startsWith("# Notas del Parche") && preamble.length > 50) { // Heuristic: preamble is content
                    potentialContent += preamble + "\n\n";
                } else if (preamble.startsWith("# Notas del Parche") && sections.length === 1) {
                    // Only title and no "##" sections, use the whole text for a default version
                    potentialContent = markdownText.replace("# Notas del Parche", "").trim();
                }
            }

            for (let i = 1; i < sections.length; i++) { // Start from 1 because split includes content before first "## "
                const sectionBlock = sections[i];
                const firstNewline = sectionBlock.indexOf('\n');
                const title = sectionBlock.substring(0, firstNewline).trim();
                // Try to extract version from title, e.g., "Versión 1.0", "1.0", "Release 1"
                let versionKey = title.replace(/^Versión\s+/i, "").trim(); // Remove "Versión " prefix

                const content = sectionBlock.substring(firstNewline + 1).trim();

                if (title && content) {
                     // If we already have this content under a more specific version, skip
                    if (Object.values(allPatchNotes).includes(content)) continue;

                    // If we couldn't parse specific versions earlier, this becomes the content
                    if (Object.keys(allPatchNotes).length === 0) {
                        allPatchNotes[versionKey || "General"] = (potentialContent + content).trim();
                        potentialContent = ""; // Reset potential content after using it
                    } else if (!allPatchNotes[versionKey]) { // Add if versionKey is new
                        allPatchNotes[versionKey] = content;
                    } else { // Append to existing if title was not unique enough for a version key
                        allPatchNotes[versionKey] += "\n\n---\n\n" + content;
                    }
                }
            }
             // If still no versions, and potentialContent has something (e.g. from preamble)
            if (Object.keys(allPatchNotes).length === 0 && potentialContent.trim()) {
                allPatchNotes["General"] = potentialContent.trim();
            }
        }


        if (Object.keys(allPatchNotes).length === 0) { // If still no versions after all attempts
             console.warn("No versions found after all parsing attempts. Treating entire file as 'General' notes.");
             allPatchNotes["General"] = markdownText.replace("# Notas del Parche", "").trim(); // Use whole content, remove main title
        }

        return allPatchNotes;
    } catch (error) {
        console.error("Error fetching or parsing patch notes:", error);
        allPatchNotes = { "Error": "No se pudieron cargar las notas del parche. Intenta de nuevo más tarde." };
        return allPatchNotes;
    }
}

function updatePatchNotesContent(version) {
    if (patchNotesContent && allPatchNotes[version]) {
        patchNotesContent.textContent = allPatchNotes[version];
    } else if (patchNotesContent) {
        patchNotesContent.textContent = "Notas no encontradas para esta versión.";
    }
}

export async function displayPatchNotes() {
    await fetchAndParsePatchNotes();

    if (patchVersionSelector) {
        patchVersionSelector.innerHTML = ''; // Clear existing options
        const sortedVersions = Object.keys(allPatchNotes).sort((a, b) => {
            if (a === "Error" || b === "Error") return a === "Error" ? 1 : -1; // Push "Error" to the end or handle as needed
            if (a === "General" || b === "General") return a === "General" ? 1 : -1; // Push "General" to the end

            const partsA = a.split('.').map(v => parseInt(v, 10));
            const partsB = b.split('.').map(v => parseInt(v, 10));

            for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const valA = partsA[i] || 0;
                const valB = partsB[i] || 0;
                if (valA !== valB) return valB - valA; // Sort descending (newest first)
            }
            return 0;
        });

        sortedVersions.forEach(version => {
            if (version === "Error" && Object.keys(allPatchNotes).length > 1) return; // Skip "Error" if other versions exist

            const option = document.createElement('option');
            option.value = version;
            option.textContent = version === "Error" ? "Error al Cargar" : (version === "General" ? "General" : `Versión ${version}`);
            patchVersionSelector.appendChild(option);
        });

        if (sortedVersions.length > 0) {
            const defaultVersion = sortedVersions[0]; // Select the newest/first version by default
            patchVersionSelector.value = defaultVersion;
            updatePatchNotesContent(defaultVersion);
        } else if (allPatchNotes["Error"]) { // Should be caught by sortedVersions[0] if Error is only key
             updatePatchNotesContent("Error");
        } else {
            patchNotesContent.textContent = "No hay notas del parche disponibles.";
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
