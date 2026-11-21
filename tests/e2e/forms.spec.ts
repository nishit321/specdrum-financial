import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { extractText, getDocumentProxy } from 'unpdf';
import { attachmentPath, drawSignature, mailIds, waitForNewMail, watchErrors } from './helpers';

// Full submissions in a real browser against the running site, with the local
// mail sink standing in for the SMTP server. Emails are only sent from the
// desktop project so each run produces one email per scenario.

const statementPdf = () => Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
const statementPng = () =>
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

async function choose(page: Page, scope: string, label: string | RegExp, option: string) {
  await page.locator(scope).getByRole('combobox', { name: label }).click();
  await page.locator(scope).getByRole('option', { name: option, exact: true }).click();
}

async function fillApplication(page: Page) {
  const s1a = '#sbfStep1A';
  await page.locator('#appEmail').fill('jordan@mapleridgebakery.com');
  await page.locator('#appZip').fill('49024');
  await page.locator('#appPhone').pressSequentially('2693503651');
  await page.locator('#appAmount').fill('46000');
  await page.locator('#appAmount').blur();
  await choose(page, s1a, 'Use of Funds', 'Business Working Capital');
  await page.locator('#appConsentCheck').check();
  await page.locator(s1a).getByRole('button', { name: /Continue/ }).click();

  const s1b = '#sbfStep1B';
  await expect(page.locator(s1b)).toBeVisible();
  await page.locator('#appFirstName').fill('Jordan');
  await page.locator('#appLastName').fill('Avery');
  await page.locator('#appHomeAddress').fill('188 W Chicago Street');
  await page.locator('#appCity').fill('Coldwater');
  await page.locator('#appState').fill('mi');
  await page.locator('#appHomeZip').fill('49036');
  await page.locator('#appDob').pressSequentially('03241965');
  await page.locator('#appSsn').pressSequentially('078051120');
  await choose(page, s1b, 'Business Title', 'Owner');
  await page.locator(s1b).getByRole('button', { name: /Continue/ }).click();

  const s2 = '#sbfStep2';
  await expect(page.locator(s2)).toBeVisible();
  await expect(page.locator('#appBizAmount')).toHaveValue('$ 46,000');
  await page.locator('#appBizDba').fill('Maple Ridge Bakery');
  await page.locator('#appBizLegal').fill('Maple Ridge Bakery LLC');
  await page.locator('#appBizEin').fill('46-2383674');
  await page.locator('#appBizAddress').fill('724 W Centre Ave, Suite 203, Portage, MI');
  await page.locator('#appBizZip').fill('49024');
  await page.locator('#appBizPhone').pressSequentially('5179189004');
  await choose(page, s2, 'Incorporation Type', 'LLC (Limited Liability Company)');
  await page.locator('#appBizState').fill('MI');
  await page.locator('#appBizStart').pressSequentially('032009');
  await choose(page, s2, 'Type of Business', 'Restaurant & Hospitality');
  await choose(page, s2, 'Own/Lease Property', 'Lease Commercial');
  await page.locator('#appMonthlyRev').fill('41000');
  await page.locator('#appDailyBal').fill('4000');
  await page.locator('#appWebsite').fill('mapleridgebakery.com');
  await page.locator(s2).getByRole('button', { name: /Continue/ }).click();

  const s3 = '#sbfStep3';
  await expect(page.locator(s3)).toBeVisible();
  await expect(page.locator('#appSignName')).toHaveValue('Jordan Avery');
  await expect(page.locator('#appSignDate')).toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
}

test.describe('Apply Now', () => {
  test('cannot get past a step with missing details', async ({ page }) => {
    await page.goto('/apply-now');
    await page.locator('#btnStep1A').click();
    await expect(page.locator('#sbfStep1A')).toBeVisible();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.locator('#appEmail')).toBeFocused();
  });

  test('signature is required, then the full application is emailed with the PDF and statements', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    await page.goto('/apply-now');
    await fillApplication(page);

    // no signature yet
    await page.locator('#chkEsignConsent').check();
    await page.locator('#btnStep3').click();
    await expect(page.getByText('Please draw your signature.')).toBeVisible();

    await drawSignature(page);
    await expect(page.getByText('Please draw your signature.')).toBeHidden();
    await page.locator('#btnStep3').click();
    await expect(page.locator('#sbfStep4')).toBeVisible();

    // going back keeps the signature
    await page.locator('#btnBack4').click();
    await expect(page.locator('#sbfStep3')).toBeVisible();
    await page.locator('#btnStep3').click();
    await expect(page.locator('#sbfStep4')).toBeVisible();

    await page.locator('#appFileInput').setInputFiles([
      { name: 'October statement.pdf', mimeType: 'application/pdf', buffer: statementPdf() },
      { name: 'September.png', mimeType: 'image/png', buffer: statementPng() },
      { name: 'virus.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') },
    ]);
    await expect(page.locator('.sbf-file-item')).toHaveCount(2);
    await expect(page.getByText(`"virus.exe" isn't a PDF, JPG or PNG file.`)).toBeVisible();

    if (testInfo.project.name !== 'desktop') return; // one email per run
    const before = mailIds();
    await page.locator('#btnSubmitApp').click();
    await expect(page.locator('#sbfStepSuccess')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#successApplicantName')).toHaveText('Jordan');
    const reference = (await page.locator('#appRefCode').textContent())!;
    expect(reference).toMatch(/^SBF-\d{4}-[A-Z2-9]{6}$/);
    await expect(page.locator('#sbfStepNode4')).toHaveClass(/is-completed/);

    const [mail] = await waitForNewMail(before);
    expect(mail.subject).toBe(`New application: Maple Ridge Bakery – $46,000 (${reference})`);
    expect(mail.replyTo).toContain('jordan@mapleridgebakery.com');
    expect(mail.attachments.map((a) => a.filename)).toEqual([
      `Funding-Application-Maple-Ridge-Bakery-${reference}.pdf`,
      'October statement.pdf',
      'September.png',
    ]);
    expect(mail.text).toContain('***-**-1120');
    expect(mail.text).not.toContain('078-05-1120');

    const pdfBytes = fs.readFileSync(attachmentPath(mail.attachments[0].file));
    const { text } = await extractText(await getDocumentProxy(new Uint8Array(pdfBytes)), { mergePages: true });
    for (const s of ['Maple Ridge Bakery LLC', '$46,000.00', '078-05-1120', 'Michigan', 'Limited Liability Company', 'Chrome on Windows', 'Application Signed by Jordan Avery, Owner']) {
      expect(text, s).toContain(s);
    }
    expect(pdfBytes.toString('latin1')).toMatch(/\/Subtype\s*\/Image/); // the drawn signature is embedded
    expect(errors).toEqual([]);
  });
});

test.describe('Apply Now with the keyboard only', () => {
  test('signing with the printed name works without a mouse; changing the name clears that signature', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'keyboard flow is a desktop flow');
    await page.goto('/apply-now');
    await fillApplication(page);
    await page.locator('#chkEsignConsent').check();
    // Enter on step 3 without a signature: the error shows and focus lands on the typed-signature button
    await page.locator('#appSignName').press('Enter');
    await expect(page.getByText('Please draw your signature.')).toBeVisible();
    await expect(page.locator('#btnTypedSign')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Please draw your signature.')).toBeHidden();
    // the printed name changes → the typed signature no longer matches and is cleared
    await page.locator('#appSignName').fill('Jordan M. Avery');
    await page.locator('#btnStep3').click();
    await expect(page.getByText('Please draw your signature.')).toBeVisible();
    await page.locator('#btnTypedSign').press('Enter');
    await page.locator('#appSignName').press('Enter');
    await expect(page.locator('#sbfStep4')).toBeVisible();
  });
});

test.describe('Quote forms', () => {
  test('home page "Get My Free Quote" sends an email with every field', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one email per run');
    await page.goto('/');
    const form = page.locator('#sbfQuoteForm');
    await form.scrollIntoViewIfNeeded();
    await form.getByLabel('Full name').fill('Marcus Lee');
    await form.getByLabel('Business name').fill('Lee Auto Repair');
    await form.getByLabel('Phone').fill('562-555-0199');
    await form.getByLabel('Email').fill('marcus@leeauto.com');
    await choose(page, '#sbfQuoteForm', 'Funding amount', '$50,000 – $150,000');
    await choose(page, '#sbfQuoteForm', 'Financing type', 'Equipment Loan / Lease');
    await form.getByLabel(/How will you use the funds/).fill('Two lifts and a tire machine');
    const before = mailIds();
    await form.getByRole('button', { name: /Get My Free Quote/ }).click();
    await expect(page.locator('#sbfQuoteSuccess')).toBeVisible();
    const [mail] = await waitForNewMail(before);
    expect(mail.subject).toMatch(/^New free quote request: Marcus Lee – Lee Auto Repair \(SBQ-\d{4}-[A-Z2-9]{6}\)$/);
    for (const s of ['marcus@leeauto.com', '562-555-0199', '$50,000 – $150,000', 'Equipment Loan / Lease', 'Two lifts and a tire machine']) expect(mail.text).toContain(s);
  });

  test('quote request page works with the keyboard only', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'keyboard flow is a desktop flow');
    await page.goto('/quote-request');
    await page.locator('#sbfQrFirst').focus();
    await page.keyboard.type('Priya');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Shah');
    await page.keyboard.press('Tab');
    await page.keyboard.type('priya@shahlogistics.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('(714) 555-0142');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Shah Logistics');
    await page.keyboard.press('Tab');
    await page.keyboard.type('truck');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#sbfQrType')).toHaveValue('Trucking & Logistics');
    await page.keyboard.press('Tab'); // monthly sales
    await expect(page.locator('#sbfQrSales')).toBeFocused();
    await page.keyboard.press('ArrowDown'); // open on first
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#sbfQrSales')).toHaveText('$50,000 – $75,000');
    await page.keyboard.press('Tab'); // loan amount
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#sbfQrAmount')).toHaveText('$25,000 – $50,000');
    await page.keyboard.press('Tab'); // sms consent
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab'); // promo
    await page.keyboard.press('Tab'); // terms
    await page.keyboard.press('Space');
    await expect(page.locator('#sbfQrTerms')).toBeChecked();

    const before = mailIds();
    await page.locator('#sbfQrTerms').press('Enter'); // implicit submit
    await expect(page.locator('#sbfQuoteSuccess')).toBeVisible();
    await expect(page.locator('#sbfQuoteSuccess')).toBeFocused();
    const [mail] = await waitForNewMail(before);
    expect(mail.subject).toMatch(/^New quote request: Priya Shah – Shah Logistics \(SBQ-/);
    expect(mail.text).toContain('SMS about this inquiry: Yes');
    expect(mail.text).toContain('Promotional SMS:        No');
  });

  test('quote request shows a clear message when the server cannot be reached, and keeps the data', async ({ page }) => {
    await page.route('**/api/quote', (route) => route.abort('connectionrefused'));
    await page.goto('/quote-request');
    await page.locator('#sbfQrFirst').fill('Priya');
    await page.locator('#sbfQrLast').fill('Shah');
    await page.locator('#sbfQrEmail').fill('priya@shahlogistics.com');
    await page.locator('#sbfQrPhone').fill('(714) 555-0142');
    await choose(page, '#sbfQuoteForm', 'Monthly sales', '$10,000 – $20,000');
    await choose(page, '#sbfQuoteForm', 'Loan amount', '$15,000 – $25,000');
    await page.locator('#sbfQrTerms').check(); // clicking the label text could hit its Terms link
    await page.getByRole('button', { name: /Send My Quote Request/ }).click();
    await expect(page.locator('.sbf-form-alert')).toContainText("couldn't reach our server");
    await expect(page.locator('#sbfQrFirst')).toHaveValue('Priya');
    await expect(page.locator('#sbfQuoteSuccess')).toBeHidden();
  });

  test('the themed dropdown list is not cut off and stays inside the screen', async ({ page }) => {
    await page.goto('/quote-request');
    await page.locator('#sbfQrSales').click();
    const list = page.locator('#sbfQrSales ~ ul[role=listbox], .sbf-dd.is-open ul[role=listbox]').first();
    await expect(list).toBeVisible();
    const box = (await list.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw);
    await expect(list.getByRole('option')).toHaveCount(4);
  });
});

test.describe('A page whose script never runs (delta-2 #10)', () => {
  test('after a few seconds the forms say why the button is grey; a normal visit never shows that', async ({ page }) => {
    // normal visit: the form is ready and the hint never appears, even after its 8 s delay
    await page.goto('/');
    await expect(page.locator('#sbfQuoteForm button[type="submit"]')).toBeEnabled();
    await page.waitForTimeout(8_600);
    await expect(page.locator('.sbf-late-hint')).toHaveCount(0);

    // the site's scripts are blocked (ad blocker, failed download); the stylesheets, which live
    // in the same folder, still load
    await page.route((url) => url.pathname.startsWith('/_next/static/') && url.pathname.endsWith('.js'), (route) => route.abort());
    for (const [path, form] of [['/quote-request', '#sbfQuoteForm'], ['/apply-now', '#sbfApplyForm']] as const) {
      await page.goto(path);
      const hint = page.locator(`${form} .sbf-late-hint`);
      await expect(hint).toBeHidden();
      await expect(hint).toBeVisible({ timeout: 12_000 });
      await expect(hint).toContainText('1-800-214-7498');
      await expect(page.locator(`${form} button[type="submit"]`).first()).toBeDisabled();
    }
  });
});

test.describe('Loan calculator', () => {
  test('revenue and start date → three offers → "Finish your Application" opens Apply Now filled in; the choice reaches the email and the PDF', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    await page.goto('/');
    // phones and tablets: the menu sits behind the menu button
    if (testInfo.project.name !== 'desktop') await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('.sbf-nav').getByRole('link', { name: 'Loan Calculator' }).click();
    await expect(page).toHaveURL(/\/loan-calculator$/);

    await page.locator('#calcRevenue').fill('50000');
    await page.locator('#calcRevenue').blur();
    await expect(page.locator('#calcRevenue')).toHaveValue('$ 50,000');
    await choose(page, '#sbfCalcForm', 'Business start date', '6 months to 1 year');
    await page.getByRole('button', { name: /Review Available Offers/ }).click();

    const offers = page.getByRole('region', { name: /You pre-qualify/ });
    await expect(offers).toBeVisible();
    await expect(page.getByRole('heading', { name: /You pre-qualify/ })).toBeFocused();
    await expect(offers.getByTestId('offer-working-capital')).toHaveText('$57,500');
    await expect(offers.getByTestId('offer-line-of-credit')).toHaveText('$57,500');
    await expect(offers.getByTestId('offer-equipment')).toHaveText('$230,000');
    await expect(offers).toContainText('You may also qualify for an SBA 7(a) Loan');

    await offers.locator('.sbf-offer-card', { hasText: 'Equipment Loan / Lease' }).getByRole('link', { name: /Finish your Application/ }).click();
    await expect(page).toHaveURL(/\/apply-now\?program=equipment&revenue=50000&tib=6to12$/);
    await expect(page.getByRole('note')).toContainText('From the loan calculator: Equipment Loan / Lease (estimated $230,000).');
    await expect(page.locator('#appAmount')).toHaveValue('$ 230,000');
    await expect(page.locator('#sbfStep1A').getByRole('combobox', { name: 'Use of Funds' })).toHaveText(/Equipment Purchase \/ Lease/);

    await fillApplication(page);
    await page.locator('#chkEsignConsent').check();
    await drawSignature(page);
    await page.locator('#btnStep3').click();
    await expect(page.locator('#sbfStep4')).toBeVisible();

    if (testInfo.project.name !== 'desktop') return; // one email per run
    const before = mailIds();
    await page.locator('#btnSubmitApp').click();
    await expect(page.locator('#sbfStepSuccess')).toBeVisible({ timeout: 30_000 });
    const [mail] = await waitForNewMail(before);
    expect(mail.text).toContain('They came from the loan calculator and picked Equipment Loan / Lease.');
    expect(mail.text).toMatch(/Program chosen:\s+Equipment Loan \/ Lease/);
    expect(mail.text).toMatch(/Calculator estimate:\s+\$230,000/);
    expect(mail.text).toMatch(/Business start date:\s+6 months to 1 year/);
    const pdfBytes = fs.readFileSync(attachmentPath(mail.attachments[0].file));
    const { text } = await extractText(await getDocumentProxy(new Uint8Array(pdfBytes)), { mergePages: false });
    expect(text[1]).toContain('Loan Calculator');
    expect(text[1]).toContain('$230,000');
    expect(errors).toEqual([]);
  });
});
