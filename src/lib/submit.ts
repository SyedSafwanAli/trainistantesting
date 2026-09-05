import { TEST_INDEX } from '../matrix';
import type { Run } from './store';

const SHEET_URL = import.meta.env.VITE_SHEET_URL as string | undefined;
const SHARED_KEY = import.meta.env.VITE_SHARED_KEY as string | undefined;

export interface SubmitResult {
  ok: boolean;
  written?: number;
  error?: string;
}

/**
 * Send a finished run to the Google Sheet, one row per answered test.
 *
 * Sent as text/plain rather than application/json on purpose. Apps Script web
 * apps do not answer CORS preflight, and a JSON content type makes the browser
 * send one; text/plain keeps the request "simple" so it goes straight through.
 * Apps Script reads the raw body either way.
 *
 * For the same reason the response cannot be read cross-origin, so this reports
 * success on delivery rather than on the script's reply. A failure to reach the
 * script still throws and is reported honestly.
 */
export async function submitRun(run: Run): Promise<SubmitResult> {
  if (!SHEET_URL) {
    return { ok: false, error: 'This build has no sheet URL configured (VITE_SHEET_URL).' };
  }

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

  if (!results.length) {
    return { ok: false, error: 'Nothing to submit: no tests answered yet.' };
  }

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
    return { ok: true, written: results.length };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not reach the sheet.',
    };
  }
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
