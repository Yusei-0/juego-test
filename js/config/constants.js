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

// Import unit classes
import Base from '../units/Base.js';
import Guerrero from '../units/Guerrero.js';
import Arquero from '../units/Arquero.js';
import Gigante from '../units/Gigante.js';

export const UNIT_CLASSES = {
    BASE: Base,
    GUERRERO: Guerrero,
    ARQUERO: Arquero,
    GIGANTE: Gigante
};

export const UNIT_TYPES_DRAW_FUNCS_KEY = {
    BASE: 'drawBase',
    GUERRERO: 'drawGuerrero',
    ARQUERO: 'drawArquero',
    GIGANTE: 'drawGigante'
};
