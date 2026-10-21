import { TEST_INDEX } from '../matrix';
import type { QaStatus } from '../matrix/types';
import { fetchRun } from './resume';
import { pendingIds, type Answer, type Run } from './store';

const STATUSES: QaStatus[] = ['pass', 'fail', 'blocked', 'na', 'solved'];

const SHEET_URL = import.meta.env.VITE_SHEET_URL as string | undefined;
const SHARED_KEY = import.meta.env.VITE_SHARED_KEY as string | undefined;

export interface SubmitResult {
  ok: boolean;
  /** How many were posted. */
  written?: number;
  /** The ids the sheet was afterwards confirmed to hold, and only those. */
  ids?: string[];
  /** Posted but not found in the sheet afterwards. These were lost. */
  missing?: string[];
  /** False when the check could not run at all, so nothing is proven either way. */
  verified?: boolean;
  error?: string;
}

/**
 * Send to the Google Sheet what it has not already been told.
 *
 * This used to post every answer in the run, so a tester who sent at lunch and
 * again at five put the whole morning in the sheet twice. Now only answers that
 * are new, or that were edited after they were sent, go up. The receiving
 * script matches on run and test id and overwrites the row it already has, so a
 * changed verdict corrects itself instead of landing underneath the old one.
 *
 * Sent as text/plain rather than application/json on purpose. Apps Script web
 * apps do not answer CORS preflight, and a JSON content type makes the browser
 * send one; text/plain keeps the request "simple" so it goes straight through.
 * Apps Script reads the raw body either way.
 *
 * THE POST IS BLIND, SO THE RESULT IS CHECKED AFTERWARDS
 * For the same CORS reason the reply cannot be read, and reporting success on
 * delivery alone is not good enough: if the Sheet cannot be written to, the
 * script fails, the browser sees an ordinary response, and a tester is told
 * their afternoon was saved when it was not. A Drive that fills up turns the
 * Sheet read-only and does exactly that, silently.
 *
 * So the send is followed by a read of the same run, through the JSONP route
 * that resume already uses, and only what the sheet is then confirmed to hold
 * is treated as sent. Anything missing stays pending and goes again next time,
 * which costs nothing now the script corrects rather than appends.
 *
 * A read that cannot run proves nothing either way. That is reported as
 * unconfirmed rather than as failure, and those answers stay pending.
 */
export async function submitRun(run: Run): Promise<SubmitResult> {
  if (!SHEET_URL) {
    return { ok: false, error: 'This build has no sheet URL configured (VITE_SHEET_URL).' };
  }

  if (!Object.keys(run.answers).length) {
    return { ok: false, error: 'Nothing to send: no cases answered yet.' };
  }

  const ids = pendingIds(run);
  if (!ids.length) {
    return { ok: false, error: 'The sheet already has everything in this run.' };
  }

  const results = ids.map((testId) => {
    const answer = run.answers[testId];
    const entry = TEST_INDEX.get(testId);
    return {
      testId,
      suite: entry?.suite ?? '',
      section: entry?.section.title ?? '',
      feature: entry?.test.feature ?? '',
      status: answer.status,
      comment: answer.comment ?? '',
    };
  });

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        key: SHARED_KEY ?? '',
        sessionId: run.sessionId,
        tester: run.tester,
        environment: run.environment,
        results,
      }),
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not reach the sheet.',
    };
  }

  // The post is away. Now find out whether the sheet actually took it.
  const check = await fetchRun(run.sessionId);
  if (!check.ok) {
    return { ok: true, written: results.length, ids: [], verified: false };
  }

  const inSheet = check.answers ?? {};
  const confirmed: string[] = [];
  const missing: string[] = [];
  for (const id of ids) {
    if (inSheet[id] === run.answers[id].status) confirmed.push(id);
    else missing.push(id);
  }

  return {
    ok: true,
    written: results.length,
    ids: confirmed,
    missing,
    verified: true,
  };
}

/** The same payload the sheet receives, for the tester to keep or send on. */
export function runAsJson(run: Run): string {
  const results = Object.entries(run.answers).map(([testId, answer]) => {
    const entry = TEST_INDEX.get(testId);
    return {
      testId,
      suite: entry?.suite ?? '',
      section: entry?.section.title ?? '',
      feature: entry?.test.feature ?? '',
      status: answer.status,
      comment: answer.comment ?? '',
    };
  });
  return JSON.stringify(
    {
      sessionId: run.sessionId,
      tester: run.tester,
      environment: run.environment,
      startedAt: run.startedAt,
      exportedAt: new Date().toISOString(),
      total: results.length,
      results,
    },
    null,
    2,
  );
}

export interface LoadedAnswers {
  /** Rows that matched a test in the checklist. */
  answers: Record<string, Answer>;
  /** Ids in the file that this checklist does not have, or with a bad status. */
  skipped: string[];
}

/**
 * Read answers back out of a file written by runAsJson.
 *
 * Testing a stretch of the checklist somewhere else, or on somebody else's
 * machine, used to have no way home: the sheet hands back verdicts but not
 * notes, so a resume lost every comment, and the comments are the part worth
 * having. A file carries both.
 *
 * The caller merges this into the run rather than replacing it, so loading one
 * suite's results does not discard the other's. Rows arrive unsent, which is
 * what they are, so the next send carries them to the sheet.
 *
 * Anything the matrix does not know is skipped and reported rather than
 * stored: an id that is not a test would sit in the run forever, counted by
 * nothing and refused by the sheet.
 */
export function answersFromJson(text: string): LoadedAnswers {
  const parsed = JSON.parse(text) as { results?: unknown };
  const rows = Array.isArray(parsed?.results) ? parsed.results : null;
  if (!rows) throw new Error('no results array');

  const answers: Record<string, Answer> = {};
  const skipped: string[] = [];

  for (const row of rows) {
    const r = (row ?? {}) as { testId?: unknown; status?: unknown; comment?: unknown };
    const id = typeof r.testId === 'string' ? r.testId.trim() : '';
    const status = String(r.status ?? '').toLowerCase() as QaStatus;
    if (!id) continue;
    if (!TEST_INDEX.has(id) || !STATUSES.includes(status)) {
      skipped.push(id);
      continue;
    }
    const comment = typeof r.comment === 'string' ? r.comment.trim() : '';
    answers[id] = comment ? { status, comment } : { status };
  }

  return { answers, skipped };
}
