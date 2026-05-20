declare const Snap: any;
declare const mina: any;

interface SVGButtonOptions {
  speed?: {
    active?: number;
    reset?: number;
  };
  easing?: {
    active?: any;
    reset?: any;
  };
}

function extend(a: { [x: string]: any; }, b: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }) {
  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

export default class SVGButton {
  private el: HTMLElement;
  public options: SVGButtonOptions;
  private shapeEl!: HTMLElement;
  private pathEl: any;
  private paths!: {
    reset: string;
    active: string;
  };

  constructor(el: HTMLElement, options: SVGButtonOptions = {}) {
    this.el = el;
    this.options = extend({
      speed: { active: 300, reset: 300 },
      easing: { active: mina.outback, reset: mina.outback }
    }, options);
    this.init();
  }

  init() {
    const shapeEl = this.el.querySelector("span.morph-shape") as HTMLElement;
    if (!shapeEl) return;
    this.shapeEl = shapeEl;

    const svg = this.shapeEl.querySelector("svg");
    if (!svg) return;
    const s = (window as any).Snap(svg);
    this.pathEl = s.select("path");

    const activePath = this.shapeEl.getAttribute("data-morph-active");
    this.paths = {
      reset: this.pathEl.attr("d"),
      active: activePath || ''
    };

    this.initEvents();
  }

  initEvents() {
    this.el.addEventListener("mousedown", this.down.bind(this));
    this.el.addEventListener("touchstart", this.down.bind(this));

    this.el.addEventListener("mouseup", this.up.bind(this));
    this.el.addEventListener("touchend", this.up.bind(this));

    this.el.addEventListener("mouseout", this.up.bind(this));
  }

  down() {
    if (!this.pathEl || !this.paths.active) return;
    this.pathEl
      .stop()
      .animate(
        { path: this.paths.active },
        this.options.speed?.active || 300,
        this.options.easing?.active || mina.outback
      );
  }

  up() {
    if (!this.pathEl || !this.paths.reset) return;
    this.pathEl
      .stop()
      .animate(
        { path: this.paths.reset },
        this.options.speed?.reset || 300,
        this.options.easing?.reset || mina.outback
      );
  }
}
