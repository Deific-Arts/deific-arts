import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const styles = css`
  :host([mode="edit"]) {
    color: white;
    padding: 0.5rem 1rem;
    background: blue;
    border: 2px dashed green;
  }
`;

@customElement('deific-consultation')
class DeificConsultation extends LitElement {
  static styles = [styles];

  static properties = {
    url: { type: String },
    height: { type: String },
    minWidth: { type: String, attribute: 'min-width' },
    mode: { type: String }
  };

  url: string = '';
  height: string = '100%';
  minWidth: string = '100%';
  mode: 'edit' | 'save' = 'save';

  connectedCallback() {
    super.connectedCallback();

    if (!this.url) return;

    if (!document.querySelector(`script[src="https://assets.calendly.com/assets/external/widget.js"]`)) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  createRenderRoot() {
    if (this.mode === 'edit') {
      // if in edit use shadow DOM like normal
      return super.createRenderRoot();
    }

    // the calendly widget requires html rendered in the light DOM
    return this;
  }

  render() {
    if (this.mode === 'edit') {
      return html`
        <p>Business Calendly in editor mode.</p>
      `;
    }

    return html`<div class="calendly-inline-widget" data-url="${this.url}" style="min-width:${this.minWidth}; height:${this.height};"></div>`;
  }
}

export default DeificConsultation;
