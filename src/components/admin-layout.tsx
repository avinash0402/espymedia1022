import { useState } from 'react';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import {
  LayoutDashboard, Briefcase, MessageSquare, Settings, LogOut,
  Wrench, Layers3, Image, Users, Search, Menu,
} from 'lucide-react';
import { useGetAuthMe, useAdminLogout } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin/dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/admin/projects',     label: 'Web Projects',      icon: Briefcase },
  { href: '/admin/graphic',      label: 'Graphic Portfolio', icon: Image },
  { href: '/admin/testimonials', label: 'Testimonials',      icon: MessageSquare },
  { href: '/admin/leads',        label: 'Leads',             icon: Users },
  { href: '/admin/services',     label: 'Services',          icon: Wrench },
  { href: '/admin/content',      label: 'CMS',               icon: Layers3 },
  { href: '/admin/seo',          label: 'SEO & Analytics',   icon: Search },
  { href: '/admin/settings',     label: 'Settings',          icon: Settings },
];

function SidebarContent({
  location,
  onNavigate,
  user,
  onLogout,
  logoutPending,
}: {
  location: string;
  onNavigate: (href: string) => void;
  user: { username: string };
  onLogout: () => void;
  logoutPending: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-gradient-purple">Espy Media</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <div
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="mb-2 px-3">
          <div className="text-sm font-medium text-sidebar-foreground truncate">{user.username}</div>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-sm"
          disabled={logoutPending}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2 shrink-0" />
          {logoutPending ? 'Logging out…' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, error } = useGetAuthMe();
  const logout = useAdminLogout();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (error || !user) && location !== '/admin') {
      setLocation('/admin');
    }
  }, [error, isLoading, location, setLocation, user]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast({ title: 'Logged out successfully' });
        setLocation('/admin');
      },
    });
  };

  const handleNavigate = (href: string) => {
    setLocation(href);
    setMobileOpen(false);
  };

  const sidebarProps = {
    location,
    onNavigate: handleNavigate,
    user,
    onLogout: handleLogout,
    logoutPending: logout.isPending,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-sidebar-border bg-sidebar">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-sidebar-border bg-sidebar shrink-0">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 -ml-1" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>
        <h1 className="text-base font-bold text-gradient-purple">Espy Media</h1>
        <span className="text-xs text-sidebar-foreground/60 ml-auto">Admin Panel</span>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
