# Spectrum Financial website (Next.js)

The Spectrum Financial marketing site (spectrumbusinessloans.com), converted from static HTML (kept for reference in
`legacy-html/`) to Next.js. Pages, styles and images are the same; the forms now send email.

| Form | Where | What happens on submit |
| --- | --- | --- |
| Apply Now (4 steps) | `/apply-now` | Email to the owner with a signed **PDF application** (laid out like the client's sample signed application, which holds real customer data and is kept out of the repository) and the uploaded bank statements attached |
| Send My Quote Request | `/quote-request` | Email to the owner with every field |
| Get My Free Quote | home page | Email to the owner with every field |

There is no database. Email is sent by the Next.js server (`src/app/api/*`), because SMTP
credentials cannot be put in the browser.

## Requirements

- Node.js **22 or 24 LTS** (Next.js needs 20.9+; the test tools need 22.12+)
- An SMTP account (Amazon SES, Microsoft 365, Google Workspace, your host's mail server, …)

## Setup

```bash
npm ci
cp .env.example .env.local   # then fill in the SMTP settings
npm run dev                  # http://localhost:3000
```

### Settings (`.env.local` locally, environment variables on AWS)

| Variable | Required | Meaning |
| --- | --- | --- |
| `SMTP_HOST`, `SMTP_PORT` | yes | Mail server. Port 587 = STARTTLS, 465 = TLS |
| `SMTP_SECURE` | no | `true` for port 465. Defaults to `true` only when the port is 465 |
| `SMTP_REQUIRE_TLS` | no | On by default: mail is never sent over an unencrypted connection (it carries the full SSN). Only a local test mail server needs `false` |
| `SMTP_USER`, `SMTP_PASS` | usually | Login for the mail server |
| `MAIL_FROM` | yes | Sender, e.g. `"Spectrum Financial Website <no-reply@spectrumbusinessfinance.com>"`. Use an address on a domain the SMTP provider has verified |
| `MAIL_TO` | yes | Owner address(es) that receive the forms. Comma separated for several. Production: `david@spectrumbusinessfinance.com` (client meeting, 2026-11-14) |
| `APP_TIMEZONE` | no | Time zone for the PDF's dates. Default `America/Los_Angeles` |
| `TRUSTED_PROXY_HOPS` | no | Proxies in front of the app that append to `X-Forwarded-For`: `1` = ALB or nginx (default), `2` = CloudFront + ALB. Used for the signer IP on the PDF and for rate limiting. Set it to the real number: too low and every visitor behind one CloudFront edge shares a rate limit; with no proxy at all the IP shows as "not available" |
| `ALLOWED_ORIGINS` | behind CloudFront | The forms only accept posts whose `Origin` matches the `Host` the app receives. Behind CloudFront the app usually sees the ALB host name, so either forward the `Host` header in the CloudFront origin request policy or list the public origins here (`https://spectrumbusinessloans.com,https://www.spectrumbusinessloans.com`). Refusals are logged as `*.forbidden_origin` |
| `NEXT_PUBLIC_UPLOAD_MAX_TOTAL_MB` | no | Total size of bank statements on step 4. Default 15. **Build-time** value: baked in by `next build`, changing it on a running server does nothing |

If the SMTP settings are missing, the forms show "we couldn't send this, call us" and the server
logs `*.not_configured` with the name of the missing variable.

### Trying the forms without a real mail server

```bash
node scripts/mail-sink.mjs 2525 tests/.output/mail     # saves every email + attachments to that folder
# .env.local: SMTP_HOST=127.0.0.1  SMTP_PORT=2525  SMTP_SECURE=false  SMTP_REQUIRE_TLS=false  MAIL_FROM=...  MAIL_TO=owner@example.com
npm run dev
```

## Deploying to AWS

`next build` produces a self-contained Node server in `.next/standalone` (`output: 'standalone'`).

**EC2 / ECS / Elastic Beanstalk / Lightsail**

```bash
npm ci && npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
# run with the environment variables above:
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

Put it behind an ALB (or nginx) with HTTPS. If nginx is in front, raise `client_max_body_size`
to at least the upload limit + 2 MB (nginx's default of 1 MB would block bank statements).
Raise the ALB idle timeout to 120 s: an application with 15 MB of statements on a slow phone
connection, plus the SMTP upload, can take longer than the default 60 s.

**Amplify Hosting**: works as a Next.js SSR app. Amplify runs the server on Lambda, which caps a
request at about 6 MB, so set `NEXT_PUBLIC_UPLOAD_MAX_TOTAL_MB=4`. Amplify only passes environment
variables to the server if the build writes them out, e.g. in `amplify.yml`:
`env | grep -E '^(SMTP_|MAIL_|APP_TIMEZONE|TRUSTED_PROXY_HOPS|ALLOWED_ORIGINS)' >> .env.production`.

Mail size: attachments grow by about a third when emailed. With the default 15 MB of statements a
message can reach ~21 MB; check your SMTP provider's limit (Gmail/Workspace 25 MB, Microsoft 365
up to 35 MB, Amazon SES 40 MB).

Old `.html` addresses (e.g. `/apply-now.html`) redirect permanently to the new ones (`/apply-now`).

Uploads: with nginx in front, keep `proxy_request_buffering on` (the default). nginx then receives
slow uploads itself and hands the app a complete body, so slow or dripping connections never hold
the app's upload slots. An ALB alone does not buffer request bodies.

**After every deploy**, check that the forms are not refused by the same-origin check (a refusal is
a 403; a 400 with `"error":"validation"` means the request got through):

```bash
curl -s -X POST https://spectrumbusinessloans.com/api/quote -H 'Origin: https://spectrumbusinessloans.com' \
  -H 'Content-Type: application/json' -d '{"form":"home-quote","idempotencyKey":"deploy-check-0000000000","data":{}}'
```

Run it for `https://www.spectrumbusinessloans.com` too. If either answers 403, forward the `Host`
header from CloudFront or add both origins to `ALLOWED_ORIGINS`.

**Rolling back**: pages and API ship together in one build, so roll back the whole build, then
invalidate the CloudFront cache (`/*`). Otherwise visitors can keep cached new pages that send
choices the old server does not know (e.g. the financing type "Line of Credit").

## How the forms protect data

- Every value is checked again on the server (`src/lib/forms/*-schema.ts`, shared with the browser).
- The email body never shows the full SSN, the date of birth, or a tax ID that is the owner's SSN;
  those are only in the attached PDF.
- Uploads are checked by their content (PDF/PNG/JPEG), not their name; size and count are limited.
- Posts from other websites are refused; a hidden "honeypot" field drops bot submissions.
- Each visitor (IPv4 address or IPv6 /64) gets 5 applications / 8 quote requests per 10 minutes, and
  all visitors together 30 applications / 60 quote requests per 10 minutes. At most 4 applications
  are processed at the same moment; the rest are asked to retry.
- A double click or a retry sends the owner one email, not two (idempotency key per form fill; a
  new key as soon as anything is edited).
- The signature must be a small, plain PNG whose pixel data matches its header, so a crafted image
  cannot exhaust the server's memory.
- Logs record events, references, client IPs and mail-server error text, never form contents
  (names, emails, SSNs).
- API responses are `Cache-Control: no-store`.

**Only let the proxy reach the app.** The client IP is read from `X-Forwarded-For`, which a visitor
can fake if they can talk to the ALB (or the server) directly instead of through CloudFront. Lock the
ALB security group to the CloudFront managed prefix list (or check a secret origin header), and use
AWS WAF rate-based rules as the first line against floods; the app's own limits are the second line.

**No database means these limits and the double-submit protection live in each server process.**
With several instances (ECS tasks, Amplify/Lambda) each one counts separately, and a retry that
lands on a different instance is not recognised as a duplicate. For one EC2 instance or one ECS
task this does not matter. Not covered (open points): a CAPTCHA (e.g. Cloudflare Turnstile) to stop
a determined spammer using many IPs, and virus scanning of uploaded statements.

## Branches and CI

- `main` is production: what is deployed. `develop` collects finished work.
- Work happens on a feature branch, merged into `develop` through a pull request. A release
  merges `develop` into `main`, also through a pull request.
- GitHub Actions (`.github/workflows/ci.yml`) runs lint, type-check, the vitest suites and the
  build on every pull request into `develop` or `main`. Merge only when every check is green.
- The browser tests below run locally: their screenshot baselines exist for Windows only.

## Tests

```bash
npm run test        # unit, API (with a local SMTP sink) and component tests — vitest
npm run typecheck
npm run lint
```

End-to-end tests run in the installed Google Chrome against a running site:

```bash
node scripts/mail-sink.mjs 2525 tests/.output/mail
npm run build && SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_SECURE=false SMTP_REQUIRE_TLS=false MAIL_FROM=site@test.local MAIL_TO=owner@test.local PORT=3100 npm start
python -m http.server 8090 --directory legacy-html          # only for the visual parity test
# (set SMTP_REQUIRE_TLS=false for the local mail sink, which has no TLS)
npx playwright test                                         # E2E_BASE_URL / LEGACY_BASE_URL / MAIL_SINK_DIR to override
```

`tests/e2e/parity.spec.ts` screenshots every page on the old static site and on the Next.js site
and compares them pixel by pixel.

## Project layout

```
src/app/                 pages (one folder per URL), layout, sitemap, robots, api/apply, api/quote
src/components/layout/   header + mobile menu, footer, icon sprite, page effects from the old javascript.js
src/components/apply/    Apply Now steps, signature pad, file drop zone
src/components/forms/    quote forms and the home page eligibility check
src/components/ui/       themed Select, Combobox, Slider, Checkbox (replace the browser's own controls)
src/lib/forms/           option lists, input masks, validation schemas (browser + server)
src/server/              request checks, rate limit, PDF (react-pdf), email (nodemailer) and the API handlers
src/styles/              original Bootstrap + site CSS, plus controls.css for the themed controls
legacy-html/             the original static site, unchanged
```
