'use client';

import { useEffect } from 'react';

const SRC = 'https://app.storyproof.io/embed.js';

let reload: ReturnType<typeof setTimeout> | undefined;

/**
 * Adds a fresh copy of the embed script once all widgets of the page have mounted. The script
 * scans the page for [data-storyproof-widget] when it runs, so it must run again after moving
 * between pages in the app; with several widgets on one page it still runs only once.
 */
function loadEmbed() {
  clearTimeout(reload);
  reload = setTimeout(() => {
    document.querySelectorAll(`script[src="${SRC}"]`).forEach((s) => s.remove());
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    document.body.appendChild(script);
  }, 0);
}

/** StoryProof testimonial widget. */
export function StoryproofWidget({ widgetId }: { widgetId: string }) {
  useEffect(() => {
    loadEmbed();
  }, [widgetId]);

  return <div data-storyproof-widget={widgetId} />;
}
