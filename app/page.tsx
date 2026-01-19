'use client';

import { useState, useRef, FormEvent } from 'react';
import type { DiagnosticReport, CheckResult } from '@/lib/core';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/Button';
import { GithubLogo, Star, Eye } from '@phosphor-icons/react';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip' | 'pending';

interface CheckItem extends CheckResult {
  status: CheckStatus;
}

const statusIcons: Record<CheckStatus, string> = {
  pass: '✓',
  fail: '✗',
  warn: '!',
  skip: '–',
  pending: '·',
};

const checkCategories: Record<string, { name: string; checks: string[] }> = {
  connectivity: { name: 'Connectivity', checks: ['connectivity', 'discovery-endpoint'] },
  structure: { name: 'Structure', checks: ['json-format', 'schema-validation'] },
  protocol: {
    name: 'Protocol',
    checks: ['version-format', 'version-recency', 'https-enforcement', 'endpoint-format'],
  },
  capabilities: {
    name: 'Capabilities',
    checks: [
      'capability-names',
      'capability-extensions',
      'capability-completeness',
      'order-capability',
    ],
  },
  services: { name: 'Services', checks: ['service-definitions', 'service-endpoints'] },
  payment: { name: 'Payment', checks: ['payment-handlers'] },
  security: {
    name: 'Security',
    checks: ['signing-keys', 'ap2-mandate-format', 'ap2-signature', 'schema-urls'],
  },
};

function getCategory(checkId: string): string {
  for (const [cat, data] of Object.entries(checkCategories)) {
    if (data.checks.includes(checkId)) return cat;
  }
  return 'other';
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [checkEndpoints, setCheckEndpoints] = useState(true);
  const [checkSchemas, setCheckSchemas] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checks, setChecks] = useState<Map<string, CheckItem>>(new Map());
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [duration, setDuration] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | CheckStatus>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const scanUrlRef = useRef<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsChecking(true);
    setChecks(new Map());
    setReport(null);
    setDuration('');
    setCurrentFilter('all');

    const scanUrl = url.trim();
    scanUrlRef.current = scanUrl;

    // Track scan started
    trackEvent('scan_started', {
      scan_url: scanUrl,
      domain: new URL(scanUrl).hostname,
      check_endpoints: checkEndpoints,
      check_schemas: checkSchemas,
      verbose,
    });

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          options: { checkEndpoints, checkSchemas, verbose },
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) continue;
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5).trim());
            handleEvent(data);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);

      // Track scan error
      trackEvent('scan_error', {
        scan_url: scanUrl,
        domain: new URL(scanUrl).hostname,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      setChecks(
        new Map([
          [
            'error',
            {
              id: 'error',
              name: 'Error',
              description: 'Failed to connect to diagnostic API',
              status: 'fail',
              message: error instanceof Error ? error.message : 'Unknown error',
              details: undefined,
              duration: 0,
              timestamp: new Date(),
            },
          ],
        ])
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleEvent = (data: any) => {
    if (data.id && data.name && !data.status) {
      // check-start
      setChecks(
        (prev) =>
          new Map(
            prev.set(data.id, {
              id: data.id,
              name: data.name,
              description: '',
              status: 'pending',
              message: 'Running...',
              details: undefined,
              duration: 0,
              timestamp: new Date(),
            })
          )
      );
    } else if (data.status) {
      // check-complete
      setChecks((prev) => new Map(prev.set(data.id, data)));
    } else if (data.report) {
      // complete
      setReport(data.report);
      setDuration((data.report.duration / 1000).toFixed(2) + 's');

      // Track scan completed
      trackEvent('scan_completed', {
        scan_url: scanUrlRef.current,
        domain: new URL(scanUrlRef.current).hostname,
        value: data.report.summary.passed,
        duration_ms: data.report.duration,
        total: data.report.summary.total,
        passed: data.report.summary.passed,
        failed: data.report.summary.failed,
        warnings: data.report.summary.warnings,
        skipped: data.report.summary.skipped,
      });
    }
  };

  const copyToClipboard = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    trackEvent('report_copied', {
      scan_url: scanUrlRef.current,
      domain: scanUrlRef.current ? new URL(scanUrlRef.current).hostname : undefined,
    });
  };

  const downloadJson = () => {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `ucp-doctor-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    trackEvent('report_downloaded', {
      scan_url: scanUrlRef.current,
      domain: scanUrlRef.current ? new URL(scanUrlRef.current).hostname : undefined,
    });
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const filteredChecks = Array.from(checks.values()).filter((check) => {
    if (currentFilter === 'all') return true;
    return check.status === currentFilter;
  });

  const groupedChecks: Record<string, CheckItem[]> = {};
  filteredChecks.forEach((check) => {
    const cat = getCategory(check.id);
    if (!groupedChecks[cat]) groupedChecks[cat] = [];
    groupedChecks[cat].push(check);
  });

  const stats = report?.summary || { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors">
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* GitHub Banner */}
        <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <GithubLogo size={20} weight="fill" className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                Open Source on GitHub
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/awesomeucp/ucp-doctor"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('github_link_clicked', { action: 'star' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-900 dark:text-blue-100 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Star size={16} weight="fill" />
                Star
              </a>
              <a
                href="https://github.com/awesomeucp/ucp-doctor/subscription"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('github_link_clicked', { action: 'watch' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-900 dark:text-blue-100 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Eye size={16} weight="regular" />
                Watch
              </a>
            </div>
          </div>
        </div>

        <header className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">UCP Doctor</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Validate your Universal Commerce Protocol implementation</p>
          </div>
          <ThemeSwitcher />
        </header>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => trackEvent('form_interaction', { field: 'url_input', action: 'focus' })}
              placeholder="https://demo.awesomeucp.com"
              required
              className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
            <Button
              type="submit"
              disabled={isChecking}
              variant="primary"
              size="md"
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isChecking ? 'Checking...' : 'Check'}
            </Button>
          </div>
          <div className="flex gap-4 flex-wrap text-xs text-zinc-600 dark:text-zinc-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkEndpoints}
                onChange={(e) => {
                  setCheckEndpoints(e.target.checked);
                  trackEvent('option_changed', { option: 'endpoints', enabled: e.target.checked });
                }}
                className="accent-blue-600 dark:accent-blue-500"
              />
              Endpoints
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkSchemas}
                onChange={(e) => {
                  setCheckSchemas(e.target.checked);
                  trackEvent('option_changed', { option: 'schemas', enabled: e.target.checked });
                }}
                className="accent-blue-600 dark:accent-blue-500"
              />
              Schemas
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={verbose}
                onChange={(e) => {
                  setVerbose(e.target.checked);
                  trackEvent('option_changed', { option: 'verbose', enabled: e.target.checked });
                }}
                className="accent-blue-600 dark:accent-blue-500"
              />
              Details
            </label>
          </div>
        </form>

        {checks.size > 0 && (
          <section className="space-y-4">
            <div className="grid grid-cols-5 gap-1 py-3 border-b border-zinc-200 dark:border-zinc-800 text-center">
              <div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.total}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-green-600 dark:text-green-400">{stats.passed}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Pass</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-red-600 dark:text-red-400">{stats.failed}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Fail</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.warnings}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Warn</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.skipped}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Skip</div>
              </div>
            </div>

            {report && (
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'pass', 'fail', 'warn', 'skip'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setCurrentFilter(filter);
                      trackEvent('filter_changed', {
                        filter,
                        scan_url: scanUrlRef.current,
                        domain: scanUrlRef.current ? new URL(scanUrlRef.current).hostname : undefined,
                      });
                    }}
                    className={`px-2 py-1 text-[11px] border rounded transition-colors ${
                      currentFilter === filter
                        ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {Object.entries(checkCategories).map(([catId, catData]) => {
                const categoryChecks = groupedChecks[catId];
                if (!categoryChecks || categoryChecks.length === 0) return null;

                const isCollapsed = collapsedGroups.has(catId);

                return (
                  <div key={catId} className="border-b border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => toggleGroup(catId)}
                      className="w-full flex items-center gap-2 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span
                        className={`text-[10px] transition-transform ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      >
                        ▼
                      </span>
                      {catData.name}
                      <span className="font-normal text-zinc-400 dark:text-zinc-500">({categoryChecks.length})</span>
                    </button>

                    {!isCollapsed && (
                      <div className="space-y-0">
                        {categoryChecks.map((check) => (
                          <div
                            key={check.id}
                            className="flex items-start gap-2.5 py-2 border-b border-zinc-50 dark:border-zinc-900 last:border-0"
                          >
                            <div
                              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 ${
                                check.status === 'pass'
                                  ? 'bg-green-600 dark:bg-green-500 text-white'
                                  : check.status === 'fail'
                                  ? 'bg-red-600 dark:bg-red-500 text-white'
                                  : check.status === 'warn'
                                  ? 'bg-yellow-600 dark:bg-yellow-500 text-white'
                                  : check.status === 'skip'
                                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                                  : 'bg-blue-500 dark:bg-blue-400 text-white'
                              }`}
                            >
                              {check.status === 'pending' ? (
                                <span className="animate-spin">◌</span>
                              ) : (
                                statusIcons[check.status]
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{check.name}</div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">{check.message}</div>
                              {verbose && check.details && (
                                <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-[10px] overflow-x-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-800">
                                  {JSON.stringify(check.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {groupedChecks['other'] && groupedChecks['other'].length > 0 && (
                <div className="border-b border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => toggleGroup('other')}
                    className="w-full flex items-center gap-2 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span
                      className={`text-[10px] transition-transform ${
                        collapsedGroups.has('other') ? '-rotate-90' : ''
                      }`}
                    >
                      ▼
                    </span>
                    Other
                  </button>
                  {!collapsedGroups.has('other') && (
                    <div className="space-y-0">
                      {groupedChecks['other'].map((check) => (
                        <div
                          key={check.id}
                          className="flex items-start gap-2.5 py-2 border-b border-zinc-50 dark:border-zinc-900 last:border-0"
                        >
                          <div
                            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 ${
                              check.status === 'pass'
                                ? 'bg-green-600 dark:bg-green-500 text-white'
                                : check.status === 'fail'
                                ? 'bg-red-600 dark:bg-red-500 text-white'
                                : check.status === 'warn'
                                ? 'bg-yellow-600 dark:bg-yellow-500 text-white'
                                : check.status === 'skip'
                                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                                : 'bg-blue-500 dark:bg-blue-400 text-white'
                            }`}
                          >
                            {check.status === 'pending' ? (
                              <span className="animate-spin">◌</span>
                            ) : (
                              statusIcons[check.status]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{check.name}</div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">{check.message}</div>
                            {verbose && check.details && (
                              <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-[10px] overflow-x-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-800">
                                {JSON.stringify(check.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {report && (
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{duration}</span>
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="secondary"
                    size="sm"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={downloadJson}
                    variant="secondary"
                    size="sm"
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
