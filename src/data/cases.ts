import type { QaCase, Status } from '../lib/qa';

// Fictional module "Multi-invoice payment". Nothing here comes from a real system.
type Row = [id: string, area: string, critical: boolean, precondition: string, steps: string[], expected: string, actualQa: string, statusQa: Status, evidence: string];

const rows: Row[] = [
  ['MI-01', 'Selection', false, 'Customer with 3 open invoices', ['Open the payments screen', 'Select 2 invoices'], 'Total equals the sum of both balances', 'Total equals the sum of both balances', 'pass', 'screenshot-01.png (simulated)'],
  ['MI-02', 'Selection', false, 'Customer with 3 open invoices', ['Select all invoices', 'Deselect one'], 'Total updates immediately', 'Total updates immediately', 'pass', 'screenshot-02.png (simulated)'],
  ['MI-03', 'Allocation', true, 'Two invoices, payment smaller than the total', ['Enter a partial amount', 'Confirm'], 'Oldest invoice is settled first', 'Oldest invoice is settled first', 'pass', 'screenshot-03.png (simulated)'],
  ['MI-04', 'Allocation', true, 'Two invoices, payment equal to the total', ['Enter the exact total', 'Confirm'], 'Both invoices end with balance 0.00', 'Both invoices end with balance 0.00', 'pass', 'screenshot-04.png (simulated)'],
  ['MI-05', 'Allocation', true, 'Two invoices, payment larger than the total', ['Enter an amount above the total', 'Confirm'], 'The form rejects the overpayment', 'The form accepts it and leaves a negative balance', 'fail', 'screenshot-05.png (simulated)'],
  ['MI-06', 'Methods', false, 'One open invoice', ['Choose cash', 'Confirm'], 'Receipt shows method "Cash"', 'Receipt shows method "Cash"', 'pass', 'screenshot-06.png (simulated)'],
  ['MI-07', 'Methods', false, 'One open invoice', ['Choose card', 'Enter the last 4 digits', 'Confirm'], 'Receipt shows the last 4 digits', 'Receipt shows the last 4 digits', 'pass', 'screenshot-07.png (simulated)'],
  ['MI-08', 'Receipt', true, 'Payment just confirmed', ['Open the receipt'], 'Receipt number is unique and sequential', 'Receipt number is unique and sequential', 'pass', 'screenshot-08.png (simulated)'],
  ['MI-09', 'Receipt', false, 'Payment just confirmed', ['Print the receipt'], 'Print layout fits one page', 'The last line is cut off on the print layout', 'fail', 'screenshot-09.png (simulated)'],
  ['MI-10', 'Permissions', true, 'User without payment permission', ['Open the payments screen'], 'The screen is hidden', 'The screen is hidden', 'pass', 'screenshot-10.png (simulated)'],
  ['MI-11', 'Permissions', false, 'Cashier role', ['Open a closed invoice'], 'Payment button is disabled', 'Payment button is disabled', 'pass', 'screenshot-11.png (simulated)'],
  ['MI-12', 'Integration', false, 'Invoice stamping service in maintenance', ['Confirm a payment'], 'Payment is queued with a clear message', 'Blocked: the test environment has no stamping service', 'blocked', 'note-12.txt (simulated)'],
  ['MI-13', 'Reports', false, 'Three payments from today', ['Open the daily report'], 'Report lists the three payments', 'Report lists the three payments', 'pass', 'screenshot-13.png (simulated)'],
  ['MI-14', 'Audit', true, 'Payment just confirmed', ['Open the audit log'], 'Entry with user, time and amount', 'Entry with user, time and amount', 'pass', 'screenshot-14.png (simulated)'],
  ['MI-15', 'Reports', false, 'Month-end', ['Export the monthly report'], 'File downloads with all rows', '', 'not_run', 'pending (simulated)'],
];

export const CASES: QaCase[] = rows.map(([id, area, critical, precondition, steps, expected, actualQa, statusQa, evidence]) => ({
  id, area, critical, precondition, steps, expected, actualQa, statusQa, evidence,
  // Production only re-runs what passed in QA.
  actualProd: statusQa === 'pass' ? actualQa : '',
  statusProd: statusQa === 'pass' ? 'pass' : 'not_run',
}));
