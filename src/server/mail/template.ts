// HTML + plain-text email in the site's navy/gold look. Table layout and inline
// styles only, so it renders the same in Gmail, Outlook and phone mail apps.
// Every value from a form is escaped before it goes into the HTML.

export type EmailRow = { label: string; value: string; href?: string };
export type EmailSection = { title: string; rows: EmailRow[] };

export type EmailContent = {
  eyebrow: string; // "New funding application"
  heading: string; // "Stoney Creek Social Media is asking for $46,000"
  intro: string[]; // short paragraphs
  sections: EmailSection[];
  action?: string; // "Reply to this email to reach Dawn directly."
  footer: string[]; // reference, time, IP, source
};

const NAVY = '#0a1f3c';
const GOLD = '#c9a24a';
const INK = '#0e1b2e';
const BODY = '#4a5568';
const MUTED = '#7a8699';
const LINE = '#e3e8f0';
const SOFT = '#f5f7fb';
const FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Only tel:, mailto: and http(s): links make it into the email. */
function safeHref(href: string): string | null {
  return /^(tel:\+?[\d-]+|mailto:[^\s<>"']+|https?:\/\/[^\s<>"']+)$/i.test(href) ? href : null;
}

// Unicode line and paragraph separators count as line breaks, so they can't hide a fake row either
const LINE_BREAK = /\r\n|[\r\n\u0085\u2028\u2029]/g;

const multiline = (value: string) => escapeHtml(value).replace(LINE_BREAK, '<br>');

function rowHtml(row: EmailRow, shaded: boolean): string {
  const href = row.href ? safeHref(row.href) : null;
  const value = row.value.trim() === '' ? `<span style="color:${MUTED}">Not provided</span>` : multiline(row.value);
  const linked = href ? `<a href="${escapeHtml(href)}" style="color:${NAVY};text-decoration:underline">${value}</a>` : value;
  return `<tr>
<td style="padding:9px 14px;width:38%;vertical-align:top;font:600 13px/1.45 ${FONT};color:${MUTED};background:${shaded ? SOFT : '#ffffff'}">${escapeHtml(row.label)}</td>
<td style="padding:9px 14px;vertical-align:top;font:600 14px/1.45 ${FONT};color:${INK};background:${shaded ? SOFT : '#ffffff'};word-break:break-word">${linked}</td>
</tr>`;
}

function sectionHtml(section: EmailSection): string {
  return `<tr><td style="padding:22px 32px 0">
<div style="font:700 11px/1 ${FONT};letter-spacing:1.4px;text-transform:uppercase;color:${NAVY};padding-bottom:10px;border-bottom:2px solid ${GOLD};display:inline-block">${escapeHtml(section.title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;border:1px solid ${LINE};border-radius:8px">
${section.rows.map((r, i) => rowHtml(r, i % 2 === 1)).join('\n')}
</table>
</td></tr>`;
}

export function renderEmailHtml(c: EmailContent): string {
  const preheader = escapeHtml(c.intro[0] ?? c.heading);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(c.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f6">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${LINE}">
<tr><td style="background:${NAVY};padding:26px 32px 22px">
<div style="font:700 11px/1 ${FONT};letter-spacing:1.6px;text-transform:uppercase;color:${GOLD}">${escapeHtml(c.eyebrow)}</div>
<div style="font:600 24px/1.2 ${SERIF};color:#ffffff;margin-top:10px">Spectrum Financial</div>
</td></tr>
<tr><td style="height:4px;background:${GOLD};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 4px">
<h1 style="margin:0 0 12px;font:600 22px/1.3 ${SERIF};color:${INK}">${escapeHtml(c.heading)}</h1>
${c.intro.map((p) => `<p style="margin:0 0 10px;font:400 15px/1.6 ${FONT};color:${BODY}">${multiline(p)}</p>`).join('\n')}
</td></tr>
${c.sections.map(sectionHtml).join('\n')}
${c.action ? `<tr><td style="padding:24px 32px 0"><div style="background:#fbf6ea;border-left:4px solid ${GOLD};border-radius:6px;padding:14px 16px;font:600 14px/1.5 ${FONT};color:${INK}">${multiline(c.action)}</div></td></tr>` : ''}
<tr><td style="padding:26px 32px 28px">
<div style="border-top:1px solid ${LINE};padding-top:16px;font:400 12px/1.7 ${FONT};color:${MUTED}">${c.footer.map(multiline).join('<br>')}</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function renderEmailText(c: EmailContent): string {
  const lines: string[] = [c.heading, '', ...c.intro.flatMap((p) => [p, ''])];
  for (const section of c.sections) {
    lines.push(section.title.toUpperCase(), '-'.repeat(section.title.length));
    const width = Math.max(...section.rows.map((r) => r.label.length));
    const indent = ' '.repeat(width + 2);
    for (const r of section.rows) {
      // later lines of a multi-line value stay under the value, so they can't pass for new rows
      const value = (r.value.trim() || 'Not provided').split(LINE_BREAK).join(`\n${indent}`);
      lines.push(`${(r.label + ':').padEnd(width + 2)}${value}`);
    }
    lines.push('');
  }
  if (c.action) lines.push(c.action, '');
  lines.push('--', ...c.footer);
  return lines.join('\n');
}

/** Header values must stay on one line. */
export const oneLine = (value: string, max = 150) => value.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max);
