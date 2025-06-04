# ElementalJS Documentation

## Introduction

ElementalJS is a lightweight, minimalist library designed to simplify the creation of Web Components for this project. It provides a thin layer over the standard Web Components APIs, making it easier to build encapsulated, reusable UI elements with their own HTML structure, CSS styles, and JavaScript logic.

**Core Benefits:**

*   **Simplicity**: Reduces boilerplate for defining custom elements.
*   **Encapsulation**: Leverages Shadow DOM to keep component markup and styles isolated, preventing conflicts with the rest of the application.
*   **Reusability**: Encourages the development of small, focused components that can be reused across the application.
*   **Clean Structure**: Promotes a clear separation of concerns by bundling a component's template, styles, and behavior in one place.
*   **Vanilla JavaScript**: Built with standard browser features (Web Components, ES6+ JavaScript) without external dependencies.

This document provides guidance on how to create and use components with ElementalJS.

## `ElementalComponent` Base Class

The `ElementalComponent` class is the cornerstone of ElementalJS. All custom components you create should extend this class.

### Creating a Component

To create a new component, define a JavaScript class that extends `ElementalComponent`:

```javascript
import { ElementalComponent } from './js/elemental.js'; // Adjust path as needed

export class MyCustomComponent extends ElementalComponent {
    constructor() {
        super(); // Always call super() first in the constructor
        // Your component-specific initialization logic here
    }

    // ... other component methods and static properties
}
```

### HTML Template

Each component defines its internal HTML structure using a static getter named `template`. This getter should return a string containing the HTML markup for your component.

ElementalJS will automatically parse this template and append it to the component's Shadow DOM when the component is connected to the document.

**Example:**

```javascript
static get template() {
    return `
<div>
    <h1>Hello, <span id="name">World</span>!</h1>
    <p>This is a custom component.</p>
</div>
    `;
}
```

### CSS Styling

Components can define their own CSS styles using a static getter named `styles`. This getter should return a string containing CSS rules.

These styles are automatically added to the component's Shadow DOM within a `<style>` tag. This ensures that the styles are **scoped** to the component, meaning they won't leak out and affect other parts of your application, nor will global styles (except for inheritable CSS properties or CSS custom properties) generally affect the component's internals.

**Example:**

```javascript
static get styles() {
    return `
div {
    border: 1px solid #ccc;
    padding: 1em;
    border-radius: 8px;
    background-color: #f9f9f9;
}
h1 {
    color: navy;
    font-size: 1.5em;
}
#name {
    color: orange;
}
    `;
}
```
When the component above is used, the `h1` style will only apply to `h1` elements *inside* this component's Shadow DOM, not to other `h1` elements on the page.

### Lifecycle Methods

`ElementalComponent` provides hooks into standard Web Component lifecycle phases, allowing you to run code at specific points in a component's existence.

*   **`constructor()`**
    *   Called when an instance of the component is created (e.g., via `document.createElement('my-component')` or when parsed in HTML).
    *   **Always call `super()` first** within the constructor.
    *   Use it for initial state setup, event listener binding (for internal methods), or other one-time initialization that doesn't involve accessing the DOM (especially the component's own DOM, which isn't ready yet).

*   **`connectedCallback()`** (Handled by Base Class)
    *   Called automatically by the browser when the component is inserted into the DOM.
    *   The `ElementalComponent` base class uses this method to:
        1.  Render the component's HTML template (from `static get template()`).
        2.  Apply its CSS styles (from `static get styles()`).
        3.  Call your component's `onReady()` method, if you've defined one.
    *   You typically don't need to override `connectedCallback()` directly unless you have very specific needs that `onReady()` doesn't cover.

*   **`onReady()`** (User-defined Hook)
    *   This method is **called by `ElementalComponent`** after the component's Shadow DOM has been populated with its template and styles.
    *   This is the recommended place for logic that needs to interact with the component's internal DOM, such as attaching event listeners to shadow DOM elements or performing initial DOM manipulations based on attributes.
    *   **Example:**
        ```javascript
        onReady() {
            const button = this.$('#myButton'); // Using the helper method
            if (button) {
                button.addEventListener('click', () => console.log('Button clicked!'));
            }
            // Initialize content based on attributes
            if (this.hasAttribute('initial-text')) {
                this.$('p').textContent = this.getAttribute('initial-text');
            }
        }
        ```

*   **`disconnectedCallback()`** (Handled by Base Class)
    *   Called automatically by the browser when the component is removed from the DOM.
    *   The `ElementalComponent` base class uses this method to call your component's `onDestroy()` method, if defined.
    *   Useful for cleanup tasks.

*   **`onDestroy()`** (User-defined Hook)
    *   This method is **called by `ElementalComponent`** when the component is being removed from the DOM.
    *   Use this to clean up anything that won't be automatically handled by the browser's garbage collection. This includes:
        *   Removing event listeners that the component added to global objects (e.g., `window`, `document`).
        *   Clearing timers (e.g., `setInterval`).
        *   Releasing any other resources.
    *   **Example:**
        ```javascript
        onDestroy() {
            console.log('My component is being destroyed. Cleaning up...');
            // window.removeEventListener('resize', this._boundResizeHandler);
        }
        ```

### Attributes and Reactivity

Components often need to be configured externally via HTML attributes. ElementalJS provides a way to observe and react to changes in these attributes.

*   **`static get observedAttributes()`**
    *   To make a component react to attribute changes, you must define a static getter named `observedAttributes`.
    *   This getter should return an array of strings, where each string is the name of an attribute you want to observe.
    *   **Example:**
        ```javascript
        static get observedAttributes() {
            return ['name', 'data-status', 'user-id'];
        }
        ```

*   **`attributeChangedCallback(name, oldValue, newValue)`** (Handled by Base Class)
    *   Called automatically by the browser when any of the attributes listed in `observedAttributes` are added, removed, or changed.
    *   The `ElementalComponent` base class implements this method and calls your component's `onAttributeChanged(name, oldValue, newValue)` method, if you've defined one.

*   **`onAttributeChanged(name, oldValue, newValue)`** (User-defined Hook)
    *   This method is **called by `ElementalComponent`** when an observed attribute changes.
    *   Implement this method in your component to define how it should react to changes in its attributes.
    *   **Parameters:**
        *   `name`: The name of the attribute that changed.
        *   `oldValue`: The previous value of the attribute (null if it was newly added).
        *   `newValue`: The new value of the attribute (null if it was removed).
    *   **Example:**
        ```javascript
        onAttributeChanged(name, oldValue, newValue) {
            if (oldValue === newValue) return; // No real change

            switch (name) {
                case 'name':
                    this.updateNameDisplay(newValue);
                    break;
                case 'data-status':
                    this.updateStatusIndicator(newValue);
                    break;
                // Handle other attributes...
            }
        }

        updateNameDisplay(newName) {
            const nameElement = this.$('#name'); // Using helper
            if (nameElement) {
                nameElement.textContent = newName || 'Default Name';
            }
        }
        ```

### Shadow DOM Query Helpers

To make it easier to access elements within your component's Shadow DOM, `ElementalComponent` provides two utility methods:

*   **`this.$(selector)`**
    *   A shorthand for `this.shadowRoot.querySelector(selector)`.
    *   Returns the first element within the component's Shadow DOM that matches the specified CSS selector.
    *   **Example:** `const myButton = this.$('#submitButton');`

*   **`this.$$(selector)`**
    *   A shorthand for `this.shadowRoot.querySelectorAll(selector)`.
    *   Returns a `NodeList` of all elements within the component's Shadow DOM that match the specified CSS selector.
    *   **Example:** `const allItems = this.$$('.list-item');`

## Registering a Component with `defineComponent`

Once you have created your component class by extending `ElementalComponent`, you need to register it with the browser so it can be used as an HTML tag. ElementalJS provides a simple helper function for this: `defineComponent`.

### `defineComponent(tagName, componentClass)`

*   **Purpose**: A convenience wrapper around the standard `customElements.define()` method. It registers your component class with a given tag name.
*   **Parameters**:
    *   `tagName` (String): The name for your custom HTML tag. Custom element names **must contain a hyphen** (e.g., `my-component`, `player-profile`).
    *   `componentClass` (Class): The component class you defined (which extends `ElementalComponent`).
*   **Usage**:
    You typically call this once per component, often in your main JavaScript file (e.g., `main.js`) after importing your component class.

**Example:**

```javascript
// In main.js (or similar entry point)
import { defineComponent } from './js/elemental.js'; // Adjust path as needed
import { MyCustomComponent } from './js/components/MyCustomComponent.js'; // Adjust path

defineComponent('my-custom-component', MyCustomComponent);

// If you had another component:
// import { AnotherComponent } from './js/components/AnotherComponent.js';
// defineComponent('another-widget', AnotherComponent);
```

The `defineComponent` helper also includes some basic checks:
*   Ensures `tagName` is a valid string.
*   Ensures `componentClass` actually extends `ElementalComponent`.
*   Warns if a component with the same `tagName` is already defined.

## Using Your Components in HTML

Once a component is defined and registered with a tag name (e.g., `my-custom-component`), you can use it in your HTML just like any standard HTML element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My App With ElementalJS</title>
    <script type="module" src="js/main.js"></script> <!-- Ensure main.js registers components -->
</head>
<body>
    <h1>Welcome!</h1>

    <my-custom-component name="Alice" data-status="active"></my-custom-component>

    <another-widget user-id="123"></another-widget>
</body>
</html>
```

### Passing Data with Attributes

The primary way to pass data into your components from the outside (e.g., from HTML or from JavaScript that manipulates the DOM) is through **attributes**.

*   You can set attributes directly in your HTML as shown above (`name="Alice"`, `data-status="active"`).
*   You can also set attributes dynamically using JavaScript:
    ```javascript
    const myComponent = document.querySelector('my-custom-component');
    if (myComponent) {
        myComponent.setAttribute('name', 'Bob');
        myComponent.setAttribute('data-status', 'inactive');
    }
    ```

For the component to react to these attribute changes, remember to:
1.  List the attribute names in the `static get observedAttributes()` array in your component class.
2.  Implement the `onAttributeChanged(name, oldValue, newValue)` method in your component class to handle the changes.

**Data Types and Attributes:**
HTML attributes are inherently strings. If you pass numbers or booleans, they will be received as strings in `onAttributeChanged` (e.g., `true` becomes `"true"`). You'll need to parse them accordingly in your component logic if you need the actual JavaScript type (e.g., `parseInt(newValue)`, `newValue === 'true'`).

For passing complex data like objects or arrays, you have a couple of options:
1.  **JSON Strings**: Serialize the object/array into a JSON string and pass it as an attribute. The component then parses the JSON string.
    ```html
    <my-data-component user-info='{"id": 1, "name": "Charlie"}'></my-data-component>
    ```
    ```javascript
    // Inside MyDataComponent's onAttributeChanged for 'user-info'
    try {
        const userInfo = JSON.parse(newValue);
        // Use userInfo object
    } catch (e) {
        console.error('Error parsing user-info attribute:', e);
    }
    ```
2.  **Properties (Advanced)**: For direct object/array passing, you can set JavaScript properties on the component instance. However, this doesn't trigger `attributeChangedCallback` directly. You would typically manage this through methods on the component or by having the component read these properties at specific times (e.g., in `onReady` or after an attribute signals that new property data is available). ElementalJS currently focuses on attribute-based reactivity for simplicity.

## Component Communication

Components often need to communicate with each other or with the wider application.

### Parent-to-Child Communication

As covered in the "Component Usage" section, the primary way for a parent element (or JavaScript code) to send data *into* a component is by setting its **attributes**. The component then reacts to these attribute changes via `onAttributeChanged`.

This is suitable for configuration, passing initial data, or updating the component's state from the outside.

**Example (reiteration):**
A parent page sets the `user-id` for a profile component:
```html
<user-profile user-id="42"></user-profile>
```
The `user-profile` component would observe `user-id` and fetch/display the correct user's data.

### Child-to-Parent Communication (Events)

For a component to send information *out* to its parent or to other parts of the application that are listening, the standard Web Components pattern is to use **Custom Events**.

The component dispatches an event, and any interested parent element (or other JavaScript code) can listen for that event.

**Dispatching an Event from a Component:**

Inside your component class (e.g., in an event handler for an internal button click, or when some internal state changes), you can dispatch a custom event:

```javascript
// Inside an ElementalComponent method
handleClick() {
    const eventData = { message: 'Hello from my component!', value: 42 };
    this.dispatchEvent(new CustomEvent('mycustomevent', {
        detail: eventData, // The data payload for the event
        bubbles: true,     // Allows the event to bubble up the DOM tree
        composed: true     // Allows the event to cross Shadow DOM boundaries
    }));
}
```
*   `'mycustomevent'`: This is your custom event name. Choose something descriptive.
*   `detail`: An object containing any data you want to send with the event.
*   `bubbles: true`: Important if you want ancestor elements in the light DOM to be able to catch the event.
*   `composed: true`: Important for events to be catchable by listeners outside the Shadow DOM of the component that dispatched it.

**Listening for the Event from a Parent:**

A parent element (which could be another Web Component or just part of your main page) can listen for this event using standard `addEventListener`:

```javascript
// In JavaScript (e.g., main.js or a parent component's onReady)
const myComponentInstance = document.querySelector('my-custom-component');

if (myComponentInstance) {
    myComponentInstance.addEventListener('mycustomevent', (event) => {
        console.log('Received mycustomevent:', event.detail);
        // event.detail would be { message: 'Hello from my component!', value: 42 }
        // Now you can use event.detail.message and event.detail.value
    });
}
```

This event-based approach keeps components decoupled. The child component doesn't need to know who is listening; it just announces that something happened.

## Full Example: A Simple Counter Component

Let's create a simple counter component (`<simple-counter>`) that displays a count, has buttons to increment and decrement, and can be initialized with a starting value via an attribute. It will also dispatch an event when the count changes.

**1. Define the Component (`js/components/SimpleCounter.js`):**

```javascript
import { ElementalComponent } from '../elemental.js'; // Adjust path as needed

export class SimpleCounter extends ElementalComponent {
    static get template() {
        return `
            <div class="counter-container">
                <button id="decrementBtn">-</button>
                <span id="countDisplay">0</span>
                <button id="incrementBtn">+</button>
                <p>Initial value was: <span id="initialValueDisplay">N/A</span></p>
            </div>
        `;
    }

    static get styles() {
        return `
            .counter-container {
                display: inline-flex;
                align-items: center;
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
            }
            button {
                min-width: 30px;
                min-height: 30px;
                font-size: 1.2em;
                margin: 0 5px;
                cursor: pointer;
            }
            #countDisplay {
                font-size: 1.2em;
                min-width: 40px;
                text-align: center;
                font-weight: bold;
            }
            p {
                margin-left: 15px;
                font-size: 0.9em;
                color: #555;
            }
        `;
    }

    static get observedAttributes() {
        return ['initial-value'];
    }

    constructor() {
        super();
        this._count = 0;
    }

    onReady() {
        this._updateCountDisplay();
        this._updateInitialValueDisplay(this.getAttribute('initial-value'));

        this.$('#incrementBtn').addEventListener('click', () => this.increment());
        this.$('#decrementBtn').addEventListener('click', () => this.decrement());
    }

    onAttributeChanged(name, oldValue, newValue) {
        if (name === 'initial-value' && oldValue !== newValue) {
            this._initializeCount(newValue);
            this._updateInitialValueDisplay(newValue);
        }
    }

    _initializeCount(value) {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            this._count = numValue;
            this._updateCountDisplay();
        }
    }

    _updateCountDisplay() {
        this.$('#countDisplay').textContent = this._count;
    }

    _updateInitialValueDisplay(value) {
        const display = this.$('#initialValueDisplay');
        if (display) {
            const numValue = parseInt(value, 10);
            display.textContent = isNaN(numValue) ? 'Not set' : numValue;
        }
    }

    increment() {
        this._count++;
        this._updateCountDisplay();
        this._emitChangeEvent();
    }

    decrement() {
        this._count--;
        this._updateCountDisplay();
        this._emitChangeEvent();
    }

    _emitChangeEvent() {
        this.dispatchEvent(new CustomEvent('countchange', {
            detail: { count: this._count },
            bubbles: true,
            composed: true
        }));
    }

    // Optional: Cleanup listeners if we were adding to document/window
    // onDestroy() {
    //    console.log('SimpleCounter destroyed');
    // }
}
```

**2. Register the Component (e.g., in `main.js`):**

```javascript
import { defineComponent } from './js/elemental.js'; // Adjust as needed
import { SimpleCounter } from './js/components/SimpleCounter.js'; // Adjust as needed

defineComponent('simple-counter', SimpleCounter);
```

**3. Use in HTML:**

```html
<simple-counter initial-value="10"></simple-counter>
<simple-counter></simple-counter> <!-- Starts at 0 -->

<script>
    const counter1 = document.querySelector('simple-counter[initial-value="10"]');
    counter1.addEventListener('countchange', (event) => {
        console.log('Counter 1 changed:', event.detail.count);
    });

    // You can also change attributes programmatically
    // setTimeout(() => {
    //    counter1.setAttribute('initial-value', '20'); // This will re-initialize the count
    // }, 2000);
</script>
```

This example demonstrates:
*   Defining template and styles.
*   Using the constructor for internal state (`_count`).
*   Using `onReady` to attach internal event listeners and set initial display.
*   Observing an attribute (`initial-value`) and reacting in `onAttributeChanged`.
*   Public methods (`increment`, `decrement`) that change state and update the display.
*   Dispatching a custom event (`countchange`) with data.
*   Registering and using the component in HTML.
*   Listening to the custom event from outside the component.
