class Unit {
    constructor(player, id, row, col, hp, attack, movement, range, isMobile, drawFuncKey, name) {
        this.player = player;
        this.id = id;
        this.row = row;
        this.col = col;
        this.hp = hp;
        this.maxHp = hp; // Initialize maxHp to initial hp
        this.attack = attack;
        this.movement = movement;
        this.range = range;
        this.isMobile = isMobile;
        this.drawFuncKey = drawFuncKey;
        this.name = name; // Add name property
    }

    // Add common methods here if needed
}

export default Unit;
