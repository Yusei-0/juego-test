import { ElementalComponent } from '../elemental.js';

export class GameLogComponent extends ElementalComponent {
    static get template() {
        return `
        <div id="logContainer">
            <p class="log-placeholder">Registro de Partida...</p>
        </div>
        `;
    }

    static get styles() {
        return `
        #logContainer {
            margin-top: 0.75rem; /* Keep */
            padding: 0.5rem; /* Keep */
            /* height: 250px; REMOVED */
            /* overflow-y: auto; REMOVED/CHANGED */
            overflow-y: visible; /* CHANGED */
            background-color: #1a202c; /* Keep */
            border-radius: 0.3rem; /* Keep */
            border: 1px solid #4a5568; /* Keep */
            text-align: left; /* Keep */
            font-size: 0.85rem; /* Keep */
            font-family: 'Roboto Condensed', sans-serif; /* Keep */
            flex-grow: 1; /* ADDED */
            display: flex; /* ADDED */
            flex-direction: column; /* ADDED */
        }
        #logContainer p {
            margin-bottom: 0.3rem;
            padding-bottom: 0.3rem;
            border-bottom: 1px dashed #4a5568; /* From original #gameLogDisplay p */
        }
        #logContainer p:last-child {
            border-bottom: none; /* From original #gameLogDisplay p:last-child */
        }
        #logContainer .log-placeholder {
            color: #a0aec0; /* Light gray for placeholder */
            text-align: center;
            border-bottom: none;
        }
        /* Copied from original #gameLogDisplay styles */
        #logContainer .log-move { color: #a0aec0; }
        #logContainer .log-attack { color: #f56565; }
        #logContainer .log-damage { color: #f6e05e; }
        #logContainer .log-death { color: #e53e3e; font-weight: bold; }
        #logContainer .log-turn { color: #63b3ed; font-style: italic; }
        #logContainer .log-system { color: #cbd5e0; font-weight: bold;}
        `;
    }

    constructor() {
        super();
        this._maxEntries = 50; // Max log entries to keep
    }

    // No onReady needed if we don't take initial logs from an attribute.

    addEntry(message, type = 'system') {
        const logContainer = this.$('#logContainer');
        if (!logContainer) return;

        const placeholder = this.$('.log-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('p');
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        entry.textContent = `${timeString} ${message}`;

        if (type) {
            entry.classList.add(`log-${type}`);
        }

        logContainer.insertBefore(entry, logContainer.firstChild); // Prepend new entries

        // Limit number of entries
        while (logContainer.children.length > this._maxEntries) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // Ensure the latest entry is visible by scrolling to the top
        logContainer.scrollTop = 0;
    }

    setEntries(logEntriesArray) { // New method to set all entries, useful for initialization or full sync
        const logContainer = this.$('#logContainer');
        if (!logContainer) return;

        logContainer.innerHTML = ''; // Clear existing entries

        if (!logEntriesArray || logEntriesArray.length === 0) {
            const p = document.createElement('p');
            p.textContent = "Registro de Partida...";
            p.classList.add('log-placeholder');
            logContainer.appendChild(p);
            return;
        }

        // Add new entries. This assumes logEntriesArray is already in the desired display order (newest first).
        // If it's oldest first, it should be reversed before calling this, or this method should reverse it.
        // For now, let's assume logEntriesArray is passed with newest entries first.
        const entriesToDisplay = logEntriesArray.slice(0, this._maxEntries);

        entriesToDisplay.forEach(log => {
            const entry = document.createElement('p');
            const date = new Date(log.timestamp); // Expecting timestamp on log objects
            const timeString = `[${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}]`;
            entry.textContent = `${timeString} ${log.text}`;
            if (log.type) entry.classList.add(`log-${log.type}`);
            logContainer.appendChild(entry); // Appending in order, so newest (first in array) is at the top
        });

        logContainer.scrollTop = 0; // Show newest
    }

    clearLog() {
        const logContainer = this.$('#logContainer');
        if (logContainer) {
            logContainer.innerHTML = '<p class="log-placeholder">Registro de Partida...</p>';
        }
    }
}
