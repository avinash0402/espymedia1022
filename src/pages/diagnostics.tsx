import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type DiagnosticCheck = { ok: boolean; detail: string };
type DiagnosticResult = {
  ok: boolean;
  generatedAt: string;
  checks: Record<string, DiagnosticCheck>;
  failedChecks: string[];
};

const labels: Record<string, string> = {
  databaseUrl: 'Database URL',
  sessionSecret: 'Session secret',
  schema: 'Database schema',
  node: 'Node.js runtime',
  database: 'Database connection',
};

export default function Diagnostics() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [requestError, setRequestError] = useState('');

  const runDiagnostics = () => {
    setResult(null);
    setRequestError('');
    fetch('/api/diagnostics', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!data) throw new Error(`API returned HTTP ${response.status}`);
        setResult(data);
      })
      .catch((error: Error) => setRequestError(error.message));
  };

  useEffect(runDiagnostics, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-violet-300">Espy Media</p>
        <h1 className="text-4xl font-bold">Deployment diagnostics</h1>
        <p className="mt-3 text-zinc-400">
          This page checks the live API configuration and reports sanitized failures. Secret values are never displayed.
        </p>

        <button
          type="button"
          onClick={runDiagnostics}
          className="mt-8 rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
        >
          Run checks again
        </button>

        {!result && !requestError && (
          <p className="mt-8 flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" />Checking deployment...</p>
        )}

        {requestError && (
          <div className="mt-8 rounded-lg border border-red-400/40 bg-red-950/30 p-5 text-red-200">
            <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" />Diagnostics API could not respond</div>
            <p className="mt-2 break-words text-sm">{requestError}</p>
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-3">
            <div className={`rounded-lg border p-5 ${result.ok ? 'border-emerald-400/40 bg-emerald-950/30' : 'border-red-400/40 bg-red-950/30'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <AlertCircle className="h-5 w-5 text-red-300" />}
                {result.ok ? 'All checks passed' : `${result.failedChecks.length} check(s) failed`}
              </div>
              <p className="mt-2 text-sm text-zinc-400">Checked at {new Date(result.generatedAt).toLocaleString()}</p>
            </div>
            {Object.entries(result.checks).map(([name, check]) => (
              <div key={name} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2 font-semibold">
                  {check.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertCircle className="h-4 w-4 text-red-300" />}
                  {labels[name] || name}
                </div>
                <p className={`mt-2 break-words text-sm ${check.ok ? 'text-zinc-400' : 'text-red-200'}`}>{check.detail}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
