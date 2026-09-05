import { t, section } from '../types';

/**
 * Cross-cutting concerns.
 *
 * Permissions are tested from both directions: what each role should be able to
 * reach, and what it must not. The negative half deliberately goes past the UI
 * — typed URLs and direct API calls — because hiding a sidebar entry is not
 * authorisation. The API here is the NestJS service (default port 3000, routes
 * served both bare and under /v1) and the auth service (port 3001).
 */

export const crossSections = [
  section(
    'PERM-ROUTE',
    'Cross-role permissions: direct URL access',
    'Typing another role dashboard URL straight into the address bar. AuthGuard is the control being tested.',
    [
      t('PERM-ROUTE-001', 'Logged out cannot reach /admin', 'The admin area requires a session.', 'Fully logged out, private window.', ['Open /admin directly.'], 'You are redirected to /login. No admin content is rendered, not even briefly.'),
      t('PERM-ROUTE-002', 'Logged out cannot reach /trainer', 'The trainer area requires a session.', 'Logged out.', ['Open /trainer directly.'], 'You are redirected to /login.'),
      t('PERM-ROUTE-003', 'Logged out cannot reach /student', 'The student area requires a session.', 'Logged out.', ['Open /student directly.'], 'You are redirected to /login.'),
      t('PERM-ROUTE-004', 'Logged out cannot reach /corporate', 'The corporate area requires a session.', 'Logged out.', ['Open /corporate directly.'], 'You are redirected to /login.'),
      t('PERM-ROUTE-005', 'Student cannot reach /admin', 'A student is kept out of the admin area.', 'Signed in as Student.', ['Type /admin into the address bar.'], 'You are redirected back to /student. No admin data is shown at any point.'),
      t('PERM-ROUTE-006', 'Student cannot reach /admin/users', 'Deep admin URLs are also protected.', 'Signed in as Student.', ['Open /admin/users directly.'], 'You are redirected away and no user list is rendered.'),
      t('PERM-ROUTE-007', 'Student cannot reach /trainer', 'A student cannot use the trainer dashboard.', 'Signed in as Student.', ['Open /trainer directly.'], 'You are redirected back to /student.'),
      t('PERM-ROUTE-008', 'Student cannot reach /corporate', 'A student cannot use the corporate dashboard.', 'Signed in as Student.', ['Open /corporate directly.'], 'You are redirected back to /student.'),
      t('PERM-ROUTE-009', 'Trainer cannot reach /admin', 'A trainer is kept out of the admin area.', 'Signed in as Trainer.', ['Open /admin directly.'], 'You are redirected back to /trainer.'),
      t('PERM-ROUTE-010', 'Trainer cannot reach /student', 'A trainer cannot use the student dashboard.', 'Signed in as Trainer.', ['Open /student directly.'], 'You are redirected back to /trainer.'),
      t('PERM-ROUTE-011', 'Trainer cannot reach /corporate', 'A trainer cannot use the corporate dashboard.', 'Signed in as Trainer.', ['Open /corporate directly.'], 'You are redirected back to /trainer.'),
      t('PERM-ROUTE-012', 'Corporate leader cannot reach /admin', 'A leader is kept out of the admin area.', 'Signed in as Corp_Leader.', ['Open /admin directly.'], 'You are redirected back to /corporate.'),
      t('PERM-ROUTE-013', 'Corporate leader cannot reach /trainer', 'A leader cannot use the trainer dashboard.', 'Signed in as Corp_Leader.', ['Open /trainer directly.'], 'You are redirected back to /corporate.'),
      t('PERM-ROUTE-014', 'Corporate leader cannot reach /student', 'A leader cannot use the student dashboard.', 'Signed in as Corp_Leader.', ['Open /student directly.'], 'You are redirected back to /corporate.'),
      t('PERM-ROUTE-015', 'Admin reaches the admin area', 'The positive case works.', 'Signed in as Admin.', ['Open /admin and three of its subpages directly.'], 'Each renders without redirect.'),
      t('PERM-ROUTE-016', 'No content flash before redirect', 'Protected content is never briefly visible.', 'Signed in as Student.', ['Open /admin/users and watch closely, ideally with a screen recording.'], 'At no point is the user table visible. Only a loading state and then the redirect.'),
      t('PERM-ROUTE-017', 'Pending trainer cannot use trainer features', 'An unapproved trainer has no trainer access.', 'An account whose Trainer role request is still pending.', ['Open /trainer directly.'], 'Access is refused or the pending state is shown. Course creation is not available.'),
    ],
  ),

  section(
    'PERM-DATA',
    'Cross-role permissions: data visibility and ownership',
    'Whether a role can see or change records that belong to somebody else, tested by URL and by API.',
    [
      t('PERM-DATA-001', 'Trainer cannot edit another trainer course', 'Course ownership is enforced.', 'Two trainers, each with a course. You know trainer B course id.', ['Signed in as trainer A, open /trainer/courses/<B course id>/edit.'], 'Access is refused or you are redirected. The edit form for B course does not open.'),
      t('PERM-DATA-002', 'Trainer cannot grade another trainer assignment', 'Grading is restricted to the owning trainer.', 'An assignment belonging to trainer B.', ['Signed in as trainer A, open /trainer/assignments/<B assignment id>.'], 'Access is refused.'),
      t('PERM-DATA-003', 'Student cannot open another student submission', 'Submissions are private.', 'Two students with submissions on the same assignment.', ['Signed in as student A, attempt to reach student B submission by URL.'], 'Access is refused.'),
      t('PERM-DATA-004', 'Student cannot see another student notes', 'Notes are private.', 'Two students with notes.', ['Signed in as student A, open /student/notes.'], 'Only student A notes are listed.'),
      t('PERM-DATA-005', 'Student cannot open an unenrolled course player', 'Course content is gated by enrolment.', 'A course you are not enrolled in.', ['Open /student/courses/<that id> directly.'], 'Access is refused. Lesson video and materials are not shown.'),
      t('PERM-DATA-006', 'Corporate leader cannot see another organisation', 'Tenancy is enforced.', 'Two organisations.', ['Signed in as leader A, attempt to reach a page or record belonging to organisation B by URL.'], 'Access is refused and no organisation B data is rendered.'),
      t('PERM-DATA-007', 'Corporate leader cannot see platform-wide data', 'A leader is scoped to their organisation.', 'Signed in as Corp_Leader.', ['Compare the trainee count on /corporate against the total user count in Admin > Users.'], 'The leader sees only their own organisation, never the platform total.'),
      t('PERM-DATA-008', 'Trainer sees only their own learners', 'Learner lists are scoped.', 'Two trainers with different students.', ['Compare the learner lists each trainer sees.'], 'Neither trainer sees the other learners.'),
      t('PERM-DATA-009', 'Student cannot open trainer analytics', 'Analytics are role-restricted.', 'Signed in as Student.', ['Open /trainer/analytics directly.'], 'Access is refused.'),
      t('PERM-DATA-010', 'Hidden user is invisible publicly but intact internally', 'Hiding is presentation only.', 'A trainer hidden from the public site.', ['Confirm they are absent from /trainers logged out.', 'Confirm they still appear in Admin > Users.'], 'Both hold. Hiding does not delete or disable the account.'),
    ],
  ),

  section(
    'PERM-API',
    'API authorisation',
    'Direct calls to the backend, bypassing the UI entirely. Use the browser devtools console on the app origin, or a tool such as curl or Postman.',
    [
      t('PERM-API-001', 'Unauthenticated API call is refused', 'A protected endpoint requires a token.', 'API base URL known. No Authorization header.', ['Call GET <API>/v1/courses/admin or another admin endpoint with no Authorization header.'], 'The response is 401 Unauthorized. No data is returned.'),
      t('PERM-API-002', 'Invalid token is refused', 'A forged token does not work.', 'API base URL known.', ['Call any protected endpoint with Authorization: Bearer not-a-real-token.'], 'The response is 401. No data is returned.'),
      t('PERM-API-003', 'Student token on an admin endpoint', 'Role guards work at the API, not only in the UI.', 'A valid student access token, copied from devtools local storage under trainistan-auth.', ['Call an Admin-only endpoint, for example GET <AUTH API>/users, with the student token.'], 'The response is 403 Forbidden. No user list is returned.'),
      t('PERM-API-004', 'Student token on a trainer endpoint', 'Trainer endpoints reject students.', 'A valid student token.', ['Call a trainer-only endpoint, such as creating a course, with the student token.'], 'The response is 403. Nothing is created.'),
      t('PERM-API-005', 'Trainer token on an admin endpoint', 'Admin endpoints reject trainers.', 'A valid trainer token.', ['Call an Admin-only endpoint with the trainer token.'], 'The response is 403.'),
      t('PERM-API-006', 'Corporate token cannot read another organisation', 'Tenant isolation holds at the API.', 'A valid Corp_Leader token for organisation A, and an id belonging to organisation B.', ['Request the organisation B resource with the leader A token.'], 'The response is 403 or 404. Organisation B data is not returned.'),
      t('PERM-API-007', 'Student token cannot read another student data', 'Ownership holds at the API.', 'A valid student A token and a student B resource id.', ['Request student B resource with student A token.'], 'The response is 403 or 404.'),
      t('PERM-API-008', 'Public endpoints stay public', 'Genuinely public reads still work unauthenticated.', 'No Authorization header.', ['Call GET <API>/v1/courses and GET <API>/v1/certificates/verify/<a real code>.'], 'Both return 200 with data. The catalogue and certificate verification do not require a token.'),
      t('PERM-API-009', 'Expired token is refused', 'An expired access token is not accepted.', 'An access token you have let expire.', ['Call a protected endpoint with it.'], 'The response is 401.'),
      t('PERM-API-010', 'Rate limiting responds cleanly', 'Excessive requests are throttled, not crashed.', 'API base URL known.', ['Send more than 100 requests to one endpoint within a minute.'], 'Later requests return 429 Too Many Requests with a clear body. The service stays up.'),
    ],
  ),

  section(
    'XC-NOTIF',
    'Notifications and email',
    'In-app notifications, real-time delivery over the websocket service, push registration and the transactional emails sent by the API.',
    [
      t('XC-NOTIF-001', 'Notification bell shows unread count', 'Unread notifications are counted.', 'A user with at least one unread notification.', ['Sign in and look at the topbar bell.'], 'An unread badge shows the correct count.'),
      t('XC-NOTIF-002', 'Open the notification panel', 'Notifications are listed.', 'A user with notifications.', ['Click the bell.'], 'Notifications render newest first with their text and time.'),
      t('XC-NOTIF-003', 'Mark a notification read', 'Reading clears the badge.', 'An unread notification.', ['Open it or use the mark-read action.'], 'The unread count decreases and the item is shown as read after a refresh.'),
      t('XC-NOTIF-004', 'Mark all read', 'Bulk clearing works.', 'Several unread notifications.', ['Use mark all as read.'], 'The badge clears. If there is no such action, mark this N/A.'),
      t('XC-NOTIF-005', 'Notification links to its subject', 'A notification navigates somewhere useful.', 'A notification about a course or assignment.', ['Click it.'], 'The relevant page opens.'),
      t('XC-NOTIF-006', 'Real-time notification delivery', 'A notification arrives without refresh.', 'Two browsers: a trainer and their student.', ['With the student dashboard open, have the trainer publish an announcement to that course.'], 'The student notification badge updates without the student refreshing.'),
      t('XC-NOTIF-007', 'Empty notification state', 'No notifications shows an empty state.', 'A fresh account.', ['Open the notification panel.'], 'A clear empty state renders.'),
      t('XC-NOTIF-008', 'Browser push permission prompt', 'Push registration is requested politely.', 'Firebase push configured. A fresh browser profile.', ['Sign in and observe whether a push permission prompt appears.', 'Allow it.'], 'The prompt appears at a sensible moment and allowing it does not break the page. If push is not configured, mark this N/A.'),
      t('XC-NOTIF-009', 'Denied push permission', 'Refusing push does not break the app.', 'A browser where you deny the push prompt.', ['Deny the permission and continue using the dashboard.'], 'The app keeps working normally with no repeated prompts or error toasts.'),
      t('XC-NOTIF-010', 'Welcome email', 'A new account receives a welcome email.', 'SMTP configured and a fresh mailbox.', ['Register a new account with that mailbox.'], 'A welcome email arrives with correct branding and no broken template placeholders.'),
      t('XC-NOTIF-011', 'Enrollment confirmation email', 'Enrolling triggers an email.', 'SMTP configured.', ['Enrol in a course.', 'Check the mailbox.'], 'An enrolment confirmation arrives naming the correct course.'),
      t('XC-NOTIF-012', 'Certificate ready email', 'Completing a course triggers an email.', 'SMTP configured and a short course you can finish.', ['Complete the course.', 'Check the mailbox.'], 'A certificate-ready email arrives with a working link.'),
      t('XC-NOTIF-013', 'Payment receipt email', 'A payment triggers a receipt.', 'SMTP configured and a paid enrolment.', ['Pay for a course.', 'Check the mailbox.'], 'A receipt arrives with the correct amount.'),
      t('XC-NOTIF-014', 'Mentorship booking email', 'Booking triggers an email.', 'SMTP configured and a bookable slot.', ['Book a mentorship slot.', 'Check the mailbox.'], 'A booking email arrives with the trainer name and time.'),
      t('XC-NOTIF-015', 'Email templates render correctly', 'No template placeholders leak into the email.', 'Any of the emails above.', ['Read the received emails carefully.'], 'No raw handlebars braces, no "undefined" and no broken images. Links work.'),
    ],
  ),

  section(
    'XC-RESP',
    'Responsive and accessibility behaviour',
    'How the site behaves at phone, tablet and desktop widths, and basic keyboard and screen-reader affordances.',
    [
      t('XC-RESP-001', 'Public site at phone width', 'The marketing pages work on a phone.', 'Browser narrowed to about 390px, or a real phone.', ['Visit /, /courses, a course detail page, /about and /contact.'], 'Every page is readable, nothing overflows horizontally, and all controls are tappable.'),
      t('XC-RESP-002', 'Public site at tablet width', 'The marketing pages work on a tablet.', 'Browser at about 768px.', ['Visit the same five pages.'], 'Layout adapts sensibly with no overlap or clipping.'),
      t('XC-RESP-003', 'Student dashboard at phone width', 'The student area works on a phone.', 'Signed in as Student, browser at about 390px.', ['Visit the dashboard, My Courses, Assignments and Settings.'], 'Each page is usable, the mobile nav works, and no table or card overflows the screen.'),
      t('XC-RESP-004', 'Trainer dashboard at phone width', 'The trainer area works on a phone.', 'Signed in as Trainer at about 390px.', ['Visit the dashboard, Courses, Assignments and Live Sessions.'], 'Each page is usable and nothing overflows horizontally.'),
      t('XC-RESP-005', 'Admin dashboard at phone width', 'The admin area works on a phone.', 'Signed in as Admin at about 390px.', ['Visit the dashboard, Users, Courses and Settings.'], 'Tables scroll within their own container rather than pushing the page sideways, and the mobile nav works.'),
      t('XC-RESP-006', 'Corporate dashboard at phone width', 'The corporate area works on a phone.', 'Signed in as Corp_Leader at about 390px.', ['Visit the dashboard, Trainees, Reports and Settings.'], 'Each page is usable with no horizontal overflow.'),
      t('XC-RESP-007', 'Wide tables on small screens', 'Data tables stay readable.', 'Any table-heavy page at about 390px.', ['Scroll a wide table horizontally.'], 'The table scrolls inside its own container. The page body itself does not scroll sideways.'),
      t('XC-RESP-008', 'Modals on small screens', 'Dialogs fit a phone screen.', 'Any modal, such as the enrolment dialog or a delete confirmation, at about 390px.', ['Open it.'], 'The modal fits the screen, its buttons are reachable, and it can be dismissed.'),
      t('XC-RESP-009', 'Orientation change', 'Rotating a device does not break layout.', 'A real phone or tablet, or devtools rotation.', ['Open a dashboard page in portrait, then rotate to landscape.'], 'The layout reflows correctly and nothing is clipped or duplicated.'),
      t('XC-RESP-010', 'Keyboard navigation of a form', 'Forms can be completed without a mouse.', 'Any form, such as login or course creation.', ['Tab through every field in order.', 'Submit with Enter.'], 'Focus moves in a sensible order, focus is always visible, and Enter submits.'),
      t('XC-RESP-011', 'Escape closes a modal', 'Modals respond to the keyboard.', 'Any modal open.', ['Press Escape.'], 'The modal closes without saving anything.'),
      t('XC-RESP-012', 'Images have alternative text', 'Meaningful images are described.', 'Any content-heavy page.', ['Inspect two or three meaningful images in devtools.'], 'They carry a non-empty alt attribute, or are marked decorative.'),
      t('XC-RESP-013', 'Text contrast', 'Text is readable against its background.', 'Any page with coloured panels.', ['Look at small or muted text on coloured backgrounds.'], 'Text remains comfortably readable. Note any place it does not.'),
      t('XC-RESP-014', 'Zoom to 200 percent', 'The layout survives browser zoom.', 'Any dashboard page.', ['Zoom the browser to 200 percent.'], 'Content reflows and stays usable rather than overlapping or being cut off.'),
    ],
  ),

  section(
    'XC-EDGE',
    'Error handling, loading, empty states and edge cases',
    'What the app does when things go wrong or when there is nothing to show.',
    [
      t('XC-EDGE-001', 'Unknown URL', 'A bad route shows a not-found page.', 'Any state.', ['Open /this-page-does-not-exist.'], 'A styled not-found page renders with a way back. Not a raw framework error.'),
      t('XC-EDGE-002', 'API unreachable', 'A dead backend is reported, not hidden.', 'Signed in on a data-heavy page.', ['Open devtools, set the network to offline.', 'Reload the page.'], 'A clear error state or retry option appears. The page does not sit on an endless spinner with no explanation.'),
      t('XC-EDGE-003', 'Recovery after reconnecting', 'The app recovers when the network returns.', 'Following the previous test.', ['Set the network back to online.', 'Retry or reload.'], 'Data loads normally again with no lingering error state.'),
      t('XC-EDGE-004', 'Slow network', 'Slow responses show a loading state.', 'Signed in.', ['Throttle the network to slow 3G in devtools.', 'Open a data-heavy page.'], 'Skeletons or spinners are shown throughout the wait, then real data replaces them.'),
      t('XC-EDGE-005', 'Server error on submit', 'A failed write is reported clearly.', 'Any form you can submit.', ['Throttle to offline, then submit the form.'], 'A clear failure message appears and the typed data is not silently lost.'),
      t('XC-EDGE-006', 'Double submit on a form', 'Submitting twice does not duplicate a record.', 'Any create form.', ['Click submit twice quickly.'], 'Exactly one record is created. The button disables or shows a loading state.'),
      t('XC-EDGE-007', 'Very long text input', 'Long input is handled.', 'Any text field with a length limit.', ['Paste about 5000 characters into it and save.'], 'Either the length limit is enforced with a clear message, or the value saves and renders without breaking layout.'),
      t('XC-EDGE-008', 'Special characters and markup in input', 'Input is escaped, not executed.', 'Any text field that is displayed back.', ['Enter <script>alert(1)</script> and an emoji, then save and view the record.'], 'The text is displayed literally. No alert fires and the layout is intact.'),
      t('XC-EDGE-009', 'Leading and trailing whitespace', 'Whitespace is handled sanely.', 'Any name or title field.', ['Save a value with spaces at both ends.'], 'The value is trimmed, or at minimum displays without odd gaps and can be found by search.'),
      t('XC-EDGE-010', 'Duplicate names are handled', 'Two records with the same name do not collide.', 'Any create form.', ['Create two records with exactly the same name.'], 'Either the duplicate is refused with a clear message, or both exist and remain individually addressable.'),
      t('XC-EDGE-011', 'Boundary numeric values', 'Numeric fields respect their bounds.', 'Any numeric field, such as price or grade.', ['Enter 0, then a negative number, then a very large number.'], 'Out-of-range values are rejected with a clear message. Valid boundary values are accepted.'),
      t('XC-EDGE-012', 'Refresh mid-flow', 'Refreshing during a multi-step flow is safe.', 'Any multi-step flow, such as onboarding or course creation.', ['Press F5 partway through.'], 'You are returned to a coherent state, not a blank page or a half-created record.'),
      t('XC-EDGE-013', 'Back button mid-flow', 'Browser back does not corrupt state.', 'Any multi-step flow.', ['Press browser back partway through, then go forward again.'], 'The flow stays coherent. No duplicate record is created.'),
      t('XC-EDGE-014', 'Cancel actions', 'Cancel really cancels.', 'Any form or dialog with a cancel control.', ['Enter data, then cancel.', 'Reopen the form.'], 'Nothing was saved and the reopened form does not carry stale data forward unexpectedly.'),
      t('XC-EDGE-015', 'Confirmation dialogs are honest', 'Destructive actions always confirm first.', 'Any delete action across admin, trainer, student and corporate.', ['Trigger three different delete actions.'], 'Each asks for confirmation naming what will be deleted, and cancelling leaves the record intact.'),
      t('XC-EDGE-016', 'Large data set', 'A long list stays usable.', 'A page with many records, such as Admin > Users or a big roster.', ['Scroll or page to the end.'], 'The page remains responsive, every record is reachable, and nothing is duplicated across pages.'),
      t('XC-EDGE-017', 'Simultaneous edits', 'Two tabs editing the same record are handled.', 'Any editable record.', ['Open the same record in two tabs.', 'Save a change in tab one, then save a different change in tab two.'], 'The result is coherent and the user is not shown a corrupted record. Note whether the second save wins silently.'),
      t('XC-EDGE-018', 'Session expiry mid-action', 'An expired session during a save is handled.', 'Signed in.', ['Clear the auth tokens from local storage.', 'Immediately submit a form.'], 'You are sent to sign in, or given a clear message. No silent failure and no crash.'),
      t('XC-EDGE-019', 'Empty states across roles', 'Every list has an empty state.', 'A fresh account in each role.', ['Visit at least five list pages that have no data yet.'], 'Each shows a clear empty state with guidance. None shows a bare page or a spinner that never resolves.'),
      t('XC-EDGE-020', 'Console errors', 'The app runs without obvious client errors.', 'Signed in as any role.', ['Open devtools console.', 'Move through five pages.'], 'No uncaught exceptions appear. Note any that do, with the page and the message.'),
      t('XC-EDGE-021', 'Broken images', 'No broken image placeholders anywhere.', 'Any state.', ['Move through the public site and one dashboard, watching for broken image icons.'], 'Every image either renders or falls back to a designed placeholder such as initials.'),
      t('XC-EDGE-022', 'Currency and number formatting', 'Money and numbers read correctly.', 'Any page showing prices or totals.', ['Compare a price on the public course page, the enrolment dialog and the admin payments page.'], 'The same value with the same currency symbol and decimal places appears everywhere.'),
      t('XC-EDGE-023', 'Date and time formatting', 'Dates read correctly and consistently.', 'Any page showing dates, such as live sessions or invoices.', ['Compare the same event date across two pages.'], 'The dates agree and are in a consistent, unambiguous format.'),
    ],
  ),
];
