export interface ProblemStatementDiagnostic {
  score: number; // 0 - 100
  isTooBroad: boolean;
  isSolutionBiased: boolean;
  hasDefinedUser: boolean;
  hasSpecificSituation: boolean;
  hasRootCause: boolean;
  hasClearConsequence: boolean;
  critique: string[];
  refinementSuggestions: string[];
  suggestedRevision?: string;
}

const SOLUTION_BIAS_KEYWORDS = [
  'needs an app',
  'lack of an app',
  'need a platform',
  'lack of a platform',
  'need an ai',
  'needs ai',
  'lack of ai',
  'need a software',
  'needs a software',
  'needs a website',
  'there is no app',
  'there is no platform',
  'needs a dashboard',
];

const VAGUE_USER_KEYWORDS = [
  'people',
  'everyone',
  'users',
  'someone',
  'anybody',
  'society',
  'customers in general',
];

export function analyzeProblemStatement(
  statement: string,
  userField = '',
  situationField = '',
  taskField = ''
): ProblemStatementDiagnostic {
  const text = (statement || '').trim().toLowerCase();
  const critique: string[] = [];
  const suggestions: string[] = [];
  let score = 50;

  if (!text || text.length < 15) {
    return {
      score: 10,
      isTooBroad: true,
      isSolutionBiased: false,
      hasDefinedUser: false,
      hasSpecificSituation: false,
      hasRootCause: false,
      hasClearConsequence: false,
      critique: ['Statement is too brief or empty.'],
      refinementSuggestions: [
        'Use the template: People in [situation] struggle to [task] because [cause], resulting in [consequence].',
      ],
    };
  }

  // 1. Solution Bias Check
  const hasSolutionBias = SOLUTION_BIAS_KEYWORDS.some((kw) => text.includes(kw));
  if (hasSolutionBias) {
    score -= 30;
    critique.push(
      'Solution-oriented bias detected: Stating "lack of an app/platform" frames the problem as the absence of your product rather than genuine customer friction.'
    );
    suggestions.push(
      'Focus on what the user is trying to accomplish and why existing tools (paper, WhatsApp, Excel) fail them.'
    );
  }

  // 2. User definition check
  const hasSpecificUser =
    (userField && userField.trim().length > 3 && !VAGUE_USER_KEYWORDS.includes(userField.toLowerCase())) ||
    (!text.startsWith('people') && !text.startsWith('everyone') && text.length > 30);

  if (!hasSpecificUser) {
    score -= 15;
    critique.push('Target user is generic ("people" or "everyone"). Problems are experienced by specific roles.');
    suggestions.push('Narrow down the user group (e.g. "Kirana shop owners with credit ledgers" vs "shoppers").');
  } else {
    score += 15;
  }

  // 3. Situation check
  const hasSituation =
    (situationField && situationField.trim().length > 5) ||
    text.includes('when ') ||
    text.includes('in ') ||
    text.includes('during ') ||
    text.includes('while ');

  if (!hasSituation) {
    score -= 10;
    critique.push('Missing a concrete situation or trigger event when the friction occurs.');
    suggestions.push('Specify the exact trigger (e.g. "at month-end closing", "during campus placement drives").');
  } else {
    score += 10;
  }

  // 4. Cause / Constraint check
  const hasCause =
    text.includes('because') ||
    text.includes('due to') ||
    text.includes('since') ||
    text.includes('owing to') ||
    text.includes('caused by');

  if (!hasCause) {
    score -= 10;
    critique.push('Root constraint or cause is ambiguous. Why is the task difficult?');
    suggestions.push('Articulate the constraint (e.g. "because fragmented supplier catalogs require manual phone calls").');
  } else {
    score += 15;
  }

  // 5. Consequence check
  const hasConsequence =
    text.includes('resulting in') ||
    text.includes('leads to') ||
    text.includes('causing') ||
    text.includes('losses') ||
    text.includes('wasting') ||
    text.includes('delayed') ||
    text.includes('risk');

  if (!hasConsequence) {
    score -= 10;
    critique.push('Measurable consequence is unclear. What time, money, or reputation is lost?');
    suggestions.push('Highlight the specific stakes (e.g. "resulting in ₹15,000 bad debt every quarter").');
  } else {
    score += 15;
  }

  // Too broad check
  const isTooBroad = text.length < 50 || (!hasSituation && !hasCause);

  const clampedScore = Math.max(10, Math.min(100, score));

  // Synthesize suggested revision
  const cleanUser = userField || 'Target operators';
  const cleanSituation = situationField || 'daily operations';
  const cleanTask = taskField || 'complete essential workflows';
  const suggestedRevision = `People in ${cleanSituation} struggle to ${cleanTask} because existing manual tools require tedious dual-entry, resulting in delayed turnaround and unrecoverable operational errors. Current workarounds rely on ad-hoc messaging, which fails due to zero audit trail.`;

  return {
    score: clampedScore,
    isTooBroad,
    isSolutionBiased: hasSolutionBias,
    hasDefinedUser: hasSpecificUser,
    hasSpecificSituation: hasSituation,
    hasRootCause: hasCause,
    hasClearConsequence: hasConsequence,
    critique: critique.length > 0 ? critique : ['Specific and well-formed problem statement!'],
    refinementSuggestions: suggestions,
    suggestedRevision,
  };
}
