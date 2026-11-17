// Option lists shared by the forms (browser) and the API validation (server).
// Values are what gets submitted; labels are what people see.

export type Option = { value: string; label: string };

const plain = (values: readonly string[]): Option[] => values.map((value) => ({ value, label: value }));

/* ---------- Apply Now ---------- */

export const USE_OF_FUNDS_INITIAL = plain([
  'Business Working Capital',
  'Expansion & Locations',
  'Secure New Inventory',
  'Equipment Purchase / Lease',
  'Short-Term Bridge / Payroll',
  'Tax Obligation or Refinance',
  'Other Business Purpose',
]);

export const OWNER_TITLES = plain(['Owner', 'President', 'CEO', 'Managing Member', 'Partner', 'Director']);

export const USE_OF_FUNDS_BUSINESS = plain([
  'Business Working Capital',
  'Expansion & Remodel',
  'Inventory Purchase',
  'Equipment Lease / Buy',
  'Short-Term Contract Carry',
]);

export const INCORPORATION_TYPES: Option[] = [
  { value: 'LLC', label: 'LLC (Limited Liability Company)' },
  { value: 'Corporation (C-Corp)', label: 'Corporation (C-Corp)' },
  { value: 'S-Corporation (S-Corp)', label: 'S-Corporation (S-Corp)' },
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'General Partnership', label: 'General Partnership' },
];

export const BUSINESS_TYPES = plain([
  'Construction & Contracting',
  'Retail & Storefront',
  'Restaurant & Hospitality',
  'Trucking & Freight Logistics',
  'Medical, Dental & Healthcare',
  'Manufacturing & Industrial',
  'Automotive & Repair',
  'Salon & Personal Care',
  'Professional Services',
  'Other Industry',
]);

export const PROPERTY_STATUS = plain(['Lease Commercial', 'Own Commercial Property', 'Home-Based Business']);

export const OPEN_LOANS = plain(['None', '1 Open Position', '2 Open Positions', '3+ Positions']);

/* ---------- Quote Request page ---------- */

export const QUOTE_BUSINESS_TYPE_SUGGESTIONS = [
  'Retail & E-commerce',
  'Restaurant & Hospitality',
  'Construction & Contractors',
  'Medical & Dental',
  'Trucking & Logistics',
  'Auto Repair & Dealers',
  'Salon & Spa',
  'Manufacturing',
  'Professional Services',
];

export const QUOTE_MONTHLY_SALES = plain(['$10,000 – $20,000', '$20,000 – $50,000', '$50,000 – $75,000', '$75,000 and above']);

export const QUOTE_LOAN_AMOUNTS = plain(['$15,000 – $25,000', '$25,000 – $50,000', '$50,000 – $75,000', '$75,000 and above']);

/* ---------- Home page quote form ---------- */

export const HOME_FUNDING_AMOUNTS = plain(['$10,000 – $50,000', '$50,000 – $150,000', '$150,000 – $500,000', '$500,000+']);

export const HOME_FINANCING_TYPES = plain([
  'Not sure yet',
  'Line of Credit',
  'Unsecured Working Capital',
  'Equipment Loan / Lease',
  'Short-Term Loan',
]);
/**
 * Choices the form no longer offers but a page loaded before an update may still send.
 * Accepted so that visitor's request is not lost; "Merchant Cash Advance" became "Line of Credit"
 * on 2026-11-14.
 */
export const RETIRED_HOME_FINANCING_TYPES = ['Merchant Cash Advance'];

/* ---------- Home page eligibility check ---------- */

export const ELIGIBILITY_REVENUE: Option[] = [
  { value: '0', label: 'Under $10,000' },
  { value: '1', label: '$10,000 – $20,000' },
  { value: '2', label: '$20,000 – $50,000' },
  { value: '3', label: '$50,000+' },
];

export const ELIGIBILITY_YEARS = plain(['Less than 1 year', '1 – 3 years', '3+ years']);

/* ---------- US states (incl. DC and territories) ---------- */

export const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands', AS: 'American Samoa', MP: 'Northern Mariana Islands',
};

export const values = (options: readonly Option[]) => options.map((o) => o.value) as [string, ...string[]];
export const labelFor = (options: readonly Option[], value: string) => options.find((o) => o.value === value)?.label ?? value;
