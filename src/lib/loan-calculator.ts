import { z } from 'zod';
import { usdWhole } from './forms/format';

// The loan calculator of the old site (spectrumsbaloans.com/loan-calculator), same rules:
// the estimate is the monthly revenue x 1.15 (rounded) for working capital and the line of
// credit, and four times that for equipment financing. The business start date is asked but
// does not change the amounts. Card texts are the old site's.

export const REVENUE_MULTIPLIER = 1.15;
export const EQUIPMENT_MULTIPLIER = 4;
/** Highest monthly revenue the calculator takes; keeps every estimate inside what Apply Now accepts. */
export const MAX_MONTHLY_REVENUE = 10_000_000;

export const TIME_IN_BUSINESS = [
  { value: 'less6', label: 'Less than 6 months' },
  { value: '6to12', label: '6 months to 1 year' },
  { value: 'longer12', label: 'Longer than 1 year' },
] as const;
export type TimeInBusiness = (typeof TIME_IN_BUSINESS)[number]['value'];

export const PROGRAM_IDS = ['working-capital', 'line-of-credit', 'equipment', 'sba'] as const;
export type ProgramId = (typeof PROGRAM_IDS)[number];

type Program = {
  name: string;
  /** shown on the card; null for SBA, which has a fixed range instead of an estimate */
  multiplier: number | null;
  lines: readonly string[];
  /** Apply Now choices to fill in when this program is picked (only where one clearly fits) */
  useOfFunds?: string;
  bizUse?: string;
};

export const PROGRAMS: Record<ProgramId, Program> = {
  'working-capital': {
    name: 'Unsecured Working Capital',
    multiplier: 1,
    lines: ['Rates starting at 9.75%', 'Term lengths up to 36 months', 'Funding available within 24 hours'],
    useOfFunds: 'Business Working Capital',
    bizUse: 'Business Working Capital',
  },
  'line-of-credit': {
    name: 'Line of Credit',
    multiplier: 1,
    lines: ['Monthly rate ranging from 1.25%–3.75%', 'Funding available within 24 hours'],
  },
  equipment: {
    name: 'Equipment Loan / Lease',
    multiplier: EQUIPMENT_MULTIPLIER,
    lines: ['Rates starting at 6.25%', 'Term lengths from 24–84 months', 'Funding available within 24 hours'],
    useOfFunds: 'Equipment Purchase / Lease',
    bizUse: 'Equipment Lease / Buy',
  },
  sba: {
    name: 'SBA 7(a) Loan',
    multiplier: null,
    lines: ['Loan amounts up to $500,000', 'Rates are Prime +3', '10 year term lengths', 'Funding within 30 days'],
  },
};

/** The three programs shown as cards; SBA has its own block below them. */
export const OFFER_IDS = ['working-capital', 'line-of-credit', 'equipment'] as const satisfies readonly ProgramId[];

/** Estimated amount for a program, or null for SBA. */
export function estimate(program: ProgramId, monthlyRevenue: number): number | null {
  const multiplier = PROGRAMS[program].multiplier;
  return multiplier === null ? null : Math.round(monthlyRevenue * REVENUE_MULTIPLIER) * multiplier;
}

/** "$57,500", or the SBA range. */
export function estimateLabel(program: ProgramId, monthlyRevenue: number): string {
  const amount = estimate(program, monthlyRevenue);
  return amount === null ? 'Up to $500,000' : usdWhole(amount);
}

export const timeInBusinessLabel = (value: TimeInBusiness) => TIME_IN_BUSINESS.find((t) => t.value === value)!.label;

/** What the calculator hands to Apply Now (in the link) and Apply Now sends with the application. */
export const calculatorSchema = z.object({
  program: z.enum(PROGRAM_IDS),
  monthlyRevenue: z.number().int().min(1).max(MAX_MONTHLY_REVENUE),
  timeInBusiness: z.enum(TIME_IN_BUSINESS.map((t) => t.value) as [TimeInBusiness, ...TimeInBusiness[]]),
});
export type CalculatorChoice = z.infer<typeof calculatorSchema>;

export function applyHref(choice: CalculatorChoice): string {
  const q = new URLSearchParams({ program: choice.program, revenue: String(choice.monthlyRevenue), tib: choice.timeInBusiness });
  return `/apply-now?${q}`;
}

/** Reads a calculator choice from an Apply Now address; anything invalid gives null. */
export function parseCalculatorQuery(search: string): CalculatorChoice | null {
  const q = new URLSearchParams(search);
  const revenue = q.get('revenue') ?? '';
  const parsed = calculatorSchema.safeParse({
    program: q.get('program'),
    monthlyRevenue: /^\d{1,9}$/.test(revenue) ? Number(revenue) : NaN,
    timeInBusiness: q.get('tib'),
  });
  return parsed.success ? parsed.data : null;
}
