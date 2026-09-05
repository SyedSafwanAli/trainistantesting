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
 * Results go to a tab named after the tester, created on their first
 * submission. One shared tab mixed everybody's runs together and made a long
 * pass hard to read.
 *
 * WHY "Anyone" IS SAFE ENOUGH HERE
 * The form posts from a tester's browser with no Google account, so the
 * endpoint has to be reachable without sign-in. SHARED_KEY turns away anything
 * that is not the form.
 *
 * doGet EXISTS ONLY TO RESUME A RUN, AND RETURNS NO COMMENTS
 * A tester who starts in the office and continues at home needs their place
 * back, and a browser cannot see another device's storage. So doGet hands back
 * which test ids were answered and with what status, and nothing else. The
 * comments are the sensitive part, the actual notes on what is broken, and they
 * never leave the sheet. Reading those still means opening the sheet, which is
 * behind Google's own sharing.
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

const COL_SESSION = 2; // 1-based, matches HEADERS
const COL_TEST_ID = 6;
const COL_STATUS = 8;

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
 * Resume: given a run id, hand back which tests were answered and how.
 *
 * Answered as JSONP, not JSON. Apps Script does not send an
 * Access-Control-Allow-Origin header, so a browser on another origin cannot
 * read a plain fetch of this. A script tag is not subject to that rule, which
 * is the one route that actually works from the form.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = p.callback;

  if (p.key !== SHARED_KEY) {
    return reply({ ok: false, error: 'bad key' }, callback);
  }
  const session = String(p.session || '').trim();
  if (!session) {
    return reply({ ok: false, error: 'no session' }, callback);
  }

  // Later rows win, so a test answered twice resumes as whatever it was
  // changed to rather than what it first was.
  const answers = {};
  let found = 0;

  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const last = sheet.getLastRow();
    if (last < 2) continue;

    const values = sheet
      .getRange(2, 1, last - 1, HEADERS.length)
      .getValues();

    for (let r = 0; r < values.length; r++) {
      const row = values[r];
      if (String(row[COL_SESSION - 1]) !== session) continue;
      const testId = String(row[COL_TEST_ID - 1] || '').trim();
      const status = String(row[COL_STATUS - 1] || '').trim();
      if (!testId || !status) continue;
      answers[testId] = status;
      found++;
    }
  }

  // Deliberately no comments in this payload. See the note at the top.
  return reply({ ok: true, session: session, rows: found, answers: answers }, callback);
}

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

/**
 * Google rejects a few characters in a sheet name and caps the length, and a
 * submission with no name would otherwise throw rather than land somewhere
 * findable.
 */
function tabName(rawName) {
  const cleaned = String(rawName || '')
    .replace(/[:\\\/\?\*\[\]]/g, ' ')
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

function reply(payload, callback) {
  if (callback) {
    return ContentService.createTextOutput(
      callback + '(' + JSON.stringify(payload) + ');',
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json(payload);
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
