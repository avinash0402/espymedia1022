import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminSetup } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const setup = useAdminSetup();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setup.mutate(
      { data: { email, password } },
      {
        onSuccess: () => {
          toast({ title: 'Admin account created successfully' });
          setLocation('/admin');
        },
        onError: (error) => {
          toast({
            title: error.message.includes('already complete') ? 'Admin setup is already complete' : 'Could not create admin account',
            description: error.message.includes('8 characters')
              ? 'Use a password with at least 8 characters.'
              : error.message.replace(/^\{"error":"?/, '').replace(/"?\}$/, '').slice(0, 180),
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full gradient-purple opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600 opacity-15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-purple mb-2">Espy Media</h1>
          <p className="text-muted-foreground">Create admin account</p>
        </div>

        <Card className="border-glow">
          <CardHeader>
            <CardTitle>Initial setup</CardTitle>
            <CardDescription>Create the first administrator account for this deployment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="setup-email">Admin email</Label>
                <Input
                  id="setup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="mt-2"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="setup-password">Admin password</Label>
                <div className="relative mt-2">
                  <Input
                    id="setup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-purple" disabled={setup.isPending}>
                {setup.isPending ? 'Creating account...' : 'Create admin account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
