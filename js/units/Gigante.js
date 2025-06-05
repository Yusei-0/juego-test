import Unit from './Unit.js';
import { UNIT_TYPES_DRAW_FUNCS_KEY } from '../config/constants.js';

class Gigante extends Unit {
    constructor(player, id, row, col) {
        super(player, id, row, col, 15, 4, 1, 1, true, UNIT_TYPES_DRAW_FUNCS_KEY.GIGANTE, 'Gigante');
    }
}

export default Gigante;
