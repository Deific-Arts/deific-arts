import Typewriter from 'typewriter-effect/dist/core';
import { isElementInView } from "./intersection";
import { deepLink } from "./navigation";

const isHomepage = window.location.pathname === '/';

const inViewElements = () => {
  const deificHome = document.querySelector('deific-home') as HTMLElement;
  const deificAbout = document.querySelector('deific-about') as HTMLElement;
  const deificServices = document.querySelector('deific-services') as HTMLElement;
  const deificWork = document.querySelector('deific-work') as HTMLElement;
  const deificGetStarted = document.querySelector('deific-consultation') as HTMLElement;
  const deificContact = document.querySelector('deific-contact') as HTMLElement;
  const deificBlog = document.querySelector('deific-blog') as HTMLElement;

  deificHome && isElementInView(deificHome, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/');
    }
  }, { threshold: .75 });

  deificAbout && isElementInView(deificAbout, (inView) => {
    if (inView) {
      iBuild();
      window.history.replaceState(null, '', '/about/');
    }
  }, { threshold: .75 });

  deificServices && isElementInView(deificServices, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/services/');
    }
  }, { threshold: .75 });

  deificWork && isElementInView(deificWork, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/work/');
    }
  }, { threshold: .75 });

  deificGetStarted && isElementInView(deificGetStarted, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/consultation/');
    }
  }, { threshold: .75 });

  deificContact && isElementInView(deificContact, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/contact/');
    }
  }, { threshold: .75 });

  deificBlog && isElementInView(deificBlog, (inView) => {
    if (inView) {
      window.history.replaceState(null, '', '/blog/');
    }
  }, { threshold: .75 });
}

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
  inViewElements();
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
