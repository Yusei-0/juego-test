import Unit from './Unit.js';
import { UNIT_TYPES_DRAW_FUNCS_KEY } from '../config/constants.js';

class Guerrero extends Unit {
    constructor(player, id, row, col) {
        super(player, id, row, col, 10, 3, 1, 1, true, UNIT_TYPES_DRAW_FUNCS_KEY.GUERRERO, 'Guerrero');
    }
}

export default Guerrero;
