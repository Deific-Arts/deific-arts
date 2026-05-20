import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { projects, type Project } from './content';
import styles from './styles';

import 'kemet-ui/elements/icon-bootstrap';
import '../me-loader';
import '../me-wheel';
import './slider';

@customElement('me-hero')
export class MeHero extends LitElement {
  static styles = [styles];

  @property()
  project!: Project;

  @property()
  projects!: Project[];

  constructor() {
    super();

    document.addEventListener('me-wheel-click', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleWheelClick(event);
      }
    });
  }

  firstUpdated() {
    // this.getProjects();
    this.project = projects[0];
  }

  render() {
    if (this.project) {
      return html`
        <div>
          <me-wheel .slides=${projects}></me-wheel>
          <div class="project">
            <span>${this.project.heading}</span>
            <a href="/projects/${this.project.slug}" aria-label="Projects">
              <kemet-icon-bootstrap icon="arrow-return-right" size="32"></kemet-icon-bootstrap>
            </a>
          </div>
        </div>
        <me-hero-slider .slides=${projects}></me-hero-slider>
      `;
    }

    return html`<me-loader loading></me-loader>`;
  }

  // async getProjects() {
  //   const response = await fetch('/api/projects');
  //   const data = await response.json();
  //   this.projects = data;
  //   this.project = data[0];
  // }

  handleWheelClick(event: CustomEvent) {
    this.project = event.detail.slide;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-hero': MeHero;
  }
}
