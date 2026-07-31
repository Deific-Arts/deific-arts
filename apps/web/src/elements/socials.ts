import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { svgLinkTree, svgGithub, svgFacebook, svgThreads, svgBlueSky, svgInstagram, svgStackBlitz, svgGooglePlay, svgLinkedIn, svgYouTube } from '../assets/svgs';

@customElement('deific-socials')
export class DeificSocials extends LitElement {
  static styles = css`
    :host {
      display: none;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
      z-index: 999;

      @media (width > 1024px) {
        display: block;
      }
    }

    ul {
      display: inline-flex;
      gap: 1rem;
    }

    li {
      list-style: none;
    }

    a {
      text-decoration: none;
      color: inherit;
    }

    svg {
      width: 24px;
      height: 24px;
    }

    kemet-fab {
      --kemet-fab-size: 64px;
    }

    kemet-fab::part(text) {
      pointer-events: auto;
    }
  `;

  @property({ type: Boolean })
  active = false;

  render() {
    return html`
      <kemet-fab pill @click=${() => (this.active = !this.active)}>
        <kemet-icon-bootstrap slot="icon" icon="wechat" size="32"></kemet-icon-bootstrap>
        ${this.makeSocialLinks()}
      </kemet-fab>
    `;
  }

  makeSocialLinks() {
    return html`
      <ul>
        <li><a href="https://www.facebook.com/deificartsllc" title="Facebook" target="_blank">${svgFacebook}</a></li>
        <li><a href="https://www.threads.com/@deificarts" title="Threads" target="_blank">${svgThreads}</a></li>
        <li><a href="https://bsky.app/profile/deificartsllc.bsky.social" title="Blue Sky" target="_blank">${svgBlueSky}</a></li>
        <li><a href="https://www.instagram.com/deificarts" title="Instagram" target="_blank">${svgInstagram}</a></li>
        <li><a href="https://github.com/Deific-Arts" title="GitHub" target="_blank">${svgGithub}</a></li>
        <li><a href="https://www.linkedin.com/company/deificarts" title="LinkedIn" target="_blank">${svgLinkedIn}</a></li>
        <li><a href="https://youtube.com/@DeificArtsLLC" title="YouTube" target="_blank">${svgYouTube}</a></li>
        <li><a href="https://stackblitz.com/@deificarts" title="StackBlitz" target="_blank">${svgStackBlitz}</a></li>
        <li><a href="https://linktr.ee/deificarts" title="Link Tree" target="_blank">${svgLinkTree}</a></li>
        <li><a href="https://play.google.com/store/apps/dev?id=6851515481249949579&hl=en_US" title="Google Play" target="_blank">${svgGooglePlay}</a></li>
      </ul>
    `;
  }
}
