/**
 * Trainistan QA — Google Sheet receiver.
 *
 * Paste this into the Sheet's Apps Script editor
 * (Extensions > Apps Script), then Deploy > New deployment > Web app,
 * with "Execute as: Me" and "Who has access: Anyone".
 *
 * Copy the /exec URL it gives you into the QA form's VITE_SHEET_URL.
 *
 * WHY "Anyone" IS SAFE ENOUGH HERE
 * The form posts from a tester's browser with no Google account, so the
 * endpoint has to be reachable without sign-in. Only doPost exists, so the URL
 * can add rows and cannot read any back: a stranger who found it could write
 * noise, never read your results. SHARED_KEY below turns away anything that is
 * not the form.
 *
 * Reading stays behind Google's own sharing on the Sheet itself, which is why
 * there is no passcode to invent, store or leak.
 */

// Change this, and put the same value in the form's VITE_SHARED_KEY.
const SHARED_KEY = 'change-me-to-something-random';

const HEADERS = [
  'Submitted at',
  'Session',
  'Tester',
  'Environment',
  'Suite',
  'Section',
  'Test ID',
  'Feature',
  'Status',
  'Comment',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.key !== SHARED_KEY) {
      return json({ ok: false, error: 'bad key' });
    }

    const results = Array.isArray(body.results) ? body.results : [];
    if (!results.length) {
      return json({ ok: false, error: 'no results' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeaders(sheet);

    const submittedAt = new Date();
    const rows = results.map(function (r) {
      return [
        submittedAt,
        body.sessionId || '',
        body.tester || '',
        body.environment || '',
        r.suite || '',
        r.section || '',
        r.testId || '',
        r.feature || '',
        r.status || '',
        r.comment || '',
      ];
    });

    // One appendRow per result would be one API call per row and would crawl
    // on a 600-test run. setValues writes the whole block at once.
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length)
      .setValues(rows);

    return json({ ok: true, written: rows.length });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Write the header row once, on the first submission. */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
