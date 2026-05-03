import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isSignInPending } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn({ email, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] rounded-full bg-violet-100/50 blur-3xl translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gradient-to-br from-primary to-primary-soft rounded-2xl shadow-xl mb-4 rotate-3 group-hover:rotate-0 transition-transform">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Autimate Admin</h1>
          <p className="text-muted-foreground mt-2 font-medium">Platform Management Control</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
          <CardHeader className="pt-8 px-8 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@autimate.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Security Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSignInPending}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-70 mt-4"
              >
                {isSignInPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-muted/20 text-center">
               <p className="text-[11px] text-muted-foreground leading-relaxed">
                 Authorized Personnel Only. All actions on this platform are logged and monitored.
               </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
