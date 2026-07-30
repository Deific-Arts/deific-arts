import { css, html, LitElement } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';

class DeificContact extends LitElement {
  static styles = [css`
    :host([status=error]) {
      --status-color: red;
    }

    :host([status=success]) {
      --status-color: green;
    }

    form {
      margin-top: 2rem;
      padding: 3rem;
      background: rgba(0, 0, 0, 0.25);
    }

    fieldset {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      border: none;
      padding: 0;
      margin: 0;
    }

    kemet-button {
      --kemet-button-background-color: var(--color-primary);
      font-size: 1.25rem;
      font-weight: bold;
      text-transform: uppercase;
      text-shadow: 1px 1px #000000aa;
    }

    kemet-icon-bootstrap {
      color: rgb(var(--kemet-color-primary));
    }

    kemet-input::part(input),
    kemet-textarea::part(textarea) {
      color: white;
    }

    .message {
      font-size: 1.1rem;
      color: var(--status-color, white);
      padding: 0;
      margin: 0;
      text-align: center;
    }
  `];

  @property({ type: String, reflect: true })
  status: 'idle' | 'success' | 'error' = 'idle';

  @state()
  private isLoading = false;

  @state()
  private statusMessage: string | null = null;

  @queryAll('kemet-input, kemet-textarea, input')
  private formElements!: NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <fieldset>
          <kemet-field label="What's your name?">
            <kemet-input slot="input" name="fullname" required>
              <kemet-icon-bootstrap icon="person" slot="left"></kemet-icon-bootstrap>
            </kemet-input>
          </kemet-field>
          <kemet-field label="What's your email?">
            <kemet-input slot="input" name="replyemail" required>
              <kemet-icon-bootstrap icon="envelope" slot="left"></kemet-icon-bootstrap>
            </kemet-input>
          </kemet-field>
          <kemet-field label="Briefly describe your project:">
            <kemet-textarea slot="input" name="text" required></kemet-textarea>
          </kemet-field>
          <small>* All fields are required</small>
          ${this.statusMessage ? html`<p class="message">${this.statusMessage}</p>` : ''}
          <kemet-button type="submit" rounded="pill">Reach out to me</kemet-button>
        </fieldset>
        <input type="hidden" name="to" value="contact@deificarts.com">
      </form>
    `;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.statusMessage = 'Sending...'

    const payload: Record<string, string> = {};

    this.formElements.forEach((element) => {
      const name = element.getAttribute('name');
      const value = element.value;
      if (name && value) {
        payload[name] = value;
      }
    });

    const response = await fetch('https://email.deificarts.com/default/', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer public-token-deificarts',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    this.isLoading = false;

    if (response.ok) {
      this.status = 'success';
      this.statusMessage = 'I got your message and will get back to you soon!';
    } else {
      const error = await response.json();
      this.status = 'error';
      this.statusMessage = error.message;
      console.error('Failed to send email', error);
    }
  }
}

customElements.define('deific-contact', DeificContact);
