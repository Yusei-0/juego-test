import Unit from './Unit.js';
import { UNIT_TYPES_DRAW_FUNCS_KEY } from '../config/constants.js';

class Arquero extends Unit {
    constructor(player, id, row, col) {
        super(player, id, row, col, 8, 2, 1, 2, true, UNIT_TYPES_DRAW_FUNCS_KEY.ARQUERO, 'Arquero');
    }
}

export default Arquero;
