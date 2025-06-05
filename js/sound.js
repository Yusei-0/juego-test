// Sonido para la habilidad de curación
let moveSound, attackSound, damageSound, deathSound, turnSound, healSound;
import { MENU_MUSIC_PATH } from './constants.js';

// Existing sound effect players

// Music players
let menuMusicPlayer;

function initializeSounds() {
    if (typeof Tone !== 'undefined') {
        moveSound = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.2 } }).toDestination();
        moveSound.volume.value = -15;
        attackSound = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 } }).toDestination();
        attackSound.volume.value = -10;
        damageSound = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 5, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 } }).toDestination();
        damageSound.volume.value = -8;
        deathSound = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 } }).toDestination();
        deathSound.volume.value = -12;
        turnSound = new Tone.Synth({ oscillator: {type: "square"}, envelope: {attack: 0.01, decay: 0.08, sustain: 0.01, release: 0.1} }).toDestination();
        turnSound.volume.value = -18;
        // Inicializa el sonido de curación
        healSound = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.3 } }).toDestination();
        healSound.volume.value = -14; // Adjust volume as needed
         console.log("Sonidos inicializados con Tone.js");
    } else { console.warn("Tone.js no está cargado."); }
}

function initializeMusic() {
    if (typeof Tone !== 'undefined' && Tone.Player) {
        menuMusicPlayer = new Tone.Player({
            url: MENU_MUSIC_PATH,
            loop: true,
            autostart: false,
            volume: -10 // Default volume, can be adjusted
        }).toDestination();

        console.log("Menu music player initialized.");
    } else {
        console.warn("Tone.js or Tone.Player is not available. Music playback disabled.");
    }
}

function playSound(type, note = null) {
    if (typeof Tone === 'undefined' || !Tone.context || Tone.context.state !== 'running') {
        if (Tone && Tone.context && Tone.context.state !== 'running') {
            Tone.start().then(() => {}).catch(e => {}); // Attempt to start Tone context on first interaction
        } return;
    }
    switch(type) {
        case 'move': if(moveSound) moveSound.triggerAttackRelease(note || "C4", "8n"); break;
        case 'attack': if(attackSound) attackSound.triggerAttackRelease("8n"); break;
        case 'damage': if(damageSound) damageSound.triggerAttackRelease(note || "C3", "8n", Tone.now(), 0.8); break;
        case 'death': if(deathSound) deathSound.triggerAttackRelease(note || "C2", "2n"); break;
        case 'turn': if(turnSound) turnSound.triggerAttackRelease(note || "E5", "16n"); break;
        // Sonido de curación
        case 'heal': if(healSound) healSound.triggerAttackRelease(note || "C5", "8n"); break; // Added heal sound
    }
}

function playMenuMusic() {
    if (typeof Tone === 'undefined' || !Tone.Player) return;
    if (!Tone.context || Tone.context.state !== 'running') {
        Tone.start().then(() => {
            if (menuMusicPlayer && menuMusicPlayer.loaded) {
                 if (menuMusicPlayer.state !== "started") menuMusicPlayer.start();
            } else if (menuMusicPlayer) {
                menuMusicPlayer.load(MENU_MUSIC_PATH).then(() => {
                    menuMusicPlayer.start();
                }).catch(e => console.error("Error loading menu music:", e));
            }
        }).catch(e => console.error("Error starting Tone context for menu music:", e));
        return;
    }

    if (menuMusicPlayer && menuMusicPlayer.loaded) {
        if (menuMusicPlayer.state !== "started") {
            menuMusicPlayer.start();
            console.log("Menu music started.");
        }
    } else if (menuMusicPlayer) {
        menuMusicPlayer.load(MENU_MUSIC_PATH).then(() => {
            menuMusicPlayer.start();
            console.log("Menu music loaded and started.");
        }).catch(e => console.error("Error loading menu music:", e));
    }
}

function stopMenuMusic() {
    if (menuMusicPlayer && menuMusicPlayer.state === "started") {
        menuMusicPlayer.stop();
        console.log("Menu music stopped.");
    }
}

export {
    initializeSounds,
    playSound,
    moveSound,
    attackSound,
    damageSound,
    deathSound,
    turnSound,
    initializeMusic,
    playMenuMusic,
    stopMenuMusic
};
