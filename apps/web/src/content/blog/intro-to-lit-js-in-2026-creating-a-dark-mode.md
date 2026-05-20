---
title: "Intro to Lit JS in 2026: Creating a dark mode"
date: 2026-02-07
author: Hasani Rogers
tags: 
- post
- lit
- web comonents
- dark mode
- theming
excerpt: The very first thing I blogged about was creating a dark mode in Lit. I wrote that blog six years ago. Here I revisit the topic with more modern updates for 2026. This is a beginner friendly blog. I’ll write more about advanced theming practices in a practical app later.
---

For this blog I’ll be covering a StackBlitz demo I put together. [You can find the demo here](https://stackblitz.com/edit/dark-mode-toggle-with-lit) and below.

<iframe src="https://stackblitz.com/edit/dark-mode-toggle-with-lit?ctl=1&embed=1&file=src%2Findex.css" style="aspect-ratio:16/9;"></iframe>

Once again there are two primary areas of concern when creating a dark mode in Lit.

1. Architecting the CSS
2. Creating a toggle Button

## Architecting the CSS

The most critical part of creating a dark mode in Lit actually has nothing to do with Lit or Web Components. The most critical part is setting up your CSS properly. We do this with CSS Custom Properties. What you want to do is create a kind of color pallet. You then reference this pallet in all your Web Components. Since CSS Custom Properties pierce the Shadow DOM, this is easy.

You create a color pallet by defining your CSS Properties in a `:root` selector. You then override this with another selector that symbolizes how to activate dark mode. There’s two ways I prefer to do this. You can either: 

1. Use a media query that prefers dark mode
2. Use an attribute like `[data-theme]` to determine this.

### Using the user's preference with a media query

Here’s a media query that allows you to prefer dark mode:

```css
@media (prefers-color-scheme: dark) { 
  :root { 
    --bg-color: #121212; 
    --text-color: #f0f0f0; 
    --accent-color: #3793ff; 
  } 
}
```

I’m mentioning this because a lot of the time you’ll want to do this instead of a manual toggle by the user on attribute. We want more control over when light/dark mode is toggled though. So this blog is gonna cover the manual toggle.

### Using an attribute

HTML5 has a cool API called the Dataset API. It allows you to use any attribute prefixed with `data-`. If you do, you’ll have access to a `.dataset` property on that element. From there, any data you pass with the attribute is available as a property of `dataset`. This is perfect for our theming needs. It means that we can place a `data-theme` on our `html` tag to always know which theme we’re in, light or dark. Since the `html` tag is a root level tag, this serves as a type of “master scope”. 

With that said, creating our pallet because a simple matter of overwriting our default CSS Custom Properties for the dark theme. Notice the following lines in my `index.css`:

```css
:root {
 --text: #16171d;
 --background: #f8f8f8;
 --border: #e5e4e7;
 --accent: #aa3bff;
 --accent-bg: rgba(170, 59, 255, 0.1);
 --accent-border: rgba(170, 59, 255, 0.5);
 --social-bg: rgba(244, 243, 236, 0.5);
 ...
}


[data-theme="dark"] {
 /* for the dark theme, we swap the text and background colors */
 --text: #f8f8f8;
 --background: #16171d;
}


html {
 color: var(--text);
 background-color: var(--background);
}
```


The most important thing to pay attention to is the `--text` and `–background` properties. When selecting our dark theme we swap them. In essence, that is all you need to do. While advance theming gets more complicated than this, I’ll cover that topic in another blog. Since we’re using attributes to toggle the theme, we can write a toggle component for this. Before we do though…

### Using a css file for your styles

<deific-callout>Notice that my css is in a `.css` file. This is not the standard. Since your css will create a <em>constructed style sheet</em>, the standard is to write css in your js. This is not like CSS in JS with JavaScript frameworks.</deific-callout>

If you want to use a css file in your Lit Element, you can do so by importing the css file with `?inline` appended to the path. So…

```typescript
import styles from './my-app.css?inline'
``` 

This should work in a Rollup based build tool like Vite. It tells it to import the file contents as a string rather than an ESModule. Once you have the string, you can use `unsafeCSS` to transform that string into a CSSResults type that Lit needs. Like so:

```typescript
static styles = [unsafeCSS(styles)];

```

Ignore the name “unsafeCSS”. It’s only named that because it’s warning you that you should always sanitize your css before using this. This assumes the css comes from an external source though. Our CSS is a file that we control so this is not necessary.

With that said, we’re now ready to take a look at how to toggle our `data-theme` attribute in a Lit Element. 
Creating a Toggle Button

Our toggle button is simple. We have one action, toggle the theme. If you [read my previous blog on using the DOM as a component model](https://deificarts.com/blog/embracing-the-platform-the-dom-as-your-component-model/) then you should know since we have one action we have one method. The method is going to be `.toggleMode()`. We’re going to call this when the button is clicked, so we also have one event.

In Lit we bind events by prefixing the event named with `@`. We can do this declaratively in our html. Also in Lit, we use the `render()` method to display UI. So our code to render a button with a click event looks like this:

```typescript
render() {
   return html`
     <button @click=${() => this.toggleTheme()}>
       <slot><slot>
     </button>
   `;
 }

```

<deific-callout>Discussing the `<slot>` element is out of scope for this discussion. I’ll write about this later. For now just know our text from the button will appear here.</deific-callout>

Actually toggling the theme is simple as well. With the dataset API we have a theme property in our dataset. Since light is the default theme, all we need to do is check for if the theme is set to dark. If it’s dark, toggle it to our default light theme. A cool thing about the Dataset API is that when we update it via JavaScript the html attribute “reflects” our changes. So when we toggle from light to dark, so does the attribute on the html. This  means that we get our styles as defined before appropriately.

That’s almost it! But check out this line of code:

```typescript
localStorage.setItem('demo-theme', newTheme);

```

It would be a shame if users had to manually click a button every time they wanted dark mode. With this line however, we leverage localStorage to remember their preference. That means that we need to read localStorage everytime the app loads. Checkout this in `my-app.ts`:

```typescript
firstUpdated() {
   const theme = localStorage.getItem('demo-theme');
   if (theme) document.documentElement.dataset.theme = theme;
 }

```


The method here is `firstUpdated`. This is a Lit Lifecycle Method. It fires when the element’s dom is ready. Inside it all we need to do is read localStorage for the theme. We then check for the theme and set the document element appropriately. 

I hope you enjoyed walking through creating a dark mode with Lit. If you’re coming from a React background I hope you can appreciate the simplicity of working with standard APIs in JavaScript. No need for context or providers or any of that jazz. I’d love feedback on the beginner friendly-ness of this blog so feel free to reach out to me about it on social media. You can [find all my socials on LinkTree](https://linktr.ee/deificarts).
