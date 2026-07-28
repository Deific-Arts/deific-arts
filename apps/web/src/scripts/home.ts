import Typewriter from 'typewriter-effect/dist/core';
import { deepLink } from "./navigation";

const isHomepage = !!document.querySelector('deific-home');
const scrollSnapContainer = document.querySelector('main') as HTMLElement;

scrollSnapContainer.addEventListener('scrollsnapchange', (event) => {
  const snappedChild = (event as any).snapTargetBlock;
  const view = snappedChild.tagName.toLowerCase().replace('deific-', '');

  window.history.replaceState(null, '', `/${view}/`);
  document.documentElement.dataset.page = view;
  document.querySelector('deific-background')?.setAttribute('section', view);

  if (view === 'about') {
    iBuild();
  }
});

const scrollToCurrent = () => {
  const { pathname } = window.location;
  const element = pathname.replace(/\//g, '');
  const target = document.querySelector(`deific-${element}`);
  target && target.scrollIntoView({ behavior: 'smooth' });
}

const iBuild = () => {
  const iBuild = document.querySelector('deific-builds') as HTMLElement;

  new Typewriter(iBuild, {
    strings: ['Websites', 'Apps', 'Experiences', 'And your vision!'],
    autoStart: true,
    loop: true,
    deleteSpeed: 50,
    typeSpeed: 50,
  });
}

const initApp = () => {
  // inViewElements();
  scrollToCurrent();
}

document.addEventListener('DOMContentLoaded', initApp);


document.querySelectorAll('footer nav a').forEach((link) => {
  if (isHomepage) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const slug = link.getAttribute('href') ?? '/';
      deepLink(event, slug);
    })
  }
})
