import { Link, useRoute } from 'wouter';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useGetLegalPage } from '@workspace/api-client-react';

export default function LegalPage() {
  const [, params] = useRoute('/:slug');
  const slug = params?.slug || 'privacy-policy';
  const { data: page, isLoading, error } = useGetLegalPage(slug);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-36">
        <Link href="/" className="mb-8 inline-block text-sm text-zinc-500 hover:text-white">← Back to home</Link>
        {isLoading ? (
          <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
        ) : error || !page ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10">
            <h1 className="mb-3 text-3xl font-bold">Page unavailable</h1>
            <p className="text-zinc-400">This legal page has not been published yet.</p>
          </div>
        ) : (
          <>
            <p className="section-label mb-5">Legal</p>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">{page.title}</h1>
            <p className="mb-10 text-sm text-zinc-500">
              Last updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
            </p>
            <article className="prose prose-lg prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}