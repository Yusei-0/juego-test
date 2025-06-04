let moveSound, attackSound, damageSound, deathSound, turnSound;

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
         console.log("Sonidos inicializados con Tone.js");
    } else { console.warn("Tone.js no está cargado."); }
}

function playSound(type, note = null) {
    if (typeof Tone === 'undefined' || !Tone.context || Tone.context.state !== 'running') {
        if (Tone && Tone.context && Tone.context.state !== 'running') {
            Tone.start().then(() => {}).catch(e => {});
        } return;
    }
    switch(type) {
        case 'move': if(moveSound) moveSound.triggerAttackRelease(note || "C4", "8n"); break;
        case 'attack': if(attackSound) attackSound.triggerAttackRelease("8n"); break;
        case 'damage': if(damageSound) damageSound.triggerAttackRelease(note || "C3", "8n", Tone.now(), 0.8); break;
        case 'death': if(deathSound) deathSound.triggerAttackRelease(note || "C2", "2n"); break;
        case 'turn': if(turnSound) turnSound.triggerAttackRelease(note || "E5", "16n"); break;
    }
}

export { initializeSounds, playSound, moveSound, attackSound, damageSound, deathSound, turnSound };
