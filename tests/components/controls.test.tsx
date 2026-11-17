// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EligibilityForm } from '@/components/forms/EligibilityForm';
import { Checkbox } from '@/components/ui/Checkbox';
import { Combobox } from '@/components/ui/Combobox';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';

const OPTIONS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
  { value: 'bl', label: 'Blueberry' },
];

function ControlledSelect({ initial = '', onChange = () => {} }: { initial?: string; onChange?: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <>
      <label htmlFor="fruit">Fruit</label>
      <Select
        id="fruit"
        name="fruit"
        className="sbf-field-select"
        placeholder="Pick one"
        options={OPTIONS}
        value={v}
        onChange={(x) => {
          setV(x);
          onChange(x);
        }}
      />
      <button type="button">after</button>
    </>
  );
}

describe('Select (themed, replaces <select>)', () => {
  it('looks like the old select when closed: same class, placeholder in grey, label works', () => {
    render(<ControlledSelect />);
    const box = screen.getByRole('combobox', { name: 'Fruit' });
    expect(box).toHaveClass('sbf-field-select', 'is-placeholder');
    expect(box).toHaveTextContent('Pick one');
    expect(box).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('input[type=hidden][name=fruit]')).toHaveValue('');
  });

  it('mouse: opens, picks, closes, submits the value in the hidden input', async () => {
    const onChange = vi.fn();
    render(<ControlledSelect onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeVisible();
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).toHaveBeenCalledWith('c');
    expect(screen.getByRole('combobox')).toHaveTextContent('Cherry');
    expect(screen.getByRole('combobox')).not.toHaveClass('is-placeholder');
    expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible();
    expect(document.querySelector('input[type=hidden][name=fruit]')).toHaveValue('c');
  });

  it('keyboard: arrows, Enter, Escape, Home/End and type-ahead', async () => {
    const onChange = vi.fn();
    render(<ControlledSelect onChange={onChange} />);
    const box = screen.getByRole('combobox');
    box.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(box).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('b');
    await userEvent.keyboard('{ArrowDown}{End}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('bl');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    expect(box).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenCalledTimes(2);
    // typing "c" jumps to Cherry
    await userEvent.keyboard('c');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('c');
  });

  it('does not fire onChange when the same option is picked again', async () => {
    const onChange = vi.fn();
    render(<ControlledSelect initial="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when clicking elsewhere or tabbing away', async () => {
    render(<ControlledSelect />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(document.body);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.tab();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('marks itself invalid for screen readers', () => {
    render(<Select id="x" className="sbf-field-select" options={OPTIONS} value="" onChange={() => {}} invalid describedBy="x-err" />);
    const box = screen.getByRole('combobox');
    expect(box).toHaveClass('is-invalid');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAttribute('aria-describedby', 'x-err');
  });
});

describe('Combobox (themed, replaces <datalist>)', () => {
  function Wrapper() {
    const [v, setV] = useState('');
    return <Combobox id="t" className="form-control" value={v} onChange={setV} suggestions={['Salon & Spa', 'Manufacturing', 'Retail & E-commerce']} />;
  }

  it('suggests matches, picks one with the keyboard, and still allows free text', async () => {
    render(<Wrapper />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'man');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Manufacturing']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(input).toHaveValue('Manufacturing');
    await userEvent.clear(input);
    await userEvent.type(input, 'Bakery');
    expect(input).toHaveValue('Bakery');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});

describe('Checkbox (themed)', () => {
  it('is a real, labelled checkbox that toggles with click and Space', async () => {
    const onChange = vi.fn();
    function C() {
      const [c, setC] = useState(false);
      return (
        <label>
          <Checkbox
            checked={c}
            onChange={(v) => {
              setC(v);
              onChange(v);
            }}
          />
          <span>I agree</span>
        </label>
      );
    }
    render(<C />);
    const box = screen.getByRole('checkbox', { name: 'I agree' });
    await userEvent.click(screen.getByText('I agree'));
    expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });
});

describe('Slider (themed, replaces <input type=range>)', () => {
  it('moves by step with arrows, jumps with Home/End, never leaves the range', async () => {
    function S() {
      const [v, setV] = useState(75_000);
      return (
        <>
          <span id="lbl">Funding needed</span>
          <Slider id="s" min={10_000} max={500_000} step={5_000} value={v} onChange={setV} labelledBy="lbl" valueText={(x) => `$${x}`} />
        </>
      );
    }
    render(<S />);
    const slider = screen.getByRole('slider', { name: 'Funding needed' });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '80000');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '70000');
    await userEvent.keyboard('{End}{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '500000');
    await userEvent.keyboard('{Home}{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '10000');
    expect(slider).toHaveAttribute('aria-valuetext', '$10000');
  });
});

describe('EligibilityForm (home page calculator)', () => {
  it('shows the same numbers the static page did', async () => {
    render(<EligibilityForm />);
    // $75,000 default → 75000 * 1.14 / 12 = 7125
    expect(screen.getByText('$75,000')).toBeInTheDocument();
    expect(screen.getByText('$7,125/mo')).toBeInTheDocument();
    expect(screen.getByText('3 – 24 mos')).toBeInTheDocument();
    expect(screen.getByText(/pre-approved/)).toBeInTheDocument();

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{End}');
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('$47,500/mo')).toBeInTheDocument();
    expect(screen.getByText('Up to 36 mos')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox', { name: 'Monthly sales' }));
    await userEvent.click(screen.getByRole('option', { name: 'Under $10,000' }));
    expect(screen.getByText(/You may still qualify/)).toBeInTheDocument();
    expect(document.getElementById('sbfResult')).not.toHaveClass('is-approved');
    expect(screen.getByRole('link', { name: /Continue to Application/ })).toHaveAttribute('href', '/apply-now');
  });
});
