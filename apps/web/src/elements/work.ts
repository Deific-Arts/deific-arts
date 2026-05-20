
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { animate, scroll } from "motion";
import { repeat } from '../scripts/repeat';

type TypeAxis = 'x' | 'y';
type TypeScrollDirection = 'forward' | 'backward';

export interface IScjScrollShowProps {
  axis?: TypeAxis,
}

const styles = css`
  :host {
    display: block;
    height: auto;
  }

  section {
    height: 500vh;
    position: relative;
  }

  section > div {
    position: sticky;
    top: 0;
    overflow: hidden;
    height: 100vh;
  }

  deific-slides {
    display: flex;
    flex-direction: row;
    position: relative;
    z-index: 1;
  }

  deific-slide {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 90vw;
    height: 100vh;
  }

  deific-backgrounds {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  deific-background {
    width: 100%;
    height: 100%;
    visibility: hidden;
    position: absolute;
    z-index: 1;
  }

  deific-background[previous] {
    z-index: 2;
    visibility: visible;
  }

  deific-background[active] {
    z-index: 3;
    visibility: visible;
    animation: fade 1s ease-in-out forwards;
  }

  @keyframes fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

@customElement('deific-work')
export default class DeificWork extends LitElement {
  static styles = [styles];

  static properties = {
    axis: { type: String, reflect: true },
  };

  declare lastProgress: number;
  declare axis: TypeAxis;
  declare isDesktop: boolean;
  declare scrollDirection: TypeScrollDirection;

  // @queryAll('deific-slide')
  declare slideElements: NodeListOf<HTMLElement>;

  // @query('deific-slides')
  declare slidesElement: HTMLElement;

  // @query('section')
  declare sectionElement: HTMLElement;

  // @queryAll('deific-background')
  declare backgroundElements: NodeListOf<HTMLElement>;

  constructor() {
    super();
    this.axis = 'x';
    this.lastProgress = 0;
    this.scrollDirection = 'backward';
    this.isDesktop = matchMedia('(min-width: 769px)').matches;
  }

  firstUpdated() {
    this.sectionElement = this.shadowRoot?.querySelector('section') as HTMLElement;
    this.slidesElement = this.shadowRoot?.querySelector('deific-slides') as HTMLElement;
    this.slideElements = this.shadowRoot?.querySelectorAll('deific-slide') as NodeListOf<HTMLElement>;
    this.init();
  }

  render() {
    const numberOfSlides = this.querySelectorAll('[slot*=slide]')?.length ?? 0;
    return html`
      <section>
        <div>
          <deific-slides>
            ${repeat(numberOfSlides, (index) => {
              return html`
                <deific-slide>
                  <slot name=${`slide-${index}`}></slot>
                </deific-slide>
              `;
            })}
          </deific-slides>
        </div>
      </section>
    `
  }

  // bootstrap animations
  init() {
    // const isDesktop = matchMedia('(min-width: 1024px)').matches;
    // const slidesHeight = this.slidesElement.offsetHeight;
    // const offset = isDesktop ? window.innerHeight * 1.5 : window.innerHeight;
    const container = document.querySelector('main') as HTMLElement;
    const translate = `translateX(-${this.slideElements.length - 1}00vw)`

    scroll(
      animate(this.slidesElement, {
        transform: ["none", translate],
      }),
      {
        container,
        target: this.sectionElement
      },
    );

    scroll((progress: number) => {
      if (progress < this.lastProgress) {
        this.scrollDirection = 'backward';
      } else {
        this.scrollDirection = 'forward';
      }
      this.lastProgress = progress;
    }, {
      container,
      target: this.sectionElement
    })
  }
}
