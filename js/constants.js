export const BOARD_ROWS = 12;
export const BOARD_COLS = 9;
export const TILE_SIZE = 50;
export const UNIT_DIV_SIZE = TILE_SIZE;
export const UNIT_CANVAS_SIZE = TILE_SIZE - 2;
export const UNIT_CANVAS_OFFSET = (UNIT_DIV_SIZE - UNIT_CANVAS_SIZE) / 2;
export const PIXEL_GRID_SIZE = 16;

export const RIVER_START_ROW = 5;
export const RIVER_END_ROW = 6;
export const BRIDGE_COL_1 = 2;
export const BRIDGE_COL_2 = 6;

export const UNIT_TYPES = {
    BASE: { name: 'Base', hp: 25, attack: 0, movement: 0, range: 0, class: 'base', isMobile: false, drawFunc: 'drawBase' },
    GUERRERO: { name: 'Guerrero', hp: 20, attack: 8, movement: 2, range: 1, class: 'guerrero', isMobile: true, drawFunc: 'drawGuerrero', summonCost: 15 },
    ARQUERO: { name: 'Arquero', hp: 15, attack: 6, movement: 2, range: 3, class: 'arquero', isMobile: true, drawFunc: 'drawArquero', summonCost: 20 },
    GIGANTE: { name: 'Gigante', hp: 40, attack: 15, movement: 1, range: 1, class: 'gigante', isMobile: true, drawFunc: 'drawGigante', summonCost: 35 },
    // Unidad Guerrero Especial: Sandor
    SANADOR: { name: 'Sanador', hp: 25, attack: 10, movement: 2, range: 1, class: 'sanador', isMobile: true, drawFunc: 'drawSanador', summonCost: 25, abilityCost: 10,
        // Cantidad de PV que cura
        healAmount: 10,
        // Alcance de la curación (en casillas)
        healRange: 1 },
    // Unidad Aérea: Unidad Voladora
    UNIDAD_VOLADORA: { name: 'Unidad Voladora', hp: 15, attack: 7, movement: 2, range: 1, class: 'voladora', isMobile: true, drawFunc: 'drawUnidadVoladora', summonCost: 15 }
};

// Music file paths
export const MENU_MUSIC_PATH = 'assets/music/menu_music.mp3';
