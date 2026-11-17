'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** false in the server-rendered HTML and until React has taken over the page, then true. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
