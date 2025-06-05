const APP_VERSION = "1.1.0";
import { initializeFirebase } from './firebase.js';
import { initializeSounds, initializeMusic, playMenuMusic, stopMenuMusic } from './sound.js';
import { animateRiver } from './graphics.js';
import {
    authLoadingScreen, mainMenuScreen, difficultyScreen, onlineLobbyScreen,
    gameContainer, gameOverModal, /*localMultiplayerBtn, vsAIBtn, onlineMultiplayerBtn,*/ // Removed old button imports
    aiEasyBtn, aiMediumBtn, aiHardBtn, backToMainMenuBtn_Diff,
    playerUserIdDisplay_Lobby, createGameBtn_Lobby, joinGameIdInput_Lobby,
    joinGameBtn_Lobby, backToMainMenuBtn_Lobby, leaveWaitingRoomBtn,
    generalLeaveGameBtn, modalLeaveGameBtn, notificationModal, notificationOkBtn,
    showScreen, addLogEntry, gameModeInfoDisplay, showNotification,
    renderHighlightsAndInfo, renderUnitRosterLocal,
    displayTutorial, // New
    backToMainMenuBtn_Tutorial, // New
    displayPatchNotes, // Added for patch notes
    backToMainMenuBtn_PatchNotes, // Added for patch notes back button
    initializeSummonUI, // Added for summon UI initialization
    summonUnitBtn, // Element for summon button
    closeSummonModal, // Element for closing summon modal
    showSummonUnitModal, // Function to show summon modal
    hideSummonUnitModal // Function to hide summon modal
} from './ui.js';
import { initializeLocalBoardAndUnits } from './localGame.js';
import { joinGameSessionOnline, leaveGameCleanup, hostNewOnlineGame, joinExistingOnlineGame, handleSurrenderOnline } from './onlineGame.js';
import * as gameActions from './gameActions.js'; // Import all game actions
import { defineComponent } from './elemental.js';
import { PlayerTurnDisplay } from './components/PlayerTurnDisplay.js';
import { GameMenuComponent } from './components/GameMenu.js';
import { GameLogComponent } from './components/GameLog.js';

// Define custom components
defineComponent('player-turn-display', PlayerTurnDisplay);
defineComponent('game-menu', GameMenuComponent);
defineComponent('game-log', GameLogComponent);

let firebaseInitResult = null; // To store Firebase initialization result

let gameState = {
    board: [], units: {}, riverCanvases: [], riverAnimationTime: 0,
    currentFirebaseGameData: null, localPlayerId: null, localPlayerRole: null,
    localPlayerNumber: null, currentGameId: null, selectedUnit: null,
    highlightedMoves: [], gameActive: false, isAnimating: false, gameLog: [],
    gameMode: null, aiDifficulty: null, aiPlayerNumber: 2,
    unsubscribeGameListener: null
};

async function handleFirebaseAuthStateChanged(user) {
    if (user) {
        gameState.localPlayerId = user.uid;
        if(playerUserIdDisplay_Lobby) playerUserIdDisplay_Lobby.textContent = user.uid.substring(0,12) + "...";
        console.log("Autenticado como:", user.uid);

        // Explicitly hide the authLoadingScreen
        if (authLoadingScreen) {
            console.log("Explicitly hiding authLoadingScreen from main.js");
            authLoadingScreen.style.display = 'none';
        }

        showScreen(mainMenuScreen.id);
        playMenuMusic(); // Start menu music

        // Configure and set up event listener for the main menu component
        const mainMenuComponent = document.getElementById('mainMenuComponent');
        if (mainMenuComponent) {
            const mainMenuButtons = [
                { id: 'localMultiplayerBtn', text: 'Multijugador Local', class: 'action-button' },
                { id: 'vsAIBtn', text: 'VS IA', class: 'action-button' },
                { id: 'onlineMultiplayerBtn', text: 'Multijugador Online', class: 'action-button' },
                { id: 'tutorialBtn', text: 'Cómo Jugar (Tutorial)', class: 'secondary-button' },
                { id: 'patchNotesBtn', text: 'Notas del Parche', class: 'secondary-button' } // New Patch Notes button
            ];
            mainMenuComponent.setAttribute('buttons', JSON.stringify(mainMenuButtons));

            mainMenuComponent.addEventListener('menuaction', (event) => {
                const buttonId = event.detail.buttonId;
                if (buttonId === 'localMultiplayerBtn') {
                    startGame('local');
                } else if (buttonId === 'vsAIBtn') {
                    showScreen(difficultyScreen.id);
                } else if (buttonId === 'onlineMultiplayerBtn') {
                    if (gameState.localPlayerId && playerUserIdDisplay_Lobby) {
                        playerUserIdDisplay_Lobby.textContent = gameState.localPlayerId.substring(0,12) + "...";
                    }
                    showScreen(onlineLobbyScreen.id);
                } else if (buttonId === 'tutorialBtn') {
                    displayTutorial();
                } else if (buttonId === 'patchNotesBtn') { // New condition for Patch Notes
                    displayPatchNotes();
                }
            });
        }

    } else {
        console.log("No autenticado, intentando iniciar sesión anónimamente...");

        // Ensure firebaseInitResult and its properties are available
        if (!firebaseInitResult || !firebaseInitResult.success) {
            console.error("Firebase not initialized successfully. Cannot attempt anonymous sign-in.");
            if(authLoadingScreen) authLoadingScreen.innerHTML = '<h2>Error Crítico</h2><p>Firebase no está inicializado. No se puede intentar el inicio de sesión.</p>';
            return;
        }

        const firebaseAuth = firebaseInitResult.firebaseAuth;
        const signInAnonymouslyFn = firebaseInitResult.signInAnonymously;

        console.log('Attempting anonymous sign-in. Auth object:', firebaseAuth);
        console.log('signInAnonymously function type:', typeof signInAnonymouslyFn);
        // Limiting output length for toString() for brevity in logs, ensure it's not excessively long.
        console.log('signInAnonymously function definition (approx):', signInAnonymouslyFn ? signInAnonymouslyFn.toString().substring(0, 200) + "..." : 'undefined');

        if (!firebaseAuth) {
            console.error("Firebase Auth object is undefined before sign-in attempt.");
            if(authLoadingScreen) authLoadingScreen.innerHTML = '<h2>Error Crítico de Autenticación</h2><p>Firebase Auth no está disponible. Revisa la consola.</p>';
            return;
        }
        if (typeof signInAnonymouslyFn !== 'function') {
            console.error("signInAnonymously is not a function before sign-in attempt.");
            if(authLoadingScreen) authLoadingScreen.innerHTML = '<h2>Error Crítico de Autenticación</h2><p>La función de inicio de sesión anónimo no está disponible. Revisa la consola.</p>';
            return;
        }

        try {
            console.log("Calling signInAnonymouslyFn with firebaseAuth:", firebaseAuth);
            await signInAnonymouslyFn(firebaseAuth);
            // If signInAnonymouslyFn resolves, onAuthStateChanged will handle the new user state.
            // No direct UI change here, as onAuthStateChanged is the source of truth for user state.
            console.log("signInAnonymously call initiated. Waiting for onAuthStateChanged callback.");
        } catch (error) { // This catch will handle errors from the signInAnonymously call itself or its promise.
            console.error("Error during signInAnonymously call or its promise:", error);
            if(authLoadingScreen) {
                authLoadingScreen.innerHTML = `<h2>Error de Autenticación</h2><p>Fallo el intento de inicio de sesión anónimo: ${error.message} (Código: ${error.code}). Revisa la consola para más detalles.</p>`;
            }
            // Use showNotification if available and appropriate
            if (typeof showNotification === 'function') {
                showNotification("Error de Autenticación", `Fallo en inicio de sesión: ${error.message} (Código: ${error.code})`);
            }
        }
    }
}

function startGame(mode, difficulty = null) {
    showScreen(gameContainer.id); // Use the ID of the element
    stopMenuMusic();
    gameState.gameMode = mode;
    gameState.aiDifficulty = difficulty;
    if(gameModeInfoDisplay) gameModeInfoDisplay.textContent = `Modo: ${mode === 'vsAI' ? `VS IA (${difficulty})` : (mode === 'online' ? 'Online' : 'Local')}`;

    if (mode === 'local' || mode === 'vsAI') {
        // Pass gameState and the onTileClick function (bound with gameState)
        initializeLocalBoardAndUnits(gameState, (r,c) => gameActions.onTileClick(gameState, r, c)); // Use gameActions.onTileClick
        initializeSummonUI(gameState, gameActions); // Initialize Summon UI with gameState and gameActions
        renderHighlightsAndInfo(gameState);
        renderUnitRosterLocal(gameState);
    } else if (mode === 'online') {
        addLogEntry(gameState, "Entrando a modo online...", "system");
        // Online game initialization is handled by joinGameSessionOnline called after creating/joining a game
    }
}

// Event Listeners
// Removed old button listeners for localMultiplayerBtn, vsAIBtn, onlineMultiplayerBtn

if(aiEasyBtn) aiEasyBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));
if(aiMediumBtn) aiMediumBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));
if(aiHardBtn) aiHardBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));

if(backToMainMenuBtn_Diff) backToMainMenuBtn_Diff.addEventListener('click', () => showScreen(mainMenuScreen.id)); // Pass ID
if(backToMainMenuBtn_Lobby) backToMainMenuBtn_Lobby.addEventListener('click', () => showScreen(mainMenuScreen.id)); // Pass ID
if(backToMainMenuBtn_Tutorial) backToMainMenuBtn_Tutorial.addEventListener('click', () => showScreen(mainMenuScreen.id));
if(backToMainMenuBtn_PatchNotes && mainMenuScreen) { // Added event listener for patch notes back button
    backToMainMenuBtn_PatchNotes.addEventListener('click', () => {
        showScreen(mainMenuScreen.id);
    });
}

if(leaveWaitingRoomBtn) leaveWaitingRoomBtn.addEventListener('click', () => leaveGameCleanup(gameState));

if(generalLeaveGameBtn) {
    generalLeaveGameBtn.addEventListener('click', async () => {
        if (gameState.gameMode === 'online' &&
            gameState.gameActive &&
            gameState.currentFirebaseGameData &&
            gameState.currentFirebaseGameData.status === 'active') {

            // For online active games, attempt to surrender first
            await handleSurrenderOnline(gameState);
            // leaveGameCleanup will be called by the Firestore listener eventually,
            // or if surrender fails and user wants to leave anyway, that's fine too.
            // However, to ensure cleanup happens even if the listener is slow or fails,
            // and to provide immediate feedback/navigation:
            leaveGameCleanup(gameState);
        } else {
            // For local games, or non-active online games, just cleanup
            leaveGameCleanup(gameState);
        }
    });
}

if(modalLeaveGameBtn) modalLeaveGameBtn.addEventListener('click', () => leaveGameCleanup(gameState));

if(notificationOkBtn) notificationOkBtn.addEventListener('click', () => {
    if(notificationModal) notificationModal.style.display = "none";
});

if(createGameBtn_Lobby) createGameBtn_Lobby.addEventListener('click', async () => {
    await hostNewOnlineGame(gameState);
});

if(joinGameBtn_Lobby) joinGameBtn_Lobby.addEventListener('click', async () => {
    const gameIdToJoin = joinGameIdInput_Lobby.value.trim();
    await joinExistingOnlineGame(gameState, gameIdToJoin);
});


document.addEventListener('DOMContentLoaded', async () => {
    firebaseInitResult = await initializeFirebase(); // Store result globally within the module
    if (firebaseInitResult.success) {
        initializeSounds();
        initializeMusic(); // Initialize music players
        // Use onAuthStateChanged and firebaseAuth from the initialization result
        firebaseInitResult.onAuthStateChanged(firebaseInitResult.firebaseAuth, handleFirebaseAuthStateChanged);
        animateRiver(gameState);

        const versionDisplayElement = document.createElement('p');
        versionDisplayElement.id = 'appVersionDisplay';
        versionDisplayElement.textContent = `Versión: ${APP_VERSION}`;
        versionDisplayElement.style.textAlign = 'center'; // Optional: center align
        versionDisplayElement.style.color = '#cbd5e0'; // Optional: light gray color
        versionDisplayElement.style.fontSize = '0.9rem'; // Optional: slightly smaller font

        const gameTitleElement = document.querySelector('h1.game-title');
        if (gameTitleElement && gameTitleElement.parentNode) {
            gameTitleElement.parentNode.insertBefore(versionDisplayElement, gameTitleElement.nextSibling);
        } else {
            // Fallback if title isn't found, though it should be there
            document.body.insertBefore(versionDisplayElement, document.body.firstChild);
        }
    } else {
        console.error("Firebase initialization failed:", firebaseInitResult.error);
        if(authLoadingScreen) {
            authLoadingScreen.innerHTML = `<h2>Error Fatal</h2><p>Firebase no pudo inicializarse: ${firebaseInitResult.error.message || firebaseInitResult.error}. El juego no puede continuar.</p>`;
        }
    }

    // Event listener for the main summon button
    if (summonUnitBtn) {
        summonUnitBtn.addEventListener('click', () => {
            console.log("MAIN: Summon Unit button clicked.");
            if (gameState && gameState.gameActive) {
                if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiPlayerNumber) {
                    console.log("MAIN: Not showing summon modal, it's AI's turn.");
                    showNotification("Aviso", "Es el turno de la IA.");
                    return;
                }
                showSummonUnitModal(gameState);
            } else {
                console.warn("MAIN: Summon button clicked, but game not active or gameState not available.");
            }
        });
    } else {
        console.warn("MAIN: summonUnitBtn element not found. Listener not attached.");
    }

    // Event listener for the close button on the summon modal
    if (closeSummonModal) {
        closeSummonModal.addEventListener('click', () => {
            console.log("MAIN: Close Summon Modal button clicked.");
            hideSummonUnitModal();
        });
    } else {
        console.warn("MAIN: closeSummonModal element not found. Listener not attached.");
    }
});
