/**
 * Trainistan QA — Google Sheet receiver.
 *
 * Paste this into the Sheet's Apps Script editor
 * (Extensions > Apps Script), then Deploy > New deployment > Web app,
 * with "Execute as: Me" and "Who has access: Anyone".
 *
 * Copy the /exec URL it gives you into the QA form's VITE_SHEET_URL.
 *
 * EACH TESTER GETS THEIR OWN TAB
 * Results are written to a tab named after the tester, created on their first
 * submission. One shared tab mixed everybody's runs together and made a long
 * pass hard to read; a tab each keeps one person's work in one place and lets
 * the developer export just that person.
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
const SHARED_KEY = '3e6c31ecd956b804f09046b98ccc075e';

const HEADERS = [
  'Submitted at',
  'Session',
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

    const sheet = sheetForTester(body.tester);

    const submittedAt = new Date();
    const rows = results.map(function (r) {
      return [
        submittedAt,
        body.sessionId || '',
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

    return json({ ok: true, written: rows.length, tab: sheet.getName() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * The tab for this tester, created on first use.
 *
 * The tester's name is not the sheet name directly: Google rejects a few
 * characters outright and caps the length, and an unnamed submission would
 * otherwise throw rather than land somewhere findable.
 */
function sheetForTester(rawName) {
  const name = tabName(rawName);
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(name);

  if (!sheet) {
    sheet = book.insertSheet(name);
  }
  ensureHeaders(sheet);
  return sheet;
}

function tabName(rawName) {
  const cleaned = String(rawName || '')
    .replace(/[:\\\/\?\*\[\]]/g, ' ') // characters a sheet name cannot contain
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
  return cleaned || 'Unnamed tester';
}

/** Write the header row once, when a tab is new. */
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
