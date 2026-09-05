import { useEffect, useMemo, useState } from 'react';
import { sectionsFor, WEBSITE_TOTAL, APP_TOTAL } from './matrix';
import type { QaSection, QaStatus, QaSuite } from './matrix/types';
import { clearRun, loadRun, newRun, saveRun, type Run } from './lib/store';
import { runAsJson, submitRun } from './lib/submit';

const STATUSES: { value: QaStatus; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'na', label: 'N/A' },
];

export default function App() {
  const [run, setRun] = useState<Run | null>(() => loadRun());
  const [suite, setSuite] = useState<QaSuite>('website');
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  // Persist on every change. A pass runs to several hundred tests over more
  // than one sitting, so nothing is held only in memory.
  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  const sections = useMemo(() => sectionsFor(suite), [suite]);
  const total = suite === 'website' ? WEBSITE_TOTAL : APP_TOTAL;
  const answered = run ? Object.keys(run.answers).length : 0;

  function setAnswer(testId: string, status: QaStatus) {
    setRun((r) =>
      r ? { ...r, answers: { ...r.answers, [testId]: { ...r.answers[testId], status } } } : r,
    );
  }

  function setComment(testId: string, comment: string) {
    setRun((r) => {
      if (!r) return r;
      const existing = r.answers[testId];
      // A comment on its own is not an answer, so it is only kept once a status
      // has been chosen. Otherwise a stray note would count as a tested case.
      if (!existing) return r;
      return { ...r, answers: { ...r.answers, [testId]: { ...existing, comment } } };
    });
  }

  async function onSubmit() {
    if (!run) return;
    setSending(true);
    setBanner(null);
    const res = await submitRun(run);
    setSending(false);
    setBanner(
      res.ok
        ? { kind: 'good', text: `Sent ${res.written} results to the sheet.` }
        : { kind: 'bad', text: res.error ?? 'Could not send.' },
    );
  }

  function onDownload() {
    if (!run) return;
    const blob = new Blob([runAsJson(run)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qa-${run.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!run) return <Start onStart={(t, e) => setRun(newRun(t, e))} />;

  const section = sections.find((s) => s.key === sectionKey) ?? null;

  return (
    <>
      <header className="top">
        <div className="top-inner">
          <div className="brand">
            Trainistan <span>QA</span>
          </div>
          <div className="top-meta">
            {run.tester} · {run.environment} · run {run.sessionId}
          </div>
          <div className="top-spacer" />
          <div className="top-meta">
            {answered} of {total} answered
          </div>
          <div className="bar">
            <i style={{ width: `${total ? (answered / total) * 100 : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="wrap">
        {banner && <div className={`note ${banner.kind}`}>{banner.text}</div>}

        {!section ? (
          <Overview
            suite={suite}
            onSuite={(s) => {
              setSuite(s);
              setSectionKey(null);
            }}
            sections={sections}
            run={run}
            onOpen={setSectionKey}
            onSubmit={onSubmit}
            onDownload={onDownload}
            sending={sending}
            answered={answered}
            onReset={() => {
              if (confirm('Start over? Everything answered in this run is discarded.')) {
                clearRun();
                setRun(null);
              }
            }}
          />
        ) : (
          <SectionView
            section={section}
            run={run}
            onStatus={setAnswer}
            onComment={setComment}
            onBack={() => setSectionKey(null)}
          />
        )}
      </div>
    </>
  );
}

function Start({ onStart }: { onStart: (tester: string, environment: string) => void }) {
  const [tester, setTester] = useState('');
  const [environment, setEnvironment] = useState('UAT');

  return (
    <div className="wrap">
      <h1>Trainistan QA</h1>
      <p>
        Work through the checklist and mark each case. Your answers are saved in this browser as
        you go, so you can close the tab and pick it up later. Send them to the sheet when you are
        done.
      </p>
      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="tester">Your name</label>
          <input
            id="tester"
            type="text"
            value={tester}
            onChange={(e) => setTester(e.target.value)}
            placeholder="Who is testing"
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="env">Environment</label>
          <select id="env" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option>UAT</option>
            <option>Production</option>
            <option>Local</option>
          </select>
        </div>
        <button
          className="btn"
          disabled={tester.trim().length < 2}
          onClick={() => onStart(tester.trim(), environment)}
        >
          Start testing
        </button>
      </div>
    </div>
  );
}

function Overview({
  suite,
  onSuite,
  sections,
  run,
  onOpen,
  onSubmit,
  onDownload,
  sending,
  answered,
  onReset,
}: {
  suite: QaSuite;
  onSuite: (s: QaSuite) => void;
  sections: QaSection[];
  run: Run;
  onOpen: (key: string) => void;
  onSubmit: () => void;
  onDownload: () => void;
  sending: boolean;
  answered: number;
  onReset: () => void;
}) {
  const counts = useMemo(() => {
    const c = { pass: 0, fail: 0, blocked: 0, na: 0 };
    for (const a of Object.values(run.answers)) c[a.status]++;
    return c;
  }, [run]);

  return (
    <>
      <h1>Sections</h1>
      <p>Pick a section to work through. You can do them in any order.</p>

      <div className="foot" style={{ marginBottom: 16 }}>
        <button
          className={`btn small ${suite === 'website' ? '' : 'ghost'}`}
          onClick={() => onSuite('website')}
        >
          Website ({WEBSITE_TOTAL})
        </button>
        <button
          className={`btn small ${suite === 'app' ? '' : 'ghost'}`}
          onClick={() => onSuite('app')}
        >
          Mobile app ({APP_TOTAL})
        </button>
      </div>

      <div className="summary">
        <div className="tile">
          <b>{counts.pass}</b>
          <span>Pass</span>
        </div>
        <div className="tile">
          <b>{counts.fail}</b>
          <span>Fail</span>
        </div>
        <div className="tile">
          <b>{counts.blocked}</b>
          <span>Blocked</span>
        </div>
        <div className="tile">
          <b>{counts.na}</b>
          <span>N/A</span>
        </div>
      </div>

      <div className="sections">
        {sections.map((s) => {
          const done = s.tests.filter((t) => run.answers[t.id]).length;
          return (
            <button
              key={s.key}
              className={`section-row${done === s.tests.length ? ' done' : ''}`}
              onClick={() => onOpen(s.key)}
            >
              <span className="name">{s.title}</span>
              <span className="count">
                {done} / {s.tests.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="foot">
        <button className="btn" onClick={onSubmit} disabled={sending || answered === 0}>
          {sending ? 'Sending…' : 'Send to sheet'}
        </button>
        <button className="btn ghost" onClick={onDownload} disabled={answered === 0}>
          Download JSON
        </button>
        <div className="spacer" />
        <button className="btn ghost small" onClick={onReset}>
          Start over
        </button>
      </div>
    </>
  );
}

function SectionView({
  section,
  run,
  onStatus,
  onComment,
  onBack,
}: {
  section: QaSection;
  run: Run;
  onStatus: (id: string, s: QaStatus) => void;
  onComment: (id: string, c: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="foot" style={{ margin: '24px 0 6px' }}>
        <button className="btn ghost small" onClick={onBack}>
          Back to all sections
        </button>
      </div>

      <h1>{section.title}</h1>
      <p>{section.blurb}</p>

      <div className="card">
        {section.tests.map((t) => {
          const answer = run.answers[t.id];
          return (
            <div className="test" key={t.id}>
              <div className="test-id">{t.id}</div>
              <div className="test-title">{t.feature}</div>
              <p style={{ margin: 0 }}>{t.what}</p>

              <dl>
                <dt>Before you start</dt>
                <dd>{t.preconditions}</dd>
                <dt>Steps</dt>
                <dd>
                  <ol>
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </dd>
                <dt>Expected</dt>
                <dd>{t.expected}</dd>
              </dl>

              <div className="statuses">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    className={`status-btn ${s.value}${answer?.status === s.value ? ' on' : ''}`}
                    onClick={() => onStatus(t.id, s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {answer && (
                <div className="comment">
                  <textarea
                    placeholder={
                      answer.status === 'pass'
                        ? 'Anything worth noting (optional)'
                        : 'What happened? Steps, error text, anything the developer needs.'
                    }
                    value={answer.comment ?? ''}
                    onChange={(e) => onComment(t.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="foot">
        <button className="btn" onClick={onBack}>
          Done with this section
        </button>
      </div>
    </>
  );
}
