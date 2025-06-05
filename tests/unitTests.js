import Unit from '../js/units/Unit.js';
import Base from '../js/units/Base.js';
import Guerrero from '../js/units/Guerrero.js';
import Arquero from '../js/units/Arquero.js';
import Gigante from '../js/units/Gigante.js';
import { UNIT_TYPES_DRAW_FUNCS_KEY } from '../js/config/constants.js';

function runUnitTests() {
    console.log("--- Running Unit Tests ---");

    // Test Base Class
    try {
        const baseUnit = new Base(1, 'b1', 0, 0);
        console.assert(baseUnit.hp === 20, "Test Failed: Base HP");
        console.assert(baseUnit.maxHp === 20, "Test Failed: Base maxHp");
        console.assert(baseUnit.attack === 0, "Test Failed: Base attack");
        console.assert(baseUnit.movement === 0, "Test Failed: Base movement");
        console.assert(baseUnit.range === 0, "Test Failed: Base range");
        console.assert(baseUnit.name === 'Base', "Test Failed: Base name");
        console.assert(baseUnit.player === 1, "Test Failed: Base player");
        console.assert(baseUnit.id === 'b1', "Test Failed: Base id");
        console.assert(baseUnit.row === 0, "Test Failed: Base row");
        console.assert(baseUnit.col === 0, "Test Failed: Base col");
        console.assert(baseUnit.isMobile === false, "Test Failed: Base isMobile");
        console.assert(baseUnit.drawFuncKey === UNIT_TYPES_DRAW_FUNCS_KEY.BASE, "Test Failed: Base drawFuncKey");
        console.assert(baseUnit instanceof Base, "Test Failed: Base instanceof Base");
        console.assert(baseUnit instanceof Unit, "Test Failed: Base instanceof Unit");
        console.log("Base tests passed.");
    } catch (e) {
        console.error("Error in Base tests:", e);
    }

    // Test Guerrero Class
    try {
        const guerreroUnit = new Guerrero(2, 'g1', 1, 1);
        console.assert(guerreroUnit.hp === 10, "Test Failed: Guerrero HP");
        console.assert(guerreroUnit.maxHp === 10, "Test Failed: Guerrero maxHp");
        console.assert(guerreroUnit.attack === 3, "Test Failed: Guerrero attack");
        console.assert(guerreroUnit.movement === 1, "Test Failed: Guerrero movement");
        console.assert(guerreroUnit.range === 1, "Test Failed: Guerrero range");
        console.assert(guerreroUnit.name === 'Guerrero', "Test Failed: Guerrero name");
        console.assert(guerreroUnit.player === 2, "Test Failed: Guerrero player");
        console.assert(guerreroUnit.id === 'g1', "Test Failed: Guerrero id");
        console.assert(guerreroUnit.row === 1, "Test Failed: Guerrero row");
        console.assert(guerreroUnit.col === 1, "Test Failed: Guerrero col");
        console.assert(guerreroUnit.isMobile === true, "Test Failed: Guerrero isMobile");
        console.assert(guerreroUnit.drawFuncKey === UNIT_TYPES_DRAW_FUNCS_KEY.GUERRERO, "Test Failed: Guerrero drawFuncKey");
        console.assert(guerreroUnit instanceof Guerrero, "Test Failed: Guerrero instanceof Guerrero");
        console.assert(guerreroUnit instanceof Unit, "Test Failed: Guerrero instanceof Unit");
        console.log("Guerrero tests passed.");
    } catch (e) {
        console.error("Error in Guerrero tests:", e);
    }

    // Test Arquero Class
    try {
        const arqueroUnit = new Arquero(1, 'a1', 2, 2);
        console.assert(arqueroUnit.hp === 8, "Test Failed: Arquero HP");
        console.assert(arqueroUnit.maxHp === 8, "Test Failed: Arquero maxHp");
        console.assert(arqueroUnit.attack === 2, "Test Failed: Arquero attack");
        console.assert(arqueroUnit.movement === 1, "Test Failed: Arquero movement"); // Values from class definition
        console.assert(arqueroUnit.range === 2, "Test Failed: Arquero range");   // Values from class definition
        console.assert(arqueroUnit.name === 'Arquero', "Test Failed: Arquero name");
        console.assert(arqueroUnit.player === 1, "Test Failed: Arquero player");
        console.assert(arqueroUnit.id === 'a1', "Test Failed: Arquero id");
        console.assert(arqueroUnit.row === 2, "Test Failed: Arquero row");
        console.assert(arqueroUnit.col === 2, "Test Failed: Arquero col");
        console.assert(arqueroUnit.isMobile === true, "Test Failed: Arquero isMobile");
        console.assert(arqueroUnit.drawFuncKey === UNIT_TYPES_DRAW_FUNCS_KEY.ARQUERO, "Test Failed: Arquero drawFuncKey");
        console.assert(arqueroUnit instanceof Arquero, "Test Failed: Arquero instanceof Arquero");
        console.assert(arqueroUnit instanceof Unit, "Test Failed: Arquero instanceof Unit");
        console.log("Arquero tests passed.");
    } catch (e) {
        console.error("Error in Arquero tests:", e);
    }

    // Test Gigante Class
    try {
        const giganteUnit = new Gigante(2, 'giant1', 3, 3);
        console.assert(giganteUnit.hp === 15, "Test Failed: Gigante HP");
        console.assert(giganteUnit.maxHp === 15, "Test Failed: Gigante maxHp");
        console.assert(giganteUnit.attack === 4, "Test Failed: Gigante attack");
        console.assert(giganteUnit.movement === 1, "Test Failed: Gigante movement");
        console.assert(giganteUnit.range === 1, "Test Failed: Gigante range");
        console.assert(giganteUnit.name === 'Gigante', "Test Failed: Gigante name");
        console.assert(giganteUnit.player === 2, "Test Failed: Gigante player");
        console.assert(giganteUnit.id === 'giant1', "Test Failed: Gigante id");
        console.assert(giganteUnit.row === 3, "Test Failed: Gigante row");
        console.assert(giganteUnit.col === 3, "Test Failed: Gigante col");
        console.assert(giganteUnit.isMobile === true, "Test Failed: Gigante isMobile");
        console.assert(giganteUnit.drawFuncKey === UNIT_TYPES_DRAW_FUNCS_KEY.GIGANTE, "Test Failed: Gigante drawFuncKey");
        console.assert(giganteUnit instanceof Gigante, "Test Failed: Gigante instanceof Gigante");
        console.assert(giganteUnit instanceof Unit, "Test Failed: Gigante instanceof Unit");
        console.log("Gigante tests passed.");
    } catch (e) {
        console.error("Error in Gigante tests:", e);
    }

    console.log("--- Unit Tests Finished ---");
}

runUnitTests();
