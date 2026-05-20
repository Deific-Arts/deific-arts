---
title: "Lit is better than React: Signals in Lit"
date: 2026-02-19
tags:
  - post
  - lit
  - singals
  - state management
  - web components
author: Hasani Rogers
excerpt: I once asked Gemini about the performance between React and Lit. It led me down a path to enlightenment.
banner: /posts/lit-is-better-than-react-signals-in-lit/banner.png
---

I once asked Gemini about the performance between React and Lit. It led me down a path to enlightenment. Here’s what it told me:

| React                                      | Lit                                                     |
|--------------------------------------------|:--------------------------------------------------------|
| Generally slower (must build the VDOM)     | Very fast (native browser templates)                    |
| Higher (stores two copies of the DOM tree) | Extremely low (no tree copies needed)                   |
| ~30KB+ (requires the React runtime)        | ~5KB (uses native browser APIs)                         |
| Complexapps with assive state trees        | Design system, micro-frontends, performance-critical UI |


> Lit is generally faster in raw benchmarks because it avoids the "diffing tax." It doesn't have to spend CPU cycles comparing two large JavaScript objects to find out what changed. React excels at developer ergonomics.

The gist of this is that while Lit performs better than React, React is familiar to devs and has a large ecosystem. That’s why it’s more popular. Gemini is not hallucinating here either. I asked Gemini to simplify data from [Krausest Benchmark](https://krausest.github.io/js-framework-benchmark/current.html) where you can verify its findings. Lit was the clear winner.

| Category                                   | Lit          | React (v19+)         | Winner                |
|--------------------------------------------|--------------|----------------------|-----------------------|
| Duration (Weighted Mean)                   | ~1.05 – 1.15 | ~1.6 – 1.8           | Lit                   |
| Startup / Boot Time                        | Fastest      | Moderate             | Lit                   |
| Swap 2 Rows                                | Excellent    | Slow (VDOM Overhead) | Lit                   |
| Memory usage                               | Minimal      | High (~10MB+)        | Lit                   |

Funny enough my personal preference for Lit has more to do with me wanting to remain as close to web standards as possible. The benefit of that is performance because what utilizes the platform will always win. At the same time though vanilla Web Components are cumbersome to write in my opinion. Hardly any one who writes web components does it vanilla. Lit is a leader here so I stuck with it.

If you’re new to Lit you can check out my beginner level video on YouTube that shows you how to create a dark mode in it.

<iframe width="1216" height="684" src="https://www.youtube.com/embed/5RTU19mIbyI?si=XfKmy_8JsfGLlRq3" title="Intro to Lit JS in 2026: Creating a dark mode" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="width:100%; aspect-ratio: 16/9;"></iframe>

Moving on.

# The VDOM Paradigm is on its way out
React relies on a VDOM and the VDOM is slow compared to the platform. That’s why Lit scores so well. But outside of that, the VDOM gets in the way in other cases as well. Mostly it gets in the way of the mental model many developers have about the code they write. The VDOM has 3 main reasons why it’s a problem that even React acknowledges:

1. Re-rendering
2. Bundle Size Bloat
3. Memory Usage

React deals with the entire dom tree, virtualizes it, does a diff then renders components that change. Bad React code can easily slow down an app fast as this process creates a lot of rendering overhead. Anyone who’s spent a good time with React professionally knows re-renders can become a pain. On top of that, React has to download the entire diff engine just to render one button. And this download is not cheap. It can be 30KB+. That's a considerable size bloat. Finally the VDOM keeps a copy of your UI in memory at all times, leading to considerable memory usage for larger applications.

React’s way of trying to solve these problems is the React compiler. But in my opinion that’s more like a band-aid because it still relies on the VDOM. The real solution is to avoid using the VDOM all together. It was good for its time but the web has evolved.


## Enter Signals

Signals is the new kid on the block and is the real solution for these issues. A signal is a kind of graph that creates a direct link between a piece of data and piece of text on the screen. When the data changes so does the UI and without all the VDOM overhead. Many JavaScript libraries are beginning to adopt Signals or are entirely based on it, like SolidJS.

I’ll admit, when I first heard of SolidJS I went “oh great, yet another JavaScript library.” I never built anything in it but I did test integrating Web Components for some design systems with it. My experience was good. Later on I found out that you can actually create Web Components in SolidJS. This got my attention. I became more curious about Signals, something SolidJS implements, because of this. Turns out Signals are legit, so much so that there is [a proposal to make Signals standard JavaScript](https://github.com/tc39/proposal-signals).

So I definitely have an eye on SolidJS and I’ll be exploring it more in the future. 


## Whaaat, Signals in Lit?!

Did you know that you can use a signal in Lit now? That’s right, we can thank Lit Labs for this. Lit Labs is a collection of experimental tech that works with Lit. It’s experimental now, so you probably want to avoid using this to build a production app. But as the proposal for signals becomes standard expect this to grow with it.

Let's take a look at some code. 

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { signal, watch, SignalWatcher } from '@lit-labs/signals';

// definte a variable as a signal outside your class
const count = signal(0);

@customElement('my-element')
export class MyElement extends SignalWatcher(LitElement) { // use the SignalWatcher mixin
  render() {
    // use the watch function to subscribe to updates
    return html`
      <button class="counter" @click=${this._onClick} part="button">
        Count is ${watch(count)} 
      </button>
    `
  }

  private _onClick() {
    // use the set method to update the signal
    count.set(count.get() + 1)
  }
}
```

[I recreated the count functionality on Stackblitz with signals](https://stackblitz.com/edit/signals-in-lit?file=src%2Fmy-element.ts). All you really need to do is use the Mixin to construct your element. Then instead of using a property decorator, use the signal function to create a const that you’ll get and set later. That’s it. Lit plays well with Signals. Checkout the [@lit-labs/signals package docs](https://www.npmjs.com/package/@lit-labs/signals) for more details.

I’m excited to see what may come of the Signals proposals and how this may evolve with it. Right now though if you are building microfrontends, design systems, or content driven apps with an Island Architecture, then going with Lit over React is a no brainer.  
