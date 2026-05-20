export interface Project {
  slug: string;
  heading: string;
  description: string;
  image: string;
  skills: string[];
  link?: string;
}

export const projects = [
  {
    slug: "blueparadox",
    heading: "Blue Paradox",
    description: "Blue Paradox is an site for raising awareness over plastic manufacturing pollution.",
    image: "/projects/blueparadox.webp",
    skills: [
        "next",
        "react",
        "zustand",
        "typescript",
        "tailwind",
        "bem",
        "scss",
        "vercel",
        "swiperjs",
        "storybook"
    ],
    link: "https://blueparadox.com"
  },
  {
    slug: "anibookquotes",
    heading: "Ani Book Quotes",
    description: "Ani Book Quotes is an app built for book lovers.",
    image: "/projects/anibookquotes.webp",
    skills: [
      "vite",
      "lit",
      "web components",
      "typescript",
      "scss",
      "supabase",
      "headless cms",
      "stripe api",
      "astro.js",
      "zustand"
    ],
    link: "https://anibookquotes.com",
    github: "https://github.com/hasanirogers/ani-pwa"
  },
  {
    slug: "checkout",
    heading: "Ford Checkout",
    description: "An e-commerce site for Ford in the UK.",
    image: "/projects/checkout.webp",
    skills: [
      "aem",
      "typescript",
      "react",
      "redux",
      "rest",
      "scss",
      "storybook"
    ],
    link: "https://ford.co.uk"
  },
  {
    slug: "bobcards",
    heading: "Bob Cards",
    description: "A passion project that is an app for Black Owned Businesses",
    image: "/projects/bobcards.webp",
    skills: [
      "wordpress",
      "headless wordpress",
      "lit",
      "vite",
      "scss",
      "web components",
      "zustand",
      "typescript"
    ],
    link: "https://bobcards.app",
    github: "https://github.com/Deific-Arts/bob-cards-ui"
  },
  {
    slug: "corporate",
    heading: "Ford Corporate",
    description: "The corporate website for Ford",
    image: "/projects/corporate.webp",
    skills: [
      "aem",
      "react",
      "typescript",
      "scss",
      "webpack",
      "storybook"
    ],
    link: "https://corporate.ford.com"
  },
  {
      slug: "fds",
      heading: "Ford Design System",
      description: "A web component driven design system for Ford",
      image: "/projects/fds.webp",
      skills: [
        "storybook",
        "lit",
        "web components",
        "react",
        "typescript",
        "scss",
        "design systems",
        "angular",
        "wcag",
        "jest",
        "vue",
        "aem"
      ]
  },
  {
    slug: "doctoratmydoor",
    heading: "Doctor At My Door",
    description: "A site about traveling medical professional services.",
    image: "/projects/doctoratmydoor.webp",
    skills: [
      "wordpress",
      "lit",
      "web components",
      "scss",
      "typescript",
      "lamp",
      "php",
      "wp engine"
    ],
    link: "https://doctoratmydoor.com"
  },
  {
    slug: "gardenscare",
    heading: "Gardens Care",
    description: "A site for senior care.",
    image: "/projects/gardenscare.webp",
    skills: [
      "wordpress",
      "lit",
      "typescript",
      "lamp",
      "php",
      "scss",
      "web components",
      "crm integration",
      "wp engine"
    ],
    link: "https://gardenscare.com"
  },
  {
    slug: "gxp",
    heading: "GXP Custom UI",
    description: "A scheduling app for Ford",
    image: "/projects/gxp.webp",
    skills: [
      "react",
      "typescript",
      "context api",
      "scss",
      "bem",
      "jest",
      "vite",
      "rest",
      "axios",
      "zod",
      "wcag"
    ],
    link: "https://www.avisford.com/service-appointment.aspx"
  },
  {
    slug: "ippm",
    heading: "Interactive Posts",
    description: "IPPM is a plugin for WordPress that brings package management to posts.",
    image: "/projects/ippm.webp",
    skills: [
      "react",
      "typescript",
      "wordpress",
      "gutenberg",
      "lit",
      "php",
      "web components"
    ],
    link: "https://ippm.deificarts.com",
    github: "https://github.com/Deific-Arts/plugin-ippm"
  },
  {
    slug: "kemet",
    heading: "Kemet UI",
    description: "Kemet UI is a design system that I maintained written in Lit with Web Components.",
    image: "/projects/kemet.webp",
    skills: [
      "design systems",
      "typescript",
      "lit",
      "rollup",
      "scss",
      "storybook",
      "wcag",
      "vite test",
      "vite"
    ],
    link: "https://kemet.dev",
    github: "https://github.com/hasanirogers/kemet-ui"
  },
  {
      slug: "tmobile",
      heading: "T-Mobile Aperion",
      description: "Aperion is T-mobiles internal design system.",
      image: "/projects/tmobile.webp",
      skills: [
        "design systems",
        "typescript",
        "lit",
        "rollup",
        "scss",
        "storybook",
        "wcag",
        "react",
        "webpack",
        "jest"
      ]
  }
]
