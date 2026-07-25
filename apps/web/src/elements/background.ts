import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('deific-background')
export class DeificBackground extends LitElement {
  static styles = css`
    :host {
      --height: 0vh;
      --opacity: 0;

      display: block;
      position: sticky;
      left: 0;
      bottom: 0;
      z-index: -1;
      width: 100%;
      height: var(--height);
      opacity: var(--opacity);
      transition: all 1s ease-out;
      transition-delay: 0.5s;
      background-color: var(--color-background);
    }

    :host([section="home"]) {
      --height: 50vh;
      --opacity: 1;
    }

    :host([section="about"]) {
      --height: 80vh;
      --opacity: 0.8;
    }

    :host([section="skills"]) {
      --height: 100vh;
      --opacity: 0.9;
    }

    :host([section="blog"]) {
      --height: 35vh;
      --opacity: 1;
    }

    kemet-button {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 1000;
    }
  `;

  @property({ type: String, reflect: true })
  section: string = 'home';

  firstUpdated() {
    this.initSectionObserver();
  }

  render() {
    return html`<slot></slot>`;
  }

  private initSectionObserver() {
    const options = {
      root: document.documentElement,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // emit custom event to update page data
          this.dispatchEvent(new CustomEvent('page-change', {
            bubbles: true,
            composed: true,
            detail: {
              page: entry.target.tagName.toLowerCase().replace('deific-', '')
            }
          }));
          this.section = entry.target.tagName.toLowerCase().replace('deific-', '');
        }
      });
    }, options);

    const sectionSeletctor = 'deific-home, deific-about, deific-services, deific-blog, deific-skills';

    // Observe all section elements
    const sections = document.querySelectorAll(sectionSeletctor);
    sections.forEach(section => {
      observer.observe(section);
    });
  }
}
