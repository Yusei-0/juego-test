import { initializeFirebase, firebaseAuth, onAuthStateChanged, signInAnonymously } from './firebase.js';
import { initializeSounds } from './sound.js';
import { animateRiver } from './graphics.js';
import {
    authLoadingScreen, mainMenuScreen, difficultyScreen, onlineLobbyScreen,
    gameContainer, gameOverModal, localMultiplayerBtn, vsAIBtn,
    onlineMultiplayerBtn, aiEasyBtn, aiMediumBtn, aiHardBtn, backToMainMenuBtn_Diff,
    playerUserIdDisplay_Lobby, createGameBtn_Lobby, joinGameIdInput_Lobby,
    joinGameBtn_Lobby, backToMainMenuBtn_Lobby, leaveWaitingRoomBtn,
    generalLeaveGameBtn, modalLeaveGameBtn, notificationModal, notificationOkBtn,
    showScreen, addLogEntry, gameModeInfoDisplay, showNotification,
    renderHighlightsAndInfo, renderUnitRosterLocal
} from './ui.js';
import { initializeLocalBoardAndUnits } from './localGame.js';
import { joinGameSessionOnline, leaveGameCleanup, hostNewOnlineGame, joinExistingOnlineGame } from './onlineGame.js';
import { onTileClick } from './gameActions.js';


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
        showScreen(mainMenuScreen.id);
    } else {
        console.log("No autenticado, intentando iniciar sesión anónimamente...");
        try {
            if (firebaseAuth) {
                await signInAnonymously(firebaseAuth);
            } else {
                console.error("Firebase Auth no está inicializado al intentar signInAnonymously.");
                if(authLoadingScreen) authLoadingScreen.innerHTML = '<h2>Error de Autenticación</h2><p>Firebase Auth no disponible.</p>';
            }
        } catch (error) {
            console.error("Error en inicio de sesión anónimo:", error);
            if(authLoadingScreen) authLoadingScreen.innerHTML = `<h2>Error de Autenticación</h2><p>Fallo en inicio de sesión: ${error.message}. Recarga.</p>`;
            showNotification("Error de Autenticación", `Fallo en inicio de sesión: ${error.message}`);
        }
    }
}

function startGame(mode, difficulty = null) {
    showScreen(gameContainer.id); // Use the ID of the element
    gameState.gameMode = mode;
    gameState.aiDifficulty = difficulty;
    if(gameModeInfoDisplay) gameModeInfoDisplay.textContent = `Modo: ${mode === 'vsAI' ? `VS IA (${difficulty})` : (mode === 'online' ? 'Online' : 'Local')}`;

    if (mode === 'local' || mode === 'vsAI') {
        // Pass gameState and the onTileClick function (bound with gameState)
        initializeLocalBoardAndUnits(gameState, (r,c) => onTileClick(gameState, r, c));
        renderHighlightsAndInfo(gameState);
        renderUnitRosterLocal(gameState);
    } else if (mode === 'online') {
        addLogEntry(gameState, "Entrando a modo online...", "system");
        // Online game initialization is handled by joinGameSessionOnline called after creating/joining a game
    }
}

// Event Listeners
if(localMultiplayerBtn) localMultiplayerBtn.addEventListener('click', () => startGame('local'));
if(vsAIBtn) vsAIBtn.addEventListener('click', () => showScreen(difficultyScreen.id)); // Pass ID
if(onlineMultiplayerBtn) onlineMultiplayerBtn.addEventListener('click', () => {
    if (gameState.localPlayerId && playerUserIdDisplay_Lobby) {
         playerUserIdDisplay_Lobby.textContent = gameState.localPlayerId.substring(0,12) + "...";
    }
    showScreen(onlineLobbyScreen.id); // Pass ID
});

if(aiEasyBtn) aiEasyBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));
if(aiMediumBtn) aiMediumBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));
if(aiHardBtn) aiHardBtn.addEventListener('click', (e) => startGame('vsAI', e.target.dataset.difficulty));

if(backToMainMenuBtn_Diff) backToMainMenuBtn_Diff.addEventListener('click', () => showScreen(mainMenuScreen.id)); // Pass ID
if(backToMainMenuBtn_Lobby) backToMainMenuBtn_Lobby.addEventListener('click', () => showScreen(mainMenuScreen.id)); // Pass ID

if(leaveWaitingRoomBtn) leaveWaitingRoomBtn.addEventListener('click', () => leaveGameCleanup(gameState));
if(generalLeaveGameBtn) generalLeaveGameBtn.addEventListener('click', () => leaveGameCleanup(gameState));
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
    const firebaseReady = await initializeFirebase();
    if (firebaseReady && firebaseAuth) { // Ensure firebaseAuth is also checked
        initializeSounds();
        onAuthStateChanged(firebaseAuth, (user) => handleFirebaseAuthStateChanged(user));
        animateRiver(gameState); // Pass gameState
    } else {
        if(authLoadingScreen) authLoadingScreen.innerHTML = '<h2>Error Fatal</h2><p>Firebase no pudo inicializarse. El juego no puede continuar.</p>';
    }
});
