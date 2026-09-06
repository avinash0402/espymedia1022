import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useGetBlogPosts } from '@workspace/api-client-react';

export default function Blog() {
  const { data: posts, isLoading } = useGetBlogPosts({ published: true });

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavBar />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0514] to-black" />
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/[0.04] rounded-full blur-[130px]" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      <main className="relative z-10">
        <section className="pt-28 sm:pt-36 pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <p className="section-label mb-5">Insights</p>
              <h1 className="section-headline mb-5" style={{ fontSize: 'clamp(2rem, 7vw, 6rem)' }}>
                What we're thinking<br />
                <span className="text-gradient-purple">about.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl font-inter">
                Insights on marketing, design, and growth from the Espy Media team.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-black p-8 space-y-4">
                    <div className="aspect-video bg-white/[0.04] animate-pulse rounded-xl" />
                    <div className="h-6 bg-white/[0.04] animate-pulse rounded" />
                    <div className="h-4 bg-white/[0.04] animate-pulse rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.id}`}>
                      <div
                        className="group bg-black hover:bg-white/[0.025] transition-colors duration-300 p-8 h-full cursor-pointer border-glow-hover border border-transparent"
                        data-testid={`card-post-${post.id}`}
                      >
                        <div className="aspect-video bg-gradient-to-br from-violet-950/30 to-purple-950/20 rounded-xl mb-6 overflow-hidden" />
                        <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#A78BFA] transition-colors duration-300 font-manrope text-white">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-zinc-500 line-clamp-3 mb-4 font-inter">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-inter">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            }) : '—'}
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-[#A78BFA] transition-colors duration-300" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-white/[0.05] rounded-2xl">
                <p className="text-lg text-zinc-600 font-inter">No blog posts published yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
