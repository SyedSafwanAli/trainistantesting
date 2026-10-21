import type { QaStatus } from '../matrix/types';

const SHEET_URL = import.meta.env.VITE_SHEET_URL as string | undefined;
const SHARED_KEY = import.meta.env.VITE_SHARED_KEY as string | undefined;

// 'solved' included, or resuming a run would silently drop every case a
// developer has already dealt with and offer it back as untested.
const VALID: QaStatus[] = ['pass', 'fail', 'blocked', 'na', 'solved'];

export interface ResumeResult {
  ok: boolean;
  answers?: Record<string, QaStatus>;
  rows?: number;
  error?: string;
}

/**
 * Fetch which tests a run already answered, so a tester can carry on from
 * another machine.
 *
 * Loaded through a script tag rather than fetch. Apps Script sends no
 * Access-Control-Allow-Origin header, so the browser refuses to let this origin
 * read a normal request to it; a script tag is not subject to that rule and is
 * the one route that works.
 *
 * The response carries statuses only. Comments stay in the sheet, which is why
 * this can be open without publishing the notes on what is broken.
 */
export function fetchRun(sessionId: string): Promise<ResumeResult> {
  if (!SHEET_URL) {
    return Promise.resolve({ ok: false, error: 'This build has no sheet URL configured.' });
  }

  return new Promise((resolve) => {
    const callback = `qaResume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement('script');
    let settled = false;

    function cleanup() {
      delete (window as unknown as Record<string, unknown>)[callback];
      script.remove();
      clearTimeout(timer);
    }

    function finish(result: ResumeResult) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    }

    // A script tag fires onerror for a network failure but stays silent if the
    // response is served and simply never calls back, so the timeout is what
    // stops the tester waiting forever.
    const timer = setTimeout(
      () => finish({ ok: false, error: 'The sheet did not answer in time. Check the run ID and try again.' }),
      20000,
    );

    (window as unknown as Record<string, unknown>)[callback] = (raw: unknown) => {
      const data = raw as { ok?: boolean; error?: string; rows?: number; answers?: Record<string, string> };
      if (!data?.ok) {
        finish({ ok: false, error: data?.error ?? 'The sheet refused that request.' });
        return;
      }
      // Trust nothing from the wire: a status the app does not know would break
      // the counts and the progress bar.
      const answers: Record<string, QaStatus> = {};
      for (const [testId, status] of Object.entries(data.answers ?? {})) {
        const s = String(status).toLowerCase() as QaStatus;
        if (VALID.includes(s)) answers[testId] = s;
      }
      finish({ ok: true, answers, rows: data.rows ?? 0 });
    };

    const url = new URL(SHEET_URL);
    url.searchParams.set('key', SHARED_KEY ?? '');
    url.searchParams.set('session', sessionId);
    url.searchParams.set('callback', callback);

    script.src = url.toString();
    script.onerror = () => finish({ ok: false, error: 'Could not reach the sheet.' });
    document.body.appendChild(script);
  });
}
