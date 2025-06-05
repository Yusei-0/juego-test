import { firestoreDB, doc, runTransaction, serverTimestamp, arrayUnion, deleteDoc, onSnapshot, setDoc, updateDoc } from './firebase.js';
import { UNIT_TYPES, BOARD_ROWS, BOARD_COLS, TILE_SIZE, UNIT_CANVAS_SIZE } from './constants.js';
import { playSound } from './sound.js';
import {
    showNotification, addLogEntry, clearHighlightsAndSelection, renderHighlightsAndInfo,
    renderUnitRosterOnline, showScreen, showEndGameModal, gameBoardElement, unitLayerElement,
    waitingGameIdDisplay, waitingStatusText, playerListDiv, gameIdInfoDisplay, createUnitElement, surrenderBtn
} from './ui.js';
import { getTileType, createUnitData } from './boardUtils.js';
import { unitDrawFunctions } from './graphics.js';
import { onTileClick } from './gameActions.js'; // Assuming onTileClick is correctly set up in main.js to be passed


export const FIRESTORE_GAME_PATH_PREFIX = "river_wars_online_games_v2";

export async function performMoveOnline(gameState, unitData, toR, toC) {
    if (!gameState.currentGameId || !firestoreDB) return;
    gameState.isAnimating = true;
    const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
    const newLogEntry = {text: `Unidad ${UNIT_TYPES[unitData.type].name} (J${unitData.player}) se mueve de (${unitData.row},${unitData.col}) a (${toR},${toC}).`, type:'move', timestamp:new Date().toISOString()};
    try {
        await runTransaction(firestoreDB, async (transaction) => {
            const gameDoc = await transaction.get(gameRef); if (!gameDoc.exists()) throw "Game DNE!";
            const gd = gameDoc.data(); const uU = {...gd.units}; const mU = uU[unitData.id];
            if(!mU || mU.player !== gameState.localPlayerNumber || gd.currentPlayerId !== gameState.localPlayerId) throw "Invalid move.";
            mU.row = toR; mU.col = toC;
            const nPId = gd.player1Id === gameState.localPlayerId ? gd.player2Id : gd.player1Id;
            const uL = [newLogEntry, ...gd.gameLog.slice(0,49)];
            transaction.update(gameRef, {units:uU, currentPlayerId:nPId, lastMoveAt:serverTimestamp(), gameLog:uL});
        });
        playSound('move','E4');
    } catch (e) { console.error("Move err:",e); showNotification("Move Error",`${e}`);}
    finally { gameState.isAnimating=false; clearHighlightsAndSelection(gameState); renderHighlightsAndInfo(gameState); }
}

export async function performAttackOnline(gameState, attackerData, targetData) {
    if (!gameState.currentGameId || !firestoreDB || !targetData) return;
    gameState.isAnimating = true;
    const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
    let attackerName=UNIT_TYPES[attackerData.type].name; let targetName=UNIT_TYPES[targetData.type].name; let damageDealt=UNIT_TYPES[attackerData.type].attack;
    let logEntries = [];
    logEntries.unshift({text:`Unidad ${attackerName} (J${attackerData.player}) ataca a ${targetName} (J${targetData.player}).`,type:'attack',timestamp:new Date().toISOString()});
    try {
        await runTransaction(firestoreDB, async (transaction) => {
            const gameDoc = await transaction.get(gameRef); if(!gameDoc.exists()) throw "Game DNE!";
            const gd = gameDoc.data(); const uU = {...gd.units}; const fA = uU[attackerData.id]; const fT = uU[targetData.id];
            if(!fA || !fT || fA.player !== gameState.localPlayerNumber || gd.currentPlayerId !== gameState.localPlayerId) throw "Invalid attack.";
            fT.hp -= damageDealt;
            logEntries.unshift({text:`${targetName} (J${fT.player}) recibe ${damageDealt} daño. PV: ${Math.max(0,fT.hp)}.`,type:'damage',timestamp:new Date().toISOString()});
            let nS=gd.status; let wR=gd.winnerReason||"";
            if(fT.hp<=0){
                logEntries.unshift({text:`¡${targetName} (J${fT.player}) destruido!`,type:'death',timestamp:new Date().toISOString()});
                delete uU[targetData.id];
                if(fT.type==='BASE'){nS=fA.player===1?'player1_wins':'player2_wins';wR="Base Destruida";}
            }
            const nPId = gd.player1Id === gameState.localPlayerId ? gd.player2Id : gd.player1Id;
            let fNPId = nPId;
            // Pass gameState to canPlayerMakeAnyMoveOnline
            if(nS==='active' && !canPlayerMakeAnyMoveOnline(gameState, nPId, {...gd, units:uU})){
                nS = fA.player === 1 ? 'player1_wins' : 'player2_wins'; wR = "Oponente sin movimientos";
                logEntries.unshift({text:`Jugador ${fA.player} gana! Oponente (Jugador ${fT.player}) no tiene movimientos.`,type:'death',timestamp:new Date().toISOString()});
                fNPId = null;
            }
            const uL = [...logEntries, ...gd.gameLog.slice(0, 50 - logEntries.length)];
            transaction.update(gameRef, {units:uU, currentPlayerId:nS==='active'?fNPId:null, status:nS, winnerReason:wR, lastMoveAt:serverTimestamp(), gameLog:uL});
        });
        playSound('attack');
    } catch(e){console.error("Attack err:",e); showNotification("Attack Error",`${e}`);}
    finally{gameState.isAnimating=false; clearHighlightsAndSelection(gameState); renderHighlightsAndInfo(gameState);}
}

export function canPlayerMakeAnyMoveOnline(gameState, playerId, gameData) { // Added gameState
    const playerNumber = gameData.player1Id === playerId ? 1 : (gameData.player2Id === playerId ? 2 : 0);
    if (!playerNumber) return false;
    const tempBoard = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
    for (const uId in gameData.units) { const u = gameData.units[uId]; if(u && u.row !== undefined && u.col !== undefined) tempBoard[u.row][u.col] = u; }

    for (const unitId in gameData.units) {
        const unitData = gameData.units[unitId];
        // Pass gameState to calculatePossibleMovesAndAttacksForUnit_Firestore if it needs it, though it seems to only need boardState.
        if (unitData && unitData.player === playerNumber && UNIT_TYPES[unitData.type].isMobile) {
            const possibleActions = calculatePossibleMovesAndAttacksForUnit_Firestore(unitData, tempBoard);
            if (possibleActions.length > 0) return true;
        }
    }
    return false;
}

// This function doesn't directly use the main `gameState`, but operates on a passed `boardState`.

async function handleSurrenderOnline(gameState) {
    if (!gameState || !gameState.gameActive || !gameState.currentGameId || !firestoreDB || !gameState.localPlayerId) return;
    if (gameState.currentFirebaseGameData && gameState.currentFirebaseGameData.status !== 'active') return; // Don't surrender if game already ended

    const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
    let winningPlayerRole;
    let surrenderingPlayerNumber;

    if (gameState.localPlayerRole === 'player1') {
        winningPlayerRole = 'player2_wins';
        surrenderingPlayerNumber = 1;
    } else if (gameState.localPlayerRole === 'player2') {
        winningPlayerRole = 'player1_wins';
        surrenderingPlayerNumber = 2;
    } else {
        console.error("Cannot determine player role for surrender.");
        showNotification("Error", "No se pudo determinar tu rol para rendirte.");
        return;
    }

    try {
        await runTransaction(firestoreDB, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) throw "Game DNE!";
            // const gd = gameDoc.data(); // Not strictly needed if just updating fixed fields based on surrender
            transaction.update(gameRef, {
                status: winningPlayerRole,
                winnerReason: "Rendición",
                currentPlayerId: null, // No more turns
                lastMoveAt: serverTimestamp(),
                // Optionally, add a log entry about the surrender
                gameLog: arrayUnion({
                    text: `Jugador ${surrenderingPlayerNumber} se ha rendido.`,
                    type: 'system',
                    timestamp: new Date().toISOString()
                })
            });
        });
        // No need to call showEndGameModal here, Firestore listener will trigger updateBoardFromFirestore
        // which then calls showEndGameModal.
        addLogEntry(gameState, `Te has rendido. Partida ${gameState.currentGameId}.`, "system");
    } catch (e) {
        console.error("Surrender error:", e);
        showNotification("Error de Rendición", `No se pudo procesar la rendición: ${e}`);
    }
}

export function calculatePossibleMovesAndAttacksForUnit_Firestore(unitData, boardState) {
    const possibleActions = [];
    if (!unitData || !UNIT_TYPES[unitData.type]) return possibleActions;
    const { movement, range, isMobile } = UNIT_TYPES[unitData.type];
    const startR = unitData.row; const startC = unitData.col;

    if(movement>0 && isMobile){ // Use destructured isMobile
        let q=[{r:startR,c:startC,dist:0}],v=new Set([`${startR},${startC}`]);
        while(q.length>0){
            let curr=q.shift();
            if(curr.dist<movement){
                const n=[[-1,0],[1,0],[0,-1],[0,1]];
                for(const [dr,dc] of n){
                    const nr=curr.r+dr,nc=curr.c+dc,pk=`${nr},${nc}`;
                    if(nr>=0&&nr<BOARD_ROWS&&nc>=0&&nc<BOARD_COLS&&!v.has(pk)){
                        const tt=getTileType(nr,nc); // From boardUtils.js
                        if(tt!=='river'&& (!boardState[nr] || !boardState[nr][nc])){
                            possibleActions.push({type:'move'}); return possibleActions;
                        }
                    }
                }
            }
        }
    }
    if(range>0){
        for(let ro=-range;ro<=range;ro++){
            for(let co=-range;co<=range;co++){
                if(Math.abs(ro)+Math.abs(co)>range||(ro===0&&co===0))continue;
                const tr=startR+ro,tc=startC+co;
                if(tr>=0&&tr<BOARD_ROWS&&tc>=0&&tc<BOARD_COLS){
                    const tudob= boardState[tr] ? boardState[tr][tc] : null;
                    if(tudob&&tudob.player!==unitData.player){
                        possibleActions.push({type:'attack'}); return possibleActions;
                    }
                }
            }
        }
    }
    return possibleActions;
}

export function joinGameSessionOnline(gameState, gameIdToJoin) { // gameId passed explicitly
    gameState.gameMode = 'online';
    gameState.currentGameId = gameIdToJoin; // Set this from the passed gameId

    showScreen('waitingRoomScreen');
    if(waitingGameIdDisplay) waitingGameIdDisplay.textContent = gameState.currentGameId;
    if(waitingStatusText) waitingStatusText.textContent = "Cargando partida...";
    if(gameIdInfoDisplay) gameIdInfoDisplay.textContent = gameState.currentGameId;

    if (gameState.unsubscribeGameListener) gameState.unsubscribeGameListener();
    const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
    gameState.unsubscribeGameListener = onSnapshot(gameRef, (docSnap) => {
        if (docSnap.exists()) {
            const gameData = docSnap.data();
            gameState.currentFirebaseGameData = gameData;

            if (!gameState.localPlayerRole) {
                if (gameData.player1Id === gameState.localPlayerId) { gameState.localPlayerRole = 'player1'; gameState.localPlayerNumber = 1; }
                else if (gameData.player2Id === gameState.localPlayerId) { gameState.localPlayerRole = 'player2'; gameState.localPlayerNumber = 2; }
            }

            if(playerListDiv) playerListDiv.innerHTML = `J1: ${gameData.player1Id ? gameData.player1Id.substring(0,8) : '---'} <br> J2: ${gameData.player2Id ? gameData.player2Id.substring(0,8) : '(Esperando...)'}`;

            if (gameData.status === 'waiting' && gameData.player2Id === null) {
                if(waitingStatusText) waitingStatusText.textContent = "Esperando al oponente...";
            } else if (gameData.status === 'active' || gameData.status.includes('_wins') || gameData.status === 'draw') {
                showScreen('gameContainer');
                // Pass gameState and the main onTileClick (bound with current gameState)
                if (!gameBoardElement.hasChildNodes() || Object.keys(gameState.units).length === 0) {
                    initializeBoardAndUnitsFirebase(gameState, (r,c) => onTileClick(gameState, r, c));
                }
                updateBoardFromFirestore(gameState, gameData);
                if (gameData.status === 'active' && !gameState.gameActive) playSound('turn');
                gameState.gameActive = gameData.status === 'active';
            }
        } else {
            showNotification("Error de Partida", "La partida ya no existe o fue eliminada.");
            leaveGameCleanup(gameState);
        }
    }, (error) => {
        console.error("Error en snapshot:", error);
        showNotification("Error de Conexión", "Se perdió la conexión.");
        leaveGameCleanup(gameState);
    });

    if (surrenderBtn) {
        surrenderBtn.removeEventListener('click', gameState.boundHandleSurrenderOnline); // Remove previous listener if any
        gameState.boundHandleSurrenderOnline = () => handleSurrenderOnline(gameState); // Store bound function for removal
        surrenderBtn.addEventListener('click', gameState.boundHandleSurrenderOnline);
    }
}

export function initializeBoardAndUnitsFirebase(gameState, onTileClickCallback) {
    gameState.riverCanvases = [];
    if(unitLayerElement) unitLayerElement.innerHTML = '';
    if(unitLayerElement) unitLayerElement.style.width = `${BOARD_COLS * TILE_SIZE}px`;
    if(unitLayerElement) unitLayerElement.style.height = `${BOARD_ROWS * TILE_SIZE}px`;
    if(gameBoardElement) gameBoardElement.innerHTML = '';
    if(gameBoardElement) gameBoardElement.style.gridTemplateColumns = `repeat(${BOARD_COLS}, ${TILE_SIZE}px)`;
    if(gameBoardElement) gameBoardElement.style.gridTemplateRows = `repeat(${BOARD_ROWS}, ${TILE_SIZE}px)`;

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const tile = document.createElement('div');
            const tileType = getTileType(r, c);
            tile.classList.add('tile', tileType);
            tile.dataset.row = r; tile.dataset.col = c;
            if (tileType === 'river') {
                const canvas = document.createElement('canvas');
                canvas.width = TILE_SIZE; canvas.height = TILE_SIZE;
                canvas.classList.add('river-canvas');
                tile.appendChild(canvas);
                gameState.riverCanvases.push(canvas.getContext('2d'));
            }
            tile.addEventListener('click', () => onTileClickCallback(r,c));
            if(gameBoardElement) gameBoardElement.appendChild(tile);
        }
    }
    addLogEntry(gameState, "Tablero inicializado para partida online.", "system");
}

export function updateBoardFromFirestore(gameState, firebaseGameData) {
    gameState.currentFirebaseGameData = firebaseGameData;
    gameState.gameActive = firebaseGameData.status === 'active';

    const newClientUnits = {};
    const newBoardModel = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

    if (firebaseGameData.units) {
        for (const unitId in firebaseGameData.units) {
            const unitDataFS = firebaseGameData.units[unitId];
            if (unitDataFS && unitDataFS.row !== undefined && unitDataFS.col !== undefined) {
                newBoardModel[unitDataFS.row][unitDataFS.col] = unitDataFS;
                let unitElement = gameState.units[unitId];
                if (!unitElement) {
                    unitElement = createUnitElement(gameState, unitDataFS);
                } else {
                    unitElement.__unitData = unitDataFS;
                    unitElement.style.transform = `translate(${unitDataFS.col * TILE_SIZE}px, ${unitDataFS.row * TILE_SIZE}px)`;
                    const canvas = unitElement.querySelector('canvas');
                    const ctx = canvas.getContext('2d');
                    const drawFunction = unitDrawFunctions[unitDataFS.drawFuncKey];
                    if (drawFunction) drawFunction(ctx, UNIT_CANVAS_SIZE, unitDataFS.player === 1);
                }
                newClientUnits[unitId] = unitElement;
            }
        }
    }

    for (const unitId in gameState.units) {
        if (!newClientUnits[unitId]) {
            if (gameState.units[unitId] && gameState.units[unitId].parentElement) gameState.units[unitId].remove();
        }
    }
    gameState.units = newClientUnits;
    gameState.board = newBoardModel;

    if (firebaseGameData.gameLog && !arraysEqual(gameState.gameLog.map(l=>l.text), firebaseGameData.gameLog.map(l=>l.text))) {
        gameState.gameLog = [...firebaseGameData.gameLog];
        // Sync with the game-log component
        const gameLogComp = document.getElementById('gameLogElement');
        if (gameLogComp && typeof gameLogComp.setEntries === 'function') {
            gameLogComp.setEntries(gameState.gameLog); // Assumes gameState.gameLog is newest first
        }
    }
    renderHighlightsAndInfo(gameState);
    renderUnitRosterOnline(gameState);

    if (!gameState.gameActive && (firebaseGameData.status.includes('_wins') || firebaseGameData.status === 'draw')) {
        let winner = null; let reason = firebaseGameData.winnerReason || "Partida Terminada";
        if (firebaseGameData.status === 'player1_wins') winner = 1;
        if (firebaseGameData.status === 'player2_wins') winner = 2;
        if (firebaseGameData.status === 'draw') reason = "Empate";

        showEndGameModal(gameState, winner, reason); // Pass gameState
    }
}

export function arraysEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function leaveGameCleanup(gameState) {
    if (gameState.unsubscribeGameListener) {
        gameState.unsubscribeGameListener();
        gameState.unsubscribeGameListener = null;
    }

    if (gameState.gameMode === 'online' &&
        gameState.currentFirebaseGameData &&
        gameState.currentFirebaseGameData.status === 'active' &&
        firestoreDB &&
        gameState.currentGameId &&
        gameState.localPlayerId && // Make sure we know who is leaving
        (gameState.localPlayerId === gameState.currentFirebaseGameData.player1Id || gameState.localPlayerId === gameState.currentFirebaseGameData.player2Id) // Make sure the leaver is a player
       ) {

        const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
        let winningPlayerRole;
        let disconnectingPlayerNumber;

        if (gameState.localPlayerId === gameState.currentFirebaseGameData.player1Id) {
            winningPlayerRole = 'player2_wins'; // Player 1 left, Player 2 wins
            disconnectingPlayerNumber = 1;
        } else { // Must be player2Id if passes guard above
            winningPlayerRole = 'player1_wins'; // Player 2 left, Player 1 wins
            disconnectingPlayerNumber = 2;
        }

        // Use a 'set' with merge:true or an 'update' if confident the doc exists.
        // runTransaction might be too much for a cleanup, but ensures atomicity if other updates were pending.
        // For simplicity, a direct update, but this might fail if offline.
        // A more robust solution might involve cloud functions for disconnects.
        // For now, client-side attempt:
        updateDoc(gameRef, { // Changed from setDoc to updateDoc
            status: winningPlayerRole,
            winnerReason: "Desconexión",
            currentPlayerId: null,
            lastMoveAt: serverTimestamp(),
            gameLog: arrayUnion({
                text: `Jugador ${disconnectingPlayerNumber} se ha desconectado.`,
                type: 'system',
                timestamp: new Date().toISOString()
            })
        }).then(() => {
            addLogEntry(gameState, `Jugador ${disconnectingPlayerNumber} desconectado, partida ${gameState.currentGameId} actualizada.`, "system");
        }).catch(e => {
            console.error("Error actualizando partida por desconexión:", e);
            // Log locally that update failed, game might be stuck for opponent
        });
    }

    if (gameState.gameMode === 'online' && gameState.localPlayerRole === 'player1' &&
        gameState.currentFirebaseGameData && gameState.currentFirebaseGameData.status === 'waiting' &&
        firestoreDB && gameState.currentGameId) {
        deleteDoc(doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`))
            .then(() => addLogEntry(gameState, `Partida ${gameState.currentGameId} eliminada por anfitrión.`, "system"))
            .catch(e => console.error("Error borrando partida al salir:", e));
    }

    gameState.currentGameId = null;
    gameState.localPlayerRole = null;
    gameState.localPlayerNumber = null;
    gameState.currentFirebaseGameData = null;
    gameState.gameActive = false;
    gameState.gameMode = null;
    gameState.aiDifficulty = null;
    if(unitLayerElement) unitLayerElement.innerHTML = '';
    gameState.units = {};
    gameState.board = [];
    showScreen('mainMenuScreen');
    addLogEntry(gameState, "Has salido de la partida.", "system");
}

export async function hostNewOnlineGame(gameState) {
    if (!firestoreDB || !gameState.localPlayerId) {
        showNotification("Error", "Firebase no está listo o no estás autenticado.");
        return;
    }
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    gameState.currentGameId = gameId;
    gameState.localPlayerRole = 'player1';
    gameState.localPlayerNumber = 1;

    const initialUnits = {};
    const p1Base = createUnitData('BASE',1,0); p1Base.row=BOARD_ROWS-1; p1Base.col=Math.floor(BOARD_COLS/2); initialUnits[p1Base.id]=p1Base;
    const p1G1=createUnitData('GUERRERO',1,1); p1G1.row=BOARD_ROWS-2; p1G1.col=Math.floor(BOARD_COLS/2)-1; initialUnits[p1G1.id]=p1G1;
    const p1A1=createUnitData('ARQUERO',1,2); p1A1.row=BOARD_ROWS-2; p1A1.col=Math.floor(BOARD_COLS/2)+1; initialUnits[p1A1.id]=p1A1;
    const p1T1=createUnitData('GIGANTE',1,3); p1T1.row=BOARD_ROWS-3; p1T1.col=Math.floor(BOARD_COLS/2); initialUnits[p1T1.id]=p1T1;
    const p2Base=createUnitData('BASE',2,0); p2Base.row=0; p2Base.col=Math.floor(BOARD_COLS/2); initialUnits[p2Base.id]=p2Base;
    const p2G1=createUnitData('GUERRERO',2,1); p2G1.row=1; p2G1.col=Math.floor(BOARD_COLS/2)-1; initialUnits[p2G1.id]=p2G1;
    const p2A1=createUnitData('ARQUERO',2,2); p2A1.row=1; p2A1.col=Math.floor(BOARD_COLS/2)+1; initialUnits[p2A1.id]=p2A1;
    const p2T1=createUnitData('GIGANTE',2,3); p2T1.row=2; p2T1.col=Math.floor(BOARD_COLS/2); initialUnits[p2T1.id]=p2T1;

    const gameData = {
        gameId: gameId, player1Id: gameState.localPlayerId, player2Id: null,
        currentPlayerId: gameState.localPlayerId, units: initialUnits, status: 'waiting',
        createdAt: serverTimestamp(), lastMoveAt: serverTimestamp(),
        gameLog: [{text: `Partida ${gameId} creada por Jugador 1 (${gameState.localPlayerId.substring(0,5)}...).`, type: 'system', timestamp: new Date().toISOString()}],
        winnerReason: ""
    };
    try {
        const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameId}`);
        await setDoc(gameRef, gameData);
        addLogEntry(gameState, `Partida ${gameId} creada. Esperando oponente...`, "system");
        joinGameSessionOnline(gameState, gameId); // Pass gameId explicitly
    } catch (e) {
        console.error("Error creando partida:",e);
        showNotification("Error",`No se pudo crear la partida: ${e.message}`);
        gameState.currentGameId = null; // Reset on error
    }
}

export async function joinExistingOnlineGame(gameState, gameIdToJoin) {
    if (!firestoreDB || !gameState.localPlayerId) {
        showNotification("Error", "Firebase no está listo o no estás autenticado.");
        return;
    }
    if (!gameIdToJoin) {
        showNotification("Error", "Por favor, ingresa un ID de partida.");
        return;
    }

    gameState.currentGameId = gameIdToJoin.toUpperCase();

    try {
        await runTransaction(firestoreDB, async (transaction) => {
            const gameRef = doc(firestoreDB, `${FIRESTORE_GAME_PATH_PREFIX}/${gameState.currentGameId}`);
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) throw new Error("Partida no encontrada.");

            const gd = gameDoc.data();
            if (gd.player1Id === gameState.localPlayerId) {
                gameState.localPlayerRole='player1'; gameState.localPlayerNumber=1;
            } else if (gd.player2Id && gd.player2Id !== gameState.localPlayerId && gd.player1Id !== gameState.localPlayerId) {
                throw new Error("Partida llena o ya eres espectador de esta partida.");
            }
             else if (!gd.player2Id) {
                transaction.update(gameRef, {
                    player2Id: gameState.localPlayerId,
                    status: 'active',
                    gameLog: arrayUnion({
                        text: `Jugador 2 (${gameState.localPlayerId.substring(0,5)}...) se unió.`,
                        type: 'system',
                        timestamp: new Date().toISOString()
                    })
                });
                gameState.localPlayerRole='player2'; gameState.localPlayerNumber=2;
            } else if (gd.player2Id === gameState.localPlayerId) {
                gameState.localPlayerRole='player2'; gameState.localPlayerNumber=2;
            } else { // Should not be reached if logic is correct
                throw new Error("No se pudo determinar el rol en la partida.");
            }
        });
        addLogEntry(gameState, `Unido a partida ${gameState.currentGameId} como ${gameState.localPlayerRole}.`, "system");
        joinGameSessionOnline(gameState, gameState.currentGameId); // Pass gameId explicitly
    } catch (e) {
        console.error("Error uniéndose a partida:",e);
        showNotification("Error al Unirse",`No se pudo unir: ${e.message}`);
        gameState.currentGameId = null; // Reset gameId if join failed
    }
}
