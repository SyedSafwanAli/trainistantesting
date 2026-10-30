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
6. Optional, and only if testers should be able to read each other's notes in
   the tracker: **Project Settings > Script properties > Add script property**,
   named `READER_KEY`, with a random value. See below.

### Two keys, and why the notes need the second one

`SHARED_KEY` is in the form's bundle. It has to be, because the form posts from
a browser with no Google account, so anybody who opens the tracker has it. That
is fine for what it does, which is turn away traffic that is not the form.

It is not fine for the comments. Those are the notes on what is broken, naming
fixture accounts, ids and which security holes were found, and returning them to
a key that every visitor holds would publish the lot. So `doGet` hands back
statuses for the shared key and comments only for a second key, `READER_KEY`.

That second key is in neither place a key would normally go. Not in the bundle,
because Vite bakes `VITE_` variables into what it serves. Not in `Code.gs`,
because this repository is public. It is a script property on the Apps Script
project, which is neither published nor served, and a tester pastes it into the
tracker once under "Reader key". Their browser keeps it.

With no property set, or no key pasted, resume and refresh return statuses only,
which is how this worked for its first two rounds.

### A refresh must never blank a note

A send rewrites the whole row, comment column included. So a refresh that pulled
a status in while leaving the note box empty would, on the next send, blank a
note already recorded in the sheet. That is the trap, and the merge is written
around it: where the tester has typed nothing the sheet's note is adopted, and
where they have typed something theirs wins and the row stays pending so it
reaches the sheet. Unsent work is never overwritten in either direction.

### The send is checked, not assumed

The browser cannot read the script's reply: Apps Script sends no
`Access-Control-Allow-Origin`, so the post goes out blind. Reporting success on
delivery alone is not good enough, because a Sheet that cannot be written to
still answers the request normally. **A full Drive turns the Sheet read-only**,
and that is exactly how an afternoon of testing disappears while the tester is
told it was saved.

So a send is followed by a read of the same run, through the same JSONP route
resume uses, and only what the sheet is then confirmed to hold counts as sent.
Anything missing stays pending and goes again next time, which costs nothing now
that a second send corrects rather than appends.

Three things the tester can be told, and all three are true when shown:

- sent and confirmed in the sheet
- sent, but the sheet shows fewer than went up, naming how many are still
  waiting and that a full Drive is the usual cause
- posted, but the sheet could not be read back, so nothing is claimed either way
  and nothing is marked as sent

Keep an eye on the Drive's free space. There is no way for this form to warn
about it in advance; it can only notice afterwards that a write did not land.

### Sending more than once

Send carries only what the sheet has not been told: answers given since the last
send, and answers edited after they were sent. Pressing it twice in a row writes
nothing the second time, and the button says so.

The script matches on run id and test id, so a second send corrects the row it
already has instead of adding another underneath. One row per case per run,
whatever order things are sent in.

This needs **both halves**. If you update the site and leave the old script in
the Sheet, the site will send less but the script will still append, and a
changed verdict will sit under the old one. After pulling these changes, paste
`google-apps-script/Code.gs` into the Sheet's Apps Script editor again and
**Deploy > Manage deployments > edit > New version**. The `/exec` URL does not
change, so nothing needs reconfiguring.

Rows written before this change are left alone. The script settles on the last
row written for a case, which is the most recent verdict, so an old duplicate
does not override a newer answer.

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

`src/matrix/` holds the cases: 777 for the website across 55 sections, plus 234
for the mobile app across 13. Each case carries an id, what it is checking, what
must be true first, numbered steps and the one observable outcome that decides
pass or fail, so two testers reading the same case do the same thing.

### Finding your way around a thousand cases

The filter row sits above the list in both views. The chips narrow by verdict
(not tested, failed, blocked, passed, N/A) and each carries its own count; the
search box matches a case's id, name, description, expected result and the note
you wrote on it.

With a filter on, the page stops showing sections and shows the matching cases
themselves, answerable where they stand. "Failed" is therefore one press away
from a list of every failure in the suite, which is the view worth having at
the end of a pass. Clearing the filter brings the sections back, and a section
that holds failures says so in that list.

### Where to start

`XC-RECENT` covers code that moved in the last few days, and each of its cases
names what used to go wrong, so it is obvious whether old behaviour has come
back. It is short. Run it before the rest.

After that, `ST-PAY` and `TR-PAYOUT` are the two that cost real money when they
fail: one takes it, the other sends it. UAT runs PayPal in sandbox and Stripe in
test mode, so nothing you do there moves money, but both need their own test
accounts set up before the cases make sense:

- a PayPal **sandbox buyer**, from developer.paypal.com under Testing Tools,
  Sandbox Accounts — a personal PayPal account cannot sign in to the sandbox
- a Stripe test card, 4242 4242 4242 4242 with any future expiry
- a student with **more than ten enrolments**, for the course-list cases, since
  the bug they cover only appears past the first page

Ids must be unique and well formed. A duplicate would quietly merge two cases
into one stored row, and the count would look complete while a case was never
answered, so the matrix throws on startup in development rather than letting
that reach a signed-off report.

To change the cases, edit the files under `src/matrix/website/` or
`src/matrix/app.ts`. Nothing else needs touching.
