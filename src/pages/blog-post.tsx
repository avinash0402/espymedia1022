import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useGetBlogPost } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';

export default function BlogPost() {
  const params = useParams();
  const postId = params.id ? Number(params.id) : 0;
  
  const { data: post, isLoading } = useGetBlogPost(postId);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen w-full bg-background">
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post not found</h1>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <NavBar />

      <article className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-8" data-testid="link-back-blog">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-12">
                <time>
                  {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              </div>
            </motion.div>

            {post.coverImageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-glow mb-12"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="prose prose-lg prose-invert max-w-none"
            >
              <div className="text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </motion.div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
