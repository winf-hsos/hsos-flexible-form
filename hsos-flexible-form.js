import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';

/**
 * `hsos-flexible-form`
 * A flexible and configurable form built with Polymer 3
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class HsosFlexibleForm extends PolymerElement {
  static get template() {
    return html`
      
      <style>
        :host {
          display: block;
        }

        paper-checkbox {
          display: block;
          margin-top: 24px;
        }

        paper-dropdown-menu {
          display: block;
        }

      </style>

      <div id="form">
        <!-- The placeholder for the input fields -->
      </div>

    `;
  }
  static get properties() {
    return {
      config: {
        type: Object,
        observer: '_configChanged'
      },
    };
  }

  _configChanged(newValue, oldValue) {
    console.dir(oldValue);
    console.dir(newValue);

    if (typeof newValue.elements !== "undefined") {
      var element;

      newValue.elements.forEach((e) => {

        // paper-input field
        if (e.type === "input") {
          element = document.createElement('paper-input');
          element.label = e.label;
          element.type = "text";
        }
        // paper-checkbox
        else if (e.type === "checkbox") {
          element = document.createElement('paper-checkbox');
          element.innerHTML = e.label;
          element.setAttribute("noink", "");
        }
        // paper-dropdown-menu
        else if (e.type === "dropdown") {
          element = document.createElement('paper-dropdown-menu');
          element.setAttribute("noink", "");
          element.setAttribute("label", e.label);

          if (typeof e.horizontalAlign !== "undefined")
            element.setAttribute("horizontal-align", e.horizontalAlign);

          var listbox = document.createElement('paper-listbox');
          listbox.setAttribute("slot", "dropdown-content");
          listbox.classList += "dropdown-content";

          var item;

          e.choices.forEach((c) => {
            console.log(c);
            item = document.createElement('paper-item');
            item.innerHTML = c;
            listbox.appendChild(item);
          })

          element.appendChild(listbox);
        }

        this.$.form.appendChild(element);

      })
    }




  }

}

window.customElements.define('hsos-flexible-form', HsosFlexibleForm);
