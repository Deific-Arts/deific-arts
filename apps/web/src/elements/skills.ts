import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { animate } from "motion";

type CardEl = HTMLElement;
type Cleanup = () => void;

@customElement("deific-skills")
export default class DeificSkills extends LitElement {
  static styles = css`
    :host {
      flex-direction: column;
      gap: 1rem;
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
      padding: 0 1rem;

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
            <svg width="128" height="128" viewBox="0 0 569 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill="none" fill-rule="evenodd"><g transform="translate(-227, -256)" fill="#58C4DC" fill-rule="nonzero"><g transform="translate(227, 256)"><path d="M285.5,201 C255.400481,201 231,225.400481 231,255.5 C231,285.599519 255.400481,310 285.5,310 C315.599519,310 340,285.599519 340,255.5 C340,225.400481 315.599519,201 285.5,201" id="Path"></path>
            <path d="M568.959856,255.99437 C568.959856,213.207656 529.337802,175.68144 466.251623,150.985214 C467.094645,145.423543 467.85738,139.922107 468.399323,134.521063 C474.621631,73.0415145 459.808523,28.6686204 426.709856,9.5541429 C389.677085,-11.8291748 337.36955,3.69129898 284.479928,46.0162134 C231.590306,3.69129898 179.282771,-11.8291748 142.25,9.5541429 C109.151333,28.6686204 94.3382249,73.0415145 100.560533,134.521063 C101.102476,139.922107 101.845139,145.443621 102.708233,151.02537 C97.4493791,153.033193 92.2908847,155.161486 87.3331099,157.39017 C31.0111824,182.708821 0,217.765415 0,255.99437 C0,298.781084 39.6220545,336.307301 102.708233,361.003527 C101.845139,366.565197 101.102476,372.066633 100.560533,377.467678 C94.3382249,438.947226 109.151333,483.32012 142.25,502.434597 C153.629683,508.887578 166.52439,512.186771 179.603923,511.991836 C210.956328,511.991836 247.567589,495.487529 284.479928,465.972527 C321.372196,495.487529 358.003528,511.991836 389.396077,511.991836 C402.475265,512.183856 415.36922,508.884856 426.75,502.434597 C459.848667,483.32012 474.661775,438.947226 468.439467,377.467678 C467.897524,372.066633 467.134789,366.565197 466.291767,361.003527 C529.377946,336.347457 569,298.761006 569,255.99437 M389.155214,27.1025182 C397.565154,26.899606 405.877839,28.9368502 413.241569,33.0055186 C436.223966,46.2772304 446.540955,82.2775015 441.522965,131.770345 C441.181741,135.143488 440.780302,138.556788 440.298575,141.990165 C414.066922,134.08804 387.205771,128.452154 360.010724,125.144528 C343.525021,103.224055 325.192524,82.7564475 305.214266,63.9661533 C336.586743,39.7116483 366.032313,27.1025182 389.135142,27.1025182 M378.356498,310.205598 C368.204912,327.830733 357.150626,344.919965 345.237759,361.405091 C325.045049,363.479997 304.758818,364.51205 284.459856,364.497299 C264.167589,364.51136 243.888075,363.479308 223.702025,361.405091 C211.820914,344.919381 200.80007,327.83006 190.683646,310.205598 C180.532593,292.629285 171.306974,274.534187 163.044553,255.99437 C171.306974,237.454554 180.532593,219.359455 190.683646,201.783142 C200.784121,184.229367 211.770999,167.201087 223.601665,150.764353 C243.824636,148.63809 264.145559,147.579168 284.479928,147.591877 C304.772146,147.579725 325.051559,148.611772 345.237759,150.68404 C357.109048,167.14607 368.136094,184.201112 378.27621,201.783142 C388.419418,219.363718 397.644825,237.458403 405.915303,255.99437 C397.644825,274.530337 388.419418,292.625022 378.27621,310.205598 M419.724813,290.127366 C426.09516,307.503536 431.324985,325.277083 435.380944,343.334682 C417.779633,348.823635 399.836793,353.149774 381.668372,356.285142 C388.573127,345.871232 395.263781,335.035679 401.740334,323.778483 C408.143291,312.655143 414.144807,301.431411 419.805101,290.207679 M246.363271,390.377981 C258.848032,391.140954 271.593728,391.582675 284.5,391.582675 C297.406272,391.582675 310.232256,391.140954 322.737089,390.377981 C310.880643,404.583418 298.10766,417.997563 284.5,430.534446 C270.921643,417.999548 258.18192,404.585125 246.363271,390.377981 Z M187.311556,356.244986 C169.137286,353.123646 151.187726,348.810918 133.578912,343.334682 C137.618549,325.305649 142.828222,307.559058 149.174827,290.207679 C154.754833,301.431411 160.736278,312.655143 167.239594,323.778483 C173.74291,334.901824 180.467017,345.864539 187.311556,356.285142 M149.174827,221.760984 C142.850954,204.473938 137.654787,186.794745 133.619056,168.834762 C151.18418,163.352378 169.085653,159.013101 187.211197,155.844146 C180.346585,166.224592 173.622478,176.986525 167.139234,188.210257 C160.65599,199.433989 154.734761,210.517173 149.074467,221.760984 M322.616657,121.590681 C310.131896,120.827708 297.3862,120.385987 284.379568,120.385987 C271.479987,120.385987 258.767744,120.787552 246.242839,121.590681 C258.061488,107.383537 270.801211,93.9691137 284.379568,81.4342157 C297.99241,93.9658277 310.765727,107.380324 322.616657,121.590681 Z M401.70019,188.210257 C395.196875,176.939676 388.472767,166.09743 381.527868,155.68352 C399.744224,158.819049 417.734224,163.151949 435.380944,168.654058 C431.331963,186.680673 426.122466,204.426664 419.785029,221.781062 C414.205023,210.55733 408.203506,199.333598 401.720262,188.230335 M127.517179,131.790423 C122.438973,82.3176579 132.816178,46.2973086 155.778503,33.0255968 C163.144699,28.9632474 171.455651,26.9264282 179.864858,27.1225964 C202.967687,27.1225964 232.413257,39.7317265 263.785734,63.9862316 C243.794133,82.7898734 225.448298,103.270812 208.949132,125.204763 C181.761691,128.528025 154.90355,134.14313 128.661281,141.990165 C128.199626,138.556788 127.778115,135.163566 127.456963,131.790423 M98.4529773,182.106474 C101.54406,180.767925 104.695358,179.429376 107.906872,178.090828 C114.220532,204.735668 122.781793,230.7969 133.498624,255.99437 C122.761529,281.241316 114.193296,307.357063 107.8868,334.058539 C56.7434387,313.076786 27.0971497,284.003505 27.0971497,255.99437 C27.0971497,229.450947 53.1907013,202.526037 98.4529773,182.106474 Z M155.778503,478.963143 C132.816178,465.691432 122.438973,429.671082 127.517179,380.198317 C127.838331,376.825174 128.259842,373.431953 128.721497,369.978497 C154.953686,377.878517 181.814655,383.514365 209.009348,386.824134 C225.500295,408.752719 243.832321,429.233234 263.805806,448.042665 C220.069,481.834331 180.105722,492.97775 155.838719,478.963143 M441.502893,380.198317 C446.520883,429.691161 436.203894,465.691432 413.221497,478.963143 C388.974566,493.017906 348.991216,481.834331 305.274481,448.042665 C325.241364,429.232737 343.566681,408.752215 360.050868,386.824134 C387.245915,383.516508 414.107066,377.880622 440.338719,369.978497 C440.820446,373.431953 441.221885,376.825174 441.563109,380.198317 M461.193488,334.018382 C454.869166,307.332523 446.294494,281.231049 435.561592,255.99437 C446.289797,230.744081 454.857778,204.629101 461.173416,177.930202 C512.216417,198.911955 541.942994,227.985236 541.942994,255.99437 C541.942994,284.003505 512.296705,313.076786 461.153344,334.058539" id="Shape"></path></g></g></g></svg>
            <figcaption>JavaScript Libraries</figcaption>
            <p>I'm familar with a couple of JavaScript libraries. My go to is Lit for custom projects. But I have a years of experience with React and ecosystem of products. I also spent some time with Angular.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg viewBox="0 0 256 256" width="128" height="128" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M20 0h216c11.046 0 20 8.954 20 20v216c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0Z" fill="#3178C6"/><path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z" fill="#FFF"/></svg>
            <figcaption>Typescript</figcaption>
            <p>Any modern project I work on I do with Typescript by default. I've been working with Typescript for serveral years and I'm comfortable with typing things and using tools that are based on types such as Zod.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 256 256"><defs><linearGradient id="c" x1="55.6%" x2="83.2%" y1="56.4%" y2="96.1%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="d" x1="50%" x2="50%" y1="0%" y2="73.4%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient><circle id="a" cx="128" cy="128" r="128"/></defs><mask id="b" fill="#fff"><use href="#a"/></mask><g mask="url(#b)"><circle cx="128" cy="128" r="128"/><path fill="url(#c)" d="M212.6 224 98.3 76.8H76.8v102.4H94V98.7l105.1 135.7a128 128 0 0 0 13.5-10.4"/><path fill="url(#d)" d="M163.6 76.8h17v102.4h-17z"/></g></svg>
            <figcaption>Meta Frameworks</figcaption>
            <p>I'm an Astro JS guy by heart but I also have a few years of experience with Next JS as well.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="128" height="128"><path fill="#264de4" d="M71.4 460.8 30.3 0h451.4l-41.1 460.7L255.7 512z"/><path fill="#2965f1" d="m405.4 431.4 35.1-393.7H256v435.1z"/><path fill="#ebebeb" d="m124.5 208.6 5 56.5H256v-56.5zm-5-57.9H256V94.2H114.3zM256 355.4h-.2l-63-17-4-45H132l8 88.7 115.7 32.1h.3z"/><path fill="#fff" d="M255.8 208.6V265h69.6l-6.6 73.3-63 17v58.8l115.9-32 .8-9.6 13.3-148.8 1.4-15.2 10.2-114.4H255.8v56.5h79.6l-5.1 57.9z"/></svg>            <figcaption>Styles</figcaption>
            <p>I'm an expert with CSS architecture and can do anyting from Tailwind, to SCSS, to full featured design systems.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg viewBox="0 0 122.52 122.52" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><g fill="#21759b"><path d="M8.7 61.26a52.6 52.6 0 0 0 29.63 47.3L13.26 39.87A52 52 0 0 0 8.7 61.26m88.04-2.66c0-6.49-2.33-10.99-4.33-14.49-2.67-4.33-5.17-8-5.17-12.32 0-4.83 3.67-9.33 8.83-9.33l.68.04A52.4 52.4 0 0 0 61.26 8.7a52.5 52.5 0 0 0-43.9 23.7c1.22.03 2.39.06 3.37.06 5.5 0 14.01-.67 14.01-.67 2.83-.16 3.17 4 .34 4.33 0 0-2.85.34-6.02.5L48.2 93.55l11.5-34.5-8.19-22.43c-2.83-.17-5.5-.5-5.5-.5-2.84-.17-2.5-4.5.32-4.33 0 0 8.68.67 13.85.67 5.5 0 14-.67 14-.67 2.84-.17 3.17 4 .34 4.33 0 0-2.85.33-6.01.5l18.99 56.5 5.24-17.52c2.27-7.27 4-12.5 4-17"/><path d="m62.18 65.86-15.76 45.82a52.6 52.6 0 0 0 32.3-.84 5 5 0 0 1-.38-.73zm45.2-29.81q.34 2.5.35 5.4c0 5.33-1 11.33-4 18.82L87.68 106.7a52.53 52.53 0 0 0 19.7-70.64"/><path d="M61.26 0A61.33 61.33 0 0 0 0 61.26a61.33 61.33 0 0 0 61.26 61.26 61.33 61.33 0 0 0 61.27-61.26A61.33 61.33 0 0 0 61.26 0m0 119.72A58.5 58.5 0 0 1 2.81 61.26 58.5 58.5 0 0 1 61.26 2.81a58.5 58.5 0 0 1 58.45 58.45 58.5 58.5 0 0 1-58.45 58.46"/></g></svg>
            <figcaption>Backend</figcaption>
            <p>I primarily work with Supabase and WordPress on the backend. I have a particularly long history with WordPress doing things from custom plugins to headless implementations.</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" width="128" height="128" viewBox="0 0 256 319" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path id="a" d="M9.87 293.32.01 30.57a16 16 0 0 1 15-16.57L238.49.03a16 16 0 0 1 17 15.98v286.3a16 16 0 0 1-16.71 16l-213.63-9.6a16 16 0 0 1-15.28-15.39"/></defs><mask id="b" fill="#fff"><use href="#a"/></mask><use fill="#ff4785" href="#a"/><path fill="#fff" d="m188.67 39.13 1.52-36.72L220.9 0l1.32 37.86a2.39 2.39 0 0 1-3.87 1.96l-11.83-9.32-14.02 10.63a2.39 2.39 0 0 1-3.83-2m-39.26 80.85c0 6.23 41.95 3.24 47.58-1.13 0-42.4-22.76-64.68-64.42-64.68s-65 22.62-65 56.56c0 59.12 79.78 60.25 79.78 92.5 0 9.05-4.44 14.42-14.19 14.42-12.7 0-17.73-6.49-17.14-28.55 0-4.78-48.45-6.28-49.93 0-3.76 53.47 29.55 68.9 67.66 68.9 36.94 0 65.9-19.69 65.9-55.33 0-63.36-80.97-61.66-80.97-93.06 0-12.72 9.46-14.42 15.07-14.42 5.91 0 16.55 1.04 15.66 24.8" mask="url(#b)"/></svg>
            <figcaption>Design Systems</figcaption>
            <p>I have experience leading multiple enterprise design systems while working with tools like Style Dictionary to deliver design tokens and Storybook for component documentation and testing. I even created my own design system that is published on npm!</p>
          </figure>
        </div>
        <div class="card">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" width="128" height="128" viewBox="0 0 256 319" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path id="a" d="M9.87 293.32.01 30.57a16 16 0 0 1 15-16.57L238.49.03a16 16 0 0 1 17 15.98v286.3a16 16 0 0 1-16.71 16l-213.63-9.6a16 16 0 0 1-15.28-15.39"/></defs><mask id="b" fill="#fff"><use href="#a"/></mask><use fill="#ff4785" href="#a"/><path fill="#fff" d="m188.67 39.13 1.52-36.72L220.9 0l1.32 37.86a2.39 2.39 0 0 1-3.87 1.96l-11.83-9.32-14.02 10.63a2.39 2.39 0 0 1-3.83-2m-39.26 80.85c0 6.23 41.95 3.24 47.58-1.13 0-42.4-22.76-64.68-64.42-64.68s-65 22.62-65 56.56c0 59.12 79.78 60.25 79.78 92.5 0 9.05-4.44 14.42-14.19 14.42-12.7 0-17.73-6.49-17.14-28.55 0-4.78-48.45-6.28-49.93 0-3.76 53.47 29.55 68.9 67.66 68.9 36.94 0 65.9-19.69 65.9-55.33 0-63.36-80.97-61.66-80.97-93.06 0-12.72 9.46-14.42 15.07-14.42 5.91 0 16.55 1.04 15.66 24.8" mask="url(#b)"/></svg>
            <figcaption>Infrastructure</figcaption>
            <p>I work with Vercel and Hostinger most of the time to deploy apps and manage releases. I also use GitHub Actions for CI/CD pipelines.</p>
          </figure>
        </div>
      </div>
      <p>(Swipe or click and drag to navigate the cards.)</p>
    `;
  }
}
