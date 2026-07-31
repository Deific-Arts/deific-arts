import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { deepLink } from '../scripts/navigation';

const isHomepage = !!document.querySelector('deific-home');

const menuItems = [
  { label: 'About', value: 'about' },
  { label: 'Services', value: 'services' },
  { label: 'FAQs', value: 'faqs' },
  { label: 'Projects', value: 'projects' },
  { label: 'Blog', value: 'blog' },
  { label: 'Skills', value: 'skills' },
  { label: 'Get Started', value: 'started' },
];

@customElement('deific-menu')
export class DeificMenu extends LitElement {
  static styles = [
    css`
      a {
        color: var(--color-secondary);
        text-decoration: none;
        transition: all 0.2s ease;

        &:hover {
          color: var(--color-primary);
        }

        &[data-active] {
          text-decoration: underline;
          text-underline-offset: 0.5rem;
          text-decoration-color: var(--color-primary);
        }
      }

      nav {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }

      select {
        font-size: 1rem;
        width: 66vw;
        padding: 1rem;
        border-radius: 1rem;
        background: transparent;
        appearance: none;

        background-repeat: no-repeat;
        background-position: right 15px center;
        background-size: 16px;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");

      }
    `,
  ];

  @state()
  private page: string = 'home';

  @state()
  private isDesktop = matchMedia('(width > 1024px)').matches;

  constructor() {
    super();
    document.addEventListener('page-change', (event: Event) => {
      this.page = (event as CustomEvent).detail.page;
      console.log('Page changed to:', this.page);
    });
  }

  render() {
    return html`
      ${this.isDesktop
        ? html`
            <nav>
              ${menuItems.map(item => html`<a href="/${item.value}" ?data-active="${this.page === item.value}" @click="${this.handleLinkClick}">
                ${item.label}
              </a>`)}
            </nav>
          `
        : html`
            <select @change="${this.handleLinkSelect}">
              ${menuItems.map(item => html`<option value="${item.value}" ?selected="${this.page === item.value}">
                ${item.label}
              </option>`)}
            </select>
          `
      }
    `;
  }

  private handleLinkClick(event: Event) {
    if (!isHomepage) return;
    event.preventDefault();
    const slug = (event.target as HTMLAnchorElement).getAttribute('href') ?? '/';
    this.page = slug;
    deepLink(event, slug);
  }

  private handleLinkSelect(event: Event) {
    const slug = (event.target as HTMLSelectElement).value;

    if (isHomepage) {
      event.preventDefault();
      this.page = slug;
      deepLink(event, slug);
    }

    window.location.href = `/${slug}`;
  }
}
