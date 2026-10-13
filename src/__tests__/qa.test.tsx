import { render, screen, fireEvent } from '@testing-library/react';
import { CASES } from '../data/cases';
import { buildReport, summary, validateReport, verdict, toCsv } from '../lib/qa';
import { Demo } from '../Demo';

test('conteos del ejemplo en QA y produccion', () => {
  expect(summary(CASES, 'qa')).toEqual({ pass: 11, fail: 2, blocked: 1, not_run: 1 });
  expect(summary(CASES, 'prod')).toEqual({ pass: 11, fail: 0, blocked: 0, not_run: 4 });
});

test('un fail critico da rework', () => {
  expect(verdict(CASES, 'qa')).toBe('rework');
});

test('todo en pass da approve', () => {
  const all = CASES.map((c) => ({ ...c, statusQa: 'pass' as const }));
  expect(verdict(all, 'qa')).toBe('approve');
});

test('buildReport no contiene "fix"', () => {
  const failing = CASES.filter((c) => c.statusQa === 'fail');
  for (const c of failing) {
    const text = buildReport(c);
    expect(text.toLowerCase()).not.toContain('fix');
    expect(text).toContain('Steps to reproduce');
    expect(validateReport(text).ok).toBe(true);
  }
});

test('validateReport rechaza "Suggested fix: ..."', () => {
  expect(validateReport('Failure: x\nSuggested fix: change the form').ok).toBe(false);
  expect(validateReport('Corrección sugerida: cambiar').ok).toBe(false);
});

test('CSV tiene una fila por caso mas encabezado', () => {
  expect(toCsv(CASES, 'qa').split('\n')).toHaveLength(16);
});

test('la interfaz muestra el veredicto y cambia a produccion', () => {
  render(<Demo lang="en" />);
  expect(screen.getByTestId('verdict')).toHaveTextContent('REWORK');
  expect(screen.getByTestId('count-pass')).toHaveTextContent('11');
  fireEvent.click(screen.getByRole('button', { name: 'Generate finding report' }));
  expect(screen.getByTestId('report')).toHaveTextContent('Steps to reproduce');
});
