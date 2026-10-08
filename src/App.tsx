import { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MotionEnhancementLayer } from '@/components/motion-enhancement-layer';
const NotFound = lazy(() => import('@/pages/not-found'));
const Home = lazy(() => import('@/pages/home'));
const GraphicDesign = lazy(() => import('@/pages/graphic-design'));
const Contact = lazy(() => import('@/pages/contact'));
const CaseStudy = lazy(() => import('@/pages/case-study'));
const AdminLogin = lazy(() => import('@/pages/admin-login'));
const AdminSetup = lazy(() => import('@/pages/admin-setup'));
const AdminDashboard = lazy(() => import('@/pages/admin-dashboard'));
const AdminProjects = lazy(() => import('@/pages/admin-projects'));
const AdminTestimonials = lazy(() => import('@/pages/admin-testimonials'));
const AdminFaq = lazy(() => import('@/pages/admin-faq'));
const AdminServices = lazy(() => import('@/pages/admin-services'));
const AdminSettings = lazy(() => import('@/pages/admin-settings'));
const AdminContent = lazy(() => import('@/pages/admin-content'));
const AdminGraphic = lazy(() => import('@/pages/admin-graphic'));
const AdminLeads = lazy(() => import('@/pages/admin-leads'));
const AdminSeo = lazy(() => import('@/pages/admin-seo'));
const WebDesignProjects = lazy(() => import('@/pages/web-design-projects'));
const LegalPage = lazy(() => import('@/pages/legal-page'));
const Diagnostics = lazy(() => import('@/pages/diagnostics'));
import { SeoHead } from '@/components/seo-head';
const Chatbot = lazy(() =>
  import('@/components/chatbot').then(({ Chatbot }) => ({ default: Chatbot })),
);
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

function DeferredChatbot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <Chatbot />
    </Suspense>
  ) : null;
}

/** Scroll to top whenever the route changes */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = Number(error.status);
          return failureCount < 2 && status >= 500;
        }
        return failureCount < 2 && error instanceof TypeError;
      },
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3_000),
    },
  },
});

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const prefersReducedMotion = useReducedMotion();
  const routes = (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/graphic-design" component={GraphicDesign} />
      <Route path="/contact" component={Contact} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/work/:id" component={CaseStudy} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
      <Route path="/admin/faqs" component={AdminFaq} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/graphic" component={AdminGraphic} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/admin/seo" component={AdminSeo} />
      <Route path="/projects" component={WebDesignProjects} />
      <Route path="/:slug" component={LegalPage} />
      <Route component={NotFound} />
    </Switch>
  );

  return (
    <>
    <ScrollToTop />
    <SeoHead />
    <MotionEnhancementLayer location={location} disabled={isAdmin} />
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-400" role="status">
          <span className="flex items-center gap-3 text-sm">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" aria-hidden="true" />
            Loading page…
          </span>
        </div>
      }
    >
      {isAdmin || prefersReducedMotion !== false ? routes : (
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {routes}
        </motion.div>
      )}
    </Suspense>
    {!isAdmin && <DeferredChatbot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
