# Trainistan QA

A checklist a tester works through, one case at a time. Answers land in a Google
Sheet the developer can open from their own machine.

Deliberately separate from the product: this is a static site with no backend,
no database and no login, and it is not deployed anywhere near the live site.

## How it fits together

```
Netlify (this static site)
      |  tester marks each case, presses "Send to sheet"
      v
Google Apps Script  (google-apps-script/Code.gs, attached to the Sheet)
      |  writes one row per test result
      v
Google Sheet  <--  developer opens it, filters, exports
```

There is no server to run and nothing to pay for. Answers are held in the
tester's browser until they submit, so closing the tab does not lose an
afternoon of work.

## Setting up the sheet

1. Create a Google Sheet.
2. **Extensions > Apps Script**, delete what is there, paste
   `google-apps-script/Code.gs`.
3. Change `SHARED_KEY` at the top to something random.
4. **Deploy > New deployment > Web app**, with *Execute as: Me* and
   *Who has access: Anyone*. Copy the `/exec` URL.
5. Share the Sheet with whoever needs to read results.

### Why "Anyone" is safe enough

The form posts from a tester's browser with no Google account, so the endpoint
has to be reachable without sign-in. Only `doPost` exists, so that URL can add
rows and cannot read any back: someone who found it could write noise, never
read your results. `SHARED_KEY` turns away anything that is not this form.

Reading stays behind Google's own sharing on the Sheet, which is why there is no
passcode here to invent, store or leak.

`SHARED_KEY` ships inside the JavaScript bundle. It is not a secret in the
security sense and is not meant to be one; it only stops casual noise.

## Running it

```bash
npm install
cp .env.example .env       # fill in both values
npm run dev
```

`VITE_SHEET_URL` is the `/exec` URL from step 4. `VITE_SHARED_KEY` must match
`SHARED_KEY` in the script.

Without `VITE_SHEET_URL` the form still works and "Download JSON" still works;
only "Send to sheet" reports that the build has no sheet configured.

## Deploying to Netlify

Connect this repo. `netlify.toml` already sets the build command, the publish
directory and the single page app redirect.

Set `VITE_SHEET_URL` and `VITE_SHARED_KEY` in **Site settings > Environment
variables**. They are read at build time, so change one and you have to
redeploy for it to take effect.

## The test matrix

`src/matrix/` holds the cases: 676 for the website across 49 sections, plus the
mobile app suite. Each case carries an id, what it is checking, what must be
true first, numbered steps and the one observable outcome that decides pass or
fail, so two testers reading the same case do the same thing.

Ids must be unique and well formed. A duplicate would quietly merge two cases
into one stored row, and the count would look complete while a case was never
answered, so the matrix throws on startup in development rather than letting
that reach a signed-off report.

To change the cases, edit the files under `src/matrix/website/` or
`src/matrix/app.ts`. Nothing else needs touching.
