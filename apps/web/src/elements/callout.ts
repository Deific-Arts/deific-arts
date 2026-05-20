import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const styles = css`
  :host {
    color: #a67f00;
    display: grid;
    grid-template-columns: 64px 1fr;
    align-items: center;
    background: #f7d566;
    padding: 2rem;
    margin: 2rem;
    gap: 2rem;
    line-height: 1.5;
    border-radius: 6px;
    border: 6px solid #ffeaa5;
  }

  svg {
    filter: drop-shadow(2px 4px 6px orange);
  }
`;

@customElement('deific-callout')
class DeificCallout extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <div>
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 280 280" xml:space="preserve" fill="#000000" stroke="#000000" stroke-width="0.0028"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_12_"> <path id="XMLID_441_" style="fill:#FFDA44; stroke:#ffd500; stroke-width:10px;" d="M30.678,265.068c-27.33,0-38.511-19.365-24.846-43.034l109.322-189.35 c13.665-23.669,36.026-23.669,49.691,0l109.322,189.35c13.665,23.669,2.484,43.034-24.846,43.034H30.678z"></path> <path id="XMLID_443_" style="fill:#FF9811;" d="M274.168,222.034L164.846,32.684C158.014,20.849,149.006,14.949,140,14.95v250.118 h109.322C276.652,265.068,287.833,245.703,274.168,222.034z"></path> <polygon id="XMLID_444_" style="fill:#FFFFFF;" points="140,175.068 120,175.068 110,95.068 140,95.068 150,135.068 "></polygon> <polygon id="XMLID_445_" style="fill:#FFDA44;" points="160,175.068 140,175.068 140,95.068 170,95.068 "></polygon> <polygon id="XMLID_446_" style="fill:#FFFFFF;" points="140,235.068 120,235.068 120,195.068 140,195.068 150,215.068 "></polygon> <rect id="XMLID_447_" x="140" y="195.068" style="fill:#FFDA44;" width="20" height="40"></rect> </g> </g></svg>
      </div>
      <div>
        <slot></slot>
      </div>
    `;
  }
}

export default DeificCallout;
