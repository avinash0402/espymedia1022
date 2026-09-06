import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Briefcase, MessageSquare, TrendingUp, ArrowRight, Image } from 'lucide-react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetDashboardStats } from '@workspace/api-client-react';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: Briefcase, color: 'text-orange-500' },
    { label: 'Testimonials', value: stats?.testimonialCount || 0, icon: MessageSquare, color: 'text-cyan-500' },
  ];

  const quickLinks = [
    { href: '/admin/projects', label: 'Manage Web Projects', icon: Briefcase },
    { href: '/admin/graphic', label: 'Manage Graphic Portfolio', icon: Image },
    { href: '/admin/testimonials', label: 'Manage Testimonials', icon: MessageSquare },
    { href: '/admin/content', label: 'Content CMS', icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back to the admin panel</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="border-glow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                        <div className="text-3xl font-bold">{stat.value}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="border-glow border-glow-hover cursor-pointer group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <span className="font-semibold">{link.label}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Public Site</h2>
          <Link href="/">
            <Button variant="outline">
              View Live Site
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
