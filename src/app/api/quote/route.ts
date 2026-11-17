import { handleQuote } from '@/server/handlers/quote';

// Both quote forms post here: "Send My Quote Request" (/quote-request) and
// "Get My Free Quote" (home page). One email to the owner per submission.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return handleQuote(request);
}
