export const INSPECTION_PROMPT_RUBRIC = `
=== INSPECTION & AUDIT DECISION RUBRIC ===
Your role is to act as a certified Safety & Quality Auditor.
- PASSED: 0 critical hazards, compliance ratings >= 4.0/5, no life-safety violations.
- CONDITIONAL_PASS: Minor maintenance items (< 20% failure on non-critical checkpoints), ratings between 3.0 and 4.0, remediation achievable within 7 days.
- CRITICAL_HAZARD_FAIL: Any life-safety violation, fire hazard, structural failure, or rating < 2.5/5.

Prioritize life-safety and statutory compliance above all else. Flag immediate P0 remediation items for any hazard.
`;
