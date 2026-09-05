import type { QaStatus } from '../matrix/types';

/**
 * A run lives in localStorage until it is submitted.
 *
 * A full pass is several hundred tests and takes more than one sitting, so
 * losing the tab must not lose the work. Every answer is written straight away
 * rather than on a timer, because the cost of a write is nothing next to the
 * cost of re-testing an afternoon.
 */
const KEY = 'trainistan-qa-run-v1';

export interface Answer {
  status: QaStatus;
  comment?: string;
}

export interface Run {
  sessionId: string;
  tester: string;
  environment: string;
  startedAt: string;
  /** test id -> answer */
  answers: Record<string, Answer>;
}

export function newRun(tester: string, environment: string): Run {
  return {
    sessionId: makeId(),
    tester,
    environment,
    startedAt: new Date().toISOString(),
    answers: {},
  };
}

/**
 * Rebuild a run on a second machine from what the sheet already has.
 *
 * The id is kept, so continuing from home writes under the same run as the
 * morning's work in the office rather than splitting one pass in two.
 *
 * Comments come back empty because the sheet does not hand them out. They are
 * not lost: they were submitted with the original answers and are sitting in
 * the sheet already.
 */
export function resumedRun(
  sessionId: string,
  tester: string,
  environment: string,
  answers: Record<string, Answer['status']>,
): Run {
  return {
    sessionId,
    tester,
    environment,
    startedAt: new Date().toISOString(),
    answers: Object.fromEntries(
      Object.entries(answers).map(([id, status]) => [id, { status }]),
    ),
  };
}

export function loadRun(): Run | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const run = JSON.parse(raw) as Run;
    // A run without a tester is a half-written or corrupted record; treating it
    // as absent is better than dropping the tester into a broken form.
    return run && run.sessionId && run.tester ? run : null;
  } catch {
    return null;
  }
}

export function saveRun(run: Run): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    // Private browsing and full quotas both throw here. The run stays usable in
    // memory, so failing quietly is better than blocking the tester mid-pass.
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* see saveRun */
  }
}

/** Short, readable, and unique enough to tell two runs apart in the sheet. */
function makeId(): string {
  const now = new Date();
  const stamp =
    String(now.getFullYear()).slice(2) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    '-' +
    pad(now.getHours()) +
    pad(now.getMinutes());
  return stamp + '-' + Math.random().toString(36).slice(2, 6);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
