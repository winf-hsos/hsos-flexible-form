import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import 'hsos-firebase';

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
          --paper-spinner-color: white;
        }

        paper-checkbox {
          display: block;
          margin-top: 24px;
        }

        paper-dropdown-menu {
          display: block;
        }

        paper-spinner-lite {
          width: 14px;
          height: 14px;
       }

        paper-button {
          margin-top: 0.5em;
          margin-left: 0em;
          color: white;
          background-color: var(--primary-color);
        }

      </style>

      <div id="form">
        <!-- The placeholder for the input fields -->
      </div>

      <paper-button on-click="_save" raised>
        <span id="spinner"><paper-spinner-lite active></paper-spinner-lite></span>
        <span id="btnText">Save<span>
      </paper-button>
      

    `;
  }

  constructor() {
    super();
    this.inputFieldsToValidate = [];
  }

  static get properties() {
    return {
      config: {
        type: Object,
        observer: '_configChanged'
      },
      dbKey: {
        type: String
      }
    };
  }

  ready() {
    super.ready();

    this.$.spinner.setAttribute("hidden", "");
    this._getRecordForKey();
  }

  _save() {
    if (!this._validateInputFields()) {
      console.log("Field validation failed");
      return;
    }

    console.log("Saving");

    this.$.spinner.removeAttribute("hidden");
    this.$.btnText.setAttribute("hidden", "");

    var dataObj = {};
    var propName;

    // Go through all input elements and get the values
    // Store in dataObj
    for (var i = 0; i < this.$.form.children.length; i++) {

      if (typeof this._elements[i].db !== "undefined")
        propName = this._elements[i].db;
      else
        propName = this._elements[i].label;

      if (this.$.form.children[i].tagName === "PAPER-CHECKBOX") {
        dataObj[propName] = this.$.form.children[i].checked;
      }
      else {
        dataObj[propName] = this.$.form.children[i].value;
      }
    }

    console.dir(dataObj);

    var keyRef = firebase.firestore().collection("users").doc(this.dbKey);

    var _this = this;
    keyRef.set(dataObj)
      .then(function () {
        console.log("Document successfully written!");
        _this.$.spinner.setAttribute("hidden", "");
        _this.$.btnText.removeAttribute("hidden");
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
      });

  } // end of _save()

  _presetValues(dataRecord) {
    var _this = this;

    Object.keys(dataRecord).forEach(function (key) {
      var element = _this.shadowRoot.getElementById(key);

      if (element.tagName !== "PAPER-CHECKBOX") {
        element.value = dataRecord[key];
      }
      else {
        element.checked = dataRecord[key];
      }

    });
  }

  _validateInputFields() {

    var result = true;

    this.inputFieldsToValidate.forEach((inputField) => {
      var check = inputField.validate();

      if (result === true && check === false)
        result = false;
    });

    return result;
  }

  _configChanged(newValue, oldValue) {

    if (typeof newValue.elements !== "undefined") {

      // Save the element's config
      this._elements = newValue.elements;

      var element;

      newValue.elements.forEach((e) => {

        // paper-input field
        if (e.type === "input") {
          element = document.createElement('paper-input');
          element.label = e.label;
          element.type = "text";

          if (typeof e.required !== "undefined" && e.required === true) {
            element.setAttribute("required", "");
          }

          this.inputFieldsToValidate.push(element);
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
          element.setAttribute("required", "");
          element.setAttribute("label", e.label);

          if (typeof e.horizontalAlign !== "undefined")
            element.setAttribute("horizontal-align", e.horizontalAlign);

          var listbox = document.createElement('paper-listbox');
          listbox.setAttribute("slot", "dropdown-content");
          listbox.setAttribute("selected", "1");
          listbox.classList += "dropdown-content";

          var item;

          e.choices.forEach((c) => {
            item = document.createElement('paper-item');
            item.innerHTML = c;
            listbox.appendChild(item);
          })

          element.appendChild(listbox);
        }

        if (typeof e.db !== "undefined")
          element.setAttribute("id", e.db);

        this.$.form.appendChild(element);
      })
    }
  }

  _getRecordForKey() {
    var _this = this;

    // Try to get the data records from firestore
    var keyRef = firebase.firestore().collection("users").doc(this.dbKey);
    keyRef.get().then(function (doc) {
      if (doc.exists) {
        //console.dir(doc.data());
        _this._presetValues(doc.data());
      } else {
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });



  }

}

window.customElements.define('hsos-flexible-form', HsosFlexibleForm);
