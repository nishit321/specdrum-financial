import { StoryproofWidget } from '@/components/StoryproofWidget';

// StoryProof review sections added in the final HTML design (2026-11-17).

/** "Reviews" widget at the end of every page, just before the footer. */
export function ReviewsSection({ variant }: { variant?: 'apply' }) {
  return (
    <section className={`sbf-section sbf-reviews${variant === 'apply' ? ' sbf-reviews--apply' : ''}`} id="reviews">
      <div className="container">
        <div className="sbf-testi-widget-card" data-sbf-reveal="">
          <StoryproofWidget widgetId="6afaae8531fe707090371314" />
        </div>
      </div>
    </section>
  );
}

/** "Quote spotlight" widget in the middle of the services, loan types and process pages. */
export function QuoteSpotlightSection() {
  return (
    <section className="sbf-spotlight" aria-label="Client review spotlight">
      <div className="container">
        <div className="sbf-spotlight-widget" data-sbf-reveal="">
          <StoryproofWidget widgetId="6afac29131fe707090371333" />
        </div>
      </div>
    </section>
  );
}
