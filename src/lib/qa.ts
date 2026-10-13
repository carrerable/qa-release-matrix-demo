export type Status = 'pass' | 'fail' | 'blocked' | 'not_run';
export type Phase = 'qa' | 'prod';
export const STATUSES: Status[] = ['pass', 'fail', 'blocked', 'not_run'];

export interface QaCase {
  id: string;
  area: string;
  critical: boolean;
  precondition: string;
  steps: string[];
  expected: string;
  actualQa: string;
  actualProd: string;
  statusQa: Status;
  statusProd: Status;
  evidence: string;
}

export const statusOf = (c: QaCase, phase: Phase): Status => (phase === 'qa' ? c.statusQa : c.statusProd);
export const actualOf = (c: QaCase, phase: Phase): string => (phase === 'qa' ? c.actualQa : c.actualProd);

export function summary(cases: QaCase[], phase: Phase): Record<Status, number> {
  const out: Record<Status, number> = { pass: 0, fail: 0, blocked: 0, not_run: 0 };
  for (const c of cases) out[statusOf(c, phase)]++;
  return out;
}

/** approve only when every critical case passed; any critical fail or blocked sends the ticket back. */
export function verdict(cases: QaCase[], phase: Phase): 'approve' | 'rework' {
  const critical = cases.filter((c) => c.critical);
  return critical.every((c) => statusOf(c, phase) === 'pass') ? 'approve' : 'rework';
}

export function setStatus(cases: QaCase[], id: string, phase: Phase, status: Status): QaCase[] {
  return cases.map((c) => (c.id !== id ? c : phase === 'qa' ? { ...c, statusQa: status } : { ...c, statusProd: status }));
}

/** QA reports the failure; it never proposes the fix. */
export function buildReport(c: QaCase, phase: Phase = 'qa'): string {
  return [
    `Failure: ${c.id} (${c.area}) ${c.critical ? '[critical] ' : ''}status ${statusOf(c, phase)} in ${phase === 'qa' ? 'QA' : 'Production'}`,
    `Evidence: ${c.evidence}`,
    `Steps to reproduce:`,
    `Precondition: ${c.precondition}`,
    ...c.steps.map((s, i) => `  ${i + 1}. ${s}`),
    `Expected: ${c.expected}`,
    `Actual: ${actualOf(c, phase) || '(not recorded)'}`,
  ].join('\n');
}

const FORBIDDEN = ['fix:', 'suggested fix', 'corrección sugerida', 'correccion sugerida'];
/** Rule "QA only reports": a report that proposes a fix is invalid. */
export function validateReport(text: string): { ok: boolean; reason?: string } {
  const low = text.toLowerCase();
  const hit = FORBIDDEN.find((f) => low.includes(f));
  return hit ? { ok: false, reason: hit } : { ok: true };
}

export function toCsv(cases: QaCase[], phase: Phase): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ['id', 'area', 'critical', 'precondition', 'steps', 'expected', 'actual', 'status', 'evidence'];
  const lines = cases.map((c) => [c.id, c.area, String(c.critical), c.precondition, c.steps.join(' | '), c.expected, actualOf(c, phase), statusOf(c, phase), c.evidence].map(esc).join(','));
  return [head.join(','), ...lines].join('\n');
}
