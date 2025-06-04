import { ElementalComponent } from '../elemental.js';

export class PlayerTurnDisplay extends ElementalComponent {
    static get template() {
        return `
        <div>
            <p>Turno de: <span id="playerName">Jugador X</span></p>
            <p id="playerRole">Rol: ---</p>
        </div>
        `;
    }

    static get styles() {
        return `
        div {
            padding: 0.5em;
            border-radius: 4px;
            text-align: center;
            font-family: 'Roboto Condensed', sans-serif; /* Match body font */
        }
        #playerName {
            font-weight: bold;
            /* Default color, will be changed by attribute */
        }
        #playerName.player1 {
            color: #fbd38d; /* From original CSS */
        }
        #playerName.player2 {
            color: #90cdf4; /* From original CSS */
        }
        #playerRole {
            font-size: 0.9rem; /* Match original playerRoleDisplay */
            margin-top: 0.2rem; /* Match original playerRoleDisplay */
            color: #a0aec0; /* Example color, similar to original */
        }
        `;
    }

    static get observedAttributes() {
        return ['player-name', 'player-role', 'player-number'];
    }

    constructor() {
        super(); // Always call super first in constructor.
        // No specific constructor logic needed here for now
    }

    // onReady is called after the component's shadow DOM is rendered
    onReady() {
        // Initialize text content from attributes if they are already set
        this._updatePlayerName(this.getAttribute('player-name') || 'Jugador X');
        this._updatePlayerRole(this.getAttribute('player-role') || 'Rol: ---');
        this._updatePlayerNumberClass(this.getAttribute('player-number'));
    }

    onAttributeChanged(name, oldValue, newValue) {
        if (oldValue === newValue) return; // Only update if value actually changed

        switch (name) {
            case 'player-name':
                this._updatePlayerName(newValue);
                break;
            case 'player-role':
                this._updatePlayerRole(newValue);
                break;
            case 'player-number':
                this._updatePlayerNumberClass(newValue);
                break;
        }
    }

    _updatePlayerName(name) {
        const playerNameEl = this.$('#playerName');
        if (playerNameEl) {
            playerNameEl.textContent = name || 'Jugador X';
        }
    }

    _updatePlayerRole(role) {
        const playerRoleEl = this.$('#playerRole');
        if (playerRoleEl) {
            playerRoleEl.textContent = role || 'Rol: ---';
        }
    }

    _updatePlayerNumberClass(playerNumber) {
        const playerNameEl = this.$('#playerName');
        if (playerNameEl) {
            playerNameEl.classList.remove('player1', 'player2'); // Remove old classes
            if (playerNumber === '1') {
                playerNameEl.classList.add('player1');
            } else if (playerNumber === '2') {
                playerNameEl.classList.add('player2');
            }
        }
    }
}
