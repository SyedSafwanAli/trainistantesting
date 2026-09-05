import { t, section } from '../types';

/**
 * Authentication, backed by the Trainistan_Users service.
 *
 * Endpoints exercised here: POST /auth/register, /auth/login, /auth/refresh,
 * /auth/logout, /auth/forgot-password, /auth/reset-password,
 * /auth/resend-verification, GET /auth/verify-email/:token, GET /auth/me, and
 * the Google and Apple OAuth entry points.
 */

export const authSections = [
  section(
    'AUTH-REG',
    'Registration',
    'The /register form, its validation, the account-intent selector and the verification email that follows.',
    [
      t('AUTH-REG-001', 'Registration page loads', 'The register page renders every field.', 'Logged out.', ['Open /register.'], 'Account intent selector, first name, last name, email, password and confirm password all render, along with a submit button.'),
      t('AUTH-REG-002', 'Register a new student', 'A new student account can be created.', 'An email address not already registered.', ['Open /register.', 'Choose the learner/student intent.', 'Fill first name, last name, a fresh email and a valid password twice.', 'Submit.'], 'The account is created and you are taken onward (verification notice, onboarding or dashboard). No error is shown.'),
      t('AUTH-REG-003', 'Register with trainer intent', 'Choosing the trainer intent records a role request.', 'A fresh email address.', ['Open /register.', 'Choose the trainer intent.', 'Complete and submit the form.'], 'The account is created. The account shows as awaiting approval, and the request appears under Admin > Role Requests or Trainer Applications.'),
      t('AUTH-REG-004', 'All fields required', 'Submitting an empty form is rejected.', 'On /register.', ['Press submit with every field blank.'], 'Inline validation errors identify each required field. No account is created.'),
      t('AUTH-REG-005', 'Invalid email rejected', 'A malformed email cannot be registered.', 'On /register.', ['Enter notanemail in the email field.', 'Fill everything else validly and submit.'], 'An email format error appears next to the field and the form does not submit.'),
      t('AUTH-REG-006', 'Password confirmation must match', 'Mismatched passwords are caught.', 'On /register.', ['Enter one password in Password and a different one in Confirm Password.', 'Submit.'], 'A mismatch error appears and the form does not submit.'),
      t('AUTH-REG-007', 'Weak password rejected', 'A password below the minimum strength is refused.', 'On /register.', ['Enter 123 as the password and confirmation.', 'Fill the rest validly and submit.'], 'A password rules message appears and the form does not submit.'),
      t('AUTH-REG-008', 'Duplicate email rejected', 'The same email cannot register twice.', 'You know an email that already has an account.', ['Register with that existing email.'], 'A clear "email already in use" error appears. No second account is created.'),
      t('AUTH-REG-009', 'Password visibility toggle', 'The show/hide password control works.', 'On /register.', ['Type a password.', 'Click the eye icon.', 'Click it again.'], 'The password becomes readable then masked again. The typed value is unchanged.'),
      t('AUTH-REG-010', 'Verification email sent', 'A new account receives a verification email.', 'SMTP configured. A fresh mailbox you control.', ['Register a new account with that mailbox.', 'Check the inbox (and spam).'], 'A verification email arrives with a working link.'),
      t('AUTH-REG-011', 'Verify email link', 'The verification link marks the account verified.', 'A verification email received.', ['Click the link in the email, or open /verify-email/<token>.'], 'A success message appears and the account is marked verified. The verify-email banner disappears from the dashboard.'),
      t('AUTH-REG-012', 'Invalid verification token', 'A bad verification token is refused.', 'Logged out.', ['Open /verify-email/not-a-real-token.'], 'A clear invalid or expired message renders. Nothing is verified.'),
      t('AUTH-REG-013', 'Resend verification', 'An unverified user can request a new verification email.', 'Signed in as an unverified account.', ['Open the dashboard and find the verify-email banner.', 'Use its resend action.'], 'A confirmation appears and a fresh verification email arrives.'),
      t('AUTH-REG-014', 'Link to login from register', 'A registered user can get to sign in from /register.', 'On /register.', ['Click the sign-in link.'], 'The /login page opens.'),
      t('AUTH-REG-015', 'Double submit protection', 'Clicking register twice does not create two accounts.', 'A fresh email address.', ['Fill the form.', 'Click submit twice in quick succession.'], 'Only one account is created. The button disables or shows a loading state after the first click.'),
    ],
  ),

  section(
    'AUTH-LOGIN',
    'Login and session',
    'The /login form, Google sign-in, remember me, token refresh, session persistence and logout.',
    [
      t('AUTH-LOGIN-001', 'Login page loads', 'The login page renders.', 'Logged out.', ['Open /login.'], 'Email, password, remember me, forgot password, submit and Continue with Google all render.'),
      t('AUTH-LOGIN-002', 'Login as Student', 'A student can sign in and lands on their dashboard.', 'A verified student account.', ['Open /login.', 'Enter the student credentials.', 'Submit.'], 'Sign-in succeeds and you land on /student.'),
      t('AUTH-LOGIN-003', 'Login as Trainer', 'A trainer can sign in and lands on their dashboard.', 'An approved trainer account.', ['Sign in with the trainer credentials.'], 'You land on /trainer.'),
      t('AUTH-LOGIN-004', 'Login as Corporate Leader', 'A corporate leader can sign in and lands on their dashboard.', 'A Corp_Leader account.', ['Sign in with the corporate leader credentials.'], 'You land on /corporate.'),
      t('AUTH-LOGIN-005', 'Login as Admin', 'An admin can sign in and lands on the admin dashboard.', 'An Admin account.', ['Sign in with the admin credentials.'], 'You land on /admin.'),
      t('AUTH-LOGIN-006', 'Wrong password rejected', 'A bad password does not sign anyone in.', 'A known email address.', ['Enter the correct email with a deliberately wrong password.', 'Submit.'], 'An invalid-credentials error appears. You stay on /login and no session is created.'),
      t('AUTH-LOGIN-007', 'Unknown email rejected', 'A non-existent account cannot sign in.', 'Logged out.', ['Enter nobody-here@example.com with any password.', 'Submit.'], 'An invalid-credentials error appears. The message does not reveal whether the email exists.'),
      t('AUTH-LOGIN-008', 'Required fields on login', 'Empty login is rejected client-side.', 'On /login.', ['Press submit with both fields blank.'], 'Required-field validation appears and no request is sent.'),
      t('AUTH-LOGIN-009', 'Password visibility toggle', 'The login password can be revealed.', 'On /login.', ['Type a password and click the eye icon twice.'], 'The value toggles between visible and masked.'),
      t('AUTH-LOGIN-010', 'Session persists across refresh', 'A signed-in session survives a page reload.', 'Signed in as any role.', ['Sign in.', 'Press F5 on the dashboard.'], 'You stay signed in and on the same page. You are not bounced to /login.'),
      t('AUTH-LOGIN-011', 'Session persists across a new tab', 'The session is shared between tabs.', 'Signed in.', ['Open the dashboard URL in a second tab of the same browser.'], 'The second tab is already signed in.'),
      t('AUTH-LOGIN-012', 'Logout clears the session', 'Signing out ends the session.', 'Signed in.', ['Use the logout control in the topbar or profile menu.'], 'You are returned to a public page or /login and the header shows logged-out state.'),
      t('AUTH-LOGIN-013', 'Back button after logout', 'A logged-out user cannot get back in with the back button.', 'Just logged out from a dashboard.', ['Press the browser back button.'], 'You are redirected to /login. The dashboard content is not shown.'),
      t('AUTH-LOGIN-014', 'Expired session handling', 'An invalid token sends the user to sign in rather than showing a broken page.', 'Signed in, browser devtools available.', ['Open devtools > Application > Local Storage.', 'Corrupt the stored access and refresh tokens in the trainistan-auth entry.', 'Reload the dashboard and try an action that loads data.'], 'You are redirected to /login rather than left on a page full of failed requests.'),
      t('AUTH-LOGIN-015', 'Token refresh is transparent', 'An expired access token is refreshed without interrupting the user.', 'Signed in and left idle long enough for the access token to expire.', ['Leave the dashboard open past the access token lifetime.', 'Click through to another dashboard page.'], 'The page loads normally. You are not signed out and no error toast appears.'),
      t('AUTH-LOGIN-016', 'Already signed in visiting /login', 'A signed-in user is not shown the login form again.', 'Signed in.', ['Open /login directly.'], 'You are redirected to your dashboard instead of seeing the login form.'),
      t('AUTH-LOGIN-017', 'Continue with Google', 'Google sign-in starts the OAuth flow.', 'Google OAuth configured.', ['Open /login.', 'Click Continue with Google.'], 'You are redirected to the Google consent screen. If OAuth is not configured for this environment, mark this BLOCKED with that note.'),
      t('AUTH-LOGIN-018', 'Google OAuth callback', 'Completing Google sign-in signs the user in.', 'Google OAuth configured and a Google account available.', ['Complete the Google consent flow.'], 'You return to the app signed in and land on the correct dashboard for your role.'),
      t('AUTH-LOGIN-021', 'OAuth callback lands correctly', 'The /auth/oauth-callback page finishes the social sign-in.', 'Google or Apple OAuth configured.', ['Complete a social sign-in and watch the callback screen.'], 'A brief loading state shows, then you land on the dashboard for your role. The callback screen is not left showing a permanent spinner.'),
      t('AUTH-LOGIN-022', 'OAuth callback failure fallback', 'A broken callback does not strand the user.', 'Logged out.', ['Open /auth/oauth-callback directly with no tokens in the URL.'], 'A visible error appears and you are returned to /login. You are not left on a blank loading screen.'),
      t('AUTH-LOGIN-023', 'Continue with Apple', 'Apple sign-in starts its flow.', 'Apple OAuth configured for this environment.', ['Use the Apple sign-in entry point if one is offered.'], 'You are redirected to the Apple flow. If Apple sign-in is not exposed in this build, mark this N/A.'),
      t('AUTH-LOGIN-019', 'Inactive account', 'A deactivated account cannot sign in or is clearly told why.', 'An admin has deactivated a test account.', ['Attempt to sign in as that account.'], 'Sign-in is refused with a clear message, or the account signs in with no access. Record exactly which behaviour you observe.'),
      t('AUTH-LOGIN-020', 'Multiple failed attempts', 'Repeated bad passwords are handled safely.', 'A known email address.', ['Submit the wrong password six times in a row.'], 'Each attempt is refused. The app either rate-limits with a clear message or keeps refusing cleanly. It never signs you in and never crashes.'),
    ],
  ),

  section(
    'AUTH-PWD',
    'Password recovery and change',
    'The /forgot-password and /reset-password/[token] flows and the in-app change password action.',
    [
      t('AUTH-PWD-001', 'Forgot password page loads', 'The recovery page renders.', 'Logged out.', ['Open /forgot-password.'], 'An email field and submit button render.'),
      t('AUTH-PWD-002', 'Request a reset link', 'A reset email is sent for a real account.', 'SMTP configured and a mailbox you control with an account.', ['Enter that email on /forgot-password.', 'Submit.', 'Check the inbox.'], 'A confirmation appears in the app and a reset email arrives with a working link.'),
      t('AUTH-PWD-003', 'Unknown email on reset', 'Requesting a reset for an unknown email does not leak account existence.', 'On /forgot-password.', ['Enter nobody-here@example.com.', 'Submit.'], 'The same neutral confirmation appears as for a real address. The response does not say the account does not exist.'),
      t('AUTH-PWD-004', 'Reset form validation', 'An empty or malformed email is rejected.', 'On /forgot-password.', ['Submit empty.', 'Then submit notanemail.'], 'Required and format validation appear in turn. No request is sent.'),
      t('AUTH-PWD-005', 'Reset password with a valid token', 'The reset link sets a new password.', 'A reset email received.', ['Open the reset link.', 'Enter a new valid password twice.', 'Submit.'], 'A success message appears and you can sign in with the new password.'),
      t('AUTH-PWD-006', 'Old password no longer works', 'The previous password is invalidated by a reset.', 'A password just reset.', ['Sign out.', 'Attempt to sign in with the old password.'], 'Sign-in is refused.'),
      t('AUTH-PWD-007', 'Reset password mismatch', 'Mismatched new passwords are caught.', 'On a valid reset link.', ['Enter two different values in the new password fields.', 'Submit.'], 'A mismatch error appears and nothing is changed.'),
      t('AUTH-PWD-008', 'Invalid reset token', 'A bad reset token is refused.', 'Logged out.', ['Open /reset-password/not-a-real-token.', 'Attempt to set a password.'], 'A clear invalid or expired message renders and no password is changed.'),
      t('AUTH-PWD-009', 'Reused reset token', 'A reset link cannot be used twice.', 'A reset link you have already used.', ['Open the same reset link again.'], 'It is refused as already used or expired.'),
      t('AUTH-PWD-010', 'Change password while signed in', 'A signed-in user can change their own password.', 'Signed in as any role.', ['Open Settings.', 'Use change password with the correct current password and a valid new one.', 'Save.'], 'A success confirmation appears and the new password works on the next sign-in.'),
      t('AUTH-PWD-011', 'Change password with wrong current password', 'The current password is actually verified.', 'Signed in, on Settings.', ['Enter a deliberately wrong current password with a valid new one.', 'Save.'], 'An error appears and the password is not changed.'),
    ],
  ),

  section(
    'AUTH-ONBOARD',
    'Onboarding',
    'The three-step /onboarding flow: profile type, personal info, and terms.',
    [
      t('AUTH-ONBOARD-001', 'Onboarding appears for a new account', 'A newly registered account is taken through onboarding.', 'A freshly registered account that has not onboarded.', ['Sign in with the new account.'], 'The onboarding flow opens at step 1 rather than dropping you straight into a dashboard.'),
      t('AUTH-ONBOARD-002', 'Step indicator', 'The step indicator tracks progress.', 'In onboarding at step 1.', ['Note the indicator.', 'Advance to step 2, then step 3.'], 'The indicator marks completed steps as done and highlights the current one.'),
      t('AUTH-ONBOARD-003', 'Step 1 profile type', 'Choosing a profile type advances the flow.', 'In onboarding at step 1.', ['Select a profile type.', 'Continue.'], 'Step 2 opens with the chosen type retained.'),
      t('AUTH-ONBOARD-004', 'Step 2 personal info validation', 'Step 2 rejects incomplete input.', 'In onboarding at step 2.', ['Press continue with required fields empty.'], 'Inline validation identifies the missing fields and the step does not advance.'),
      t('AUTH-ONBOARD-005', 'Step 2 completes', 'Valid personal info advances to step 3.', 'In onboarding at step 2.', ['Fill every field validly.', 'Continue.'], 'Step 3 opens.'),
      t('AUTH-ONBOARD-006', 'Step 3 terms required', 'Terms must be accepted to finish.', 'In onboarding at step 3.', ['Attempt to finish without accepting terms.'], 'Finishing is blocked until terms are accepted.'),
      t('AUTH-ONBOARD-007', 'Onboarding completion', 'Finishing onboarding lands the user on their dashboard.', 'In onboarding at step 3.', ['Accept terms and finish.'], 'You land on the dashboard matching your role, and onboarding does not reappear on the next sign-in.'),
      t('AUTH-ONBOARD-008', 'Back through onboarding steps', 'A tester can go back and change an answer.', 'In onboarding at step 2 or 3.', ['Use the back control.', 'Change an earlier answer.', 'Continue forward again.'], 'The changed answer is retained and the flow moves forward correctly.'),
      t('AUTH-ONBOARD-009', 'Trainer awaiting approval banner', 'A pending trainer sees their approval status.', 'An account that applied for the Trainer role and is still pending.', ['Sign in with that account.'], 'A clear "under review" banner explains the role request is pending. Trainer-only features are not available yet.'),
      t('AUTH-ONBOARD-010', 'Onboarding refresh recovery', 'Refreshing mid-onboarding does not lose the account.', 'In onboarding at step 2.', ['Press F5.'], 'You remain signed in and are returned to onboarding rather than to an error or a blank page.'),
    ],
  ),
];
