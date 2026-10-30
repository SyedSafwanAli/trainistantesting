import { useEffect, useMemo, useState } from 'react';
import { sectionsFor, WEBSITE_TOTAL, APP_TOTAL } from './matrix';
import type { QaSection, QaStatus, QaSuite, QaTest } from './matrix/types';
import {
  clearRun,
  loadRun,
  markSent,
  newRun,
  pendingIds,
  resumedRun,
  saveRun,
  signature,
  type Run, refreshedFromSheet } from './lib/store';
import { fetchRun, loadReaderKey, saveReaderKey } from './lib/resume';
import { answersFromJson, runAsJson, submitRun, type LoadedAnswers } from './lib/submit';

const STATUSES: { value: QaStatus; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'na', label: 'N/A' },
];

/** "untested" is not a verdict, so it sits alongside them rather than among them. */
type Filter = 'all' | 'untested' | QaStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'untested', label: 'Not tested' },
  { value: 'fail', label: 'Failed' },
  { value: 'solved', label: 'Solved' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'pass', label: 'Passed' },
  { value: 'na', label: 'N/A' },
];

function matches(test: QaTest, run: Run, filter: Filter, query: string): boolean {
  const answer = run.answers[test.id];
  if (filter === 'untested' && answer) return false;
  if (filter !== 'all' && filter !== 'untested' && answer?.status !== filter) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    test.id.toLowerCase().includes(q) ||
    test.feature.toLowerCase().includes(q) ||
    test.what.toLowerCase().includes(q) ||
    test.expected.toLowerCase().includes(q) ||
    (run.answers[test.id]?.comment ?? '').toLowerCase().includes(q)
  );
}

export default function App() {
  const [run, setRun] = useState<Run | null>(() => loadRun());
  const [suite, setSuite] = useState<QaSuite>('website');
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  /**
   * Buys the sheet's notes back on a refresh.
   *
   * Kept in localStorage rather than the run, so it survives starting a new one
   * and is typed once per machine. It is not in the bundle on purpose: the
   * shared key is, and comments returned to that would be comments returned to
   * anybody who opens this page.
   */
  const [readerKey, setReaderKey] = useState(loadReaderKey);

  function onReaderKey(value: string) {
    setReaderKey(value);
    saveReaderKey(value);
  }
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  // Persist on every change. A pass runs to several hundred tests over more
  // than one sitting, so nothing is held only in memory.
  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  const sections = useMemo(() => sectionsFor(suite), [suite]);
  const total = suite === 'website' ? WEBSITE_TOTAL : APP_TOTAL;
  /*
   * Count the suite you are looking at, not every answer in the run.
   *
   * This was every answer in the run against one suite's total, so opening
   * the app tab after a website pass read "798 of 234 answered" and filled
   * the progress bar. Counting the way `untested` already does keeps the two
   * halves of the same line talking about the same thing.
   */
  const answered = useMemo(
    () =>
      run
        ? sections.reduce((n, s) => n + s.tests.filter((t) => run.answers[t.id]).length, 0)
        : 0,
    [sections, run],
  );
  const unsent = useMemo(() => (run ? pendingIds(run).length : 0), [run]);

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

  /**
   * Pull the sheet's statuses into the run that is already open.
   *
   * Resuming only existed on the start screen, so once a tester was in a run
   * there was no way to see a status changed since they loaded it: a failure a
   * developer had fixed and marked solved still read fail on their screen, and
   * the only route to it was to abandon the run and resume. Statuses the sheet
   * knows win; answers only this browser has are kept, because those are unsent
   * and a refresh must not be a way to lose an afternoon.
   */
  async function onRefresh() {
    if (!run) return;
    setRefreshing(true);
    setBanner(null);
    const res = await fetchRun(run.sessionId, readerKey);
    setRefreshing(false);

    if (!res.ok) {
      setBanner({ kind: 'bad', text: res.error ?? 'Could not read the sheet.' });
      return;
    }
    const fromSheet = res.answers ?? {};
    const incoming = Object.keys(fromSheet).length;
    if (!incoming) {
      setBanner({ kind: 'bad', text: `The sheet has no answers for run ${run.sessionId}.` });
      return;
    }

    // Counted before the merge, or the comparison is against itself.
    const changed = Object.entries(fromSheet).filter(
      ([id, status]) => run.answers[id]?.status !== status,
    ).length;

    const notes = res.comments
      ? Object.values(res.comments).filter((text) => text.trim()).length
      : 0;

    setRun((r) => (r ? refreshedFromSheet(r, fromSheet, res.comments) : r));
    setBanner({
      kind: 'good',
      text:
        (changed
          ? `Read ${incoming} answers from the sheet; ${changed} ${changed === 1 ? 'differs' : 'differ'} from what was on this screen and ${changed === 1 ? 'has' : 'have'} been updated.`
          : `Read ${incoming} answers from the sheet. Nothing had changed since you loaded this run.`) +
        (res.comments
          ? ` ${notes} ${notes === 1 ? 'note' : 'notes'} came back with them.`
          : ' Notes were not read: there is no reader key on this machine.'),
    });
  }

  async function onSubmit() {
    if (!run) return;
    setSending(true);
    setBanner(null);
    const res = await submitRun(run);
    setSending(false);

    if (!res.ok) {
      setBanner({ kind: 'bad', text: res.error ?? 'Could not send.' });
      return;
    }
    // Only what the sheet was afterwards confirmed to hold is recorded as sent.
    // Anything else stays pending and goes again next time, which costs nothing
    // now that a second send corrects rather than duplicates.
    setRun((r) => (r ? markSent(r, res.ids ?? []) : r));

    const sent = res.written ?? 0;
    const kept = res.ids?.length ?? 0;
    const lost = res.missing?.length ?? 0;

    if (res.verified === false) {
      setBanner({
        kind: 'bad',
        text: `Posted ${sent} ${sent === 1 ? 'result' : 'results'}, but the sheet could not be read back, so there is no proof it arrived. Nothing has been marked as sent. Press send again in a moment; if it keeps saying this, the sheet is not accepting writes.`,
      });
      return;
    }

    if (lost) {
      setBanner({
        kind: 'bad',
        text: `Sent ${sent}, but the sheet only shows ${kept}. ${lost} did not save and are still waiting. The usual cause is the Drive being full, which makes the sheet read-only. Tell the developer before you carry on, and do not clear this run.`,
      });
      return;
    }

    setBanner({
      kind: 'good',
      text: `Sent ${kept} ${kept === 1 ? 'result' : 'results'} and checked the sheet has them. Sending again writes nothing until you change something.`,
    });
  }

  /*
   * Load a stretch of testing done elsewhere.
   *
   * Merged into the answers, never replacing them, so a file covering one
   * suite leaves the other alone. The loaded rows are not recorded as sent,
   * because the sheet has not been told about them, so the next send carries
   * them with their notes.
   */
  async function onLoadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !run) return;

    let loaded: LoadedAnswers;
    try {
      loaded = answersFromJson(await file.text());
    } catch {
      setBanner({ kind: 'bad', text: 'That file is not a QA export. Use one from Download JSON.' });
      return;
    }

    const ids = Object.keys(loaded.answers);
    if (ids.length === 0) {
      setBanner({ kind: 'bad', text: 'Nothing in that file matched a case in this checklist.' });
      return;
    }

    const changed = ids.filter(
      (id) => !run.answers[id] || signature(run.answers[id]) !== signature(loaded.answers[id]),
    ).length;

    setRun((r) => (r ? { ...r, answers: { ...r.answers, ...loaded.answers } } : r));
    setBanner({
      kind: 'good',
      text:
        `Loaded ${ids.length} ${ids.length === 1 ? 'result' : 'results'}` +
        (changed ? `, ${changed} new or changed` : ', none of them new') +
        (loaded.skipped.length ? `. ${loaded.skipped.length} skipped as unknown.` : '.'),
    });
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

  if (!run) return <Start onStart={setRun} />;

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
            {run.resumed ? ' · continued' : ''}
          </div>
          <div className="top-spacer" />
          <div className="top-meta">
            {answered} of {total} answered
            {/* Said here as well as on the button, because the thing a tester
                worries about is whether their afternoon reached the sheet. */}
            {unsent > 0 ? ` · ${unsent} not sent yet` : run.lastSentAt ? ' · all sent' : ''}
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
            onRefresh={onRefresh}
            readerKey={readerKey}
            onReaderKey={onReaderKey}
            onDownload={onDownload}
            onLoadFile={onLoadFile}
            onStatus={setAnswer}
            onComment={setComment}
            sending={sending}
            refreshing={refreshing}
            answered={answered}
            unsent={unsent}
            filter={filter}
            onFilter={setFilter}
            query={query}
            onQuery={setQuery}
            onReset={() => {
              const kept = Object.keys(run.sent ?? {}).length;
              const warning = kept
                ? `Start a new run?\n\nThis clears the ${answered} answers on this machine and gives you a new run ID. The ${kept} already sent stay in the sheet under run ${run.sessionId}; they are not deleted.`
                : `Start a new run?\n\nThe ${answered} answers on this machine are discarded. Nothing has been sent to the sheet yet, so they are not kept anywhere.`;
              if (confirm(warning)) {
                clearRun();
                setRun(null);
                setFilter('all');
                setQuery('');
                setBanner(null);
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
            filter={filter}
            onFilter={setFilter}
            query={query}
            onQuery={setQuery}
          />
        )}
      </div>
    </>
  );
}

function Start({ onStart }: { onStart: (run: Run) => void }) {
  const [tester, setTester] = useState('');
  const [environment, setEnvironment] = useState('UAT');
  const [resumeId, setResumeId] = useState('');
  const [resumeKey, setResumeKey] = useState(loadReaderKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function begin() {
    const name = tester.trim();
    const id = resumeId.trim();

    if (!id) {
      onStart(newRun(name, environment));
      return;
    }

    setLoading(true);
    setError(null);
    saveReaderKey(resumeKey);
    const res = await fetchRun(id, resumeKey);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? 'Could not load that run.');
      return;
    }
    if (!res.rows) {
      setError(`No answers found for run ${id}. Check the ID, or leave it blank to start fresh.`);
      return;
    }
    onStart(resumedRun(id, name, environment, res.answers ?? {}, res.comments));
  }

  return (
    <div className="wrap">
      <h1>Trainistan QA</h1>
      <p>
        Work through the checklist and mark each case. Your answers are saved in this browser as
        you go, so you can close the tab and pick it up later. Send them to the sheet when you are
        done.
      </p>

      {error && <div className="note bad">{error}</div>}

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
        <button className="btn" disabled={tester.trim().length < 2 || loading} onClick={begin}>
          {loading ? 'Loading your run…' : 'Start testing'}
        </button>
      </div>

      <div className="card">
        <h2>Carrying on from another computer?</h2>
        <p style={{ marginBottom: 12 }}>
          Answers live in the browser you used, so a run started at the office is not on this
          machine. Enter that run ID and the answers already sent to the sheet come back. The run
          ID is shown at the top of the page while you test.
        </p>
        <label htmlFor="resume">Run ID (optional)</label>
        <input
          id="resume"
          type="text"
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          placeholder="260905-2028-i4lj"
        />
        <label htmlFor="resumekey" style={{ marginTop: 14 }}>
          Key for reading notes (optional)
        </label>
        <input
          id="resumekey"
          type="password"
          autoComplete="off"
          value={resumeKey}
          onChange={(e) => setResumeKey(e.target.value)}
          placeholder="ask whoever set up the sheet"
        />
        <p style={{ fontSize: 13, marginTop: 10, marginBottom: 0 }}>
          Only answers that were sent to the sheet come back. Anything marked but never submitted
          stayed on the other machine. The note on each case comes back too, but only with the key
          above: it is not in this page's code, because the notes say what is broken and this page
          is open to anybody. Without it you get statuses and the notes stay in the sheet.
        </p>
      </div>
    </div>
  );
}

/** The filter chips and the search box, shared by both views. */
function FilterBar({
  filter,
  onFilter,
  query,
  onQuery,
  counts,
  untested,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  query: string;
  onQuery: (q: string) => void;
  counts: Record<QaStatus, number>;
  untested: number;
}) {
  function count(f: Filter): number | null {
    if (f === 'all') return null;
    if (f === 'untested') return untested;
    return counts[f];
  }

  return (
    <div className="filters">
      {FILTERS.map((f) => {
        const n = count(f.value);
        return (
          <button
            key={f.value}
            className={`chip${filter === f.value ? ' on' : ''}`}
            onClick={() => onFilter(f.value)}
          >
            {f.label}
            {n !== null && <b>{n}</b>}
          </button>
        );
      })}
      <input
        type="search"
        className="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search cases and notes"
      />
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
  onRefresh,
  readerKey,
  onReaderKey,
  onDownload,
  onLoadFile,
  sending,
  refreshing,
  answered,
  unsent,
  filter,
  onFilter,
  query,
  onQuery,
  onReset,
  onStatus,
  onComment,
}: {
  suite: QaSuite;
  onSuite: (s: QaSuite) => void;
  sections: QaSection[];
  run: Run;
  onOpen: (key: string) => void;
  onSubmit: () => void;
  onRefresh: () => void;
  readerKey: string;
  onReaderKey: (value: string) => void;
  onDownload: () => void;
  onLoadFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sending: boolean;
  refreshing: boolean;
  answered: number;
  unsent: number;
  filter: Filter;
  onFilter: (f: Filter) => void;
  query: string;
  onQuery: (q: string) => void;
  onReset: () => void;
  onStatus: (id: string, s: QaStatus) => void;
  onComment: (id: string, c: string) => void;
}) {
  // Scoped to the sections on screen, for the same reason `answered` is: the
  // chips sat above one suite's list while counting both, so the app tab
  // offered "Passed 515" and then showed nothing passed in it.
  const counts = useMemo(() => {
    const c: Record<QaStatus, number> = { pass: 0, fail: 0, blocked: 0, na: 0, solved: 0 };
    for (const s of sections) {
      for (const t of s.tests) {
        const a = run.answers[t.id];
        if (a) c[a.status]++;
      }
    }
    return c;
  }, [sections, run]);

  const untested = useMemo(
    () => sections.reduce((n, s) => n + s.tests.filter((t) => !run.answers[t.id]).length, 0),
    [sections, run],
  );

  /*
   * With a filter on, the section list is the wrong shape: somebody looking
   * for what failed wants the failures, not the sections that contain some.
   * So the page switches to the matching cases themselves, answerable where
   * they stand, and switches back when the filter is cleared.
   */
  const filtering = filter !== 'all' || query.trim().length > 0;
  const hits = useMemo(() => {
    if (!filtering) return [];
    const q = query.trim();
    return sections
      .map((s) => ({ section: s, tests: s.tests.filter((t) => matches(t, run, filter, q)) }))
      .filter((g) => g.tests.length);
  }, [filtering, sections, run, filter, query]);
  const hitCount = hits.reduce((n, g) => n + g.tests.length, 0);

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

      <FilterBar
        filter={filter}
        onFilter={onFilter}
        query={query}
        onQuery={onQuery}
        counts={counts}
        untested={untested}
      />

      {filtering ? (
        hitCount === 0 ? (
          <div className="card">
            <p style={{ margin: 0 }}>
              Nothing matches. Clear the filter to see every section again.
            </p>
          </div>
        ) : (
          <>
            <p className="hits">
              {hitCount} {hitCount === 1 ? 'case' : 'cases'} in this suite. You can answer
              them here.
            </p>
            {hits.map((g) => (
              <div key={g.section.key}>
                <h2 className="group">{g.section.title}</h2>
                <div className="card">
                  {g.tests.map((t) => (
                    <TestCard
                      key={t.id}
                      test={t}
                      run={run}
                      onStatus={onStatus}
                      onComment={onComment}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )
      ) : (
        <div className="sections">
          {sections.map((s) => {
            const done = s.tests.filter((t) => run.answers[t.id]).length;
            const failed = s.tests.filter((t) => run.answers[t.id]?.status === 'fail').length;
            return (
              <button
                key={s.key}
                className={`section-row${done === s.tests.length ? ' done' : ''}`}
                onClick={() => onOpen(s.key)}
              >
                <span className="name">{s.title}</span>
                {failed > 0 && <span className="fails">{failed} failed</span>}
                <span className="count">
                  {done} / {s.tests.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="foot">
        <button className="btn" onClick={onSubmit} disabled={sending || unsent === 0}>
          {sending
            ? 'Sending…'
            : unsent === 0
              ? answered === 0
                ? 'Nothing to send yet'
                : 'Everything is in the sheet'
              : `Send ${unsent} to sheet`}
        </button>
        {/* The sheet is the shared record and a developer changes it while a
            tester is mid-run, so there has to be a way to pick that up without
            abandoning the run. */}
        <button className="btn ghost" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Reading the sheet…' : 'Refresh from sheet'}
        </button>
        <button className="btn ghost" onClick={onDownload} disabled={answered === 0}>
          Download JSON
        </button>
        <label className="btn ghost">
          Load JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={onLoadFile}
            style={{ display: 'none' }}
          />
        </label>
        <div className="spacer" />
        <button className="btn ghost small" onClick={onReset}>
          Start a new run
        </button>
      </div>

      {/* Here rather than on the start screen because a tester who is already
          mid-run should not have to abandon it to read the notes. */}
      <div className="card" style={{ marginTop: 18 }}>
        <h2>Reader key</h2>
        <p style={{ marginBottom: 12 }}>
          Refresh from sheet brings back statuses for anybody. The notes on each case cost this
          second key, which is kept out of this page's code on purpose. Paste it once and this
          browser remembers it. Leave it empty and refresh behaves as it always did.
        </p>
        <label htmlFor="readerkey">Key for reading notes (optional)</label>
        <input
          id="readerkey"
          type="password"
          autoComplete="off"
          value={readerKey}
          onChange={(e) => onReaderKey(e.target.value)}
          placeholder="ask whoever set up the sheet"
        />
        <p style={{ fontSize: 13, marginTop: 10, marginBottom: 0 }}>
          {readerKey.trim()
            ? 'Set. The next refresh will fill in the note on every case the sheet has one for.'
            : 'Not set. Refresh will read statuses only, and the notes stay in the sheet.'}
        </p>
      </div>
    </>
  );
}

/** One case, with its verdict buttons and note. Used in both views. */
function TestCard({
  test,
  run,
  onStatus,
  onComment,
}: {
  test: QaTest;
  run: Run;
  onStatus: (id: string, s: QaStatus) => void;
  onComment: (id: string, c: string) => void;
}) {
  const answer = run.answers[test.id];
  const sent = (run.sent ?? {})[test.id];
  const edited = Boolean(answer && sent && sent !== answer.status + '\u0000' + (answer.comment ?? ''));

  return (
    <div className="test">
      <div className="test-id">
        {test.id}
        {answer && !sent && <span className="tag">not sent</span>}
        {edited && <span className="tag">edited since sending</span>}
        {/*
          A solved case is shown but not offered as a button: 'solved' is the
          developer's answer to a failure, not a verdict a tester hands down.
          Pressing Fail or Pass still works and is the point, because re-testing
          it is what clears it.
        */}
        {answer?.status === 'solved' && <span className="tag solved">solved, re-test</span>}
      </div>
      <div className="test-title">{test.feature}</div>
      <p style={{ margin: 0 }}>{test.what}</p>

      <dl>
        <dt>Before you start</dt>
        <dd>{test.preconditions}</dd>
        <dt>Steps</dt>
        <dd>
          <ol>
            {test.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </dd>
        <dt>Expected</dt>
        <dd>{test.expected}</dd>
      </dl>

      <div className="statuses">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`status-btn ${s.value}${answer?.status === s.value ? ' on' : ''}`}
            onClick={() => onStatus(test.id, s.value)}
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
            onChange={(e) => onComment(test.id, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function SectionView({
  section,
  run,
  onStatus,
  onComment,
  onBack,
  filter,
  onFilter,
  query,
  onQuery,
}: {
  section: QaSection;
  run: Run;
  onStatus: (id: string, s: QaStatus) => void;
  onComment: (id: string, c: string) => void;
  onBack: () => void;
  filter: Filter;
  onFilter: (f: Filter) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  const counts = useMemo(() => {
    const c: Record<QaStatus, number> = { pass: 0, fail: 0, blocked: 0, na: 0, solved: 0 };
    for (const t of section.tests) {
      const a = run.answers[t.id];
      if (a) c[a.status]++;
    }
    return c;
  }, [section, run]);

  const untested = section.tests.filter((t) => !run.answers[t.id]).length;
  const shown = section.tests.filter((t) => matches(t, run, filter, query.trim()));

  return (
    <>
      <div className="foot" style={{ margin: '24px 0 6px' }}>
        <button className="btn ghost small" onClick={onBack}>
          Back to all sections
        </button>
      </div>

      <h1>{section.title}</h1>
      <p>{section.blurb}</p>

      <FilterBar
        filter={filter}
        onFilter={onFilter}
        query={query}
        onQuery={onQuery}
        counts={counts}
        untested={untested}
      />

      {shown.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0 }}>
            No case in this section matches. Clear the filter to see all{' '}
            {section.tests.length}.
          </p>
        </div>
      ) : (
        <div className="card">
          {shown.map((t) => (
            <TestCard key={t.id} test={t} run={run} onStatus={onStatus} onComment={onComment} />
          ))}
        </div>
      )}

      <div className="foot">
        <button className="btn" onClick={onBack}>
          Done with this section
        </button>
      </div>
    </>
  );
}
