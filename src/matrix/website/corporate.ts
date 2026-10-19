import { t, section } from '../types';

/**
 * Corporate leader dashboard (role Corp_Leader).
 *
 * One section per sidebar entry in
 * src/components/corporate/corporate-sidebar.tsx: Dashboard, Trainees,
 * Departments, Courses, Custom Courses, Messages, Bulk Enroll, Leaderboard,
 * Certificates, Reports, Announcements, Settings.
 */

export const corporateSections = [
  section(
    'CORP-DASH',
    'Corporate: Dashboard and shell',
    'The /corporate overview, sidebar, topbar and mobile navigation.',
    [
      t('CORP-DASH-001', 'Corporate dashboard loads', 'The leader landing page renders.', 'Signed in as a Corp_Leader with an organisation.', ['Open /corporate.'], 'Headcount, enrolment and completion cards render with real numbers.'),
      t('CORP-DASH-002', 'Sidebar shows every corporate entry', 'The sidebar lists all destinations.', 'Signed in as Corp_Leader.', ['Read the sidebar top to bottom.'], 'Dashboard, Trainees, Departments, Courses, Custom Courses, Messages, Bulk Enroll, Leaderboard, Certificates, Reports, Announcements and Settings are all present.'),
      t('CORP-DASH-003', 'Sidebar navigation', 'Every entry opens its page.', 'Signed in as Corp_Leader.', ['Click each sidebar entry in turn.'], 'Each opens the matching page and is highlighted as active.'),
      t('CORP-DASH-004', 'Dashboard reflects the organisation only', 'Data is scoped to this organisation.', 'Two organisations exist with trainees in each.', ['Note the headcount on /corporate as leader A.', 'Compare against the trainee count in Admin > Organizations for that organisation.'], 'The dashboard counts only this organisation, not the whole platform.'),
      t('CORP-DASH-005', 'New organisation empty dashboard', 'An organisation with no trainees shows a sensible empty state.', 'A fresh organisation with no members.', ['Open /corporate as its leader.'], 'Zero values and an invite prompt render, not broken cards.'),
      t('CORP-DASH-006', 'Mobile corporate navigation', 'The corporate shell works on a phone-sized screen.', 'Signed in as Corp_Leader.', ['Narrow the browser to about 390px and move between two pages.'], 'The mobile nav is reachable and no content is cut off horizontally.'),
    ],
  ),

  section(
    'CORP-TRAINEES',
    'Corporate: Trainees',
    'The /corporate/employees page: search, filter, invite, department assignment, deactivate and remove.',
    [
      t('CORP-TRAINEES-001', 'Trainees page loads', 'The trainee list renders.', 'An organisation with at least one trainee.', ['Open /corporate/employees.'], 'Trainees render with name, email, department and progress.'),
      t('CORP-TRAINEES-002', 'Search trainees', 'Search narrows the list.', 'Several trainees.', ['Search part of a trainee name.', 'Then part of an email.'], 'The list narrows correctly for each.'),
      t('CORP-TRAINEES-003', 'Search error handling', 'A failed search is reported, not swallowed.', 'On /corporate/employees.', ['Open devtools, throttle the network to offline, then run a search.'], 'A clear search-failed message appears. The page does not stay stuck on a spinner.'),
      t('CORP-TRAINEES-004', 'Filter by department', 'The department filter restricts the list.', 'Trainees in more than one department.', ['Filter by each department in turn.'], 'Only trainees in that department are shown.'),
      t('CORP-TRAINEES-005', 'Empty trainee state', 'A search matching nothing shows an empty state.', 'On /corporate/employees.', ['Search zzzqqq.'], 'A clear empty state renders.'),
      t('CORP-TRAINEES-006', 'Invite a trainee by email', 'An invitation can be sent.', 'On /corporate/employees.', ['Use the invite action with an email address you control.', 'Send.'], 'A success message appears and the invitation is listed as pending.'),
      t('CORP-TRAINEES-007', 'Invitation email arrives', 'The invited person receives a link.', 'SMTP configured and a mailbox you control.', ['Check that mailbox.'], 'An invitation email arrives with a working /invite link.'),
      t('CORP-TRAINEES-008', 'Invite validation', 'A malformed email is rejected.', 'The invite form open.', ['Enter notanemail.', 'Send.'], 'A format error appears and no invitation is created.'),
      t('CORP-TRAINEES-009', 'Duplicate invitation', 'The same person is not invited twice silently.', 'An email already invited.', ['Invite the same address again.'], 'Either it is refused with a clear message, or the existing invitation is reissued. No duplicate pending row appears.'),
      t('CORP-TRAINEES-010', 'Accepted invitation appears as a trainee', 'Accepting moves the person into the roster.', 'An invitation you accepted in a private window.', ['Reload /corporate/employees.'], 'The person now appears as a trainee rather than a pending invitation.'),
      t('CORP-TRAINEES-011', 'Revoke a pending invitation', 'An invitation can be withdrawn.', 'A pending invitation.', ['Revoke it.'], 'It leaves the pending list and the link no longer works.'),
      t('CORP-TRAINEES-012', 'Assign a trainee to a department', 'Department assignment works.', 'A trainee and at least one department.', ['Assign the trainee to a department.', 'Save.'], 'The trainee row shows the department and the department filter now includes them.'),
      t('CORP-TRAINEES-013', 'Open a trainee detail', 'Individual progress is visible.', 'A trainee with enrolments.', ['Open that trainee.'], 'Their enrolled courses, progress and certificates render.'),
      t('CORP-TRAINEES-014', 'Remove a trainee', 'A trainee can be removed from the organisation.', 'A disposable trainee.', ['Remove them and confirm.'], 'A confirmation is requested, then they disappear from the roster.'),
      t('CORP-TRAINEES-015', 'Only own organisation trainees are visible', 'Cross-organisation data is not exposed.', 'Two organisations with trainees.', ['As leader A, search for a trainee name that belongs to organisation B.'], 'No result is returned.'),
      t('CORP-TRAINEES-016', 'Large roster stays usable', 'A long trainee list is fully reachable.', 'More trainees than fit on one screen.', ['Scroll or page to the end of the list.'], 'All trainees are reachable and no row is duplicated across pages.'),
      t('CORP-TRAINEES-017', 'Remove somebody from the team', 'A leaver can be taken off.', 'A trainee you are willing to remove, ideally one added for this run.', ['Remove them from the team.', 'Reload the list.'], 'They are gone from the roster.'),
      t('CORP-TRAINEES-018', 'The confirmation says what survives', 'Removing a person does not read as deleting them.', 'Starting to remove a trainee.', ['Read the confirmation before accepting.'], 'It says their own account and their learning stay with them, and only their membership of this company ends.'),
      t('CORP-TRAINEES-019', 'A removed person keeps their account', 'Removal does not destroy the learner.', 'The trainee removed above, whose login you have.', ['Sign in as them.'], 'They can still sign in and their own courses are still there.'),
      t('CORP-TRAINEES-020', 'One employee\'s courses', 'A leader can see what one person is on.', 'A trainee enrolled in at least one course.', ['Open that trainee and look at their learning.'], 'Their courses are listed with progress for each.'),
      t('CORP-TRAINEES-021', 'A trainee on nothing', 'Somebody with no courses reads clearly.', 'A trainee with no enrolments.', ['Open their courses.'], 'It says they are on nothing yet, rather than showing an empty box.'),
    ],
  ),

  section(
    'CORP-DEPTS',
    'Corporate: Departments',
    'The /corporate/departments page: create, rename, delete and member counts.',
    [
      t('CORP-DEPTS-001', 'Departments page loads', 'Departments render.', 'Signed in as Corp_Leader.', ['Open /corporate/departments.'], 'Departments render with name and member count, or a clear empty state.'),
      t('CORP-DEPTS-002', 'Create a department', 'A new department can be created.', 'On /corporate/departments.', ['Create a department with a name.', 'Save.'], 'A success message appears and the department joins the list.'),
      t('CORP-DEPTS-003', 'Department name validation', 'An empty name is rejected.', 'The create form open.', ['Save with the name blank.'], 'Validation blocks it and nothing is created.'),
      t('CORP-DEPTS-004', 'Duplicate department name', 'The same name is not created twice.', 'An existing department.', ['Create another with exactly the same name.'], 'Either it is refused, or duplicates are permitted by design. Record which behaviour you see.'),
      t('CORP-DEPTS-005', 'Rename a department', 'A department can be renamed.', 'An existing department.', ['Rename it and save.'], 'The new name shows in the list and in the trainee department filter.'),
      t('CORP-DEPTS-006', 'Delete an empty department', 'An unused department can be removed.', 'A department with no members.', ['Delete it and confirm.'], 'A confirmation is requested, then it disappears.'),
      t('CORP-DEPTS-007', 'Delete a department with members', 'Deleting a populated department is handled safely.', 'A department with at least one trainee.', ['Attempt to delete it.'], 'Either it is refused with a clear message, or the trainees are reassigned or unassigned coherently. No trainee is left pointing at a department that no longer exists.'),
      t('CORP-DEPTS-008', 'Member counts are correct', 'The count matches the roster.', 'A department with known members.', ['Compare the count against the filtered trainee list.'], 'The two agree.'),
    ],
  ),

  section(
    'CORP-COURSES',
    'Corporate: Courses and bulk enrolment',
    'The /corporate/courses catalogue and the /corporate/bulk-enroll flow.',
    [
      t('CORP-COURSES-001', 'Corporate courses page loads', 'The catalogue available to the organisation renders.', 'Signed in as Corp_Leader.', ['Open /corporate/courses.'], 'Courses render with title, trainer and price.'),
      t('CORP-COURSES-002', 'Search corporate courses', 'Search narrows the catalogue.', 'On /corporate/courses.', ['Search part of a known course title.'], 'Only matching courses remain.'),
      t('CORP-COURSES-003', 'Filter corporate courses', 'Filters restrict the catalogue.', 'On /corporate/courses.', ['Apply each filter present.'], 'The list narrows accordingly. If there are no filters, mark this N/A.'),
      t('CORP-COURSES-004', 'Open a course from corporate', 'A course detail can be inspected.', 'On /corporate/courses.', ['Click a course.'], 'Its description, curriculum and price render.'),
      t('CORP-COURSES-005', 'Bulk enroll page loads', 'The bulk enrolment flow renders.', 'Signed in as Corp_Leader.', ['Open /corporate/bulk-enroll.'], 'A course picker and a trainee picker both render.'),
      t('CORP-COURSES-006', 'Search courses in bulk enroll', 'The course search narrows the picker.', 'On /corporate/bulk-enroll.', ['Search a course title in the course search box.'], 'The picker narrows to matching courses.'),
      t('CORP-COURSES-007', 'Search trainees in bulk enroll', 'The trainee search narrows the picker.', 'On /corporate/bulk-enroll.', ['Search a trainee name or email in the trainee search box.'], 'The picker narrows to matching trainees.'),
      t('CORP-COURSES-008', 'Select multiple trainees', 'Several trainees can be selected at once.', 'At least three trainees.', ['Select three trainees.'], 'All three show as selected and a running count is shown.'),
      t('CORP-COURSES-009', 'Select all trainees', 'A select-all control works.', 'On /corporate/bulk-enroll.', ['Use select all, then clear the selection.'], 'Every visible trainee is selected then deselected. If there is no select-all, mark this N/A.'),
      t('CORP-COURSES-010', 'Bulk enroll with nothing selected', 'The action is blocked without a selection.', 'On /corporate/bulk-enroll.', ['Press enroll with no course or no trainee selected.'], 'The action is blocked with a clear message. Nothing is enrolled.'),
      t('CORP-COURSES-011', 'Complete a bulk enrolment', 'Selected trainees are enrolled.', 'A course and three selected trainees.', ['Confirm the bulk enrolment.'], 'A success message reports how many were enrolled, and each trainee shows the course in their own My Courses.'),
      t('CORP-COURSES-012', 'Bulk enroll an already-enrolled trainee', 'Duplicates are handled.', 'A trainee already enrolled in the chosen course.', ['Include them in a bulk enrolment for that course.'], 'They are skipped or reported as already enrolled. No duplicate enrolment or double charge occurs.'),
      t('CORP-COURSES-013', 'Bulk enrolment cost is reported', 'A paid bulk enrolment shows the total.', 'A paid course and several trainees selected.', ['Proceed to the confirmation step.'], 'The total cost is shown before you commit.'),
      t('CORP-COURSES-014', 'Cancel a bulk enrolment', 'Cancelling enrols nobody.', 'A bulk enrolment set up but not confirmed.', ['Cancel out of the flow.'], 'No enrolments are created and nothing is charged.'),
    ],
  ),

  section(
    'CORP-CUSTOM',
    'Corporate: Custom courses',
    'The /corporate/custom-courses request flow and the /corporate/custom-courses/[courseId] detail.',
    [
      t('CORP-CUSTOM-001', 'Custom courses page loads', 'Existing custom course requests render.', 'Signed in as Corp_Leader.', ['Open /corporate/custom-courses.'], 'Requests render with status and trainer, or a clear empty state.'),
      t('CORP-CUSTOM-002', 'Search trainers for a custom course', 'The trainer search narrows the picker.', 'On /corporate/custom-courses.', ['Search a trainer name.'], 'The picker narrows to matching trainers.'),
      t('CORP-CUSTOM-003', 'Raise a custom course request', 'A request can be submitted.', 'On /corporate/custom-courses.', ['Choose a trainer.', 'Fill the brief and any required fields.', 'Submit.'], 'A success message appears and the request is listed as pending.'),
      t('CORP-CUSTOM-004', 'Custom request validation', 'An incomplete request is rejected.', 'The request form open.', ['Submit with the brief empty.'], 'Validation blocks it and nothing is created.'),
      t('CORP-CUSTOM-005', 'Trainer receives the request', 'The named trainer sees it.', 'A request you just raised.', ['Sign in as that trainer.', 'Open /trainer/custom-requests.'], 'The request appears with your organisation and brief.'),
      t('CORP-CUSTOM-006', 'Trainer response is visible', 'The leader sees accept or decline.', 'A request the trainer has responded to.', ['Reopen /corporate/custom-courses.'], 'The status reflects the trainer response.'),
      t('CORP-CUSTOM-007', 'Open a custom course detail', 'The detail page renders.', 'An existing custom course.', ['Open /corporate/custom-courses/<id>.'], 'The brief, trainer, status and any curriculum render.'),
      t('CORP-CUSTOM-008', 'Cancel a custom request', 'A pending request can be withdrawn.', 'A pending request.', ['Cancel it and confirm.'], 'A confirmation is requested, then the request is cancelled and the trainer sees it withdrawn.'),
    ],
  ),

  section(
    'CORP-REPORTS',
    'Corporate: Leaderboard, certificates, reports, messages, announcements, settings',
    'The remaining corporate pages: /corporate/leaderboard, /corporate/certificates, /corporate/reports, /corporate/messages, /corporate/announcements and /corporate/settings.',
    [
      t('CORP-REPORTS-001', 'Leaderboard loads', 'The trainee leaderboard renders.', 'An organisation with trainees who have progress.', ['Open /corporate/leaderboard.'], 'Trainees are ranked with their scores or completion counts.'),
      t('CORP-REPORTS-002', 'Search the leaderboard', 'Search narrows the ranking.', 'On /corporate/leaderboard.', ['Search a trainee name.'], 'Only matching trainees remain, with their ranks intact.'),
      t('CORP-REPORTS-003', 'Filter the leaderboard by department', 'The department filter restricts the ranking.', 'Trainees across two departments.', ['Filter by one department.'], 'Only that department is ranked.'),
      t('CORP-REPORTS-004', 'Leaderboard ordering', 'Ranking is genuinely ordered.', 'Trainees with different progress.', ['Read the scores down the table.'], 'Scores descend and the rank numbers agree with the order.'),
      t('CORP-REPORTS-005', 'Empty leaderboard', 'No progress shows an empty state.', 'An organisation whose trainees have no progress.', ['Open /corporate/leaderboard.'], 'A clear empty or zero state renders.'),
      t('CORP-REPORTS-006', 'Corporate certificates page loads', 'Certificates earned by trainees render.', 'A trainee with a certificate.', ['Open /corporate/certificates.'], 'Certificates render with trainee name, course and issue date.'),
      t('CORP-REPORTS-007', 'Search certificates', 'Search by name or course narrows the list.', 'Several certificates.', ['Search a trainee name.', 'Then a course name.'], 'The list narrows correctly for each.'),
      t('CORP-REPORTS-008', 'Download a trainee certificate', 'A certificate can be downloaded from corporate.', 'A listed certificate.', ['Download it.'], 'The file downloads and names the correct trainee and course.'),
      t('CORP-REPORTS-009', 'Reports page loads', 'Organisation reports render.', 'Signed in as Corp_Leader.', ['Open /corporate/reports.'], 'Completion, engagement and enrolment reporting renders with real numbers.'),
      t('CORP-REPORTS-010', 'Report filters', 'Date or department filters change the report.', 'On /corporate/reports.', ['Apply each filter present.'], 'The report re-renders for the new scope.'),
      t('CORP-REPORTS-011', 'Export a report', 'A report can be exported.', 'On /corporate/reports.', ['Use the export or download action.'], 'A file downloads and opens with the reported data in it.'),
      t('CORP-REPORTS-012', 'Export with no data', 'Exporting an empty report is handled.', 'A filter that produces no rows.', ['Export it.'], 'Either an empty file with headers downloads, or a clear message explains there is nothing to export. Nothing crashes.'),
      t('CORP-REPORTS-013', 'Corporate messages page loads', 'Conversations render.', 'Signed in as Corp_Leader.', ['Open /corporate/messages.'], 'Conversations render, or a clear empty state.'),
      t('CORP-REPORTS-014', 'Message a trainee', 'A leader can message a trainee.', 'A trainee in the organisation.', ['Open a thread with that trainee and send a message.'], 'The message appears in the thread and reaches the trainee.'),
      t('CORP-REPORTS-015', 'Corporate announcements page loads', 'Organisation announcements render.', 'Signed in as Corp_Leader.', ['Open /corporate/announcements.'], 'Announcements render, or a clear empty state.'),
      t('CORP-REPORTS-016', 'Create a corporate announcement', 'A leader can announce to their organisation.', 'On /corporate/announcements.', ['Create an announcement with title and body.', 'Publish.'], 'A success message appears and trainees in the organisation see it.'),
      t('CORP-REPORTS-017', 'Corporate announcement scope', 'The announcement does not leak outside the organisation.', 'An announcement published for organisation A.', ['Sign in as a student in organisation B, or an unaffiliated student.'], 'They do not see organisation A announcement.'),
      t('CORP-REPORTS-018', 'Delete a corporate announcement', 'An announcement can be removed.', 'A disposable corporate announcement.', ['Delete it and confirm.'], 'It disappears for the leader and for trainees.'),
      t('CORP-REPORTS-019', 'Corporate settings page loads', 'Organisation settings render.', 'Signed in as Corp_Leader.', ['Open /corporate/settings.'], 'Organisation name, logo, contact and preference fields render.'),
      t('CORP-REPORTS-020', 'Update organisation settings', 'Settings changes persist.', 'On /corporate/settings.', ['Change the organisation name.', 'Save.', 'Refresh.'], 'A success message appears and the new name persists across the corporate pages.'),
      t('CORP-REPORTS-021', 'Corporate settings validation', 'Invalid settings are rejected.', 'On /corporate/settings.', ['Clear a required field, or enter an invalid email.', 'Save.'], 'A validation error appears and nothing invalid is saved.'),
      t('CORP-REPORTS-022', 'Upload an organisation logo', 'A logo can be uploaded.', 'On /corporate/settings.', ['Upload a PNG or JPG logo.', 'Save.'], 'The logo uploads and renders in the corporate shell.'),
    ],
  ),

  section(
    'CORP-ATTENTION',
    'Corporate: What needs the leader',
    'The panel that names what a leader has to act on. Their dashboard reported averages for a long time, which could say a team was at twelve per cent without ever saying that four of the six had never opened a course. Each line here should be a thing somebody can do something about today.',
    [
      t('CORP-ATTENTION-001', 'The panel is present', 'A leader is told what is waiting.', 'Signed in as a corporate leader with a team.', ['Open the corporate management screen.'], 'A panel names what needs attention, above the management tools rather than buried under them.'),
      t('CORP-ATTENTION-002', 'Unaccepted invitations are counted', 'Invitations nobody took up are surfaced.', 'At least one invitation sent and not accepted.', ['Read the panel.'], 'It names how many invitations are still unaccepted.'),
      t('CORP-ATTENTION-003', 'People with no course are named', 'Employees nobody enrolled are surfaced.', 'At least one trainee with no enrolment.', ['Read the panel.'], 'It gives a count, and names some of them rather than only a number.'),
      t('CORP-ATTENTION-004', 'Enrolled but never started', 'People sitting on an unopened course are surfaced.', 'A trainee enrolled who has opened nothing.', ['Read the panel.'], 'They are counted separately from people with no course at all. The two are different problems.'),
      t('CORP-ATTENTION-005', 'Delivered work awaiting acceptance', 'Commissioned courses that need a decision are surfaced.', 'A custom course a trainer has delivered.', ['Read the panel.'], 'It is listed as waiting for the leader.'),
      t('CORP-ATTENTION-006', 'The lines go somewhere', 'Each item leads to the screen that fixes it.', 'A panel with at least one item.', ['Follow each line in turn.'], 'Each opens the screen where that thing is dealt with.'),
      t('CORP-ATTENTION-007', 'Nothing waiting', 'A clear company shows no panel or an empty one.', 'A company with no invitations pending, everybody enrolled and started, nothing delivered.', ['Open the management screen.'], 'The panel is absent or says plainly that nothing needs attention. It does not show zeroes as though they were work.'),
      t('CORP-ATTENTION-008', 'The counts are true', 'The panel agrees with the lists.', 'A panel showing counts.', ['Check each count against the matching list, such as invitations or the roster.'], 'Each number matches what the list actually holds.'),
    ],
  ),

  section(
    'CORP-TRAINREQ',
    'Corporate: Asking Trainistan to build a course',
    'The second way to commission work, and the one for a company that does not know which trainer it wants. A custom course makes the customer pick a trainer and settle the brief with them; this hands the whole job to Trainistan. The two are separate queues and the screens should not blur them.',
    [
      t('CORP-TRAINREQ-001', 'The screen is reachable', 'A leader can find where to ask.', 'Signed in as a corporate leader.', ['Find and open the request screen from the corporate area.'], 'It opens, and it is distinguishable from custom courses.'),
      t('CORP-TRAINREQ-002', 'The difference is explained', 'The two ways of commissioning are told apart.', 'On that screen.', ['Read the wording.'], 'It says this one is for when you do not already have a trainer in mind, and points at custom courses for when you do.'),
      t('CORP-TRAINREQ-003', 'Send a request', 'A brief can be submitted.', 'On that screen.', ['Fill in the topic, level, number of learners and timing.', 'Send.'], 'It is accepted and appears in the list with a status.'),
      t('CORP-TRAINREQ-004', 'Too short a brief is refused', 'A one-word topic is not accepted.', 'On the form.', ['Enter a very short topic such as "sql".', 'Send.'], 'It asks for more rather than sending. The message says what is wrong, before the send rather than after.'),
      t('CORP-TRAINREQ-005', 'Only the company sees its own', 'Requests do not leak between companies.', 'Two companies, each with a request.', ['As leader A, read the list.'], 'Only A\'s requests are listed.'),
      t('CORP-TRAINREQ-006', 'Admin receives it', 'The request reaches the queue.', 'A request just sent.', ['As an admin, open Admin > Training requests.'], 'It is listed, stamped with the company that sent it.'),
      t('CORP-TRAINREQ-007', 'A status change reaches the company', 'Progress is visible to whoever asked.', 'As an admin on that request.', ['Move it to in progress or matched.', 'Return to the company account and read the list.'], 'The new status shows there.'),
      t('CORP-TRAINREQ-008', 'Nothing asked for yet', 'An empty list reads sensibly.', 'A company that has sent none.', ['Open the screen.'], 'It explains what the screen is for rather than showing a blank page.'),
    ],
  ),
];
