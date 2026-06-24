---
name: No test framework configured
description: Project has no jest/vitest — validate via next build and eslint only
type: project
---

No unit test framework (jest, vitest, etc.) is installed and no `test` script exists in package.json.

**Why:** The project is a Next.js landing page; testing is done manually and via build/lint checks.

**How to apply:** When asked to "run tests" or "unit test", run `next build` (for TypeScript + compilation) and `eslint` (for lint errors) as the available validation. Suggest adding a test framework only if the user asks for it.
