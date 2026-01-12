# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The UCP Doctor team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@awesomeucp.com**

If you prefer encrypted communication, you can use our PGP key (available upon request).

### What to Include

To help us better understand and resolve the issue, please include as much of the following information as possible:

- **Type of issue** (e.g., XSS, injection, authentication bypass)
- **Full paths of source file(s)** related to the manifestation of the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Any special configuration** required to reproduce the issue

### What to Expect

After you submit a report, we will:

1. **Acknowledge receipt** within 48 hours
2. **Provide an initial assessment** within 5 business days
3. **Keep you informed** about our progress
4. **Notify you** when the issue is fixed
5. **Publicly credit you** for the discovery (unless you prefer to remain anonymous)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Varies by severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### Disclosure Policy

- We will work with you to understand the scope and impact of the vulnerability
- We will keep you informed as we develop and test fixes
- We ask that you give us a reasonable amount of time to fix the issue before public disclosure
- We will credit you in our security advisories (unless you wish to remain anonymous)

### Security Update Process

When we receive a security bug report:

1. We confirm the issue and determine affected versions
2. We audit code to find similar problems
3. We prepare fixes for all supported versions
4. We release new versions as soon as possible
5. We publish a security advisory

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit the vulnerability beyond what is necessary to confirm it exists
- Report the vulnerability promptly to security@awesomeucp.com
- Keep the vulnerability confidential until we have issued a fix

We will not pursue legal action against researchers who follow these guidelines.

## Security Best Practices for Users

When deploying UCP Doctor:

1. **Keep dependencies updated** - Run `npm audit` regularly and update packages
2. **Use HTTPS** - Always serve UCP Doctor over HTTPS in production
3. **Validate inputs** - The tool validates UCP implementations; ensure your own inputs are trusted
4. **Environment variables** - Never commit sensitive credentials or API keys
5. **Monitor logs** - Review application logs for suspicious activity
6. **Rate limiting** - Consider implementing rate limiting for the diagnostic API endpoints
7. **CORS configuration** - Configure CORS appropriately for your deployment

## Known Security Considerations

### External URL Fetching

UCP Doctor fetches and validates external URLs provided by users. While we implement security measures:

- We set reasonable timeouts to prevent hanging requests
- We validate response formats before processing
- We limit the size of downloaded content

**Recommendation**: When deploying UCP Doctor, consider:
- Running it behind a firewall with restricted outbound access
- Implementing additional URL validation/allowlisting for your use case
- Setting up monitoring for unusual outbound request patterns

### Schema Validation

UCP Doctor validates JSON against Zod schemas. While Zod is designed to be safe:

- We limit recursion depth to prevent stack overflow attacks
- We validate input size before processing
- We handle validation errors gracefully

### Dependencies

We regularly update dependencies to patch known vulnerabilities. You can check the current security status:

```bash
npm audit
```

## Security Credits

We would like to thank the following researchers for responsibly disclosing security issues:

- _No reports yet_

## Questions?

If you have questions about this security policy, please email security@awesomeucp.com.

## Learn More

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)
