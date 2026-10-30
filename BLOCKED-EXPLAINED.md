# The blocked cases, in plain words

There are 119 and the number is misleading. It reads like 119 problems. It is
fifteen reasons, and seven of them are already solved.

**54 of the 119 need nobody and nothing new.** The fixture, the account or the
card they were waiting for was built on 28 October, or the thing blocking them
was a bug that has since been fixed and deployed. They were recorded as blocked
before that and nobody has been back to them since.

The other 65 are each waiting on exactly one thing from outside, and this
document says what that thing is. **None of them is waiting on code.**

Six cases were removed from the catalogue rather than explained, because they
were not worth keeping. The reason for each is written beside the gap it left
in `src/matrix`.

## What is waiting on what

| Cases | Waiting on | Who is needed |
|---|---|---|
| 8 | Run these now: the thing to destroy already exists | nobody, run it |
| 10 | Run these now: an account with nothing in it | nobody, run it |
| 4 | Run these now: the test card | nobody, run it |
| 8 | Run these now on the phone: the quiz runner is reachable again | nobody, run it |
| 8 | Run these now on the phone: a session with no course attached | nobody, run it |
| 4 | Run these now on the phone: the batch has a learner in it | nobody, run it |
| 6 | Run these now: one each | nobody, run it |
| 6 | Needs two accounts signed in at once, which is not the same as two people | nobody, two profiles |
| 16 | Needs one batch signed off, and then all sixteen open at once | you, one decision |
| 10 | Needs the PayPal sandbox buyer login | a login |
| 8 | Needs access to a mailbox that receives platform mail | a mailbox |
| 12 | Genuinely needs a second person in the room at the same time | a second person |
| 12 | Needs a second organisation and trainees with real progress | a second company |
| 6 | Needs the phone on a USB cable | a cable |
| 1 | Needs social sign-in switched on for UAT | a decision |

Totals: **48 ready to run**, 6 that need a second browser profile, and 65
waiting on one thing each from outside.

## Run these now: the thing to destroy already exists

**8 cases.** Each of these waited on something safe to delete, hide or approve. Those were built on 28 October and are sitting there: `qa.delete.me`, `qa.hide.me`, the course QA Delete Me Course, a pending skill request, a trainer application, a Trainer role request. Nobody else is needed.

- `ADMIN-USERS-018` **Delete a user.** Confirming actually deletes.
- `ADMIN-USERS-019` **Deleted user cannot sign in.** A deleted account is really gone.
- `ADMIN-COURSES-011` **Delete a course.** Confirming removes the course.
- `ADMIN-COURSES-012` **Course with enrolments is protected.** Deleting an enrolled course is handled safely.
- `ADMIN-ROLEREQ-005` **Approve a role request.** Approval grants the role.
- `ADMIN-ROLEREQ-006` **Approved user gains access.** The promoted user can reach their new dashboard.
- `ADMIN-TRAINERAPP-005` **Approve an application.** Approval creates or promotes the trainer.
- `PERM-DATA-010` **Hidden user is invisible publicly but intact internally.** Hiding is presentation only.

## Run these now: an account with nothing in it

**10 cases.** These check that a screen with no data says so instead of looking broken. They were blocked because every account in the environment has data in it. `qa.blank.learner@example.test` exists for exactly this and has nothing at all. Sign in as it and read the screen. Do not enrol it, message from it or write a note as it, or these stop being testable.

- `TR-DASH-005` **Dashboard with no data.** A brand new trainer sees a sensible empty state.
- `TR-COURSES-003` **Empty course list.** A trainer with no courses sees an empty state.
- `CORP-DASH-005` **New organisation empty dashboard.** An organisation with no trainees shows a sensible empty state.
- `ST-OTHER-023` **Empty announcements state.** No announcements shows an empty state.
- `TR-PAYOUT-012` **A trainer with no earnings.** An empty earnings page is sensible.
- `CORP-TRAINREQ-008` **Nothing asked for yet.** An empty list reads sensibly.
- `CORP-ATTENTION-007` **Nothing waiting.** A clear company shows no panel or an empty one.
- `APP-ASSESS-002` **Assessments empty state.** Nothing due shows an empty state.
- `APP-CHAT-002` **Chat empty state.** No conversations shows an empty state.
- `APP-CORP-019` **Nothing waiting.** A clear company shows no panel.

## Run these now: the test card

**4 cases.** Card payment was blocked on not wanting to take a real payment. The Stripe test card works on UAT and was proved on the Android app on 28 October: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP. For the declined case, `4000 0000 0000 0002`.

- `ST-BROWSE-010` **Insufficient wallet balance.** A wallet payment beyond the balance is refused.
- `ST-BROWSE-012` **Pay by card.** The Stripe card flow completes.
- `ST-BROWSE-013` **Declined card.** A declined card does not enrol the student.
- `ST-BROWSE-017` **Payment receipt.** A paid enrolment produces a receipt.

## Run these now on the phone: the quiz runner is reachable again

**8 cases.** These were blocked because the app would not let a learner back into a quiz once attempted, so the runner itself could not be reached. The Retake button added on 28 October opens it. Everything here is one person on one phone.

- `APP-ASSESS-005` **Attach a file to a submission.** The file picker works.
- `APP-ASSESS-008` **Answer and advance.** Answers are retained across questions.
- `APP-ASSESS-009` **Quiz timer on mobile.** The per-question timer is enforced.
- `APP-ASSESS-010` **Submit a quiz.** The quiz can be submitted and scored.
- `APP-ASSESS-011` **Backgrounding mid-quiz.** Leaving the app during a quiz is handled.
- `APP-ASSESS-014` **A quiz that has not opened yet.** A future quiz is visible but not startable.
- `APP-ASSESS-015` **A quiz that is open with a deadline.** An open quiz shows when it shuts.
- `APP-ASSESS-020` **The marking is shown question by question.** A learner can see what they got wrong.

## Run these now on the phone: a session with no course attached

**8 cases.** Camera, microphone, speaker, switching camera and leaving are all things a host can check alone. They were blocked only because every session belonged to a course, and joining one as a learner needed somebody to host it. The session QA app session 28 Oct has no course attached, so the host can enter their own room and test their own devices.

- `APP-LIVE-003` **Camera and microphone permission.** Device permissions are requested before joining.
- `APP-LIVE-004` **Join a live session.** The Agora room connects.
- `APP-LIVE-005` **Mute and unmute.** Audio control works on device.
- `APP-LIVE-006` **Camera on and off.** Video control works on device.
- `APP-LIVE-007` **Switch front and rear camera.** Camera switching works.
- `APP-LIVE-008` **Speaker and earpiece.** Audio routing works.
- `APP-LIVE-010` **Backgrounding during a call.** Leaving the app mid-call is handled.
- `APP-LIVE-011` **Leave a session.** Leaving is clean.

## Run these now on the phone: the batch has a learner in it

**4 cases.** Signing a batch off needs a batch with somebody in it who finished. The batch QA app paid batch 28 Oct, on the course Mollitia obcaecati m, has one. The chain runs: sign off, leave somebody out, try it twice, then approve as admin.

- `APP-TRAINER-019` **Sign a batch off.** The trainer says who passed.
- `APP-TRAINER-020` **Leaving a learner out of the sign-off.** Somebody who did not finish stays out.
- `APP-TRAINER-021` **Only one pending request per batch.** A batch cannot be signed off twice at once.
- `APP-TRAINER-022` **Approval reaches the learners.** Admin approval is what completes people.

## Run these now: one each

**6 cases.** Six that have nothing in common except that the thing holding them up is gone. ST-OTHER-005 became testable the moment the double-booking bug was fixed and deployed. The two upload cases need any image file. ST-LIVE-013 is about refusing the browser's camera prompt, which needs nobody else.

- `ST-OTHER-005` **Double booking the same slot.** A slot cannot be booked twice.
- `XC-RECENT-001` **Browser push registers.** The website can get a push token.
- `TR-OTHER-024` **Upload a trainer avatar.** An avatar can be uploaded.
- `CORP-REPORTS-022` **Upload an organisation logo.** A logo can be uploaded.
- `TR-PAYOUT-013` **Payout details.** Where the money should go can be recorded.
- `ST-LIVE-013` **Denied camera permission.** Refusing device access is explained.

## Needs two accounts signed in at once, which is not the same as two people

**6 cases.** These were recorded as needing a second person and that reading was wrong. Messages arriving without a refresh, presence turning green, and a deletion showing up elsewhere all need two accounts signed in at the same time, not two humans. Open a second Chrome profile, or one normal window and one incognito, sign in as a different account in each, and put them side by side. Worth doing, because this is the websocket path and nothing else in the run covers it.

- `TR-OTHER-009` **Receive a message live.** Incoming messages arrive without refresh.
- `TR-OTHER-012` **Group conversation.** Course group chat works.
- `ST-OTHER-010` **Receive a reply live.** Replies arrive without refresh.
- `APP-CHAT-005` **Receive a message live.** Incoming messages arrive over the socket.
- `APP-CHAT-006` **Online and offline presence.** Presence markers update.
- `APP-CHAT-011` **Deleted message.** A message deleted elsewhere is reflected.

## Needs one batch signed off, and then all sixteen open at once

**16 cases.** This is the largest block in the run and it has a single cause. Nothing exists to pay out, so the trainer has nothing to claim, so the admin queue is empty, so neither the eight admin cases nor the eight trainer cases have anything to act on. The moment one batch is signed off and one payout is requested, the whole chain becomes testable in one sitting. Payoneer is built as the method; sending automatically still needs partner API credentials, but that is a separate case and does not block these.

- `ADMIN-PAYOUTS-001` **Payouts page loads.** The payout queue renders.
- `ADMIN-PAYOUTS-002` **Pending requests are separated.** What is waiting is distinguishable from what is done.
- `ADMIN-PAYOUTS-003` **Open one request.** A request shows its detail.
- `ADMIN-PAYOUTS-004` **Mark it paid.** Settling records a reference.
- `ADMIN-PAYOUTS-005` **Upload a receipt.** Proof can be attached.
- `ADMIN-PAYOUTS-006` **Reject a request.** A request can be refused.
- `ADMIN-PAYOUTS-007` **A settled payout cannot be settled again.** Paying twice is prevented.
- `ADMIN-PAYOUTS-008` **Totals agree with the list.** Any headline figure matches the rows.
- `TR-PAYOUT-004` **A claimable batch is offered.** Finished work can be claimed.
- `TR-PAYOUT-005` **Request a payout.** A request is created.
- `TR-PAYOUT-006` **The same batch cannot be claimed twice.** A claimed batch leaves the list.
- `TR-PAYOUT-007` **Admin sees the request.** The request reaches the queue.
- `TR-PAYOUT-008` **Admin settles it.** Marking it paid records a reference.
- `TR-PAYOUT-009` **The trainer sees it settled.** The decision reaches the trainer.
- `TR-PAYOUT-010` **Payout receipt.** A paid payout produces a receipt.
- `TR-PAYOUT-011` **A refused request says so.** A rejection is visible to the trainer.

## Needs the PayPal sandbox buyer login

**10 cases.** Every one of these stops at the same screen: PayPal's own sign-in. Without a sandbox buyer account there is no way past it, and nothing on our side gets further. One login opens all ten, the two wallet top-up cases included.

- `ST-PAY-004` **The amount at PayPal matches the course.** PayPal is asked for the right amount.
- `ST-PAY-005` **PayPal returns you to the capture page.** The return address is the page that completes the payment.
- `ST-PAY-006` **A PayPal purchase enrols the student.** An approved PayPal payment produces an enrolment.
- `ST-PAY-008` **Capturing twice does not charge twice.** The capture page is safe to reload.
- `ST-PAY-010` **Top up the wallet through PayPal.** A wallet top-up completes.
- `ST-PAY-011` **Top-up shows in the wallet history.** The transaction is recorded.
- `ST-PAY-012` **Spend the credit.** Credit bought through PayPal can be spent.
- `ST-PAY-013` **Receipt for a PayPal purchase.** A PayPal payment produces a receipt.
- `ST-PAY-015` **Signed out part way through.** A payment started while signed in does not strand the buyer.
- `ST-OTHER-018` **Top up the wallet.** Funds can be added.

## Needs access to a mailbox that receives platform mail

**8 cases.** These check whether an email actually arrives: a confirmation, a receipt, a reset code, and the five settings cases about turning sending off and back on. The platform sends them; nobody here can see where they land. Access to one real mailbox that platform mail reaches settles all eight. Three of the settings cases are about mail that must still arrive while sending is off, so they cannot be reasoned about, only observed.

- `ADMIN-SETTINGS-015` **An ordinary email stops.** A notification email is not sent while off.
- `ADMIN-SETTINGS-016` **Password reset still arrives.** A code email ignores the switch.
- `ADMIN-SETTINGS-017` **Verification still arrives.** Registration email ignores the switch too.
- `ADMIN-SETTINGS-019` **Turn email back on.** Sending resumes.
- `ADMIN-SETTINGS-020` **In-app notifications are unaffected.** Stopping email does not stop notifications.
- `ST-BROWSE-007` **Enrol in a free course.** A free course enrols without payment.
- `ST-BROWSE-016` **Enrolment confirmation email.** Enrolling sends a confirmation.
- `ST-OTHER-004` **Booking confirmation email.** A booking sends a confirmation.

## Genuinely needs a second person in the room at the same time

**12 cases.** There is no way round this one and it should not be attempted alone. Joining through the API registers an attendee but publishes no video, which is how an earlier round produced a confident wrong answer. Two-way video, screen share, in-session chat, the participant list and being ended on all need somebody else actually in the room. Ten minutes with a second person clears all twelve.

- `TR-LIVE-011` **Student joins and both see each other.** Two-way video works.
- `TR-LIVE-014` **Screen share.** The trainer can share a screen.
- `TR-LIVE-015` **In-session chat.** Chat inside the room works.
- `TR-LIVE-016` **Participant list.** The room shows who is present.
- `ST-LIVE-004` **Enter the student lobby.** The lobby opens before joining.
- `ST-LIVE-005` **Join a live session.** The student can join the room.
- `ST-LIVE-007` **Mute and camera controls.** The student can control their own devices.
- `ST-LIVE-008` **In-session chat.** The student can chat in the room.
- `ST-LIVE-009` **Leave a session.** Leaving returns the student to the app.
- `ST-LIVE-010` **Trainer ends the session.** The student is removed cleanly.
- `APP-LIVE-009` **Another participant joins.** Multi-party video works.
- `APP-LIVE-012` **Trainer ends the session.** The app handles being ended on.

## Needs a second organisation and trainees with real progress

**12 cases.** The corporate side is built, but the environment has one company with little activity in it. So a leaderboard has nothing to rank, a certificates page has nothing to list, and the case about requests not leaking between companies has no second company to leak to. One more organisation with its own leader login, plus a few trainees who have finished something, covers all twelve.

- `CORP-TRAINEES-014` **Remove a trainee.** A trainee can be removed from the organisation.
- `CORP-TRAINEES-019` **A removed person keeps their account.** Removal does not destroy the learner.
- `CORP-COURSES-004` **Open a course from corporate.** A course detail can be inspected.
- `CORP-COURSES-008` **Select multiple trainees.** Several trainees can be selected at once.
- `CORP-COURSES-012` **Bulk enroll an already-enrolled trainee.** Duplicates are handled.
- `CORP-REPORTS-003` **Filter the leaderboard by department.** The department filter restricts the ranking.
- `CORP-REPORTS-004` **Leaderboard ordering.** Ranking is genuinely ordered.
- `CORP-REPORTS-006` **Corporate certificates page loads.** Certificates earned by trainees render.
- `CORP-REPORTS-007` **Search certificates.** Search by name or course narrows the list.
- `CORP-REPORTS-008` **Download a trainee certificate.** A certificate can be downloaded from corporate.
- `CORP-TRAINREQ-005` **Only the company sees its own.** Requests do not leak between companies.
- `APP-CORP-016` **Organisation scoping on mobile.** A leader sees only their own organisation.

## Needs the phone on a USB cable

**6 cases.** Each of these cuts the phone's network on purpose: launching offline, losing connection mid-session, recovering afterwards, a slow video, sending a chat with no signal, a bad call. The handset is driven over wireless debugging, so cutting its network cuts the test itself. On 28 October marking the wifi metered to simulate this took the device off adb and lost it for the rest of the session. A cable fixes it. Do not try these without one.

- `APP-EDGE-001` **Offline on launch.** Launching with no network is handled.
- `APP-EDGE-002` **Going offline mid-session.** Losing connection is communicated.
- `APP-EDGE-003` **Recovery when the network returns.** The app recovers automatically or on retry.
- `APP-LEARN-013` **Player on a slow connection.** Buffering is communicated.
- `APP-CHAT-012` **Chat after losing connection.** Sending offline is handled.
- `APP-LIVE-015` **Poor network during a call.** Degraded connectivity is communicated.

## Needs social sign-in switched on for UAT

**1 case.** Social sign-in is in the code, on both the login and register pages. This case follows the callback after Google hands the browser back. It is blocked because the provider is not configured on UAT, so the flow cannot be started at all. Configuring it, or deciding social sign-in is not shipping, settles it either way.

- `AUTH-LOGIN-021` **OAuth callback lands correctly.** The /auth/oauth-callback page finishes the social sign-in.

## The order worth doing them in

1. **The 48 that need nobody.** They are the cheapest, and they are what makes
   the blocked count look like what it really is.
2. **The 6 on two browser profiles.** Fifteen minutes, and they cover the
   websocket path that nothing else reaches.
3. **One batch signed off.** One decision opens 16 cases, more than any other
   single action in this list.
4. **Ten minutes with a second person in a live room.** That is 12.
5. **The PayPal buyer, one mailbox, and a second organisation.** Three
   requests, 30 cases.
6. **The phone on a cable.** 6 cases, and do not attempt them without it.

Done in that order the blocked count goes 119, 71, 65, 49, 37, 7, 0, and only
the last two steps need anybody other than the tester.

## Where the longer reason on each row lives

Every one of these rows carries a fuller note in the Google Sheet, column I,
written on 28 October. The tracker could not show them because its read-back
returned statuses only. That is fixed now and needs the reader key set as a
script property on the Apps Script project. Until that is deployed, the sheet
itself is where they are read.
