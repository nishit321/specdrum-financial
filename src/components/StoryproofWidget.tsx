'use client';

import { useEffect } from 'react';

const SRC = 'https://app.storyproof.io/embed.js';

/**
 * StoryProof testimonial widget. The embed script scans the page for
 * [data-storyproof-widget] when it runs, so it is re-added on every mount:
 * moving between pages in the app would otherwise leave the new widget empty.
 */
export function StoryproofWidget({ widgetId }: { widgetId: string }) {
  useEffect(() => {
    document.querySelectorAll(`script[src="${SRC}"]`).forEach((s) => s.remove());
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    document.body.appendChild(script);
  }, [widgetId]);

  return <div data-storyproof-widget={widgetId} />;
}
