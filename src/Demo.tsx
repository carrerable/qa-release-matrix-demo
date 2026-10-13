import { useMemo, useState } from 'react';
import type { Lang } from './i18n';
import { Shell, Tabs } from './ui/Shell';
import { Frame } from './ui/Frame';
import { CASES } from './data/cases';
import { STATUSES, buildReport, setStatus, statusOf, summary, toCsv, validateReport, verdict, type Phase, type Status } from './lib/qa';

const T = {
  en: {
    eyebrow: 'Case study / QA release gate', title: 'QA release gate: E2E test matrix',
    lead: 'Every ticket is gated twice, in QA and in production. QA reports; it never fixes.',
    tabs: { summary: 'Summary', matrix: 'E2E Matrix' }, phase: 'Phase', qa: 'QA', prod: 'Production',
    verdict: 'Verdict', approve: 'APPROVE', rework: 'REWORK', filter: 'Filter', all: 'All',
    status: { pass: 'Pass', fail: 'Fail', blocked: 'Blocked', not_run: 'Not run' },
    cols: ['ID', 'Area', 'Critical', 'Expected', 'Actual', 'Status'], gen: 'Generate finding report', csv: 'Export CSV',
    rule: 'Rule: QA only reports failure, evidence and steps. A report with a suggested fix is rejected.',
    module: 'Module: Multi-invoice payment (fictional)', yes: 'yes', no: 'no', reportTitle: 'Finding report', pick: 'Pick a failing case',
  },
  es: {
    eyebrow: 'Caso de estudio / compuerta de QA', title: 'Compuerta de QA: matriz E2E',
    lead: 'Cada ticket pasa dos veces, en QA y en producción. QA reporta; nunca corrige.',
    tabs: { summary: 'Resumen', matrix: 'Matriz E2E' }, phase: 'Fase', qa: 'QA', prod: 'Producción',
    verdict: 'Veredicto', approve: 'APROBAR', rework: 'RETRABAJO', filter: 'Filtro', all: 'Todos',
    status: { pass: 'Aprobado', fail: 'Falla', blocked: 'Bloqueado', not_run: 'Sin correr' },
    cols: ['ID', 'Área', 'Crítico', 'Esperado', 'Real', 'Estado'], gen: 'Generar reporte de hallazgo', csv: 'Exportar CSV',
    rule: 'Regla: QA solo reporta falla, evidencia y pasos. Un reporte con corrección sugerida se rechaza.',
    module: 'Módulo: Pago de varias facturas (ficticio)', yes: 'sí', no: 'no', reportTitle: 'Reporte de hallazgo', pick: 'Elige un caso con falla',
  },
};

const chipClass: Record<Status, string> = { pass: 'ok', fail: 'bad', blocked: 'warn', not_run: '' };

export function Demo({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [cases, setCases] = useState(CASES);
  const [tab, setTab] = useState<'summary' | 'matrix'>('summary');
  const [phase, setPhase] = useState<Phase>('qa');
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [report, setReport] = useState('');
  const counts = useMemo(() => summary(cases, phase), [cases, phase]);
  const v = verdict(cases, phase);
  const shown = cases.filter((c) => filter === 'all' || statusOf(c, phase) === filter);

  const generate = () => {
    const bad = cases.find((c) => statusOf(c, phase) === 'fail');
    if (!bad) { setReport(t.pick); return; }
    const text = buildReport(bad, phase);
    setReport(validateReport(text).ok ? text : 'Rejected: QA only reports.');
  };
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(cases, phase)], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `qa-matrix-${phase}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell lang={lang} eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <Frame tl="REC 00:15" tr={t.module}>
        <div className="row" style={{ marginBottom: 'var(--s-4)' }}>
          <span className="mono">{t.phase}</span>
          {(['qa', 'prod'] as Phase[]).map((p) => (
            <button key={p} className="toggle" aria-pressed={phase === p} onClick={() => setPhase(p)}>{t[p]}</button>
          ))}
        </div>
        <Tabs value={tab} onChange={setTab} items={[{ id: 'summary', label: t.tabs.summary }, { id: 'matrix', label: t.tabs.matrix }]} />

        {tab === 'summary' && (
          <>
            <div className="grid">
              {STATUSES.map((s) => (
                <div className="card" key={s}><div className="num" data-testid={`count-${s}`}>{counts[s]}</div><div className="label">{t.status[s]}</div></div>
              ))}
              <div className="card verdict">
                <div className="num" data-testid="verdict">{v === 'approve' ? t.approve : t.rework}</div>
                <div className="label">{t.verdict}</div>
              </div>
            </div>
            <p className="note" style={{ marginTop: 'var(--s-4)' }}>{t.rule}</p>
            <div className="row">
              <button className="btn primary" onClick={generate}>{t.gen}</button>
              <button className="btn" onClick={exportCsv}>{t.csv}</button>
            </div>
            {report && (<><h3 style={{ marginTop: 'var(--s-5)' }}>{t.reportTitle}</h3><pre data-testid="report">{report}</pre></>)}
          </>
        )}

        {tab === 'matrix' && (
          <>
            <div className="row" style={{ marginBottom: 'var(--s-3)' }}>
              <span className="mono">{t.filter}</span>
              {(['all', ...STATUSES] as const).map((s) => (
                <button key={s} className="toggle" aria-pressed={filter === s} onClick={() => setFilter(s)}>{s === 'all' ? t.all : t.status[s]}</button>
              ))}
            </div>
            <div className="tablewrap">
              <table>
                <thead><tr>{t.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {shown.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.id}</strong></td><td>{c.area}</td><td>{c.critical ? t.yes : t.no}</td>
                      <td>{c.expected}</td><td>{(phase === 'qa' ? c.actualQa : c.actualProd) || '-'}</td>
                      <td>
                        <select aria-label={`${c.id} status`} value={statusOf(c, phase)} onChange={(e) => setCases(setStatus(cases, c.id, phase, e.target.value as Status))}>
                          {STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                        </select>{' '}
                        <span className={`chip ${chipClass[statusOf(c, phase)]}`}>{statusOf(c, phase)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Frame>
    </Shell>
  );
}
