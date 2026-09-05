/**
 * The QA test matrix lives in code, not in the database.
 *
 * It is derived from what the codebase actually contains — every route under
 * src/app, every sidebar entry, every backend controller, every Flutter screen
 * in trainistan_app/lib/features — so it moves with the product. A recorded
 * verdict stores the test's id, section and feature alongside the status, which
 * means an already-submitted report still reads correctly after this file is
 * edited.
 */

export type QaSuite = 'website' | 'app';
export type QaStatus = 'pass' | 'fail' | 'blocked' | 'na';
export type QaSeverity = 'critical' | 'high' | 'medium' | 'low';
export type QaFrequency = 'always' | 'sometimes' | 'once';

export interface QaTest {
  /** Stable identifier, e.g. ADMIN-USERS-001. Uppercase letters, digits, dashes. */
  id: string;
  /** Short name of the thing under test. */
  feature: string;
  /** What the tester is checking, in one or two sentences. */
  what: string;
  /** What must be true before the steps make sense. */
  preconditions: string;
  /** Numbered steps, one action each. */
  steps: string[];
  /** The single observable outcome that decides pass or fail. */
  expected: string;
}

export interface QaSection {
  key: string;
  title: string;
  /** Which part of the product this section covers, for the tester's context. */
  blurb: string;
  tests: QaTest[];
}

export interface QaGroup {
  key: string;
  title: string;
  sections: QaSection[];
}

/** Terse constructor so the matrix files stay readable at a few hundred cases. */
export function t(
  id: string,
  feature: string,
  what: string,
  preconditions: string,
  steps: string[],
  expected: string,
): QaTest {
  return { id, feature, what, preconditions, steps, expected };
}

export function section(
  key: string,
  title: string,
  blurb: string,
  tests: QaTest[],
): QaSection {
  return { key, title, blurb, tests };
}

// ── Recorded verdicts ───────────────────────────────────────────────────────

export interface QaBugForm {
  title: string;
  whatWentWrong: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: QaSeverity;
  frequency: QaFrequency;
  additionalComments?: string;
}

export interface QaBlockedForm {
  reason: string;
  requiredToContinue: string;
  notes?: string;
}

export interface QaResult {
  result_id: string;
  session_id: string;
  test_id: string;
  suite: QaSuite;
  section: string;
  feature: string;
  status: QaStatus;
  comment: string | null;
  bug: {
    title: string;
    what_went_wrong: string;
    steps_to_reproduce: string;
    expected_result: string;
    actual_result: string;
    severity: QaSeverity;
    frequency: QaFrequency;
    additional_comments?: string;
  } | null;
  blocked: {
    reason: string;
    required_to_continue: string;
    notes?: string;
  } | null;
}

export interface QaAttachment {
  attachment_id: string;
  session_id: string;
  test_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface QaSession {
  session_id: string;
  tester_name: string;
  tester_email: string | null;
  status: 'in_progress' | 'website_complete' | 'submitted';
  environment: string | null;
  user_agent: string | null;
  started_at: string;
  website_completed_at: string | null;
  completed_at: string | null;
  final_comments: string | null;
  overall_result: string | null;
  summary: Record<string, any> | null;
}

export interface QaSessionState {
  session: QaSession;
  results: QaResult[];
  attachments: QaAttachment[];
}
