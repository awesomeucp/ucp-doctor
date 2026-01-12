## Description

<!-- Provide a clear and concise description of your changes -->

## Related Issues

<!-- Link to related issues using keywords (e.g., "Closes #123", "Fixes #456", "Related to #789") -->

- Closes #
- Related to #

## Type of Change

<!-- Mark the relevant option(s) with an "x" -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] New diagnostic check
- [ ] Enhancement to existing diagnostic check
- [ ] Dependency update
- [ ] Other (please describe):

## Changes Made

<!-- Provide a detailed list of changes -->

-
-
-

## Diagnostic Checks Affected

<!-- If applicable, list which diagnostic checks are new, modified, or affected -->

- [ ] Not applicable
- [ ] New check:
- [ ] Modified check:
- [ ] Affects checks:

## Testing

<!-- Describe how you tested your changes -->

### Manual Testing

- [ ] Tested locally with development server
- [ ] Tested against sample UCP implementations
- [ ] Verified in multiple browsers (if UI change)

### Test Cases

<!-- Describe specific test cases you ran -->

-
-

### Test URLs

<!-- If you tested with specific UCP implementations, list them -->

-
-

## Schema Changes

<!-- If your changes affect schemas -->

- [ ] No schema changes
- [ ] Regenerated schemas with `bun run schemas:generate`
- [ ] Updated UCP specification submodule
- [ ] Generated schemas are included in this PR

## Documentation

<!-- Mark all that apply -->

- [ ] Updated README.md
- [ ] Updated CONTRIBUTING.md
- [ ] Updated VALIDATION_CHECKS.md
- [ ] Added inline code comments for complex logic
- [ ] Updated JSDoc comments
- [ ] No documentation changes needed

## Pre-submission Checklist

<!-- Please verify all items before submitting -->

### Code Quality

- [ ] Code follows the project's code style guidelines
- [ ] TypeScript types are properly defined (no `any` without justification)
- [ ] File naming follows project conventions (kebab-case for files, PascalCase for components)
- [ ] Imports are organized and alphabetized

### Build & Validation

- [ ] `bun run lint` passes with no errors
- [ ] `bun run build` completes successfully
- [ ] `bunx tsc --noEmit` shows no type errors
- [ ] No console errors in browser developer tools

### Git

- [ ] Branch is up to date with main
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- [ ] No merge conflicts

### Review

- [ ] Self-reviewed the code changes
- [ ] Checked for potential security issues
- [ ] Verified no sensitive information (API keys, credentials) is committed
- [ ] Added appropriate labels to this PR

## Screenshots / Videos

<!-- If applicable, add screenshots or videos demonstrating the changes -->

## Additional Notes

<!-- Any additional context, concerns, or notes for reviewers -->

## Reviewer Notes

<!-- Optional: Specific areas you'd like reviewers to focus on -->

- Please pay special attention to:
- Questions for reviewers:

---

**By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.**
