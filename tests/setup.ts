import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// jsdom lacks a few browser APIs the components call.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
  Element.prototype.scrollIntoView ??= function scrollIntoView() {};
  window.scrollTo = () => {};

  // Testing Library only cleans up on its own when test globals are enabled.
  const { cleanup } = await import('@testing-library/react');
  afterEach(cleanup);
}
