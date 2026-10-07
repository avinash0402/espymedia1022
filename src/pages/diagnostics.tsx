import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE } from '@workspace/api-client-react';

type DiagnosticCheck = { ok: boolean; detail: string };
type DiagnosticResult = {
  ok: boolean;
  generatedAt: string;
  checks: Record<string, DiagnosticCheck>;
  failedChecks: string[];
};

type DiagnosticState = {
  result: DiagnosticResult | null;
  requestError: string;
  loading: boolean;
};

const labels: Record<string, string> = {
  databaseConfig: 'Database configuration',
  databaseDriver: 'PHP MySQL driver',
  schema: 'Database schema',
  php: 'PHP runtime',
  database: 'Database connection',
  frontendOrigin: 'Website-to-API access (CORS)',
  adminSetup: 'Admin account setup',
};

export default function Diagnostics() {
  const [state, setState] = useState<DiagnosticState>({ result: null, requestError: '', loading: true });

  const runDiagnostics = async () => {
    setState({ result: null, requestError: '', loading: true });
    try {
      const response = await fetch(`${API_BASE}/diagnostics`, { cache: 'no-store', credentials: 'include' });
      const data = await response.json().catch(() => null) as DiagnosticResult | null;
      if (!data) throw new Error(`API returned HTTP ${response.status} without a valid diagnostics response`);
      setState({ result: data, requestError: '', loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState({ result: null, requestError: message, loading: false });
    }
  };

  useEffect(() => {
    void runDiagnostics();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-violet-300">Espy Media</p>
        <h1 className="text-4xl font-bold">Deployment diagnostics</h1>
        <p className="mt-3 text-zinc-400">
          Checks the website-to-Hostinger API connection, MySQL configuration, database connection, schema, and admin setup. Secret values are never displayed.
        </p>

        <button
          type="button"
          onClick={runDiagnostics}
          disabled={state.loading}
          className="mt-8 rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
        >
          {state.loading ? 'Running checks...' : 'Run checks again'}
        </button>

        {state.loading && (
          <p className="mt-8 flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" />Checking deployment...</p>
        )}

        {state.requestError && (
          <div className="mt-8 rounded-lg border border-red-400/40 bg-red-950/30 p-5 text-red-200">
            <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" />Diagnostics API could not respond</div>
            <p className="mt-2 break-words text-sm">{state.requestError}</p>
            <p className="mt-2 text-sm">The browser could not read a response. Check that the API is online and that this website’s exact origin is listed in Hostinger FRONTEND_ORIGIN.</p>
          </div>
        )}

        {state.result && (
          <section className="mt-8 space-y-3">
            <div className={`rounded-lg border p-5 ${state.result.ok ? 'border-emerald-400/40 bg-emerald-950/30' : 'border-red-400/40 bg-red-950/30'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {state.result.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <AlertCircle className="h-5 w-5 text-red-300" />}
                {state.result.ok ? 'All checks passed' : `${state.result.failedChecks.length} check(s) failed`}
              </div>
              <p className="mt-2 text-sm text-zinc-400">Checked at {new Date(state.result.generatedAt).toLocaleString()}</p>
            </div>
            {Object.entries(state.result.checks).map(([name, check]) => (
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
