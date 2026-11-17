'use client';

import { useSyncExternalStore } from 'react';

const BUILD_YEAR = new Date().getFullYear();
const noop = () => () => {};

/** The visitor's current year; the build year is used for the server-rendered HTML. */
export function CurrentYear() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => BUILD_YEAR);
  return <span id="sbfYear">{year}</span>;
}
