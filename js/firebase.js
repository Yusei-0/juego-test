import { firebaseConfig } from './config.js';
import { authLoadingScreen } from './ui.js'; // Added import

// Firebase SDK imports
let firebaseApp, firebaseAuth, firestoreDB;
let doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp, runTransaction, deleteDoc, signInAnonymously, onAuthStateChanged, signInWithCustomToken;
let arrayUnion; // Changed from FieldValue

async function initializeFirebase() {
    if (firebaseConfig.apiKey) {
        try {
            const fb = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
            const authFb = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
            const firestoreFb = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

            firebaseApp = fb.initializeApp(firebaseConfig);
            firebaseAuth = authFb.getAuth(firebaseApp);
            firestoreDB = firestoreFb.getFirestore(firebaseApp);
            // firestoreFb.setLogLevel('debug'); // Uncomment for Firestore debugging

            doc = firestoreFb.doc;
            setDoc = firestoreFb.setDoc;
            getDoc = firestoreFb.getDoc;
            onSnapshot = firestoreFb.onSnapshot;
            updateDoc = firestoreFb.updateDoc;
            serverTimestamp = firestoreFb.serverTimestamp;
            runTransaction = firestoreFb.runTransaction;
            arrayUnion = firestoreFb.arrayUnion; // Changed from FieldValue
            deleteDoc = firestoreFb.deleteDoc;
            signInAnonymously = authFb.signInAnonymously;
            onAuthStateChanged = authFb.onAuthStateChanged;
            signInWithCustomToken = authFb.signInWithCustomToken;

            console.log("Firebase initialized successfully for deployment.");
            return { success: true, firebaseAuth, signInAnonymously, onAuthStateChanged };
        } catch (error) {
            console.error("Error initializing Firebase for deployment:", error);
            if (authLoadingScreen) { // Use imported authLoadingScreen
                authLoadingScreen.innerHTML = '<h2>Error Crítico</h2><p>No se pudo inicializar Firebase. Revisa la consola.</p>';
            }
            return { success: false, error: error };
        }
    } else {
        const error = new Error("Firebase configuration object is missing API key.");
        console.error(error.message);
        if (authLoadingScreen) { // Use imported authLoadingScreen
            authLoadingScreen.innerHTML = '<h2>Error de Configuración</h2><p>Falta la configuración de Firebase.</p>';
        }
        return { success: false, error: error };
    }
}

export {
    initializeFirebase,
    firebaseApp,
    firebaseAuth,
    firestoreDB,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    runTransaction,
    arrayUnion,
    deleteDoc,
    signInAnonymously,
    onAuthStateChanged,
    signInWithCustomToken
};
