import { css, html, LitElement } from 'lit';

class DeificContact extends LitElement {
  static styles = [css`
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
  `];
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
          <kemet-button type="submit" rounded="pill">Reach out to me</kemet-button>
        </fieldset>
        <input type="hidden" name="to" value="contact@deificarts.com">
      </form>
    `;
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    fetch('https://email.deificarts.com/default', {
      method: 'POST',
      body: new FormData(event.target as HTMLFormElement)
    });
  }
}

customElements.define('deific-contact', DeificContact);
