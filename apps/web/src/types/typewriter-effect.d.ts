declare module 'typewriter-effect/dist/core' {
  export interface TypewriterOptions {
    strings?: string | string[];
    autoStart?: boolean;
    loop?: boolean;
    deleteSpeed?: number;
    typeSpeed?: number;
    cursor?: string;
    delay?: number;
    pauseFor?: number;
    devMode?: boolean;
    wrapperClassName?: string;
    cursorClassName?: string;
    stringClassName?: string;
    [key: string]: any;
  }

  export default class Typewriter {
    constructor(element: HTMLElement, options?: TypewriterOptions);
    
    typeString(string: string): Typewriter;
    deleteAll(): Typewriter;
    deleteChars(count: number): Typewriter;
    pauseFor(ms: number): Typewriter;
    start(): Typewriter;
    stop(): Typewriter;
    reset(): Typewriter;
    
    // Event methods
    callFunction(callback: Function, ...args: any[]): Typewriter;
    
    // Chain methods
    typeCharacters(characters: string): Typewriter;
    deleteCharacters(count: number): Typewriter;
    
    // Control methods
    pause(): Typewriter;
    resume(): Typewriter;
  }
}
