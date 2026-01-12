# Contributing to UCP Doctor

Thank you for your interest in contributing to UCP Doctor! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Questions and Support](#questions-and-support)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

UCP Doctor is a diagnostic tool for validating Universal Commerce Protocol (UCP) implementations. Before contributing, familiarize yourself with:

- [UCP Specification](https://ucp.dev) - The protocol this tool validates
- The project [README.md](README.md) - Project overview and features
- [VALIDATION_CHECKS.md](docs/VALIDATION_CHECKS.md) - Details on diagnostic checks

## Development Setup

### Prerequisites

- **Node.js** 20 or higher
- **Bun** (recommended package manager) - [Install Bun](https://bun.sh/)
  - Alternatively, you can use npm
- **Git** for version control

### Installation

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ucp-doctor.git
   cd ucp-doctor
   ```

3. **Install dependencies**

   ```bash
   bun install
   # or with npm
   npm install
   ```

4. **Generate Zod schemas from UCP specifications**

   ```bash
   bun run schemas:generate
   # or with npm
   npm run schemas:generate
   ```

   This generates 76 Zod validation schemas from the official UCP JSON schemas located in `/ucp/spec/schemas`.

5. **Run the development server**

   ```bash
   bun run dev
   # or with npm
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Schema Generation (Important!)

UCP Doctor uses auto-generated Zod schemas to ensure validation logic stays synchronized with the UCP specification. The schema generator is located in `tools/schema-generator/`.

**When to regenerate schemas:**
- After updating the UCP specification submodule
- When UCP JSON schemas change
- When developing new diagnostic checks that require new schemas

**Commands:**
```bash
# One-time generation
bun run schemas:generate

# Watch mode (auto-regenerate on changes)
bun run schemas:watch
```

**Generated files location:** `lib/core/schemas/generated/`

## Project Structure

```
ucp-doctor/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── health/               # Health check endpoint
│   │   └── diagnose/             # Diagnostic endpoints (SSE & sync)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main UI
├── lib/core/                     # Core diagnostic engine
│   ├── checks/                   # Diagnostic check implementations (20 checks)
│   ├── engine/                   # DiagnosticEngine orchestrator
│   ├── registry/                 # Version & capability registries
│   ├── schemas/                  # Zod validation schemas
│   │   ├── generated/            # Auto-generated from UCP specs
│   │   └── index.ts              # Schema exports
│   └── types/                    # TypeScript type definitions
├── tools/schema-generator/       # Schema generation tool
└── components/                   # React components
```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-timeout-check`)
- `fix/` - Bug fixes (e.g., `fix/version-validation`)
- `docs/` - Documentation updates (e.g., `docs/update-contributing`)
- `refactor/` - Code refactoring (e.g., `refactor/check-engine`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(checks): add CORS header validation check

Implements validation for CORS headers in UCP discovery endpoint
responses to ensure proper cross-origin resource sharing configuration.

Closes #42
```

```
fix(schema): correct payment handler validation

The payment handler schema was incorrectly requiring the 'logo' field.
Updated to make it optional per UCP spec 2026-01-11.

Fixes #56
```

### Making Changes

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clean, readable code
   - Follow the code style guidelines below
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**

   ```bash
   # Build the project
   bun run build

   # Run linting
   bun run lint

   # Type checking
   bunx tsc --noEmit
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(checks): add new diagnostic check"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

   Go to the original repository and click "New Pull Request". Fill out the PR template with details about your changes.

## Code Style Guidelines

### TypeScript

- Use **TypeScript** for all new code
- Prefer **interfaces** over type aliases for object shapes
- Use **explicit return types** for functions
- Avoid `any` - use proper typing or `unknown` if necessary
- Use **const** over let when possible
- Prefer **async/await** over raw promises

### File Naming

- Use **kebab-case** for file names: `capability-registry.ts`
- Use **PascalCase** for component files: `DiagnosticCard.tsx`
- Use `.ts` for TypeScript files, `.tsx` for React components

### Code Organization

- **One responsibility per file** - Keep files focused
- **Export from index.ts** - Use barrel exports for directories
- **Group imports** - External packages first, then internal modules
- **Alphabetize imports** within groups

### Diagnostic Checks

When adding new diagnostic checks:

1. Create a new file in `lib/core/checks/`
2. Extend the `BaseCheck` class
3. Implement the `execute()` method
4. Return appropriate `CheckResult` status (`pass`, `fail`, `warn`, or `skip`)
5. Include descriptive messages and details
6. Add the check to `lib/core/checks/index.ts`
7. Update `docs/VALIDATION_CHECKS.md` documentation

**Example:**
```typescript
import { BaseCheck } from './base';
import { CheckResult, DiagnosticContext } from '../types';

export class MyNewCheck extends BaseCheck {
  constructor() {
    super('my-check', 'My Check', 'PROTOCOL');
  }

  async execute(context: DiagnosticContext): Promise<CheckResult> {
    // Implement validation logic

    return {
      status: 'pass',
      message: 'Validation passed',
      details: { /* additional info */ }
    };
  }
}
```

### ESLint

Run ESLint before committing:
```bash
bun run lint
```

Fix auto-fixable issues:
```bash
bun run lint --fix
```

## Testing

Currently, the project does not have automated tests. When tests are added:

- Tests will use a testing framework (likely Vitest or Jest)
- Write tests for new diagnostic checks
- Ensure existing tests pass before submitting PRs
- Aim for meaningful test coverage, not just high percentages

## Submitting Changes

### Pull Request Process

1. **Ensure your PR:**
   - Has a clear, descriptive title
   - References related issues (e.g., "Closes #123")
   - Includes a summary of changes
   - Passes all CI checks (linting, type checking, build)
   - Follows the code style guidelines
   - Updates documentation if needed

2. **Fill out the PR template** completely

3. **Request review** from maintainers

4. **Address feedback** promptly and professionally

5. **Squash commits** if requested before merging

### Review Criteria

Pull requests will be reviewed for:

- **Correctness** - Does it work as intended?
- **Code quality** - Is it clean, readable, and maintainable?
- **UCP compliance** - Does it align with UCP specifications?
- **Documentation** - Are changes documented?
- **Performance** - Are there any performance concerns?

## Reporting Bugs

Found a bug? Please help us fix it!

1. **Check existing issues** - Has it already been reported?
2. **Use the bug report template** - Click "New Issue" and select "Bug Report"
3. **Provide details:**
   - UCP implementation URL you were testing
   - Expected vs actual behavior
   - Steps to reproduce
   - Browser and environment info
   - Screenshots if applicable

## Suggesting Features

Have an idea for improvement?

1. **Check existing feature requests** - Has it been suggested?
2. **Use the feature request template** - Click "New Issue" and select "Feature Request"
3. **Describe:**
   - The problem your feature solves
   - Your proposed solution
   - How it relates to the UCP specification
   - Alternative approaches you considered

## Questions and Support

- **Documentation** - Check the [README](README.md) and [VALIDATION_CHECKS](docs/VALIDATION_CHECKS.md)
- **Discussions** - Use GitHub Discussions for questions
- **UCP Specification** - Refer to [ucp.dev](https://ucp.dev) for protocol details
- **Issues** - For bug reports and feature requests only

## License

By contributing to UCP Doctor, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

---

Thank you for contributing to UCP Doctor! Your efforts help improve UCP implementation quality across the ecosystem.
