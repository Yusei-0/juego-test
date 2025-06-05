import { PIXEL_GRID_SIZE } from './constants.js';
// gameState is not available here, so we'll need to pass it or its relevant parts to animateRiver
// For now, gameState references are commented out or will be passed as arguments.

function drawPixel(ctx, x, y, color, pixelSize, artOffsetX = 0, artOffsetY = 0) {
    ctx.fillStyle = color;
    ctx.fillRect(artOffsetX + x * pixelSize, artOffsetY + y * pixelSize, pixelSize, pixelSize);
}

const unitDrawFunctions = {
    drawBase: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize; const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2; const artOffsetY = (canvasSize - artActualHeight) / 2;
        const wall = isPlayer1 ? '#8B572A' : '#6C7A89'; const roof = isPlayer1 ? '#CD853F' : '#95A5A6';
        const detail = isPlayer1 ? '#5D4037' : '#34495E'; const shadow = '#4A3B31';
        ctx.clearRect(0,0, canvasSize, canvasSize);
        for (let y = 4; y < 14; y++) for (let x = 2; x < 14; x++) drawPixel(ctx, x, y, wall, pSize, artOffsetX, artOffsetY);
        for (let x = 3; x < 13; x++) drawPixel(ctx, x, 3, roof, pSize, artOffsetX, artOffsetY);
        for (let i = 0; i < 5; i++) { drawPixel(ctx, 2 + i*2, 2, wall, pSize, artOffsetX, artOffsetY); if (i < 4) drawPixel(ctx, 3 + i*2, 2, detail, pSize, artOffsetX, artOffsetY);}
        drawPixel(ctx, 12, 2, wall, pSize, artOffsetX, artOffsetY);
        for (let y = 10; y < 13; y++) for (let x = 6; x < 10; x++) drawPixel(ctx, x, y, detail, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 4, 5, shadow, pSize, artOffsetX, artOffsetY); drawPixel(ctx, 11, 5, shadow, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 4, 8, shadow, pSize, artOffsetX, artOffsetY); drawPixel(ctx, 11, 8, shadow, pSize, artOffsetX, artOffsetY);
    },
    drawGuerrero: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize; const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2; const artOffsetY = (canvasSize - artActualHeight) / 2;
        const skin = '#FFDBAC'; const skinShadow = '#E0AC69'; const hair = isPlayer1 ? '#7A4E3D' : '#555555';
        const armorMain = isPlayer1 ? '#B22222' : '#4169E1'; const armorAccent = isPlayer1 ? '#DC143C' : '#6495ED';
        const swordBlade = '#E0E0E0'; const swordGuard = '#A0A0A0'; const swordHilt = '#6F4E37';
        ctx.clearRect(0,0, canvasSize, canvasSize);
        for(let y=2; y<6; y++) for(let x=6; x<10; x++) drawPixel(ctx, x, y, skin, pSize, artOffsetX, artOffsetY);
        for(let x=6; x<10; x++) drawPixel(ctx, x,1,hair,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,2,hair,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,2,hair,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,4,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let y=6; y<12; y++) for(let x=5; x<11; x++) drawPixel(ctx, x, y, armorMain, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,6,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 8,6,armorAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 5,7,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,7,armorAccent,pSize, artOffsetX, artOffsetY);
        for(let y=12; y<15; y++) { drawPixel(ctx, 5,y,armorMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 6,y,armorMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,y,armorMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,y,armorMain,pSize, artOffsetX, artOffsetY); }
        drawPixel(ctx, 5,15,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 6,15,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,15,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,15,armorAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 12, 11, swordHilt, pSize, artOffsetX, artOffsetY); drawPixel(ctx, 12, 10, swordHilt, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 11, 9, swordGuard, pSize, artOffsetX, artOffsetY); drawPixel(ctx, 13, 9, swordGuard, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<7; i++) drawPixel(ctx, 12, 8-i, swordBlade, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 12, 1, '#FFFFFF', pSize, artOffsetX, artOffsetY);
        const shieldMain = isPlayer1 ? '#8B0000' : '#00008B'; const shieldAccent = isPlayer1 ? '#CD5C5C' : '#ADD8E6';
        for(let y=6; y<11; y++) drawPixel(ctx, 2,y,shieldMain,pSize, artOffsetX, artOffsetY);
        for(let y=7; y<10; y++) drawPixel(ctx, 3,y,shieldMain,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 1,7,shieldMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 1,8,shieldMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 1,9,shieldMain,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 2,8,shieldAccent,pSize, artOffsetX, artOffsetY);
    },
     drawArquero: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize; const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2; const artOffsetY = (canvasSize - artActualHeight) / 2;
        const skin = '#FFDBAC'; const skinShadow = '#E0AC69'; const hair = isPlayer1 ? '#9ACD32' : '#FFD700';
        const tunicMain = isPlayer1 ? '#006400' : '#483D8B'; const tunicAccent = isPlayer1 ? '#2E8B57' : '#6A5ACD';
        const bowWood = '#8B4513'; const arrowFletching = '#FFF8DC';
        ctx.clearRect(0,0, canvasSize, canvasSize);
        for(let y=2; y<6; y++) for(let x=6; x<10; x++) drawPixel(ctx, x, y, skin, pSize, artOffsetX, artOffsetY);
        for(let x=6; x<10; x++) drawPixel(ctx, x,1,hair,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,2,hair,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,2,hair,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,4,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let y=6; y<12; y++) for(let x=5; x<11; x++) drawPixel(ctx, x, y, tunicMain, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,6,tunicAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 8,6,tunicAccent,pSize, artOffsetX, artOffsetY);
        for(let y=12; y<15; y++) { drawPixel(ctx, 5,y,tunicMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 6,y,tunicMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,y,tunicMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,y,tunicMain,pSize, artOffsetX, artOffsetY); }
        drawPixel(ctx, 5,15,tunicAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 6,15,tunicAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,15,tunicAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,15,tunicAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 3, 1, bowWood, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<12; i++) drawPixel(ctx, 4, 2+i, bowWood, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 3, 14, bowWood, pSize, artOffsetX, artOffsetY);
        ctx.strokeStyle = '#C0C0C0'; ctx.lineWidth = pSize/2; ctx.beginPath();
        ctx.moveTo(artOffsetX + 3.5*pSize, artOffsetY + 1.5*pSize); ctx.lineTo(artOffsetX + 3.5*pSize, artOffsetY + 14.5*pSize);
        ctx.stroke();
        for(let i=0; i<5; i++) drawPixel(ctx, 5+i, 7, '#A0522D', pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 10, 7, '#B0B0B0', pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 4,7,arrowFletching,pSize, artOffsetX, artOffsetY);
    },
    drawGigante: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize; const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2; const artOffsetY = (canvasSize - artActualHeight) / 2;
        const skin = isPlayer1 ? '#DEB887' : '#A9A9A9'; const skinShadow = isPlayer1 ? '#CD853F' : '#696969';
        const loincloth = isPlayer1 ? '#8B4513' : '#556B2F'; const clubWood = '#A0522D'; const clubStone = '#708090';
        ctx.clearRect(0,0, canvasSize, canvasSize);
        for(let y=1; y<5; y++) for(let x=5; x<11; x++) drawPixel(ctx, x,y,skin,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,2,skinShadow,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,2,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let y=5; y<12; y++) for(let x=1; x<15; x++) drawPixel(ctx, x,y,skin,pSize, artOffsetX, artOffsetY);
        for(let y=5; y<12; y++) { drawPixel(ctx,1,y,skinShadow,pSize, artOffsetX, artOffsetY); drawPixel(ctx,14,y,skinShadow,pSize, artOffsetX, artOffsetY); }
        for(let x=2; x<14; x++) drawPixel(ctx,x,11,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let y=12; y<14; y++) for(let x=4; x<12; x++) drawPixel(ctx, x,y,loincloth,pSize, artOffsetX, artOffsetY);
        for(let y=14; y<16; y++) { for(let x=2; x<7; x++) drawPixel(ctx,x,y,skin,pSize, artOffsetX, artOffsetY); for(let x=9; x<14; x++) drawPixel(ctx,x,y,skin,pSize, artOffsetX, artOffsetY); }
        for(let x=2; x<7; x++) drawPixel(ctx,x,15,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let x=9; x<14; x++) drawPixel(ctx,x,15,skinShadow,pSize, artOffsetX, artOffsetY);
        for(let y=3; y<12; y++) drawPixel(ctx, 13,y,clubWood,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 14,2,clubStone,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 15,2,clubStone,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 13,3,clubStone,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 14,3,clubStone,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 15,3,clubStone,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 12,4,clubStone,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 13,4,clubStone,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 14,4,clubStone,pSize, artOffsetX, artOffsetY);
    },
    // --- Dibuja la unidad Sandor ---
    drawSanador: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize;
        const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2;
        const artOffsetY = (canvasSize - artActualHeight) / 2;
        const skin = '#FFDBAC';
        const hair = isPlayer1 ? '#4A2A00' : '#333333'; // Darker Brown for P1, Dark Grey for P2
        const armorMain = isPlayer1 ? '#D4AF37' : '#708090'; // Gold for P1, Slate Gray for P2
        const armorAccent = isPlayer1 ? '#B8860B' : '#536878'; // Dark Gold for P1, Dark Slate Gray for P2
        const swordBlade = '#C0C0C0'; // Silver
        const swordGuard = '#808080'; // Gray
        const swordHilt = '#5D4037'; // Brown

        ctx.clearRect(0,0, canvasSize, canvasSize);

        // Head (similar to Guerrero but different hair)
        for(let y=2; y<6; y++) for(let x=6; x<10; x++) drawPixel(ctx, x, y, skin, pSize, artOffsetX, artOffsetY);
        for(let x=5; x<11; x++) drawPixel(ctx, x,1,hair,pSize, artOffsetX, artOffsetY); // Wider hair
        drawPixel(ctx, 5,2,hair,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 10,2,hair,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,0,hair,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 7,0,hair,pSize, artOffsetX, artOffsetY); // Spiky hair top
        drawPixel(ctx, 8,0,hair,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,0,hair,pSize, artOffsetX, artOffsetY);


        // Body Armor (more ornate)
        for(let y=6; y<12; y++) for(let x=4; x<12; x++) drawPixel(ctx, x, y, armorMain, pSize, artOffsetX, artOffsetY); // Wider torso
        drawPixel(ctx, 6,6,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,6,armorAccent,pSize, artOffsetX, artOffsetY); // Pauldrons
        drawPixel(ctx, 4,7,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 11,7,armorAccent,pSize, artOffsetX, artOffsetY);
        for(let i=0; i<3; i++) drawPixel(ctx, 7, 7+i, armorAccent, pSize, artOffsetX, artOffsetY); // Vertical stripe

        // Legs (armored)
        for(let y=12; y<15; y++) {
            drawPixel(ctx, 4,y,armorMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 5,y,armorMain,pSize, artOffsetX, artOffsetY);
            drawPixel(ctx, 10,y,armorMain,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 11,y,armorMain,pSize, artOffsetX, artOffsetY);
        }
        drawPixel(ctx, 4,15,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 5,15,armorAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 10,15,armorAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 11,15,armorAccent,pSize, artOffsetX, artOffsetY);

        // Sword (larger or different style)
        drawPixel(ctx, 13, 10, swordHilt, pSize, artOffsetX, artOffsetY); // Hand on hilt
        drawPixel(ctx, 13, 9, swordHilt, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 12, 8, swordGuard, pSize, artOffsetX, artOffsetY); drawPixel(ctx, 14, 8, swordGuard, pSize, artOffsetX, artOffsetY); // Wider guard
        for(let i=0; i<8; i++) drawPixel(ctx, 13, 7-i, swordBlade, pSize, artOffsetX, artOffsetY); // Longer blade
        drawPixel(ctx, 13, 0, '#FFFFFF', pSize, artOffsetX, artOffsetY); // Glint

        // Shield (optional, or a different arm position)
        // For Sandor, let's make his sword two-handed looking, so less shield or smaller buckler
        drawPixel(ctx, 2, 7, skin, pSize, artOffsetX, artOffsetY); // Left hand
        drawPixel(ctx, 2, 8, skin, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 1, 8, armorAccent, pSize, artOffsetX, artOffsetY); // Small buckler/gauntlet detail
        drawPixel(ctx, 2, 9, armorAccent, pSize, artOffsetX, artOffsetY);
    },

    // --- Dibuja la unidad Unidad Voladora ---
    drawUnidadVoladora: (ctx, canvasSize, isPlayer1) => {
        const pSize = Math.floor(canvasSize / PIXEL_GRID_SIZE);
        const artActualWidth = PIXEL_GRID_SIZE * pSize;
        const artActualHeight = PIXEL_GRID_SIZE * pSize;
        const artOffsetX = (canvasSize - artActualWidth) / 2;
        const artOffsetY = (canvasSize - artActualHeight) / 2;

        const bodyMain = isPlayer1 ? '#A0D2DB' : '#E0BBE4'; // Light Blue for P1, Light Purple for P2
        const bodyAccent = isPlayer1 ? '#78C1D0' : '#D0A9CE'; // Darker Blue for P1, Darker Purple for P2
        const wingColor = isPlayer1 ? '#FFFFFF' : '#F0F0F0'; // White/Light Grey wings
        const eyeColor = '#FF0000'; // Red eye

        ctx.clearRect(0,0, canvasSize, canvasSize);

        // Body (central oval shape)
        for(let y=5; y<11; y++) for(let x=6; x<10; x++) drawPixel(ctx, x,y,bodyMain,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,5,bodyAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 8,5,bodyAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,6,bodyAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,6,bodyAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 6,10,bodyAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 9,10,bodyAccent,pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,11,bodyAccent,pSize, artOffsetX, artOffsetY); drawPixel(ctx, 8,11,bodyAccent,pSize, artOffsetX, artOffsetY);

        // Eye
        drawPixel(ctx, 8, 7, eyeColor, pSize, artOffsetX, artOffsetY);

        // Wings (spread outwards)
        // Left Wing
        for(let i=0; i<5; i++) drawPixel(ctx, 5-i, 3+i, wingColor, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<4; i++) drawPixel(ctx, 4-i, 4+i, wingColor, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<5; i++) drawPixel(ctx, 5-i, 4+i, wingColor, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 1, 8, bodyAccent, pSize, artOffsetX, artOffsetY); // Wing joint shadow

        // Right Wing
        for(let i=0; i<5; i++) drawPixel(ctx, 10+i, 3+i, wingColor, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<4; i++) drawPixel(ctx, 11+i, 4+i, wingColor, pSize, artOffsetX, artOffsetY);
        for(let i=0; i<5; i++) drawPixel(ctx, 10+i, 4+i, wingColor, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 14, 8, bodyAccent, pSize, artOffsetX, artOffsetY); // Wing joint shadow

        // Simple "feet" or landing gear (optional, as it's flying)
        drawPixel(ctx, 7, 12, bodyAccent, pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 8, 12, bodyAccent, pSize, artOffsetX, artOffsetY);
    }
};

function drawRiverTile(ctx, width, height, time) {
    const waveHeight = 4; const waveLength = 20; const speed = 0.05; const numWaves = 3;
    const baseColor = '#3B82F6'; const highlightColor = '#60A5FA'; const shadowColor = '#2563EB';
    ctx.fillStyle = baseColor; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        const yOffset = (height / numWaves) * i + (height / (numWaves * 2));
        const timeOffset = i * 0.5;
        for (let x = 0; x <= width; x++) {
            const y = yOffset + Math.sin(x / waveLength + time * speed + timeOffset) * waveHeight;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = highlightColor; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath();
         for (let x = 0; x <= width; x++) {
            const y = yOffset + Math.sin(x / waveLength + time * speed + timeOffset) * waveHeight + 2;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = shadowColor; ctx.lineWidth = 1; ctx.stroke();
    }
}

// animateRiver now accepts gameState and uses its properties directly.
function animateRiver(gameState) {
    gameState.riverAnimationTime += 1;
    if (gameState.riverCanvases) {
        gameState.riverCanvases.forEach(rCtx => {
            if (rCtx && rCtx.canvas) { // Add null check for rCtx
                drawRiverTile(rCtx, rCtx.canvas.width, rCtx.canvas.height, gameState.riverAnimationTime);
            }
        });
    }
    requestAnimationFrame(() => animateRiver(gameState)); // Pass gameState recursively
    // No need to return riverAnimationTime as it's modified on gameState directly
}

// --- Terrain Tile Drawing Functions ---

function drawPrairieTile(ctx, tileWidth, tileHeight) {
    ctx.fillStyle = '#8FBC8F'; // MediumSeaGreen
    ctx.fillRect(0, 0, tileWidth, tileHeight);

    // Optional: Add some subtle texture or variation (can be kept or removed)
    // For this change, let's remove the random dots to ensure the color is flat as per typical spawn indication
    // ctx.fillStyle = 'rgba(0,0,0,0.03)';
    // for (let i = 0; i < 10; i++) {
    //     ctx.fillRect(Math.random() * tileWidth, Math.random() * tileHeight, 2, 2);
    // }
}

function drawMountainTile(ctx, tileWidth, tileHeight) {
    // Base color (can be prairie or a darker earth tone if mountain is on it)
    ctx.fillStyle = '#A8C256'; // Prairie base, assuming mountains rise from it
    ctx.fillRect(0, 0, tileWidth, tileHeight);

    const pSize = Math.floor(tileWidth / PIXEL_GRID_SIZE); // Assuming PIXEL_GRID_SIZE is 16
    const artOffsetX = (tileWidth - PIXEL_GRID_SIZE * pSize) / 2;
    const artOffsetY = (tileHeight - PIXEL_GRID_SIZE * pSize) / 2;

    // Mountain Body
    const mountainBaseColor = '#8B8989'; // Main rock color
    const mountainMidColor = '#A9A9A9';  // Slightly lighter rock
    const mountainHighlightColor = '#DCDCDC'; // Lightest rock/snow
    const snowColor = '#FFFFFF';

    // Simplified blocky mountain
    // Base layer
    for (let y = 8; y < 15; y++) for (let x = 3; x < 13; x++) drawPixel(ctx, x, y, mountainBaseColor, pSize, artOffsetX, artOffsetY);

    // Mid layer
    for (let y = 5; y < 8; y++) for (let x = 5; x < 11; x++) drawPixel(ctx, x, y, mountainMidColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 4, 7, mountainMidColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 11, 7, mountainMidColor, pSize, artOffsetX, artOffsetY);

    // Highlight/Snow cap
    for (let y = 2; y < 5; y++) for (let x = 6; x < 10; x++) drawPixel(ctx, x, y, mountainHighlightColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 7, 1, snowColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 8, 1, snowColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 6, 2, snowColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 9, 2, snowColor, pSize, artOffsetX, artOffsetY);
}


function drawForestTile(ctx, tileWidth, tileHeight) {
    // Base color (prairie, assuming forest grows on it)
    ctx.fillStyle = '#A8C256';
    ctx.fillRect(0, 0, tileWidth, tileHeight);

    const pSize = Math.floor(tileWidth / PIXEL_GRID_SIZE);
    const artOffsetX = (tileWidth - PIXEL_GRID_SIZE * pSize) / 2;
    const artOffsetY = (tileHeight - PIXEL_GRID_SIZE * pSize) / 2;

    const trunkColor = '#8B4513'; // SaddleBrown
    const leavesDarkColor = '#006400'; // DarkGreen
    const leavesLightColor = '#228B22'; // ForestGreen

    // Tree 1 (slightly left)
    for (let y = 8; y < 14; y++) drawPixel(ctx, 5, y, trunkColor, pSize, artOffsetX, artOffsetY); // Trunk
    for (let y = 3; y < 9; y++) for (let x = 2; x < 8; x++) { // Canopy
        if (Math.random() > 0.3) drawPixel(ctx, x, y, (x+y)%2===0 ? leavesDarkColor : leavesLightColor, pSize, artOffsetX, artOffsetY);
    }
    drawPixel(ctx, 4, 2, leavesLightColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 5, 2, leavesLightColor, pSize, artOffsetX, artOffsetY);


    // Tree 2 (slightly right, smaller)
    for (let y = 9; y < 14; y++) drawPixel(ctx, 10, y, trunkColor, pSize, artOffsetX, artOffsetY); // Trunk
     for (let y = 5; y < 10; y++) for (let x = 8; x < 13; x++) { // Canopy
        if (Math.random() > 0.3) drawPixel(ctx, x, y, (x+y)%2===0 ? leavesDarkColor : leavesLightColor, pSize, artOffsetX, artOffsetY);
    }
    drawPixel(ctx, 9, 4, leavesDarkColor, pSize, artOffsetX, artOffsetY);
    drawPixel(ctx, 10, 4, leavesDarkColor, pSize, artOffsetX, artOffsetY);
}

function drawSwampTile(ctx, tileWidth, tileHeight) {
    ctx.fillStyle = '#556B2F'; // DarkOliveGreen - base murky water
    ctx.fillRect(0, 0, tileWidth, tileHeight);

    // Patches of different murky colors
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Darker patches
    ctx.fillRect(tileWidth*0.1, tileHeight*0.1, tileWidth*0.5, tileHeight*0.3);
    ctx.fillRect(tileWidth*0.5, tileHeight*0.6, tileWidth*0.4, tileHeight*0.3);
    ctx.fillRect(tileWidth*0.2, tileHeight*0.5, tileWidth*0.6, tileHeight*0.2);

    ctx.fillStyle = 'rgba(107, 142, 35, 0.3)'; // OliveDrab, slightly lighter patches
    ctx.fillRect(tileWidth*0.6, tileHeight*0.2, tileWidth*0.3, tileHeight*0.4);
    ctx.fillRect(tileWidth*0.1, tileHeight*0.7, tileWidth*0.4, tileHeight*0.2);

    // Optional: a few "reeds" or "bubbles" using drawPixel if PIXEL_GRID_SIZE and drawPixel are available
    const pSize = Math.floor(tileWidth / PIXEL_GRID_SIZE);
    const artOffsetX = (tileWidth - PIXEL_GRID_SIZE * pSize) / 2;
    const artOffsetY = (tileHeight - PIXEL_GRID_SIZE * pSize) / 2;
    if(pSize > 0){ // only if pixel size is valid
        drawPixel(ctx, 5,5, '#6B8E23', pSize, artOffsetX, artOffsetY); // Olive
        drawPixel(ctx, 6,5, '#6B8E23', pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 10,10, '#6B8E23', pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 11,10, '#6B8E23', pSize, artOffsetX, artOffsetY);
        drawPixel(ctx, 7,12, 'rgba(0,0,0,0.2)', pSize, artOffsetX, artOffsetY); // Darker bubble
    }
}


export { unitDrawFunctions, drawPixel, drawRiverTile, animateRiver, drawPrairieTile, drawMountainTile, drawForestTile, drawSwampTile };
