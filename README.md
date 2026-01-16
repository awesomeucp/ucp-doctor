# UCP Doctor

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)

Diagnostic tool for validating [Universal Commerce Protocol (UCP)](https://ucp.dev) implementations.

## Features

- **Web UI**: Interactive browser-based interface with real-time progress
- **20 Diagnostic Checks**: Comprehensive validation suite aligned with UCP 2026-01-11
- **Auto-Generated Schemas**: 76 Zod schemas generated from official UCP JSON schemas
- **Real-time Streaming**: Server-Sent Events (SSE) for live progress updates
- **Export Reports**: Copy to clipboard or download JSON
- **Filtering & Grouping**: Organize checks by category and status
- **Strict Validation**: Full UCP specification compliance

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **Zod** - Schema validation

## Quick Start

```bash
# Install dependencies
npm install

# Generate schemas from UCP specifications
npm run schemas:generate

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Watch mode for schema development
npm run schemas:watch
```

## Usage

1. Enter a UCP implementation URL (e.g., `https://demo.awesomeucp.com`)
2. Select diagnostic options:
   - **Endpoints**: Check service endpoint reachability
   - **Schemas**: Validate schema URL accessibility
   - **Details**: Show verbose diagnostic information
3. Click **Check** to run diagnostics
4. View real-time results organized by category
5. Filter by status (All, Pass, Fail, Warn, Skip)
6. Export results as JSON

## Diagnostic Checks

The tool performs 20 comprehensive checks organized into categories:

### Connectivity
| Check | Description |
|-------|-------------|
| Connectivity | Domain is reachable via HTTP |
| Discovery Endpoint | `/.well-known/ucp` returns 200 |

### Structure
| Check | Description |
|-------|-------------|
| JSON Format | Response is valid JSON |
| Schema Validation | Matches UCP discovery schema |

### Protocol
| Check | Description |
|-------|-------------|
| Version Format | Version is `YYYY-MM-DD` format |
| **Version Registry** | **Validates against known UCP specification versions** |
| Version Recency | Version is not outdated |
| HTTPS Enforcement | Proper HTTPS usage |
| Endpoint Format | Valid endpoint formatting |

### Capabilities
| Check | Description |
|-------|-------------|
| Capability Names | Names follow reverse-domain pattern |
| **Capability Registry** | **Validates capabilities against official registry and checks extension dependencies** |
| Capability Extensions | Extensions reference valid parents |
| Capability Completeness | Capabilities have recommended fields |
| **Namespace Binding** | **Validates namespace-to-origin binding (spec/schema URLs match namespace authority)** |
| **Intersection Algorithm** | **Simulates capability intersection and extension pruning** |

### Services
| Check | Description |
|-------|-------------|
| Service Definitions | Services have required fields, reverse-domain naming, and transport-specific validation |
| Service Endpoints | REST endpoints are reachable |

### Payment
| Check | Description |
|-------|-------------|
| Payment Handlers | Handlers have required fields (id, name, version, spec) and unique IDs |

### Security
| Check | Description |
|-------|-------------|
| Signing Keys | JWK format is valid |
| Schema URLs | Schema URLs are reachable |

**Bold** items indicate new checks added for full UCP specification alignment.

## API Endpoints

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### POST /api/diagnose

Run diagnostics with Server-Sent Events (SSE) streaming for real-time updates.

**Request:**
```json
{
  "url": "https://demo.awesomeucp.com",
  "options": {
    "timeout": 10000,
    "checkEndpoints": true,
    "checkSchemas": false,
    "verbose": false
  }
}
```

**Response:** SSE stream with events:
- `check-start`: When a check begins
- `check-complete`: When a check finishes
- `complete`: Final report with all results

### POST /api/diagnose/sync

Run diagnostics and return full report (no streaming).

**Request:** Same as `/api/diagnose`

**Response:**
```json
{
  "id": "...",
  "target": "https://demo.awesomeucp.com",
  "duration": 1234,
  "summary": {
    "total": 20,
    "passed": 16,
    "failed": 1,
    "warnings": 2,
    "skipped": 1
  },
  "checks": [...],
  "errors": []
}
```

## Project Structure

```
ucp-doctor/
├── app/
│   ├── api/
│   │   ├── health/route.ts          # Health check endpoint
│   │   ├── diagnose/route.ts        # Streaming SSE endpoint
│   │   └── diagnose/sync/route.ts   # Non-streaming endpoint
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main UI page
├── lib/
│   └── core/                        # Diagnostic engine
│       ├── types/                   # TypeScript types
│       ├── schemas/                 # Zod validation schemas
│       │   ├── generated/           # Auto-generated from UCP specs (76 schemas)
│       │   └── index.ts             # Schema exports
│       ├── registry/                # Version & capability registries
│       │   ├── versions.ts          # Known UCP versions
│       │   └── capabilities.ts      # Known capabilities & namespace validation
│       ├── checks/                  # Check implementations (20 checks)
│       └── engine/                  # DiagnosticEngine
├── tools/
│   └── schema-generator/            # Schema generation tool
│       ├── src/
│       │   ├── index.ts             # Main orchestrator
│       │   ├── resolver.ts          # $ref resolution
│       │   ├── generator.ts         # JSON Schema to Zod conversion
│       │   ├── post-process.ts      # Header injection & formatting
│       │   ├── watch.ts             # Watch mode for development
│       │   └── config.ts            # Path configuration
│       └── package.json
├── public/                          # Static assets
└── package.json
```

## Schema Generation

UCP Doctor uses auto-generated Zod schemas from the official UCP JSON schemas. This ensures validation logic stays in sync with the specification.

### How It Works

1. **Source**: Reads JSON schemas from `/ucp/spec/schemas` and `/ucp/spec/discovery`
2. **Resolution**: Bundles and resolves all `$ref` references using `@apidevtools/json-schema-ref-parser`
3. **Generation**: Converts JSON Schema to Zod using `json-schema-to-zod`
4. **Post-Processing**: Adds headers, JSDoc comments, and formatting
5. **Output**: 76 TypeScript files with Zod schemas in `lib/core/schemas/generated/`

### Commands

```bash
# Generate all schemas (run after UCP submodule updates)
npm run schemas:generate

# Watch mode - auto-regenerate on schema changes
npm run schemas:watch
```

### Generated Schemas

The generator produces schemas for:
- **Discovery**: Profile schema and capability definitions
- **Shopping**: Checkout, order, payment, fulfillment, discount operations
- **Types**: 60+ supporting types (addresses, buyers, items, etc.)

All schemas are exported from `lib/core/schemas/index.ts` for use in validation checks.

## Development

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Run TypeScript type checking
npm run build

# Lint code
npm run lint
```

## Configuration

### Diagnostic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 10000 | Request timeout in milliseconds |
| `checkEndpoints` | boolean | true | Check service endpoint reachability |
| `checkSchemas` | boolean | false | Validate schema URL accessibility |
| `verbose` | boolean | false | Show detailed diagnostic information |

## Example Output

```
┌──────────────────────────────────────────┐
│  Total: 20  Pass: 16  Fail: 1  Warn: 2  │
└──────────────────────────────────────────┘

▼ CONNECTIVITY (2)
  ✓ Connectivity
    Domain is reachable (HTTP 200)
  ✓ Discovery Endpoint
    Discovery endpoint exists (HTTP 200)

▼ STRUCTURE (2)
  ✓ JSON Format
    Response is valid JSON
  ✓ Schema Validation
    Response matches UCP discovery profile schema

▼ PROTOCOL (5)
  ✓ Version Format
    Version "2026-01-11" is valid YYYY-MM-DD format
  ✓ Version Registry
    Version "2026-01-11" is a known UCP specification version
  ✓ Version Recency
    Version is recent (within 1 year)
  ✓ HTTPS Enforcement
    Using HTTPS correctly
  ✓ Endpoint Format
    All endpoints properly formatted

▼ CAPABILITIES (6)
  ✓ Capability Names
    All capability names follow reverse-domain notation
  ✓ Capability Registry
    3 core capabilities, 2 extensions found
  ✓ Capability Extensions
    All extension dependencies satisfied
  ✓ Namespace Binding
    All spec/schema URLs match namespace authority
  ! Intersection Algorithm
    Simulation: 5 capabilities in intersection, 0 pruned
  ✓ Capability Completeness
    All capabilities have recommended fields

Duration: 1.2s
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

We welcome contributions to UCP Doctor! Whether you're fixing bugs, adding new diagnostic checks, or improving documentation, your help is appreciated.

Please read our [Contributing Guide](CONTRIBUTING.md) to get started. It covers:

- Development setup and workflow
- Code style guidelines
- How to add new diagnostic checks
- Commit message conventions
- Pull request process

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add new diagnostic check"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Community & Support

- **Documentation**: Check this README and [VALIDATION_CHECKS.md](docs/VALIDATION_CHECKS.md)
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/awesomeucp/ucp-doctor/issues)
- **Discussions**: Ask questions and share ideas in [GitHub Discussions](https://github.com/awesomeucp/ucp-doctor/discussions)
- **UCP Specification**: Official protocol documentation at [ucp.dev](https://ucp.dev)

### Issue Templates

We provide templates to help you report issues effectively:

- **Bug Report**: Report issues with UCP Doctor
- **Feature Request**: Suggest new features or enhancements
- **Diagnostic Check**: Propose new diagnostic checks or improve existing ones

## Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright 2026 AwesomeUCP

## Related

- [UCP Specification](https://ucp.dev) - Official Universal Commerce Protocol documentation
- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
