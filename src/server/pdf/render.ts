import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { ApplicationPdf, type ApplicationPdfProps } from './ApplicationPdf';

export function renderApplicationPdf(props: ApplicationPdfProps): Promise<Buffer> {
  return renderToBuffer(createElement(ApplicationPdf, props) as Parameters<typeof renderToBuffer>[0]);
}

/** "Funding-Application-Stoney-Creek-Social-Media-SBF-2026-4F7K2Q.pdf" */
export function applicationPdfName(dba: string, reference: string): string {
  const slug = dba
    .normalize('NFKD')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `Funding-Application-${slug ? slug + '-' : ''}${reference}.pdf`;
}
