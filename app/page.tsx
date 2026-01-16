'use client';

import { useState, FormEvent } from 'react';
import type { DiagnosticReport, CheckResult } from '@/lib/core';
import { ThemeSwitcher } from '@/components/theme-switcher';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsChecking(true);
    setChecks(new Map());
    setReport(null);
    setDuration('');
    setCurrentFilter('all');

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
    }
  };

  const copyToClipboard = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  const downloadJson = () => {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ucp-doctor-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                Open Source on GitHub
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/awesomeucp/ucp-doctor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-900 dark:text-blue-100 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                </svg>
                Star
              </a>
              <a
                href="https://github.com/awesomeucp/ucp-doctor/subscription"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-900 dark:text-blue-100 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 2.5A5.5 5.5 0 1013.5 8a.75.75 0 011.5 0 7 7 0 11-7-7 .75.75 0 010 1.5z" />
                  <path d="M8 5a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
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
              placeholder="https://demo.awesomeucp.com"
              required
              className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
            <button
              type="submit"
              disabled={isChecking}
              className="px-4 py-2 border border-zinc-900 dark:border-zinc-100 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? 'Checking...' : 'Check'}
            </button>
          </div>
          <div className="flex gap-4 flex-wrap text-xs text-zinc-600 dark:text-zinc-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkEndpoints}
                onChange={(e) => setCheckEndpoints(e.target.checked)}
                className="accent-zinc-900 dark:accent-zinc-100"
              />
              Endpoints
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkSchemas}
                onChange={(e) => setCheckSchemas(e.target.checked)}
                className="accent-zinc-900 dark:accent-zinc-100"
              />
              Schemas
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={verbose}
                onChange={(e) => setVerbose(e.target.checked)}
                className="accent-zinc-900 dark:accent-zinc-100"
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
                    onClick={() => setCurrentFilter(filter)}
                    className={`px-2 py-1 text-[11px] border rounded transition-colors ${
                      currentFilter === filter
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
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
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1.5 text-[11px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadJson}
                    className="px-2.5 py-1.5 text-[11px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
