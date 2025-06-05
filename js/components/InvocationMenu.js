import { ElementalComponent, defineComponent } from '../elemental.js';
import { UNIT_TYPES } from '../constants.js';

class InvocationMenu extends ElementalComponent {
    constructor() {
        super();
        this.selectedUnitTypeKey = null;
        this.gameState = null;
    }

    static get styles() {
        return `
            :host {
                display: none; /* Hidden by default */
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(40, 40, 60, 0.95);
                border: 2px solid #6c757d;
                border-radius: 8px;
                padding: 20px;
                z-index: 100;
                color: white;
                font-family: 'Arial', sans-serif;
                box-shadow: 0 0 15px rgba(0,0,0,0.5);
                width: 300px;
                max-height: 80vh;
                overflow-y: auto;
            }
            h3 {
                margin-top: 0;
                text-align: center;
                color: #ffc107; /* Amber */
            }
            #current-magic-points {
                text-align: center;
                margin-bottom: 15px;
                font-size: 1.1em;
            }
            #unit-list {
                margin-bottom: 15px;
                max-height: 200px; /* Adjust as needed */
                overflow-y: auto;
                border: 1px solid #495057; /* Darker gray */
                padding: 5px;
                background-color: rgba(0,0,0,0.2);
            }
            .unit-button {
                display: flex;
                justify-content: space-between;
                padding: 8px 10px;
                margin: 5px 0;
                background-color: #495057; /* Dark gray */
                color: white;
                border: 1px solid #6c757d; /* Medium gray */
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .unit-button:hover:not(:disabled) {
                background-color: #6c757d; /* Medium gray on hover */
            }
            .unit-button.selected {
                background-color: #007bff; /* Blue for selected */
                border-color: #0056b3; /* Darker blue */
            }
            .unit-button:disabled {
                background-color: #343a40; /* Very dark gray for disabled */
                color: #6c757d; /* Medium gray text for disabled */
                cursor: not-allowed;
            }
            .unit-button span:last-child {
                font-weight: bold;
                color: #ffc107; /* Amber for cost */
            }
            .action-buttons {
                display: flex;
                justify-content: space-around;
                margin-top: 10px;
            }
            .action-buttons button {
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1em;
            }
            #confirm-invocation {
                background-color: #28a745; /* Green */
                color: white;
            }
            #confirm-invocation:disabled {
                background-color: #5a6268; /* Gray when disabled */
                cursor: not-allowed;
            }
            #cancel-invocation {
                background-color: #dc3545; /* Red */
                color: white;
            }
        `;
    }

    static get template() {
        return `
            <h3>Invocar Unidad</h3>
            <div id="current-magic-points">Puntos: --</div>
            <div id="unit-list">
                <!-- Unit buttons will be populated here -->
            </div>
            <div class="action-buttons">
                <button id="confirm-invocation" disabled>Invocar</button>
                <button id="cancel-invocation">Cerrar</button>
            </div>
        `;
    }

    onReady() {
        this._boundHandleCancel = this.closeMenu.bind(this);
        this._boundHandleConfirm = this.handleConfirmInvocation.bind(this);

        this.$('#cancel-invocation').addEventListener('click', this._boundHandleCancel);
        this.$('#confirm-invocation').addEventListener('click', this._boundHandleConfirm);
    }

    disconnectedCallback() {
        if (this.$('#cancel-invocation') && this._boundHandleCancel) {
            this.$('#cancel-invocation').removeEventListener('click', this._boundHandleCancel);
        }
        if (this.$('#confirm-invocation') && this._boundHandleConfirm) {
            this.$('#confirm-invocation').removeEventListener('click', this._boundHandleConfirm);
        }
        // Important: clean up unit button listeners if any are directly bound and not delegated
        const unitList = this.$('#unit-list');
        if (unitList) {
            unitList.innerHTML = ''; // Simple way to remove elements and their listeners
        }
    }

    setGameState(gameState) {
        this.gameState = gameState;
        if (!this.gameState) return;
        this.renderUnitList();
        this.updateMagicPointsDisplay();
    }

    updateMagicPointsDisplay() {
        if (this.$('#current-magic-points')) {
            this.$('#current-magic-points').textContent = `Puntos: ${this.getCurrentPlayerMagicPoints()}`;
        }
    }

    getCurrentPlayerMagicPoints() {
        if (!this.gameState) return 0;
        // Assuming local game context for currentPlayer determination
        return this.gameState.currentPlayer === 1 ? this.gameState.player1MagicPoints : this.gameState.player2MagicPoints;
    }

    renderUnitList() {
        const unitList = this.$('#unit-list');
        if (!unitList || !this.gameState) return;

        unitList.innerHTML = ''; // Clear previous list
        const currentPlayerMagicPoints = this.getCurrentPlayerMagicPoints();

        Object.entries(UNIT_TYPES).forEach(([typeKey, unit]) => {
            if (unit.magicCost >= 9999 || unit.class === 'base') { // Skip BASE or non-invocable units
                return;
            }

            const button = document.createElement('div');
            button.classList.add('unit-button');
            button.dataset.typeKey = typeKey;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = unit.name;
            const costSpan = document.createElement('span');
            costSpan.textContent = `${unit.magicCost} MP`;

            button.appendChild(nameSpan);
            button.appendChild(costSpan);

            if (currentPlayerMagicPoints < unit.magicCost) {
                button.disabled = true;
            }

            button.addEventListener('click', () => {
                if (!button.disabled) {
                    this.selectUnitToInvoke(typeKey, button);
                }
            });
            unitList.appendChild(button);
        });
    }

    selectUnitToInvoke(typeKey, buttonElement) {
        // Clear previous selection
        const previouslySelected = this.$('.unit-button.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        // Add selection to current button
        buttonElement.classList.add('selected');
        this.selectedUnitTypeKey = typeKey;
        this.$('#confirm-invocation').disabled = false;
    }

    handleConfirmInvocation() {
        if (this.selectedUnitTypeKey && this.gameState) {
            this.dispatchEvent(new CustomEvent('invocation-confirmed', {
                detail: {
                    unitTypeKey: this.selectedUnitTypeKey,
                    playerId: this.gameState.currentPlayer // Pass current player for context
                },
                bubbles: true, // Allows event to bubble up if needed
                composed: true // Allows event to cross shadow DOM boundaries if needed
            }));
        }
        this.closeMenu();
    }

    openMenu(gameState) {
        this.setGameState(gameState); // This will also call renderUnitList and updateMagicPointsDisplay
        this.style.display = 'block';
        this.selectedUnitTypeKey = null;
        if(this.$('#confirm-invocation')) this.$('#confirm-invocation').disabled = true;

        // Clear previous selection visuals
        const previouslySelectedButton = this.$('.unit-button.selected');
        if (previouslySelectedButton) {
            previouslySelectedButton.classList.remove('selected');
        }
    }

    closeMenu() {
        this.style.display = 'none';
        this.dispatchEvent(new CustomEvent('invocation-cancelled', {
            bubbles: true,
            composed: true
        }));
    }
}

// defineComponent('invocation-menu', InvocationMenu); // Will be defined in main.js
export { InvocationMenu };
`
