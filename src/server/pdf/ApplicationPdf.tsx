import fs from 'node:fs';
import path from 'node:path';
import { Document, Font, Image as PdfImage, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { ApplyFields } from '@/lib/forms/apply-schema';
import type { CalculatorChoice } from '@/lib/loan-calculator';
import { SITE_DOMAIN } from '@/lib/seo';
import {
  AUTHORIZATION_TEXT,
  PERMISSION_TO_CONTACT_TEXT,
  businessRows,
  calculatorRows,
  displayIp,
  formatInZone,
  ownerRows,
  type Row,
  type SubmissionMeta,
} from '../application';

// Signed funding application in the site's look (navy and gold, as the website and the owner
// email), with the same content and order as the client's sample signed application, which
// lenders know: business information, business owner, authorization and signature; then the
// permission to contact. The sample holds a real customer's data, so it is not in the repository.

// Roboto prints accented, Greek and Cyrillic names (the built-in fonts cannot), so everything a
// person typed is set in Roboto. Fixed English headings use the PDF's built-in bold fonts.
// The font file is copied into the standalone build by next.config.ts.
Font.register({ family: 'Roboto', src: path.join(process.cwd(), 'src/server/pdf/fonts/Roboto-Regular.ttf') });

// Never hyphenate: emails, tax IDs and names must stay whole. Only a token too long
// for any column is cut into pieces so it still wraps.
Font.registerHyphenationCallback((word) => (word.length <= 60 ? [word] : word.match(/.{1,40}/g) ?? [word]));

// The white logo from the site. Without it (a deploy that left out public/), the header shows
// the name instead: a missing image must never stop an application from going out.
const LOGO = (() => {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'public/img/logo-white.png'));
  } catch {
    return null;
  }
})();

const NAVY = '#0a1f3c';
const NAVY_DEEP = '#061529';
const GOLD = '#c9a24a';
const GOLD_SOFT = '#fbf6ea';
const INK = '#0e1b2e';
const MUTED = '#5b6676';
const LINE = '#e3e8f0';
const SOFT = '#f5f7fb';

const HEADER_H = 60;
const STRIP_H = 22;
const FOOTER_H = 46;

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 8.5, color: INK, paddingTop: HEADER_H + STRIP_H + 22, paddingBottom: FOOTER_H + 20, paddingHorizontal: 32 },

  header: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_H, backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32 },
  logo: { height: 30, width: 88, objectFit: 'contain' },
  brand: { fontFamily: 'Times-Bold', fontSize: 18, color: '#ffffff' },
  headerRight: { alignItems: 'flex-end' },
  eyebrow: { fontFamily: 'Helvetica-Bold', fontSize: 7, letterSpacing: 1.6, color: GOLD, marginBottom: 3 },
  headerTitle: { fontFamily: 'Times-Bold', fontSize: 15, color: '#ffffff' },
  goldRule: { position: 'absolute', top: HEADER_H, left: 0, right: 0, height: 3, backgroundColor: GOLD },
  strip: {
    position: 'absolute',
    top: HEADER_H + 3,
    left: 0,
    right: 0,
    height: STRIP_H,
    backgroundColor: SOFT,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stripCell: { flex: 1, fontSize: 8, color: MUTED },

  card: { backgroundColor: '#ffffff', borderWidth: 0.75, borderColor: LINE, borderRadius: 6, paddingTop: 13, paddingBottom: 4, paddingHorizontal: 14, marginBottom: 14 },
  cardHead: { marginBottom: 11 },
  cardTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: NAVY },
  cardBar: { width: 26, height: 2, backgroundColor: GOLD, marginTop: 4 },
  row: { flexDirection: 'row', marginBottom: 9 },
  cell: { paddingRight: 8 },
  label: { fontFamily: 'Helvetica', fontSize: 6.8, color: MUTED, marginBottom: 2.5 },
  value: { fontSize: 9, color: INK },
  paragraph: { fontSize: 7.8, lineHeight: 1.55, color: INK, marginBottom: 10 },

  signCard: { backgroundColor: GOLD_SOFT, borderLeftWidth: 3, borderLeftColor: GOLD, borderRadius: 4, paddingTop: 10, paddingBottom: 2, paddingHorizontal: 12, marginBottom: 8 },
  signedBy: { fontSize: 10, color: NAVY, marginBottom: 8 },
  signature: { height: 28, maxWidth: 150, objectFit: 'contain', objectPosition: 'left center' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: FOOTER_H, backgroundColor: NAVY_DEEP, paddingTop: 9, borderTopWidth: 2, borderTopColor: GOLD },
  footerLine: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', fontSize: 9, color: '#ffffff' },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 9 },
  footerIcon: { width: 9, height: 9, marginRight: 4 },
  footerSite: { textAlign: 'center', fontSize: 7.5, marginTop: 6, color: '#c6cfdc' },
  footerLink: { color: GOLD },
});

// Card columns as in the sample: 50% / 25% / 25%. A shorter row lets its last value use
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead} wrap={false}>
        <Text style={s.cardTitle}>{title}</Text>
        <View style={s.cardBar} />
      </View>
      {children}
    </View>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={s.footerIcon}>
      <Path d={d} fill={GOLD} />
    </Svg>
  );
}

const ICON_PERSON = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z';
const ICON_PHONE =
  'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z';
const ICON_MAIL = 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z';

function Chrome({ dated, reference }: { dated: string; reference: string }) {
  return (
    <>
      <View style={s.header} fixed>
        {LOGO ? <PdfImage style={s.logo} src={{ data: LOGO, format: 'png' }} /> : <Text style={s.brand}>Spectrum Financial</Text>}
        <View style={s.headerRight}>
          <Text style={s.eyebrow}>SIGNED APPLICATION</Text>
          <Text style={s.headerTitle}>Funding Application</Text>
        </View>
      </View>
      <View style={s.goldRule} fixed />
      <View style={s.strip} fixed>
        <Text style={s.stripCell}>ISO Rep: Spectrum Financial</Text>
        <Text style={[s.stripCell, { textAlign: 'center' }]}>Reference: {reference}</Text>
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
        <Text style={s.footerSite} render={({ pageNumber, totalPages }) => `Submitted on www.${SITE_DOMAIN}  ·  Page ${pageNumber} of ${totalPages}`} />
      </View>
    </>
  );
}

function SignatureBlock({ fields, meta, signaturePng, signedAt }: { fields: ApplyFields; meta: SubmissionMeta; signaturePng: Buffer; signedAt: string }) {
  return (
    <View style={s.signCard} wrap={false}>
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

export type ApplicationPdfProps = { fields: ApplyFields; meta: SubmissionMeta; signaturePng: Buffer; calculator?: CalculatorChoice | null };

export function ApplicationPdf({ fields, meta, signaturePng, calculator = null }: ApplicationPdfProps) {
  const { day, dateTime } = formatInZone(meta.submittedAt, meta.timeZone);
  const signature = <SignatureBlock fields={fields} meta={meta} signaturePng={signaturePng} signedAt={dateTime} />;
  const calc = calculator ? calculatorRows(calculator) : null;
  return (
    <Document
      title={`Funding Application - ${fields.biz_dba}`}
      author="Spectrum Financial"
      subject={`Funding application ${meta.reference}`}
      creator={SITE_DOMAIN}
      producer={SITE_DOMAIN}
    >
      <Page size="A4" style={s.page}>
        <Chrome dated={day} reference={meta.reference} />
        <Card title="Applicant Business Information">
          {businessRows(fields).map((row) => (
            <Cells key={row[0].label} row={row} />
          ))}
        </Card>
        <Card title="Business Owner">
          {ownerRows(fields).map((row) => (
            <Cells key={row[0].label} row={row} />
          ))}
        </Card>
        {/* very long answers can push the end of page 1 onto an extra page; the signature then
            moves together with the authorization it signs, never on its own */}
        <View wrap={false}>
          <Text style={s.paragraph}>{AUTHORIZATION_TEXT}</Text>
          {signature}
        </View>
      </Page>
      <Page size="A4" style={s.page}>
        <Chrome dated={day} reference={meta.reference} />
        {calc && (
          <Card title="Loan Calculator">
            <Cells row={calc.slice(0, 2)} />
            <Cells row={calc.slice(2)} />
          </Card>
        )}
        <Card title="Permission to Contact:">
          <Text style={s.paragraph}>{PERMISSION_TO_CONTACT_TEXT}</Text>
        </Card>
        {signature}
      </Page>
    </Document>
  );
}
