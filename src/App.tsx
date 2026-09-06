import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import GraphicDesign from '@/pages/graphic-design';
import Contact from '@/pages/contact';
import CaseStudy from '@/pages/case-study';
import AdminLogin from '@/pages/admin-login';
import AdminSetup from '@/pages/admin-setup';
import AdminDashboard from '@/pages/admin-dashboard';
import AdminProjects from '@/pages/admin-projects';
import AdminTestimonials from '@/pages/admin-testimonials';
import AdminServices from '@/pages/admin-services';
import AdminSettings from '@/pages/admin-settings';
import AdminContent from '@/pages/admin-content';
import AdminGraphic from '@/pages/admin-graphic';
import AdminLeads from '@/pages/admin-leads';
import AdminSeo from '@/pages/admin-seo';
import WebDesignProjects from '@/pages/web-design-projects';
import LegalPage from '@/pages/legal-page';
import { SeoHead } from '@/components/seo-head';
import { Chatbot } from '@/components/chatbot';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

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

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');

  return (
    <>
    <ScrollToTop />
    <SeoHead />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/graphic-design" component={GraphicDesign} />
      <Route path="/contact" component={Contact} />
      <Route path="/work/:id" component={CaseStudy} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
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
    {!isAdmin && <Chatbot />}
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
