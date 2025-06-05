import { ElementalComponent } from '../core/elemental.js';

export class GameMenuComponent extends ElementalComponent {
    static get template() {
        return `
        <div class="menu-container">
            <h2 id="menuTitle">Menu Title</h2>
            <div id="buttonArea"></div>
        </div>
        `;
    }

    static get styles() {
        return `
        .menu-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 500px; /* From original .menu-screen */
            padding: 2rem; /* From original .menu-screen */
            background-color: #2d3748; /* gray-700 from original */
            border-radius: 0.75rem; /* From original .menu-screen */
            box-shadow: 0 8px 25px rgba(0,0,0,0.6); /* From original .menu-screen */
            text-align: center;
            font-family: 'Roboto Condensed', sans-serif;
        }
        #menuTitle {
            font-family: 'Press Start 2P', cursive; /* From original h2 */
            font-size: 1.5rem; /* From original h2 */
            color: #90cdf4; /* blue-300 from original h2 */
            margin-bottom: 1.5rem; /* From original h2 */
        }
        #buttonArea button {
            font-family: 'Press Start 2P', cursive; /* From original button */
            font-size: 1rem; /* From original button */
            padding: 0.8rem 1.5rem; /* From original button */
            margin: 0.5rem; /* From original button */
            min-width: 220px; /* From original button */
            border: none;
            border-radius: 0.3rem;
            cursor: pointer;
            transition: background-color 0.2s;
            color: white;
            background-color: #4a5568; /* Default button color */
        }
        #buttonArea button:hover {
            background-color: #718096; /* Default hover */
        }
        #buttonArea button.action-button { /* Specific class from original */
            background-color: #48bb78;
        }
        #buttonArea button.action-button:hover {
            background-color: #38a169;
        }
        /* Add other button type styles if needed (e.g., .secondary-button, .danger-button) */
        `;
    }

    static get observedAttributes() {
        return ['menu-title', 'buttons'];
    }

    constructor() {
        super();
        this._boundButtonClickHandler = this._handleButtonClick.bind(this);
    }

    onReady() {
        this._renderTitle();
        this._renderButtons();
    }

    disconnectedCallback() {
        // Call onDestroy if defined by a subclass, or perform specific cleanup here
        if (typeof this.onDestroy === 'function') {
            this.onDestroy();
        }
        // Clean up button event listeners to prevent memory leaks
        const buttonArea = this.$('#buttonArea');
        if (buttonArea) {
            const buttons = buttonArea.querySelectorAll('button');
            buttons.forEach(button => {
                button.removeEventListener('click', this._boundButtonClickHandler);
            });
        }
    }

    onAttributeChanged(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'menu-title':
                this._renderTitle();
                break;
            case 'buttons':
                this._renderButtons();
                break;
        }
    }

    _renderTitle() {
        const title = this.getAttribute('menu-title') || 'Menu';
        const menuTitleEl = this.$('#menuTitle');
        if (menuTitleEl) {
            menuTitleEl.textContent = title;
        }
    }

    _renderButtons() {
        const buttonArea = this.$('#buttonArea');
        if (!buttonArea) return;

        // Clear old buttons and listeners
        buttonArea.innerHTML = '';
        // (The disconnectedCallback handles removing listeners from old buttons if the component itself is removed,
        // but if we are just re-rendering buttons due to attribute change, we ensure old ones are gone here)

        const buttonsAttr = this.getAttribute('buttons');
        try {
            const buttonsArray = JSON.parse(buttonsAttr || '[]');
            buttonsArray.forEach(btnData => {
                const button = document.createElement('button');
                button.id = btnData.id || '';
                button.textContent = btnData.text || 'Button';
                if (btnData.class) { // Support for multiple classes
                    btnData.class.split(' ').forEach(cls => button.classList.add(cls));
                }
                button.addEventListener('click', this._boundButtonClickHandler);
                buttonArea.appendChild(button);
            });
        } catch (e) {
            console.error('GameMenuComponent: Error parsing "buttons" attribute. Expected JSON string.', e);
            buttonArea.innerHTML = '<p style="color:red;">Error loading buttons.</p>';
        }
    }

    _handleButtonClick(event) {
        const buttonId = event.target.id;
        if (buttonId) {
            this.dispatchEvent(new CustomEvent('menuaction', {
                detail: { buttonId: buttonId },
                bubbles: true, // Optional: allows event to bubble up the DOM
                composed: true // Optional: allows event to cross shadow DOM boundaries
            }));
        }
    }
}
