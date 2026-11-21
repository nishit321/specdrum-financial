// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ApplyForm } from '@/components/apply/ApplyForm';
import { LoanCalculator } from '@/components/calculator/LoanCalculator';

afterEach(() => window.history.replaceState({}, '', '/'));

async function calculate(revenue: string, start?: string) {
  if (revenue) await userEvent.type(screen.getByLabelText(/Average monthly revenue/), revenue);
  if (start) {
    await userEvent.click(screen.getByRole('combobox', { name: /Business start date/ }));
    await userEvent.click(screen.getByRole('option', { name: start }));
  }
  await userEvent.click(screen.getByRole('button', { name: /Review Available Offers/ }));
}

describe('loan calculator', () => {
  it('shows the three programs with the old site\'s amounts and texts, plus the SBA block', async () => {
    render(<LoanCalculator />);
    await calculate('50000', '6 months to 1 year');
    const offers = screen.getByRole('region', { name: /You pre-qualify for the following loan programs/ });
    expect(within(offers).getByTestId('offer-working-capital')).toHaveTextContent('$57,500');
    expect(within(offers).getByTestId('offer-line-of-credit')).toHaveTextContent('$57,500');
    expect(within(offers).getByTestId('offer-equipment')).toHaveTextContent('$230,000');
    for (const text of [
      'Rates starting at 9.75%',
      'Term lengths up to 36 months',
      'Monthly rate ranging from 1.25%–3.75%',
      'Rates starting at 6.25%',
      'Term lengths from 24–84 months',
      'You may also qualify for an SBA 7(a) Loan',
      'Loan amounts up to $500,000',
      'Rates are Prime +3',
      '* Larger loan amounts can be made available upon further review.',
    ]) {
      expect(offers).toHaveTextContent(text);
    }
    expect(offers).toHaveTextContent('Based on average monthly revenue of $50,000, in business 6 months to 1 year.');
  });

  it('each "Finish your Application" opens Apply Now with that program', async () => {
    render(<LoanCalculator />);
    await calculate('41000', 'Longer than 1 year');
    const links = screen.getAllByRole('link', { name: /Finish your Application/ }).map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      '/apply-now?program=working-capital&revenue=41000&tib=longer12',
      '/apply-now?program=line-of-credit&revenue=41000&tib=longer12',
      '/apply-now?program=equipment&revenue=41000&tib=longer12',
      '/apply-now?program=sba&revenue=41000&tib=longer12',
    ]);
  });

  it('asks for both answers before showing anything', async () => {
    render(<LoanCalculator />);
    await calculate('');
    expect(screen.getByText('Enter your average monthly revenue in dollars.')).toBeVisible();
    expect(screen.getByText('Select when your business started.')).toBeVisible();
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
    expect(screen.getByLabelText(/Average monthly revenue/)).toHaveFocus();
  });

  it.each([
    ['0', 'Enter your average monthly revenue in dollars.'],
    ['abc', 'Enter your average monthly revenue in dollars.'],
    ['10000001', 'Enter an amount up to $10,000,000, or call us at 1-800-214-7498.'],
  ])('revenue %j is refused', async (revenue, message) => {
    render(<LoanCalculator />);
    await calculate(revenue, 'Less than 6 months');
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
  });

  // breaker: after the offers showed, a new revenue left the old cards (and their links) on screen
  it('changing the revenue hides the old offers until they are reviewed again', async () => {
    render(<LoanCalculator />);
    await calculate('50000', 'Longer than 1 year');
    expect(screen.getByTestId('offer-equipment')).toHaveTextContent('$230,000');
    const input = screen.getByLabelText(/Average monthly revenue/);
    await userEvent.clear(input);
    await userEvent.type(input, '1000');
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Finish your Application/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Review Available Offers/ }));
    expect(screen.getByTestId('offer-equipment')).toHaveTextContent('$4,600');
  });

  it('changing the start date hides the old offers too', async () => {
    render(<LoanCalculator />);
    await calculate('50000', 'Longer than 1 year');
    await userEvent.click(screen.getByRole('combobox', { name: /Business start date/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Less than 6 months' }));
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Review Available Offers/ }));
    expect(screen.getAllByRole('link', { name: /Finish your Application/ })[0]).toHaveAttribute('href', expect.stringContaining('tib=less6'));
  });

  it('picking the same start date again keeps the offers', async () => {
    render(<LoanCalculator />);
    await calculate('50000', 'Longer than 1 year');
    await userEvent.click(screen.getByRole('combobox', { name: /Business start date/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Longer than 1 year' }));
    expect(screen.getByRole('region', { name: /pre-qualify/ })).toBeVisible();
  });

  it('a refused review never leaves the earlier offers on screen', async () => {
    render(<LoanCalculator />);
    await calculate('50000', 'Longer than 1 year');
    await userEvent.clear(screen.getByLabelText(/Average monthly revenue/));
    await userEvent.click(screen.getByRole('button', { name: /Review Available Offers/ }));
    expect(screen.getByText('Enter your average monthly revenue in dollars.')).toBeVisible();
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
  });

  it('a business under 6 months still sees the programs, as on the old site', async () => {
    render(<LoanCalculator />);
    await calculate('8000', 'Less than 6 months');
    expect(screen.getByTestId('offer-equipment')).toHaveTextContent('$36,800');
  });

  it('formats the revenue as money when leaving the field', async () => {
    render(<LoanCalculator />);
    const input = screen.getByLabelText(/Average monthly revenue/);
    await userEvent.type(input, '1250000');
    await userEvent.tab();
    expect(input).toHaveValue('$ 1,250,000');
  });

  it('cents are dropped, not turned into extra digits (review: "1,000.50" became $100,050)', async () => {
    render(<LoanCalculator />);
    const input = screen.getByLabelText(/Average monthly revenue/);
    await userEvent.type(input, '1,000.50');
    await userEvent.tab();
    expect(input).toHaveValue('$ 1,000');
    await calculate('', 'Longer than 1 year');
    expect(screen.getByTestId('offer-working-capital')).toHaveTextContent('$1,150');
  });

  it('a pasted number longer than 12 digits is kept whole and refused, not cut to a smaller one', async () => {
    render(<LoanCalculator />);
    const input = screen.getByLabelText(/Average monthly revenue/);
    await userEvent.click(input);
    await userEvent.paste('1234567890123');
    await userEvent.tab();
    expect(input).toHaveValue('$ 1,234,567,890,123');
    await calculate('', 'Longer than 1 year');
    expect(screen.getByText('Enter an amount up to $10,000,000, or call us at 1-800-214-7498.')).toBeVisible();
    expect(screen.queryByRole('region', { name: /pre-qualify/ })).toBeNull();
  });

  it('text that is not an amount is left as typed and refused', async () => {
    render(<LoanCalculator />);
    const input = screen.getByLabelText(/Average monthly revenue/);
    await userEvent.type(input, '50k');
    await userEvent.tab();
    expect(input).toHaveValue('50k');
    await calculate('', 'Longer than 1 year');
    expect(screen.getByText('Enter your average monthly revenue in dollars.')).toBeVisible();
  });
});

describe('Apply Now coming from the calculator', () => {
  it('fills in the amount, use of funds and monthly revenue, and says so', async () => {
    window.history.replaceState({}, '', '/apply-now?program=equipment&revenue=50000&tib=longer12');
    render(<ApplyForm />);
    expect(await screen.findByRole('note')).toHaveTextContent('From the loan calculator: Equipment Loan / Lease (estimated $230,000).');
    expect(document.getElementById('appAmount')).toHaveValue('$ 230,000');
    expect(screen.getByRole('combobox', { name: /Use of Funds/ })).toHaveTextContent('Equipment Purchase / Lease');
    expect(document.getElementById('appMonthlyRev')).toHaveValue('$ 50,000');
  });

  it('line of credit: no use of funds is guessed; SBA: no amount', async () => {
    window.history.replaceState({}, '', '/apply-now?program=line-of-credit&revenue=50000&tib=6to12');
    const loc = render(<ApplyForm />);
    expect(await screen.findByRole('note')).toHaveTextContent('Line of Credit (estimated $57,500)');
    expect(screen.getByRole('combobox', { name: /Use of Funds/ })).not.toHaveTextContent('Business Working Capital');
    loc.unmount();

    window.history.replaceState({}, '', '/apply-now?program=sba&revenue=50000&tib=6to12');
    render(<ApplyForm />);
    expect(await screen.findByRole('note')).toHaveTextContent('SBA 7(a) Loan (up to $500,000)');
    expect(document.getElementById('appAmount')).toHaveValue('');
  });

  it('a broken or missing link fills in nothing', async () => {
    window.history.replaceState({}, '', '/apply-now?program=free-money&revenue=50000&tib=6to12');
    render(<ApplyForm />);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('note')).toBeNull();
    expect(document.getElementById('appAmount')).toHaveValue('');
  });
});
