
import { LitElement, html, css } from 'lit';
import { customElement, property, query, queryAll, state } from 'lit/decorators.js';
import { animate, scroll } from "motion";
import { repeat } from '../scripts/repeat';

type TypeAxis = 'x' | 'y';
type TypeScrollDirection = 'forward' | 'backward';

export interface IScjScrollShowProps {
  axis?: TypeAxis,
}

const styles = css`
  :host {
    display: flex;
    height: auto;
  }

  img {
    width: auto;
    height: 50vh;
    object-fit: cover;
  }

  section {
    height: 400vh;
    position: relative;
  }

  section > div {
    position: sticky;
    top: 0;
    overflow: hidden;
    height: 100vh;
  }

  deific-description {
    display: inline-block;
    position: relative;
    top: 1rem;
    left: 1rem;

    h2 {
      font-size: 2rem;
      margin: 0;
    }

    p {
      margin: 0;
      max-width: 400px;
    }

    kemet-button {
      position: relative;
      top: -4px;
      z-index: 99;
      transform: scale(0.75);
    }
  }

  deific-slides {
    display: flex;
    height: 100vh;
    flex-direction: row;
    position: relative;
    top: -8vh;
    z-index: 1;
  }

  deific-slide {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 33vw;
    height: 100vh;
    margin-top: -6vh;
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

@customElement('deific-projects')
export default class DeificProjects extends LitElement {
  static styles = [styles];

  @property({ type: Array })
  projects: any[] = [];

  @property({ type: String, reflect: true })
  axis: TypeAxis = 'x';

  @state()
  currentSlide: number = 0;

  @state()
  lastProgress: number = 0;

  @state()
  isDesktop: boolean = matchMedia('(width > 1024px)').matches;

  @state()
  scrollDirection: TypeScrollDirection = 'backward';

  @queryAll('deific-slide')
  slideElements!: NodeListOf<HTMLElement>;

  @query('deific-slides')
  slidesElement!: HTMLElement;

  @query('section')
  sectionElement!: HTMLElement;

  @queryAll('deific-background')
  backgroundElements!: NodeListOf<HTMLElement>;

  firstUpdated() {
    this.init();
  }

  render() {
    const numberOfSlides = this.querySelectorAll('[slot*=slide]')?.length ?? 0;
    return html`
      <section>
        <div>
          <deific-description>
            <h2>
              ${this.projects[this.currentSlide ?? 0]?.data.heading}
              <kemet-button rounded="circle" link="/projects/${this.projects[this.currentSlide ?? 0]?.id}">
                <kemet-icon-bootstrap icon="chevron-right" size="20"></kemet-icon-bootstrap>
              </kemet-button>
            </h2>
            <p>${this.projects[this.currentSlide ?? 0]?.data.description}</p>
          </deific-description>
          <deific-slides>
            ${repeat(numberOfSlides, (index) => {
              return html`
                <deific-slide>
                  <slot name=${`slide-${index}`} ></slot>
                </deific-slide>
              `;
            })}
            <deific-slide>
              <a href="/projects/${this.projects[0]?.id}">
                <img src=${this.projects[0]?.data.image} alt=${this.projects[0]?.data.heading} />
              </a>
            </deific-slide>
          </deific-slides>
        </div>
      </section>
    `
  }

  // bootstrap animations
  init() {
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
      // Determine which slide is most centered in viewport
      const maxTranslate = -(this.slideElements.length) * 100;
      const currentTranslate = progress * maxTranslate;
      const viewportCenter = 50; // 50vw

      let closestSlideIndex = 0;
      let minDistance = Infinity;

      this.slideElements.forEach((slide, index) => {
        const slideLeft = index * 33; // 33vw per slide
        const slideCenter = slideLeft + currentTranslate + 16.5; // center of 33vw slide
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestSlideIndex = index;
        }
      });

      // we're manually cloning the first slide so go to 0 if it's higher than the number of projects
      this.currentSlide = closestSlideIndex <= this.projects.length -1 ? closestSlideIndex : 0;

      const inView = progress > 0 && progress < 1;

      if (inView) {
        window.history.replaceState(null, '', '/projects/');
        document.documentElement.dataset.page = 'projects';
        document.querySelector('deific-background')?.setAttribute('section', 'projects');
      }

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

  handleHover(index: number) {
    this.currentSlide = index;
    console.log('current slide', this.currentSlide);
  }
}
