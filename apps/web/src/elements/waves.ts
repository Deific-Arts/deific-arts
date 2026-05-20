import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const styles = css`
  svg {
      position:relative;
      width: 100%;
      height: 40px;
      margin-bottom: -7px;
      min-height: 40px;
      max-height: 150px;
  }

  @media (min-width: 768px) {
      svg {
          height: 15vh;
          min-height: 100px;
          max-height: 120px;
      }
  }

  g > use {
      animation: move 25s cubic-bezier(.55,.5,.45,.5) infinite;
  }

  g > use:nth-child(1) {
      animation-delay: -2s;
      animation-duration: 7s;
  }

  g > use:nth-child(2) {
      animation-delay: -3s;
      animation-duration: 10s;
  }

  g > use:nth-child(3) {
      animation-delay: -4s;
      animation-duration: 13s;
  }

  g > use:nth-child(4) {
      animation-delay: -5s;
      animation-duration: 20s;
  }

  @keyframes move {
      0% {
      transform: translate3d(-90px,0,0);
      }
      100% {
          transform: translate3d(85px,0,0);
      }
  }
`;

@customElement('deific-waves')
export default class DeificWaves extends LitElement {
  static get styles() {
    return [styles]
  }

  render() {
    return html `
        <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
            <defs>
            <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            </defs>
            <g class="parallax">
            <use xlink:href="#wave" x="48" y="0" fill="rgba(255,255,255,0.7"></use>
            <use xlink:href="#wave" x="48" y="3" fill="rgba(255,255,255,0.5)"></use>
            <use xlink:href="#wave" x="48" y="5" fill="rgba(255,255,255,0.3)"></use>
            <use xlink:href="#wave" x="48" y="7" fill="#fff"></use>
            </g>
        </svg>
    `
  }
}
