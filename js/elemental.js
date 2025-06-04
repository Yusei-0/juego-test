export class ElementalComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._render();
        if (typeof this.onReady === 'function') {
            this.onReady();
        }
    }

    _render() {
        const Ctor = this.constructor; // Get the class constructor

        // Render Template
        if (Ctor.template) {
            const templateElement = document.createElement('template');
            templateElement.innerHTML = Ctor.template;
            this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
        }

        // Apply Styles
        if (Ctor.styles) {
            const styleElement = document.createElement('style');
            styleElement.textContent = Ctor.styles;
            this.shadowRoot.appendChild(styleElement);
        }
    }

    // Basic attribute change handling - subclasses should implement onAttributeChanged
    attributeChangedCallback(name, oldValue, newValue) {
        if (typeof this.onAttributeChanged === 'function') {
            this.onAttributeChanged(name, oldValue, newValue);
        }
    }

    // Optional helper methods for subclasses
    $(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    $$(selector) {
        return this.shadowRoot.querySelectorAll(selector);
    }

    disconnectedCallback() {
        if (typeof this.onDestroy === 'function') {
            this.onDestroy();
        }
    }
}

export function defineComponent(tagName, componentClass) {
    if (!tagName || typeof tagName !== 'string') {
        console.error('ElementalJS Error: defineComponent expects a valid string for tagName.');
        return;
    }
    if (!componentClass || !(componentClass.prototype instanceof ElementalComponent)) {
        console.error(`ElementalJS Error: Class provided for <${tagName}> does not extend ElementalComponent.`);
        return;
    }
    if (customElements.get(tagName)) {
        console.warn(`ElementalJS Warning: Component <${tagName}> already defined.`);
        return;
    }
    customElements.define(tagName, componentClass);
}
