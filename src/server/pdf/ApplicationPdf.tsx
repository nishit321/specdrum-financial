import path from 'node:path';
import { Document, Font, Image as PdfImage, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { ApplyFields } from '@/lib/forms/apply-schema';
import { SITE_DOMAIN } from '@/lib/seo';
import {
  AUTHORIZATION_TEXT,
  PERMISSION_TO_CONTACT_TEXT,
  businessRows,
  displayIp,
  formatInZone,
  ownerRows,
  type Row,
  type SubmissionMeta,
} from '../application';

// Signed funding application, laid out like the client's sample signed application
// (A4, indigo banner, info strip, three-column cards, signature block, contact footer).
// The sample holds a real customer's data, so it is not in the repository.

// Roboto, as in the sample, and it prints accented, Greek and Cyrillic names (the built-in
// Helvetica cannot). The file is copied into the standalone build by next.config.ts.
Font.register({ family: 'Roboto', src: path.join(process.cwd(), 'src/server/pdf/fonts/Roboto-Regular.ttf') });

// Never hyphenate: emails, tax IDs and names must stay whole. Only a token too long
// for any column is cut into pieces so it still wraps.
Font.registerHyphenationCallback((word) => (word.length <= 60 ? [word] : word.match(/.{1,40}/g) ?? [word]));

const INDIGO = '#5c6bc0';
const INK = '#212121';
const MUTED = '#424242';
const CARD = '#fafafa';

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 8.5, color: INK, paddingTop: 70, paddingBottom: 78, paddingHorizontal: 30 },
  banner: { position: 'absolute', top: 0, left: 0, right: 0, height: 34, backgroundColor: INDIGO, justifyContent: 'center' },
  bannerText: { color: '#ffffff', fontSize: 18, textAlign: 'center' },
  strip: {
    position: 'absolute',
    top: 34,
    left: 0,
    right: 0,
    height: 21,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  stripCell: { flex: 1, fontSize: 8.5 },
  card: {
    backgroundColor: CARD,
    borderWidth: 0.5,
    borderColor: '#e3e3e3',
    borderBottomWidth: 1.5,
    borderBottomColor: '#cfcfcf',
    borderRadius: 2,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 10.5, marginBottom: 10 },
  row: { flexDirection: 'row', paddingLeft: 6, marginBottom: 11 },
  cell: { paddingRight: 8 },
  label: { fontSize: 7, color: MUTED, marginBottom: 2.5 },
  value: { fontSize: 8.5 },
  paragraph: { fontSize: 8, lineHeight: 1.55, color: INK, marginBottom: 10 },
  signedBy: { fontSize: 10.5, marginBottom: 6 },
  signature: { height: 26, maxWidth: 150, objectFit: 'contain', objectPosition: 'left center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, borderTopWidth: 1, borderTopColor: '#9e9e9e', backgroundColor: '#f7f7f7', paddingTop: 9 },
  footerLine: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', fontSize: 10 },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 9 },
  footerIcon: { width: 9, height: 9, marginRight: 3 },
  footerSite: { textAlign: 'center', fontSize: 8, marginTop: 7, color: INK },
  footerLink: { color: '#4527a0' },
});

// Card columns match the sample: 50% / 25% / 25%. A shorter row lets its last value use
// the empty space (the sample's email runs into the third column). Signature block: thirds.
const COLUMNS: Record<number, readonly string[]> = { 1: ['100%'], 2: ['50%', '50%'], 3: ['50%', '25%', '25%'] };
const THIRDS = ['33.33%', '33.33%', '33.34%'] as const;

function Cells({ row }: { row: Row[] }) {
  const widths = COLUMNS[row.length];
  return (
    <View style={s.row} wrap={false}>
      {row.map((cell, i) => (
        <View key={cell.label} style={[s.cell, { width: widths[i] }]}>
          <Text style={s.label}>{cell.label}</Text>
          <Text style={s.value}>{cell.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={s.footerIcon}>
      <Path d={d} fill={INK} />
    </Svg>
  );
}

const ICON_PERSON = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z';
const ICON_PHONE =
  'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z';
const ICON_MAIL = 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z';

function Chrome({ dated }: { dated: string }) {
  return (
    <>
      <View style={s.banner} fixed>
        <Text style={s.bannerText}>Spectrum Financial</Text>
      </View>
      <View style={s.strip} fixed>
        <Text style={s.stripCell}>ISO Rep: Spectrum Financial</Text>
        <Text style={[s.stripCell, { textAlign: 'center' }]}>Funding Application</Text>
        <Text style={[s.stripCell, { textAlign: 'right' }]}>Dated: {dated}</Text>
      </View>
      <View style={s.footer} fixed>
        <View style={s.footerLine}>
          <View style={s.footerItem}>
            <Icon d={ICON_PERSON} />
            <Text>Spectrum Financial</Text>
          </View>
          <View style={s.footerItem}>
            <Icon d={ICON_PHONE} />
            <Text>(800) 214-7498</Text>
          </View>
          <View style={s.footerItem}>
            <Icon d={ICON_MAIL} />
            <Text>info@spectrumbusinessfinance.com</Text>
          </View>
        </View>
        <Text style={s.footerSite}>
          Submitted on <Text style={s.footerLink}>www.{SITE_DOMAIN}</Text>
        </Text>
      </View>
    </>
  );
}

function SignatureBlock({ fields, meta, signaturePng, signedAt }: { fields: ApplyFields; meta: SubmissionMeta; signaturePng: Buffer; signedAt: string }) {
  return (
    <View wrap={false}>
      <Text style={s.signedBy}>
        Application Signed by {fields.sign_name}, {fields.title}
      </Text>
      <View style={s.row}>
        <View style={[s.cell, { width: THIRDS[0] }]}>
          <Text style={s.label}>Signature</Text>
          <PdfImage style={s.signature} src={{ data: signaturePng, format: 'png' }} />
        </View>
        <View style={[s.cell, { width: THIRDS[1] }]}>
          <Text style={s.label}>IP Address / Device Info</Text>
          <Text style={s.value}>
            {displayIp(meta.ip)} / {meta.device}
          </Text>
        </View>
        <View style={[s.cell, { width: THIRDS[2] }]}>
          <Text style={s.label}>Sign Date/Timestamp</Text>
          <Text style={s.value}>{signedAt}</Text>
        </View>
      </View>
    </View>
  );
}

export type ApplicationPdfProps = { fields: ApplyFields; meta: SubmissionMeta; signaturePng: Buffer };

export function ApplicationPdf({ fields, meta, signaturePng }: ApplicationPdfProps) {
  const { day, dateTime } = formatInZone(meta.submittedAt, meta.timeZone);
  const signature = <SignatureBlock fields={fields} meta={meta} signaturePng={signaturePng} signedAt={dateTime} />;
  return (
    <Document
      title={`Funding Application - ${fields.biz_dba}`}
      author="Spectrum Financial"
      subject={`Funding application ${meta.reference}`}
      creator={SITE_DOMAIN}
      producer={SITE_DOMAIN}
    >
      <Page size="A4" style={s.page}>
        <Chrome dated={day} />
        <View style={s.card}>
          <Text style={s.cardTitle}>Applicant Business Information</Text>
          {businessRows(fields).map((row) => (
            <Cells key={row[0].label} row={row} />
          ))}
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Business Owner</Text>
          {ownerRows(fields).map((row) => (
            <Cells key={row[0].label} row={row} />
          ))}
        </View>
        <View style={s.card}>
          <Text style={s.paragraph}>{AUTHORIZATION_TEXT}</Text>
          {signature}
        </View>
      </Page>
      <Page size="A4" style={s.page}>
        <Chrome dated={day} />
        <View style={s.card}>
          <Text style={s.cardTitle}>Permission to Contact:</Text>
          <Text style={s.paragraph}>{PERMISSION_TO_CONTACT_TEXT}</Text>
          {signature}
        </View>
      </Page>
    </Document>
  );
}
