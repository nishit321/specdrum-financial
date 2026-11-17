// @vitest-environment jsdom
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplyForm } from '@/components/apply/ApplyForm';
import { HomeQuoteForm } from '@/components/forms/HomeQuoteForm';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';

const visibleStep = () => [...document.querySelectorAll<HTMLElement>('.sbf-step-view')].find((el) => el.style.display !== 'none')!.id;

// All Apply Now steps stay in the page (hidden ones use display:none, like the static
// page), so Apply queries are scoped to the step on screen.
const inStep = () => within(document.getElementById(visibleStep())!);
const scope = () => (document.getElementById('sbfApplyForm') ? inStep() : screen);

async function pick(label: RegExp | string, option: string) {
  await userEvent.click(scope().getByRole('combobox', { name: label }));
  await userEvent.click(scope().getByRole('option', { name: option }));
}

const type = (label: RegExp | string, value: string) => userEvent.type(scope().getByLabelText(label), value);
const field = (label: RegExp | string) => scope().getByLabelText(label);

async function fillStep1A() {
  await type(/Email Address/, 'jordan@mapleridgebakery.com');
  await type(/^Zip Code/, '49024');
  await type(/Mobile Phone/, '2693503651');
  await type(/^Amount Requested/, '46000');
  await userEvent.tab(); // blur formats the amount
  await pick(/^Use of Funds/, 'Secure New Inventory');
  await userEvent.click(scope().getByRole('checkbox', { name: /By checking this box/ }));
}

async function fillStep1B() {
  await type(/First Name/, 'Jordan');
  await type(/Last Name/, 'Avery');
  await type(/Home Address/, '188 W Chicago Street');
  await type(/^City/, 'Coldwater');
  await type(/^State \*/, 'mi');
  await type(/^Zip Code/, '49036');
  await type(/Date of Birth/, '03241965');
  await type(/Social Security Number/, '078051120');
  await pick(/Business Title/, 'Owner');
}

describe('ApplyForm — steps and validation', () => {
  it('starts on step 1 with the progress bar on "Owners"', () => {
    render(<ApplyForm />);
    expect(visibleStep()).toBe('sbfStep1A');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 1 of 4: Owners');
    expect(document.getElementById('sbfStepNode1')).toHaveClass('is-active');
  });

  it('will not continue with empty fields and says what is wrong', async () => {
    render(<ApplyForm />);
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    expect(visibleStep()).toBe('sbfStep1A');
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter a 5-digit ZIP code.')).toBeInTheDocument();
    expect(screen.getByText('Please check the box to continue.')).toBeInTheDocument();
    expect(field(/Email Address/)).toHaveAttribute('aria-invalid', 'true');
    // fixing a field clears its message right away
    await type(/Email Address/, 'jordan@mapleridgebakery.com');
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
  });

  it('masks phone, SSN, dates, ZIP and state while typing, formats money on blur', async () => {
    render(<ApplyForm />);
    await fillStep1A();
    expect(field(/Mobile Phone/)).toHaveValue('(269) 350-3651');
    expect(field(/^Amount Requested/)).toHaveValue('$ 46,000');
    await type(/^Zip Code/, '12'); // already 5 digits: ignored
    expect(field(/^Zip Code/)).toHaveValue('49024');
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    expect(visibleStep()).toBe('sbfStep1B');

    await fillStep1B();
    expect(field(/Date of Birth/)).toHaveValue('03/24/1965');
    expect(field(/Social Security Number/)).toHaveValue('078-05-1120');
    expect(field(/^State \*/)).toHaveValue('MI');
  });

  it('carries the amount to step 2 and the name to the signature, like the static page', async () => {
    render(<ApplyForm />);
    await fillStep1A();
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    await fillStep1B();
    await userEvent.click(within(document.getElementById('sbfStep1B')!).getByRole('button', { name: /Continue/ }));
    expect(visibleStep()).toBe('sbfStep2');
    expect(field(/^Amount Requested/)).toHaveValue('$ 46,000');
    expect(document.getElementById('appSignName')).toHaveValue('Jordan Avery');
    expect(document.getElementById('sbfStepNode1')).toHaveClass('is-completed');
    expect(document.getElementById('sbfStepNode2')).toHaveClass('is-active');
  });

  it('step 2 helpers: legal name follows the D/B/A, tax ID copies the SSN', async () => {
    render(<ApplyForm />);
    await fillStep1A();
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    await fillStep1B();
    await userEvent.click(within(document.getElementById('sbfStep1B')!).getByRole('button', { name: /Continue/ }));

    await type(/D\/B\/A Name/, 'Maple');
    await userEvent.click(scope().getByRole('checkbox', { name: /Legal Name is same as D\/B\/A/ }));
    expect(field(/Business Legal Name/)).toHaveValue('Maple');
    await type(/D\/B\/A Name/, ' Ridge');
    expect(field(/Business Legal Name/)).toHaveValue('Maple Ridge');

    await userEvent.click(scope().getByRole('checkbox', { name: /Tax ID is same as my SSN/ }));
    expect(field(/Tax ID \/ EIN/)).toHaveValue('078-05-1120');
  });

  it('Back keeps what was typed', async () => {
    render(<ApplyForm />);
    await fillStep1A();
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    await userEvent.click(scope().getByRole('button', { name: 'Back' }));
    expect(visibleStep()).toBe('sbfStep1A');
    expect(field(/Email Address/)).toHaveValue('jordan@mapleridgebakery.com');
  });

  it('rejects an under-18 owner and an impossible date', async () => {
    render(<ApplyForm />);
    await fillStep1A();
    await userEvent.click(scope().getByRole('button', { name: /Continue/ }));
    await fillStep1B();
    const dob = field(/Date of Birth/);
    await userEvent.clear(dob);
    await userEvent.type(dob, `0101${new Date().getFullYear() - 10}`);
    const step1b = within(document.getElementById('sbfStep1B')!);
    await userEvent.click(step1b.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText('The business owner must be at least 18.')).toBeInTheDocument();
    await userEvent.clear(dob);
    await userEvent.type(dob, '02301980');
    expect(screen.getByText('Enter your date of birth as MM/DD/YYYY.')).toBeInTheDocument();
    expect(visibleStep()).toBe('sbfStep1B');
  });
});

describe('quote forms', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const okResponse = () => new Response(JSON.stringify({ ok: true, reference: 'SBQ-2026-ABCDEF' }), { status: 200, headers: { 'content-type': 'application/json' } });

  async function fillQuoteRequest() {
    await type(/First name/, 'Priya');
    await type(/Last name/, 'Shah');
    await type(/^Email/, 'priya@shahlogistics.com');
    await type(/Phone \(with area code\)/, '(714) 555-0142');
    await type(/Company name/, 'Shah Logistics');
    await pick(/Monthly sales/, '$50,000 – $75,000');
    await pick(/Loan amount/, '$25,000 – $50,000');
    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the/ }));
  }

  it('quote request: blocks an empty form without calling the server', async () => {
    render(<QuoteRequestForm />);
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter your first name.')).toBeInTheDocument();
    expect(screen.getByText('Please accept the Terms of Service & Privacy Policy.')).toBeInTheDocument();
    // focus moves on the next animation frame
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/First name/)));
  });

  it('quote request: sends exactly what was filled, shows the thank-you panel, clears the form', async () => {
    fetchMock.mockResolvedValue(okResponse());
    render(<QuoteRequestForm />);
    await fillQuoteRequest();
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    await waitFor(() => expect(screen.getByRole('status')).toBeVisible());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/quote');
    const body = JSON.parse(init.body);
    expect(body.form).toBe('quote-request');
    expect(body.idempotencyKey).toMatch(/^[\w-]{16,64}$/);
    expect(body.honeypot).toBe('');
    expect(body.data).toEqual({
      first_name: 'Priya',
      last_name: 'Shah',
      email: 'priya@shahlogistics.com',
      phone: '(714) 555-0142',
      company: 'Shah Logistics',
      business_type: '',
      monthly_sales: '$50,000 – $75,000',
      loan_amount: '$25,000 – $50,000',
      sms_consent: false,
      sms_promo_consent: false,
      terms: true,
    });
    expect(screen.getByLabelText(/First name/)).toHaveValue('');
  });

  it('quote request: server down → friendly message with the phone number, form kept, retry reuses the key', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: 'send_failed' }), { status: 502 }));
    render(<QuoteRequestForm />);
    await fillQuoteRequest();
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('1-800-214-7498');
    expect(screen.getByLabelText(/First name/)).toHaveValue('Priya');

    fetchMock.mockResolvedValueOnce(okResponse());
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const keys = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });

  it('quote request: no internet → says so', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<QuoteRequestForm />);
    await fillQuoteRequest();
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't reach our server/);
  });

  it('quote request: double click sends one request', async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    render(<QuoteRequestForm />);
    await fillQuoteRequest();
    const button = screen.getByRole('button', { name: /Send My Quote Request/ });
    await userEvent.dblClick(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    await act(async () => resolve(okResponse()));
  });

  it('quote request: field errors from the server are shown on the fields', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false, error: 'validation', fields: { email: 'Please enter a valid email address.' } }), { status: 400 }));
    render(<QuoteRequestForm />);
    await fillQuoteRequest();
    await userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Some details need another look');
  });

  it('home form: sends the default financing type and the message', async () => {
    fetchMock.mockResolvedValue(okResponse());
    render(<HomeQuoteForm />);
    await type(/Full name/, 'Marcus Lee');
    await type(/Business name/, 'Lee Auto Repair');
    await type(/^Phone/, '562-555-0199');
    await type(/^Email/, 'marcus@leeauto.com');
    await pick(/Funding amount/, '$50,000 – $150,000');
    await type(/How will you use the funds/, 'Two lifts');
    await userEvent.click(screen.getByRole('button', { name: /Get My Free Quote/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.form).toBe('home-quote');
    expect(body.data).toEqual({ name: 'Marcus Lee', business: 'Lee Auto Repair', phone: '562-555-0199', email: 'marcus@leeauto.com', amount: '$50,000 – $150,000', type: 'Not sure yet', message: 'Two lifts' });
  });
});
