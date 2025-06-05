import {
    firestoreDB,
    doc,
    setDoc,
    getDoc, // Added getDoc here
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from './firebase.js';
import { showScreen, matchmakingStatusText, mainMenuScreen, onlineLobbyScreen } from './ui.js'; // Ensure onlineLobbyScreen is imported
import { joinGameSessionOnline } from './onlineGame.js';

const MATCHMAKING_QUEUE_COLLECTION = 'matchmakingQueue';
const PLAYER_MATCH_RESULTS_COLLECTION = 'playerMatchResults';

let unsubscribeFromMatchResults = null;
let currentGameStateRef = null; // To hold a reference to the main gameState

export function initializeMatchmaking(gameState) {
    currentGameStateRef = gameState;
    if (currentGameStateRef) {
        currentGameStateRef.isMatchmaking = false; // Initial state
    }
}

export async function startMatchmaking() {
    if (!currentGameStateRef || !currentGameStateRef.localPlayerId) {
        console.error("Matchmaking: Game state or localPlayerId not initialized.");
        showScreen(mainMenuScreen.id); // Or onlineLobbyScreen.id
        alert("Error: No se pudo iniciar la búsqueda de partida. Falta ID de jugador.");
        return;
    }

    if (currentGameStateRef.isMatchmaking) {
        console.warn("Matchmaking: Already searching for a game.");
        return;
    }

    currentGameStateRef.isMatchmaking = true;
    showScreen('matchmakingScreen');
    if (matchmakingStatusText) matchmakingStatusText.textContent = "Agregándote a la cola de emparejamiento...";

    const playerId = currentGameStateRef.localPlayerId;
    const queueDocRef = doc(firestoreDB, MATCHMAKING_QUEUE_COLLECTION, playerId);
    const resultDocRef = doc(firestoreDB, PLAYER_MATCH_RESULTS_COLLECTION, playerId);

    // Handle user navigating away while matchmaking (best effort)
    window.addEventListener('beforeunload', handleBeforeUnload);

    try {
        // Add player to the matchmaking queue
        await setDoc(queueDocRef, {
            playerId: playerId,
            timestamp: serverTimestamp(),
            gameMode: "default" // Add other criteria if any
        });
        if (matchmakingStatusText) matchmakingStatusText.textContent = "Esperando a otros jugadores...";
        console.log(`Matchmaking: Player ${playerId} added to queue.`);

        // Listen for match results
        unsubscribeFromMatchResults = onSnapshot(resultDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const resultData = docSnap.data();
                const gameId = resultData.gameId;

                if (gameId && currentGameStateRef.isMatchmaking) { // Process only if still matchmaking
                    console.log(`Matchmaking: Match found! Game ID: ${gameId}`);
                    currentGameStateRef.isMatchmaking = false; // Set before async operations
                    window.removeEventListener('beforeunload', handleBeforeUnload);

                    if (matchmakingStatusText) matchmakingStatusText.textContent = `¡Partida encontrada! Uniéndote a ${gameId}...`;

                    if (unsubscribeFromMatchResults) {
                        unsubscribeFromMatchResults();
                        unsubscribeFromMatchResults = null;
                    }

                    // Attempt to delete the result document as it has been processed
                    try {
                        await deleteDoc(resultDocRef);
                        console.log(`Matchmaking: Deleted match result for ${playerId}`);
                    } catch (deleteError) {
                        console.error(`Matchmaking: Error deleting match result for ${playerId}:`, deleteError);
                    }

                    // Clean up from queue just in case the cloud function didn't
                    try {
                        await deleteDoc(queueDocRef);
                        console.log(`Matchmaking: Ensured player ${playerId} is removed from queue (client-side).`);
                    } catch (queueDeleteError) {
                        console.warn(`Matchmaking: Could not remove player ${playerId} from queue (client-side, might be okay):`, queueDeleteError);
                    }

                    joinGameSessionOnline(currentGameStateRef, gameId);
                } else if (gameId && !currentGameStateRef.isMatchmaking) {
                    // Match found, but we are no longer in matchmaking (e.g. user cancelled, then result came)
                    // Log this, ensure result doc is cleaned up if we didn't already.
                    console.log(`Matchmaking: Result for ${gameId} arrived but no longer in matchmaking state. Cleaning up result doc.`);
                     if (unsubscribeFromMatchResults) { // Should be null already if cancelled properly
                        unsubscribeFromMatchResults();
                        unsubscribeFromMatchResults = null;
                    }
                    try {
                        await deleteDoc(resultDocRef);
                    } catch (e) { /* ignore */ }
                }
            } else {
                console.log(`Matchmaking: Result document for ${playerId} does not exist or was deleted.`);
            }
        }, (error) => {
            console.error("Matchmaking: Error listening for match results:", error);
            if (currentGameStateRef && currentGameStateRef.isMatchmaking) {
                alert("Error en el servicio de emparejamiento. Intenta de nuevo.");
                cancelMatchmaking(); // Attempt to clean up
            }
        });

    } catch (error) {
        console.error("Matchmaking: Error starting matchmaking:", error);
        if (matchmakingStatusText) matchmakingStatusText.textContent = "Error al iniciar búsqueda. Intenta de nuevo.";
        alert("Error al iniciar la búsqueda de partida: " + error.message);
        if(currentGameStateRef) currentGameStateRef.isMatchmaking = false;
        window.removeEventListener('beforeunload', handleBeforeUnload); // remove listener on error
        showScreen(onlineLobbyScreen.id);
    }
}

export async function cancelMatchmaking() {
    if (!currentGameStateRef || !currentGameStateRef.localPlayerId) {
        // If currentGameStateRef exists but no localPlayerId, still reset isMatchmaking
        if (currentGameStateRef) currentGameStateRef.isMatchmaking = false;
        showScreen(onlineLobbyScreen.id);
        return;
    }

    if (!currentGameStateRef.isMatchmaking) {
        // Not actively matchmaking, ensure UI is correct but don't run full cancel logic
        console.log("Matchmaking: Cancel called but not currently matchmaking.");
        showScreen(onlineLobbyScreen.id);
        return;
    }

    console.log("Matchmaking: Cancelling search...");
    currentGameStateRef.isMatchmaking = false; // Set this first

    cleanupMatchmakingListeners(); // This will remove beforeunload and unsubscribe

    const playerId = currentGameStateRef.localPlayerId;
    const queueDocRef = doc(firestoreDB, MATCHMAKING_QUEUE_COLLECTION, playerId);
    const resultDocRef = doc(firestoreDB, PLAYER_MATCH_RESULTS_COLLECTION, playerId);

    try {
        await deleteDoc(queueDocRef);
        console.log(`Matchmaking: Player ${playerId} removed from queue upon cancellation.`);
    } catch (error) {
        console.error(`Matchmaking: Error removing player ${playerId} from queue:`, error);
    }

    try {
        const resultSnap = await getDoc(resultDocRef);
        if (resultSnap.exists()) {
            await deleteDoc(resultDocRef);
            console.log(`Matchmaking: Deleted match result document for ${playerId} during cancellation.`);
        }
    } catch (error) {
        console.error(`Matchmaking: Error checking/deleting result document for ${playerId} during cancellation:`, error);
    }

    showScreen(onlineLobbyScreen.id);
    if (matchmakingStatusText) matchmakingStatusText.textContent = "Búsqueda cancelada.";
}

function handleBeforeUnload(event) {
    // This is a best-effort attempt.
    // The Cloud Function should ideally handle orphaned queue entries.
    if (currentGameStateRef && currentGameStateRef.isMatchmaking && currentGameStateRef.localPlayerId) {
        const playerId = currentGameStateRef.localPlayerId;
        const queueDocRef = doc(firestoreDB, MATCHMAKING_QUEUE_COLLECTION, playerId);
        // Firestore operations are async and not guaranteed to complete in beforeunload.
        // This is a "fire and forget" attempt.
        deleteDoc(queueDocRef).then(() => {
            console.log(`Matchmaking: Attempted to remove ${playerId} from queue on page unload.`);
        }).catch(err => {
            console.warn(`Matchmaking: Error attempting to remove ${playerId} from queue on page unload (may be okay):`, err);
        });
    }
    // Do not set event.returnValue for modern browsers if you don't want a generic dialog.
    // If you want to attempt to show a dialog:
    // event.preventDefault(); // Standard for preventing default action
    // event.returnValue = ''; // For older browsers like IE
    // return ''; // For some modern browsers, but custom message is often not shown.
}

export function cleanupMatchmakingListeners() {
    if (unsubscribeFromMatchResults) {
        unsubscribeFromMatchResults();
        unsubscribeFromMatchResults = null;
        console.log("Matchmaking: Cleaned up match results listener.");
    }
    window.removeEventListener('beforeunload', handleBeforeUnload);
    if (currentGameStateRef && currentGameStateRef.isMatchmaking) {
        console.log("Matchmaking: Resetting isMatchmaking state via cleanup.");
        currentGameStateRef.isMatchmaking = false;
    }
}

