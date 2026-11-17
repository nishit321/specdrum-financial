// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryproofWidget } from '@/components/StoryproofWidget';

const SRC = 'https://app.storyproof.io/embed.js';
const tick = () => new Promise((r) => setTimeout(r, 10));

afterEach(() => {
  document.querySelectorAll(`script[src="${SRC}"]`).forEach((s) => s.remove());
  vi.restoreAllMocks();
});

const scriptsAdded = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.filter(([node]) => node instanceof HTMLScriptElement && node.src === SRC).length;

describe('StoryProof embed script', () => {
  it('loads once for a page with several widgets (the final HTML has up to three per page)', async () => {
    const append = vi.spyOn(document.body, 'appendChild');
    render(
      <>
        <StoryproofWidget widgetId="6af49fb191f9b7a0112848fe" />
        <StoryproofWidget widgetId="6afab4c431fe707090371321" />
        <StoryproofWidget widgetId="6afaae8531fe707090371314" />
      </>,
    );
    await tick();
    expect(scriptsAdded(append)).toBe(1);
    expect(document.querySelectorAll(`script[src="${SRC}"]`)).toHaveLength(1);
    expect(document.querySelectorAll('[data-storyproof-widget]')).toHaveLength(3);
  });

  it('runs again after moving to another page, so the new widgets fill in', async () => {
    const append = vi.spyOn(document.body, 'appendChild');
    const first = render(<StoryproofWidget widgetId="6afaae8531fe707090371314" />);
    await tick();
    first.unmount();
    render(<StoryproofWidget widgetId="6afac29131fe707090371333" />);
    await tick();
    expect(scriptsAdded(append)).toBe(2);
    expect(document.querySelectorAll(`script[src="${SRC}"]`)).toHaveLength(1); // the old copy is replaced
  });
});
