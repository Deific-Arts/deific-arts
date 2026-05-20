import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import SVGButton from "../scripts/svgbutton";

declare const mina: any;

const styles = css`
  :host {
    cursor: pointer;
    display: inline-flex;
    border-radius: 1rem;
  }

  svg,
  span {
    cursor: pointer;
  }

  .button-wrap {
    margin-bottom: 3em;
  }

  .button {
    background: none;
    border: none;
    width: 248px;
    height: 72px;
    outline: none;
    position: relative;
    margin: 1em;
    padding: 0;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-tap-highlight-color: transparent; /* For some Androids */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .button--round {
    width: 150px;
    height: 150px;
  }

  .button__text {
    display: block;
    padding: 10px;
    text-align: center;
    position: relative;
    z-index: 100;
    font-size: 1.25em;
    color: #fff;
    font-weight: bold;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .morph-shape {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .button--line .morph-shape svg {
    fill: var(--color-secondary);
    stroke: none;
    stroke-width: 1px;
    stroke-linecap: round;
  }

  .button--line:nth-child(2) .morph-shape svg {
    fill: #938edc;
  }

  .button--fill .morph-shape svg {
    fill: #44474d;
  }

  .button--fill:nth-child(4) .morph-shape svg {
    fill: #202020;
  }

  .button--round .morph-shape svg {
    stroke-width: 7px;
  }

  /* Example for effect */
  .button--anim-1 .button__text {
    -webkit-transition: -webkit-transform 0.15s;
    transition: transform 0.15s;
  }

  .button--anim-1:active .button__text {
    -webkit-transform: translate3d(0, -5px, 0);
    transform: translate3d(0, -5px, 0);
  }
`;

@customElement("deific-button")
export default class DeificButton extends LitElement {
  static styles = [styles];

  @property()
  link: string | undefined;

  @property()
  delay: number = 0;

  firstUpdated() {
    if (this.link) {
      this.addEventListener("mouseup", this.handleClick.bind(this));
    }

    SVGButton.prototype.options = {
      speed: { reset: 800, active: 150 },
      easing: { reset: mina.elastic, active: mina.easein }
    };

    [].slice
      .call(this.shadowRoot?.querySelectorAll("button.button--effect-1"))
      .forEach(el => {
        new SVGButton(el);
      });

    [].slice
      .call(this.shadowRoot?.querySelectorAll("button.button--effect-2"))
      .forEach(el => {
        new SVGButton(el, {
          speed: { reset: 650, active: 650 },
          easing: { reset: mina.elastic, active: mina.elastic }
        });
      });
  }

  render() {
    return html`
      <button class="button button--line button--effect-1">
        <span class="morph-shape" data-morph-active="M286,113c0,0-68.8,9-136,9c-78.2,0-137-9-137-9S3,97.198,3,62.5C3,33.999,13,12,13,12S72,2,150,2c85,0,136,10,136,10s11,17.598,11,52C297,96.398,286,113,286,113z">
          <svg width="100%" height="100%" viewBox="0 0 300 125" preserveAspectRatio="none">
            <path d="M286.5,113c0,0-104,0-136.5,0c-35.75,0-136.5,0-136.5,0s0-39.417,0-52.5c0-12.167,0-48.5,0-48.5s101.833,0,136.5,0c33.583,0,136.5,0,136.5,0s0,35.917,0,48.5C286.5,73.167,286.5,113,286.5,113z"/>
          </svg>
        </span>
        <span class="button__text"><slot></slot></span>
      </button>
    `;
  }

  handleClick()  {
    setTimeout(() => {
      console.log(this.link);
      window.location.href = this.link || '/';
    }, this.delay);
  }
}
