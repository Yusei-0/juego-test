import Unit from './Unit.js';
import { UNIT_TYPES_DRAW_FUNCS_KEY } from '../config/constants.js';

class Base extends Unit {
    constructor(player, id, row, col) {
        super(player, id, row, col, 20, 0, 0, 0, false, UNIT_TYPES_DRAW_FUNCS_KEY.BASE, 'Base');
    }
}

export default Base;
