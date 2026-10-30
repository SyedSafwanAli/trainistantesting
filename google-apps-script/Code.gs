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
 * doGet EXISTS ONLY TO RESUME A RUN, AND NEEDS A SECOND KEY FOR COMMENTS
 * A tester who starts in the office and continues at home needs their place
 * back, and a browser cannot see another device's storage. So doGet hands back
 * which test ids were answered and with what status.
 *
 * The comments are the sensitive part, the actual notes on what is broken, so
 * they are not in that answer. SHARED_KEY cannot buy them: it ships inside the
 * form's JavaScript bundle, which means anybody who opens the tracker has it,
 * and returning comments to it would publish every QA note on the platform.
 * READER_KEY is the one that buys them. It is not in this file and not in the
 * bundle; it is set as a script property on this project, and a tester pastes
 * it into the tracker once and their browser keeps it. With no reader key the
 * answer is statuses only, exactly as before.
 */

// Change this, and put the same value in the form's VITE_SHARED_KEY.
const SHARED_KEY = '3e6c31ecd956b804f09046b98ccc075e';

/**
 * The key that buys the comments back out of the sheet, and nothing else.
 *
 * ITS VALUE IS DELIBERATELY NOT IN THIS FILE.
 * This file lives in a public GitHub repository, so a key written here would be
 * readable by anybody and would protect nothing. It is not a VITE_ variable
 * either: Vite bakes those into the bundle it serves, which would hand it to
 * every visitor of the tracker.
 *
 * It lives in the one place that is neither published nor served: this script's
 * own properties. In the Apps Script editor, Project Settings > Script
 * properties > Add script property, named READER_KEY.
 *
 * Unset, or set to nothing, means comment reading is off and doGet behaves
 * exactly as it did before it existed.
 */
function readerKey() {
  try {
    return PropertiesService.getScriptProperties().getProperty('READER_KEY') || '';
  } catch (err) {
    // A script with no properties access must fail closed, not open.
    return '';
  }
}

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
const COL_COMMENT = 9;

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
    const session = body.sessionId || '';
    const submittedAt = new Date();

    function rowFor(r) {
      return [
        submittedAt,
        session,
        body.environment || '',
        r.suite || '',
        r.section || '',
        r.testId || '',
        r.feature || '',
        r.status || '',
        r.comment || '',
      ];
    }

    // One row per test per run, never two.
    //
    // This used to append everything it was given, so a tester who pressed send
    // at lunch and again at five had the whole morning in the sheet twice, and
    // a verdict they had changed sat underneath the one they changed it from.
    // Matching on run and test id makes a second send a correction rather than
    // a duplicate, whatever the form chooses to post.
    const existing = rowIndex(sheet, session);
    const appended = [];
    let updated = 0;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const id = String(r.testId || '').trim();
      if (!id) continue;
      const at = existing[id];
      if (at) {
        sheet.getRange(at, 1, 1, HEADERS.length).setValues([rowFor(r)]);
        updated++;
      } else {
        appended.push(rowFor(r));
      }
    }

    // One appendRow per result would be one API call per row and would crawl
    // on a 600-test run. setValues writes the whole block at once.
    if (appended.length) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, appended.length, HEADERS.length)
        .setValues(appended);
    }

    return json({
      ok: true,
      written: appended.length + updated,
      added: appended.length,
      updated: updated,
      tab: sheet.getName(),
    });
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
  // An unset READER_KEY means comment reading is off, and must not be
  // satisfiable by sending reader= with nothing after it.
  const expectedReader = readerKey();
  const canReadComments = Boolean(expectedReader) && String(p.reader || '') === expectedReader;

  const answers = {};
  const comments = canReadComments ? {} : null;
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
      if (comments) {
        // Written even when blank, so that resuming a run shows a row whose
        // note was later cleared as having none rather than as unknown.
        comments[testId] = String(row[COL_COMMENT - 1] || '').trim();
      }
      found++;
    }
  }

  // 'comments' is absent, not empty, when the reader key was not given. The
  // tracker tells those apart: absent means it never asked and must keep the
  // notes already on screen, empty means the sheet holds none.
  const payload = { ok: true, session: session, rows: found, answers: answers };
  if (comments) payload.comments = comments;
  return reply(payload, callback);
}

/**
 * test id -> the row it already occupies for this run, on this tab.
 *
 * Read in one call rather than searching per result: a send can carry hundreds
 * of cases, and a getRange for each would take minutes. Later rows win, so a
 * tab that already holds duplicates from before this change settles on the
 * last one written, which is the most recent verdict.
 */
function rowIndex(sheet, session) {
  const index = {};
  const last = sheet.getLastRow();
  if (last < 2 || !session) return index;

  const values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (let r = 0; r < values.length; r++) {
    if (String(values[r][COL_SESSION - 1]) !== session) continue;
    const id = String(values[r][COL_TEST_ID - 1] || '').trim();
    if (id) index[id] = r + 2; // +2: one for the header, one for 1-based rows
  }
  return index;
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
