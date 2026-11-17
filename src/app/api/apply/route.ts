import { handleApply } from '@/server/handlers/apply';

// "Submit Application" on /apply-now: signed PDF + bank statements emailed to the owner.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// PDF rendering and an SMTP upload of several statements can take a while.
export const maxDuration = 60;

export function POST(request: Request) {
  return handleApply(request);
}
