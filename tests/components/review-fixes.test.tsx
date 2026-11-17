// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplyForm } from '@/components/apply/ApplyForm';
import { HomeQuoteForm } from '@/components/forms/HomeQuoteForm';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';
import { Select } from '@/components/ui/Select';

// Regression tests for the UI findings of the first code review.

describe('honeypot fields have a name browsers do not autofill (review #6)', () => {
  it.each([
    ['home quote', <HomeQuoteForm key="h" />],
    ['quote request', <QuoteRequestForm key="q" />],
    ['apply', <ApplyForm key="a" />],
  ])('%s', (_, ui) => {
    const { container } = render(ui);
    const hp = container.querySelectorAll('.sbf-qr-hp input');
    expect(hp).toHaveLength(1);
    expect(hp[0]).toHaveAttribute('name', 'sbf_hp');
    expect(hp[0]).toHaveAttribute('autocomplete', 'off');
    expect(hp[0]).toHaveAttribute('tabindex', '-1');
  });
});

describe('a resubmission after an edit is a new submission (review #12)', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('quote request: same key without changes, new key after a change', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false, error: 'timeout' }), { status: 504 }));
    render(<QuoteRequestForm />);
    await userEvent.type(screen.getByLabelText(/First name/), 'Priya');
    await userEvent.type(screen.getByLabelText(/Last name/), 'Shah');
    await userEvent.type(screen.getByLabelText(/^Email/), 'priya@shahlogistics.com');
    await userEvent.type(screen.getByLabelText(/Phone \(with area code\)/), '(714) 555-0142');
    for (const [label, option] of [
      [/Monthly sales/, '$10,000 – $20,000'],
      [/Loan amount/, '$15,000 – $25,000'],
    ] as const) {
      await userEvent.click(screen.getByRole('combobox', { name: label }));
      await userEvent.click(screen.getByRole('option', { name: option }));
    }
    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    const send = () => userEvent.click(screen.getByRole('button', { name: /Send My Quote Request/ }));
    await send();
    await send();
    await userEvent.type(screen.getByLabelText(/Company name/), 'Shah Logistics');
    await send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const keys = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[1]);
  });
});

describe('the "still loading" hint is gone once the form works (delta-2 #10)', () => {
  it.each([
    ['home quote', <HomeQuoteForm key="h" />],
    ['quote request', <QuoteRequestForm key="q" />],
    ['apply', <ApplyForm key="a" />],
  ])('%s', (_, ui) => {
    const { container } = render(ui);
    expect(container.querySelector('.sbf-late-hint')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).not.toBeDisabled();
  });
});

describe('a conflict answer does not leave the form stuck (breaker B3)', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('home quote: explains what happened and the next press uses a new key', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: 'conflict' }), { status: 409 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, reference: 'SBQ-2026-ABCDEF' }), { status: 200 }));
    render(<HomeQuoteForm />);
    await userEvent.type(screen.getByLabelText(/Full name/), 'Marcus Lee');
    await userEvent.type(screen.getByLabelText(/Business name/), 'Lee Auto Repair');
    await userEvent.type(screen.getByLabelText(/Phone/), '(562) 555-0199');
    await userEvent.type(screen.getByLabelText(/Email/), 'marcus@leeauto.com');
    await userEvent.click(screen.getByRole('combobox', { name: /Funding amount/ }));
    await userEvent.click(screen.getByRole('option', { name: '$50,000 – $150,000' }));
    const send = () => userEvent.click(screen.getByRole('button', { name: /Get My Free Quote/ }));
    await send();
    expect(await screen.findByRole('alert')).toHaveTextContent(/press the button again to send the latest version/);
    await send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const keys = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).idempotencyKey);
    expect(keys[1]).not.toBe(keys[0]);
  });
});

describe('Enter continues to the next step (review #19)', () => {
  it('pressing Enter in a field on step 1 acts like Continue', async () => {
    render(<ApplyForm />);
    const step = () => within(document.getElementById('sbfStep1A')!);
    await userEvent.type(step().getByLabelText(/Email Address/), 'jordan@mapleridgebakery.com');
    await userEvent.type(step().getByLabelText(/^Zip Code/), '49024');
    await userEvent.type(step().getByLabelText(/Mobile Phone/), '2693503651');
    await userEvent.type(step().getByLabelText(/^Amount Requested/), '46000');
    await userEvent.click(step().getByRole('combobox', { name: /Use of Funds/ }));
    await userEvent.click(step().getByRole('option', { name: 'Business Working Capital' }));
    await userEvent.click(step().getByRole('checkbox'));
    await userEvent.type(step().getByLabelText(/Email Address/), '{Enter}');
    expect(document.getElementById('sbfStep1B')).toBeVisible();
    expect(document.getElementById('sbfStep1A')).not.toBeVisible();
  });

  it('Enter on an incomplete step shows the errors instead of moving on', async () => {
    render(<ApplyForm />);
    await userEvent.type(screen.getAllByLabelText(/Email Address/)[0], 'nope{Enter}');
    expect(document.getElementById('sbfStep1A')).toBeVisible();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });
});

describe('Select: hovering then tabbing away does not change the value (review #16)', () => {
  function S({ onChange }: { onChange: (v: string) => void }) {
    const [v, setV] = useState('a');
    return (
      <>
        <label htmlFor="s">Fruit</label>
        <Select
          id="s"
          className="sbf-field-select"
          options={[
            { value: 'a', label: 'Apple' },
            { value: 'b', label: 'Banana' },
          ]}
          value={v}
          onChange={(x) => {
            setV(x);
            onChange(x);
          }}
        />
      </>
    );
  }

  it('hover + Tab keeps the value; arrow + Tab picks', async () => {
    const onChange = vi.fn();
    render(<S onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Fruit');
    await userEvent.hover(screen.getByRole('option', { name: 'Banana' }));
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple');

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('typing a letter on the closed list, then Tab, picks the match like a native select (delta #4)', async () => {
    const onChange = vi.fn();
    render(<S onChange={onChange} />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('b');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
