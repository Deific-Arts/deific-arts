import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { animate } from "motion";

type CardEl = HTMLElement;
type Cleanup = () => void;

@customElement("deific-services")
export default class DeificServices extends LitElement {
  static styles = css`
    :host {
      display: flex;
      padding-top: 4rem;
      align-items: center;
    }

    p {
      font-size: 1.25rem;
    }

    figure {
      margin: 0;
      padding: 1rem;
    }

    figure p {
      font-size: 1rem;
      line-height: 1.2;

      @media screen and (min-width: 769px) {
        font-size: 1.25rem;
        line-height: 1.5;
      }
    }

    figcaption {
      font-size: 2rem;
    }

    .deck {
      position: relative;
      width: min(320px, 70vw);
      height: 50vh;
      margin: 40px auto;
      perspective: 1200px;
      touch-action: pan-y;

      @media screen and (min-width: 769px) {
        width: min(420px, 92vw);
        height: 560px;
      }
    }

    .card {
      position: absolute;
      inset: 0;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.01);
      backdrop-filter: blur(14px);
      color: #fff;
      display: grid;
      place-items: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      user-select: none;
      will-change: transform, opacity;

      /* drag vars */
      --x: 0px;
      --y: 0px;
      --rot: 0deg;
      --s: 1;

      /* stack vars */
      --stack-x: 0px;
      --stack-y: 0px;
      --stack-r: 0deg;
      --stack-s: 1;

      transform:
        translateX(var(--stack-x))
        translateY(var(--stack-y))
        rotate(var(--stack-r))
        scale(var(--stack-s))
        translateX(var(--x))
        translateY(var(--y))
        rotate(var(--rot))
        scale(var(--s));
    }

    .card::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), transparent 45%);
      pointer-events: none;
    }
  `;

  private cards: CardEl[] = [];
  private detachTop: Cleanup | null = null;

  protected updated() {
    // if DOM was re-rendered, refresh references
    const fresh = Array.from(this.renderRoot.querySelectorAll<CardEl>(".card"));
    if (fresh.length && fresh[0] !== this.cards[0]) {
      this.detachTop?.();
      this.cards = fresh;
      this.syncZ();
      this.prepStack(true);
      this.enableTop();
    }
  }

  firstUpdated() {
    this.cards = Array.from(this.renderRoot.querySelectorAll<CardEl>(".card"));
    this.syncZ();
    this.prepStack(true);
    this.enableTop();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachTop?.();
    this.detachTop = null;
  }

  private advanceDeck(card: CardEl) {
    // rotate: first -> last
    this.cards = this.cards.slice(1).concat(card);

    // cancel animations + reset drag vars for all cards
    this.cards.forEach((c) => {
      c.getAnimations().forEach(a => a.cancel());
      c.style.setProperty("--x", "0px");
      c.style.setProperty("--y", "0px");
      c.style.setProperty("--rot", "0deg");
      c.style.setProperty("--s", "1");
      c.style.removeProperty("opacity"); // optional
    });

    this.syncZ();
    this.prepStack();
    this.enableTop();
  }

  private syncZ() {
    this.cards.forEach((c, idx) => {
      c.style.zIndex = String(this.cards.length - idx);
      c.style.setProperty("--i", String(idx));
      c.style.pointerEvents = idx === 0 ? "auto" : "none";
    });
  }

  private setMotionVars(card: CardEl, x: number, y: number, rotDeg: number, s: number) {
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
    card.style.setProperty("--rot", `${rotDeg}deg`);
    card.style.setProperty("--s", String(s));
  }

  private prepStack(initial = false) {
    this.cards.forEach((c, idx) => {
      const y = idx * 14;
      const x = (idx % 2 === 0 ? -1 : 1) * idx * 10;
      const r = (idx % 2 === 0 ? -1 : 1) * idx * 2.2;
      const s = 1 - idx * 0.03;

      // set immediately
      c.style.setProperty("--stack-x", `${x}px`);
      c.style.setProperty("--stack-y", `${y}px`);
      c.style.setProperty("--stack-r", `${r}deg`);
      c.style.setProperty("--stack-s", String(s));

      // animate to those values (INCLUDING idx 0)
      animate(
        c,
        {
          "--stack-x": `${x}px`,
          "--stack-y": `${y}px`,
          "--stack-r": `${r}deg`,
          "--stack-s": String(s),
          opacity: 1,
        } as any,
        initial
          ? { duration: 0 }
          : { type: "spring", stiffness: 350, damping: 30 }
      );
    });
}


  private topCard(): CardEl | null {
    return this.cards[0] ?? null;
  }

  private enableTop() {
    this.detachTop?.();
    this.detachTop = null;

    const card = this.topCard();
    if (!card) return;

    this.cards.forEach((c, idx) => (c.style.pointerEvents = idx === 0 ? "auto" : "none"));
    this.detachTop = this.attachDrag(card);
  }

  private attachDrag(card: CardEl): Cleanup {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let dragging = false;

    const snapBack = () => {
      card.getAnimations().forEach((a) => a.cancel());

      animate(
        card,
        {
          "--x": "0px",
          "--y": "0px",
          "--rot": "0deg",
          "--s": "1",
          opacity: 1,
        } as any,
        { type: "spring", stiffness: 420, damping: 34, mass: 0.9 }
      );
    };

    const tuckToBack = async () => {
      // stop any animations that might still be controlling props
      card.getAnimations().forEach(a => a.cancel());

      // lift a bit (optional)
      await animate(
        card,
        { "--y": "-10px", "--s": "1.02", "--rot": "0deg" } as any,
        { duration: 0.10, ease: "easeOut" }
      ).finished;

      // tuck “under” (down + slight scale)
      await animate(
        card,
        { "--y": "28px", "--s": "0.98", "--rot": "0deg" } as any,
        { duration: 0.14, ease: "easeIn" }
      ).finished;

      // IMPORTANT: move to back *after* the tuck motion
      this.advanceDeck(card);
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      card.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;

      // subtle “lift”
      animate(card, { "--s": "1.03" } as any, { duration: 0.12 });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;

      dx = e.clientX - startX;
      dy = e.clientY - startY;

      const rot = dx * 0.06;
      this.setMotionVars(card, dx, dy, rot, 1.03);
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;

      const threshold = 120;
      if (Math.abs(dx) > threshold) {
        void tuckToBack();
      } else {
        snapBack();
      }
    };

    // attach listeners
    card.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      card.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }

  render() {
    return html`
      <div class="deck">
        <div class="card">
          <figure>
            <svg viewBox="0 0 128 128" width="128" height="128" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#4d91bb;}.cls-2{fill:#2175aa;}.cls-3{fill:#c3edf5;}.cls-4{fill:#87dbec;}.cls-5{fill:#4dbab4;}</style></defs><title></title><g data-name="09 Responsive Design" id="_09_Responsive_Design"><rect class="cls-1" height="72" width="96" x="14" y="20"></rect><rect class="cls-2" height="44" width="42.17" x="67.83" y="48"></rect><rect class="cls-3" height="80" transform="translate(118 -6) rotate(90)" width="56" x="34" y="16"></rect><polygon class="cls-4" points="102 84 22 82.5 22 84 102 84"></polygon><rect class="cls-4" height="36" width="34.2" x="67.83" y="48"></rect><rect class="cls-1" height="9" width="36" x="44" y="95"></rect><rect class="cls-2" height="9" width="16" x="67.83" y="95"></rect><rect class="cls-5" height="56" width="42" x="72" y="52"></rect><rect class="cls-3" height="34" transform="translate(173 -13) rotate(90)" width="40" x="73" y="63"></rect><polygon class="cls-4" points="22 28 102 31.5 102 28 22 28"></polygon><polygon class="cls-4" points="75.83 60 110 63.38 110 60 75.83 60"></polygon><polygon class="cls-4" points="76 100 76 98.75 110 100 76 100"></polygon></g></svg>
            <figcaption>Design</figcaption>
            <p>A good design gives your product credibility and trustworthiness. I design products that are visually, accessible, and easy to navigate.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg enable-background="new 0 0 128 128" id="Layer_1" version="1.1" viewBox="0 0 128 128" width="128" height="128" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M110,107H13c-2.21,0-4-1.79-4-4V26c0-2.21,1.79-4,4-4h97c2.21,0,4,1.79,4,4v77  C114,105.21,112.21,107,110,107z" fill="#00AEEF"></path><path d="M115,107H18c-2.21,0-4-1.79-4-4V26c0-2.21,1.79-4,4-4h97c2.21,0,4,1.79,4,4v77  C119,105.21,117.21,107,115,107z" fill="#00C0F3"></path><polyline fill="none" points="84.86,48.55   106.56,70.24 85.34,91.45 " stroke="#00AEEF" stroke-linecap="square" stroke-miterlimit="10" stroke-width="6"></polyline><polyline fill="none" points="49.14,48.55   27.44,70.24 48.66,91.45 " stroke="#00AEEF" stroke-linecap="square" stroke-miterlimit="10" stroke-width="6"></polyline><line fill="none" stroke="#00AEEF" stroke-linecap="square" stroke-miterlimit="10" stroke-width="6" x1="76.73" x2="60.94" y1="48.55" y2="91.45"></line><rect fill="#00AEEF" height="3" width="105" x="14" y="35"></rect><rect fill="#0092C8" height="3" width="5" x="9" y="35"></rect><circle cx="20.67" cy="28.67" fill="#FFF200" r="2"></circle><circle cx="27.67" cy="28.67" fill="#EC008C" r="2"></circle><circle cx="34.67" cy="28.67" fill="#333031" r="2"></circle><rect fill="#EC008C" height="3" width="13" x="26" y="47"></rect><rect fill="#58595B" height="3" width="27" x="26" y="65"></rect><rect fill="#58595B" height="3" width="27" x="26" y="85"></rect><rect fill="#FFFFFF" height="3" width="25" x="34" y="52"></rect><rect fill="#FFFFFF" height="3" width="18" x="34" y="57"></rect><rect fill="#FFFFFF" height="3" width="18" x="88" y="52"></rect><rect fill="#EC008C" height="3" width="8" x="76" y="52"></rect><rect fill="#FFF200" height="3" width="11" x="62" y="52"></rect><rect fill="#FFFFFF" height="3" width="11" x="55" y="57"></rect><rect fill="#0092C8" height="3" width="11" x="69" y="57"></rect><rect fill="#EC008C" height="3" width="13" x="26" y="91"></rect><rect fill="#FFFFFF" height="3" width="25" x="34" y="96"></rect><rect fill="#EC008C" height="3" width="13" x="26" y="70"></rect><rect fill="#FFFFFF" height="3" width="25" x="34" y="75"></rect><rect fill="#FFFFFF" height="3" width="18" x="34" y="80"></rect><rect fill="#FFFFFF" height="3" width="18" x="88" y="75"></rect><rect fill="#EC008C" height="3" width="8" x="77" y="75"></rect><rect fill="#FFF200" height="3" width="11" x="55" y="80"></rect><rect fill="#0092C8" height="3" width="11" x="62" y="75"></rect></svg>
            <figcaption>Development</figcaption>
            <p>I develop custom solutions for businesses on the web. From Next.js to WordPress I use choose the a tech stack best suited for your needs.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg viewBox="0 0 20 20" width="128" height="128" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:none;}.cls-2{fill:#1b5cf3;}.cls-3{fill:#f92115;}.cls-4{fill:#190d15;}</style></defs><g data-name="Layer 2" id="Layer_2"><g data-name="Layer 1" id="Layer_1-2"><path class="cls-2" d="M17.16,19H2.84A.83.83,0,0,1,2,18.12l.74-13.5a.83.83,0,0,1,.83-.79H16.42a.83.83,0,0,1,.83.79L18,18.12A.83.83,0,0,1,17.16,19Z"></path><path class="cls-3" d="M6.39,6.82h0v2h7.22V4.41A3.41,3.41,0,0,0,10.2,1H9.8A3.41,3.41,0,0,0,6.39,4.41v.2h0Z"></path><path class="cls-4" d="M13.61,6.82V4.41a2.78,2.78,0,0,0-.06-.58H6.45a2.78,2.78,0,0,0-.06.58v.2h0V8.82h7.22Z"></path></g></g></svg>
            <figcaption>eCommerce</figcaption>
            <p>If you're looking to sell goods online, but don't have the budget of over $25k that you may be charged by an agency then you're in the right place!</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg style="enable-background:new 0 0 500 500.002;" version="1.1" width="128" height="128" viewBox="0 0 500 500.002" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="magnifier"><g><path d="M249.999,0C111.93,0,0,111.939,0,249.996c0,138.076,111.93,250.006,249.999,250.006    S500,388.072,500,249.996C500,111.939,388.067,0,249.999,0z" style="fill:#7DBEBD;"></path><g id="_x32_9"><path d="M284.261,299.456l10.114-8.091l17.053,17.948c2.966,3.706,2.36,9.1-1.327,12.05     c-3.706,2.978-9.105,2.377-12.064-1.329L284.261,299.456z" style="fill:#CCD1D9;"></path><path d="M286.606,308.769l16.336-13.078l53.123,60.937c4.788,5.986,3.825,14.698-2.156,19.481     c-5.981,4.783-14.703,3.822-19.481-2.154L286.606,308.769z" style="fill:#656D78;"></path><path d="M141.246,208.715c-4.516,52.836,34.669,99.346,87.51,103.867     c52.836,4.511,99.34-34.674,103.853-87.52c4.511-52.836-34.662-99.347-87.498-103.858     C192.268,116.693,145.762,155.869,141.246,208.715z M163.119,210.578c3.476-40.699,39.413-70.979,80.132-67.496     c40.687,3.473,70.986,39.418,67.5,80.117c-3.478,40.709-39.423,70.988-80.125,67.515     C189.92,287.222,159.633,251.287,163.119,210.578z" style="fill:#DBDFE4;"></path><path d="M244.668,126.424c-49.969-4.269-93.943,32.772-98.197,82.737     c-4.276,49.964,32.763,93.933,82.737,98.202c49.952,4.269,93.926-32.763,98.202-82.737     C331.683,174.662,294.624,130.693,244.668,126.424z M309.677,223.112c-3.43,40.117-38.853,69.96-78.956,66.525     c-40.117-3.425-69.95-38.856-66.525-78.963c3.427-40.117,38.851-69.96,78.958-66.525     C283.261,147.574,313.109,182.995,309.677,223.112z" style="fill:#FFFFFF;"></path><path d="M230.721,289.638c40.112,3.424,75.533-26.418,78.956-66.525     c3.432-40.107-26.411-75.538-66.523-78.953c-40.112-3.434-75.531,26.408-78.958,66.515     C160.771,250.782,190.599,286.203,230.721,289.638z" style="opacity:0.5;fill:#E7E1E2;"></path></g></g></g><g id="Layer_1"></g></svg>
            <figcaption>SEO</figcaption>
            <p>I build performant products that are optimized for SEO to reach as many potential customers as possible.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg enable-background="new 0 0 50 50" width="128" height="128" id="Layer_1" version="1.1" viewBox="0 0 50 50" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M27.42716,37.97365H3.37195c-1.31001,0-2.37198,1.06197-2.37198,2.37198v5.68487   c0,1.31001,1.06197,2.37199,2.37198,2.37199h24.05521c1.31001,0,2.37198-1.06197,2.37198-2.37199v-5.68487   C29.79915,39.03562,28.73717,37.97365,27.42716,37.97365z" fill="#656766"></path><path d="M27.42716,24.453H3.37195c-1.31001,0-2.37198,1.06197-2.37198,2.37198v5.68487   c0,1.31001,1.06197,2.37198,2.37198,2.37198h24.05521c1.31001,0,2.37198-1.06197,2.37198-2.37198v-5.68487   C29.79915,25.51497,28.73717,24.453,27.42716,24.453z" fill="#656766"></path><path d="M27.42716,10.93911H3.37195c-1.31001,0-2.37198,1.06197-2.37198,2.37198v5.68487   c0,1.31001,1.06197,2.37198,2.37198,2.37198h24.05521c1.31001,0,2.37198-1.06197,2.37198-2.37198v-5.68487   C29.79915,12.00108,28.73717,10.93911,27.42716,10.93911z" fill="#656766"></path><rect fill="#4E4C4D" height="3.09181" width="23.70859" x="3.54527" y="34.88184"></rect><rect fill="#4E4C4D" height="3.09181" width="23.70859" x="3.54527" y="21.36119"></rect><g><circle cx="6.55463" cy="16.15353" fill="#EC6E62" r="2.00697"></circle><circle cx="12.25864" cy="16.15353" fill="#85BD57" r="2.00697"></circle></g><g><circle cx="6.55463" cy="29.66742" fill="#EC6E62" r="2.00697"></circle><circle cx="12.25864" cy="29.66742" fill="#85BD57" r="2.00697"></circle></g><g><circle cx="6.55463" cy="43.18806" fill="#EC6E62" r="2.00697"></circle><circle cx="12.25864" cy="43.18806" fill="#85BD57" r="2.00697"></circle></g><path d="M46.78577,5.77846c-4.501,0.5352-8.20477-0.81942-11.28495-3.63849   c-0.7902-0.72327-1.97526-0.72327-2.76546,0C29.65517,4.9591,25.9514,6.31365,21.45034,5.77846   c-1.21568-0.1445-2.2832,0.8556-2.21071,2.0777C20.192,23.90665,30.21903,29.86,33.25307,31.30178   c0.55103,0.26179,1.17901,0.26179,1.73003,0C38.01715,29.86,48.04412,23.90665,48.99648,7.85616   C49.06897,6.63406,48.00145,5.63396,46.78577,5.77846z" fill="#53B1E2"></path><path d="M34.11381,28.38583c-2.84101-1.44447-10.58167-6.53286-11.78457-19.51692   c0.34131,0.01907,0.67969,0.02885,1.01513,0.02885c4.01556,0,7.62721-1.33493,10.77335-3.97546   c3.14614,2.64053,6.75877,3.97546,10.77335,3.97546c0.33447,0,0.67285-0.00978,1.01416-0.02836   C44.69352,21.82803,36.91375,26.94919,34.11381,28.38583z" fill="#22A7D4"></path></g></svg>
            <figcaption>Hosting</figcaption>
            <p>I'll host your product once its built on my premium infrastructure.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg data-name="Layer 1" width="128" height="128" id="Layer_1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1 {fill: #e7ecef;} .cls-2 {fill: #8b8c89;} .cls-3 {fill: #bc6c25;} .cls-4 {fill: #a3cef1;} .cls-5 {fill: #dda15e;} .cls-6 {fill: #6096ba;} .cls-7 {fill: #274c77;}</style></defs><path class="cls-5" d="M25.58,36.04l-3,1.29c-1.01,.43-2.15,.43-3.15,0l-3-1.29c-1.47-.63-2.42-2.08-2.42-3.68v-5.36c0-3.31,2.69-6,6-6h2c3.31,0,6,2.69,6,6v5.36c0,1.6-.95,3.05-2.42,3.68Z"></path><path class="cls-7" d="M34.14,42c-1.82-1.85-4.35-3-7.14-3h-3c0,1.66-1.34,3-3,3s-3-1.34-3-3h-3c-5.52,0-10,4.48-10,10v7H27l4-14h3.14Z"></path><path class="cls-5" d="M16,52h2c1.1,0,2,.9,2,2v2h-4v-4h0Z"></path><path class="cls-7" d="M11,28.73c-.29,.17-.64,.27-1,.27-1.1,0-2-.9-2-2s.9-2,2-2c.42,0,.81,.13,1.14,.36"></path><path class="cls-7" d="M31,28.73c.29,.17,.64,.27,1,.27,1.1,0,2-.9,2-2s-.9-2-2-2c-.42,0-.81,.13-1.14,.36"></path><path class="cls-3" d="M18,36.71l1.42,.61c1.01,.44,2.15,.44,3.16,0l1.42-.61v2.29c0,1.66-1.34,3-3,3s-3-1.34-3-3v-2.29Z"></path><polyline class="cls-2" points="27 56 31 42 53 42 49 56"></polyline><path class="cls-7" d="M27.4,24.38h-.01c-.57-.23-1.23-.38-2.06-.38-4.33,0-4.33,4-8.67,4-1.13,0-1.97-.27-2.66-.67v-.33c0-3.31,2.69-6,6-6h2c2.37,0,4.42,1.38,5.39,3.38h.01Z"></path><path class="cls-1" d="M28,31.6v-4.6c0-3.31-2.69-6-6-6h-2c-3.31,0-6,2.69-6,6v4h-2c-.55,0-1-.45-1-1v-3c0-5.52,4.48-10,10-10,2.76,0,5.26,1.12,7.07,2.93s2.93,4.31,2.93,7.07v3.18c0,.48-.34,.89-.8,.98l-2.2,.44Z"></path><path class="cls-4" d="M40,48c.55,0,1,.45,1,1s-.45,1-1,1v-2Z"></path><path class="cls-6" d="M21,33h0c-.11-.54,.24-1.07,.78-1.18l8.22-1.64v-2.86c0-4.79-3.61-8.98-8.38-9.3-5.24-.35-9.62,3.81-9.62,8.98v3h2v2h-2c-1.1,0-2-.9-2-2v-2.68c0-5.72,4.24-10.74,9.94-11.27,6.54-.62,12.06,4.53,12.06,10.95v3.18c0,.95-.67,1.77-1.61,1.96l-8.22,1.64c-.54,.11-1.07-.24-1.18-.78Z"></path><path class="cls-6" d="M21,56h-2v-2c0-.55-.45-1-1-1h-7c-.55,0-1-.45-1-1v-4c0-.27,.11-.52,.29-.71l1.29-1.29c.39-.39,1.02-.39,1.41,0h0c.39,.39,.39,1.02,0,1.41l-1,1v2.59h6c1.66,0,3,1.34,3,3v2Z"></path><rect class="cls-4" height="2" width="50" x="3" y="56"></rect><path class="cls-6" d="M41,19.71l-6,4.29,1-5h-2c-.55,0-1-.45-1-1V7c0-.55,.45-1,1-1h14c.55,0,1,.45,1,1v6h-7c-.55,0-1,.45-1,1v5.71Z"></path><path class="cls-7" d="M61,14v14c0,.55-.45,1-1,1h-3s1,6,1,6l-7-6h-9c-.55,0-1-.45-1-1V14c0-.55,.45-1,1-1h18c.55,0,1,.45,1,1Z"></path></svg>
            <figcaption>Support</figcaption>
            <p>You'll get training on using your product and support + updates for any issues or changes you may have.</p>
          </figure>
        </div>
      </div>
    `;
  }
}
