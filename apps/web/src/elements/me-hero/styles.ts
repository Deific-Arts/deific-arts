import { css } from 'lit';

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    top: -6rem;
    width: 100%;
    min-height: 100vh;
  }

  :host::before {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgb(5 22 31 / 80%) 0%, rgb(5 22 31) 80%);
    z-index: 1;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2.5rem;
  }

  kemet-button {
    position: relative;
    z-index: 1;
  }

  me-loader {
    position: relative;
    z-index: 2;
  }

  kemet-icon-bootstrap {
    color: var(--color-primary);
  }

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    position: relative;
    z-index: 1;
    color: var(--color-primary);
    /* border: 1px solid var(--color-primary); */
    padding-top: 2px;
    border-radius: 50%;
  }

  .project {
    position: absolute;
    z-index: 1;
    font-size: 2.5rem;
  }

  .project span {
    font-size: clamp(1.75rem, 2.5vw, 2.5rem);
    line-height: 1.2;
    text-align: center;
    display: inline-flex;
    max-width: 300px;
  }
`;

export const stylesSlider = css`
  :host {
    display: block;
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }

  swiper-container {
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
