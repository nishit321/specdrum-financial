// Local SMTP server for development and end-to-end tests. Every email the site
// sends is saved to a folder instead of being delivered, so nothing leaves the machine.
//
//   node scripts/mail-sink.mjs [port] [folder]
//   default: port 2525, folder tests/.output/mail
//
// Then run the site with SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_SECURE=false.

import fs from 'node:fs';
import path from 'node:path';
import { simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';

const port = Number(process.argv[2] ?? 2525);
const dir = path.resolve(process.argv[3] ?? 'tests/.output/mail');
fs.mkdirSync(dir, { recursive: true });
let count = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).length;

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  logger: false,
  size: 60 * 1024 * 1024,
  onData(stream, session, callback) {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', async () => {
      try {
        const raw = Buffer.concat(chunks);
        const mail = await simpleParser(raw);
        const id = String(++count).padStart(3, '0');
        fs.writeFileSync(path.join(dir, `${id}.eml`), raw);
        const attachments = mail.attachments.map((a, i) => {
          const file = `${id}-att${i + 1}-${(a.filename ?? 'file').replace(/[^\w.-]+/g, '_')}`;
          fs.writeFileSync(path.join(dir, file), a.content);
          return { filename: a.filename, contentType: a.contentType, size: a.size, file };
        });
        if (mail.html) fs.writeFileSync(path.join(dir, `${id}.html`), mail.html);
        fs.writeFileSync(
          path.join(dir, `${id}.json`),
          JSON.stringify(
            {
              id,
              envelope: { from: session.envelope.mailFrom?.address, to: session.envelope.rcptTo.map((r) => r.address) },
              from: mail.from?.text,
              to: mail.to?.text,
              replyTo: mail.replyTo?.text,
              subject: mail.subject,
              text: mail.text,
              attachments,
            },
            null,
            2,
          ),
        );
        console.log(`mail ${id}: ${mail.subject} (${attachments.length} attachments)`);
        callback();
      } catch (err) {
        callback(err);
      }
    });
  },
});

server.listen(port, '127.0.0.1', () => console.log(`mail sink listening on 127.0.0.1:${port}, saving to ${dir}`));
const stop = () => server.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
