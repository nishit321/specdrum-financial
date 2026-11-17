'use client';

import { useEffect, useRef } from 'react';

/** Thin reading-progress bar at the top of the page. Updates the style directly to avoid a render per scroll event. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <div className="sbf-progress" id="sbfProgress" aria-hidden="true" ref={ref} />;
}
