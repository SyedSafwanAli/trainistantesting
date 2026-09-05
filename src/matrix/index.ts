import type { QaSection, QaSuite, QaTest } from './types';
import { publicSections } from './website/public';
import { authSections } from './website/auth';
import { adminSections } from './website/admin';
import { trainerSections } from './website/trainer';
import { studentSections } from './website/student';
import { corporateSections } from './website/corporate';
import { crossSections } from './website/cross';
import { appSections } from './app';

/**
 * Website testing comes first and app testing is gated behind it, so the order
 * here is the order the tester works through: public site, then authentication,
 * then each role, then the cross-role concerns that need more than one account
 * set up.
 */
export const WEBSITE_SECTIONS: QaSection[] = [
  ...publicSections,
  ...authSections,
  ...adminSections,
  ...trainerSections,
  ...studentSections,
  ...corporateSections,
  ...crossSections,
];

export const APP_SECTIONS: QaSection[] = appSections;

export function sectionsFor(suite: QaSuite): QaSection[] {
  return suite === 'website' ? WEBSITE_SECTIONS : APP_SECTIONS;
}

export const WEBSITE_TESTS: QaTest[] = WEBSITE_SECTIONS.flatMap((s) => s.tests);
export const APP_TESTS: QaTest[] = APP_SECTIONS.flatMap((s) => s.tests);

export const WEBSITE_TOTAL = WEBSITE_TESTS.length;
export const APP_TOTAL = APP_TESTS.length;

/** test_id -> the section it belongs to, for rendering a stored result. */
export const TEST_INDEX: Map<string, { suite: QaSuite; section: QaSection; test: QaTest }> =
  (() => {
    const index = new Map<string, { suite: QaSuite; section: QaSection; test: QaTest }>();
    for (const [suite, sections] of [
      ['website', WEBSITE_SECTIONS],
      ['app', APP_SECTIONS],
    ] as const) {
      for (const s of sections) {
        for (const test of s.tests) {
          index.set(test.id, { suite, section: s, test });
        }
      }
    }
    return index;
  })();

/**
 * Duplicate ids would silently merge two different tests into one stored row,
 * so the count would look complete while a case was never actually answered.
 * Failing loudly in development is much cheaper than discovering that in a
 * signed-off report.
 */
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const test of [...WEBSITE_TESTS, ...APP_TESTS]) {
    if (seen.has(test.id)) dupes.push(test.id);
    seen.add(test.id);
    if (!/^[A-Z0-9-]{3,64}$/.test(test.id)) {
      throw new Error(`QA matrix: malformed test id "${test.id}"`);
    }
  }
  if (dupes.length) {
    throw new Error(`QA matrix: duplicate test ids ${dupes.join(', ')}`);
  }
}
