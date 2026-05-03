import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import Dashboard from '@/pages/Dashboard';
import UsersPage from '@/pages/Users';
import SocialSkillsAdmin from '@/pages/SocialSkillsAdmin';
import SpeechTherapyAdmin from '@/pages/SpeechTherapyAdmin';
import SpeechSpaceAdmin from '@/pages/SpeechSpaceAdmin';
import LoginPage from '@/pages/Login';
import { useAuth } from '@/hooks/useAuth';

// Create a client
const queryClient = new QueryClient();

function App() {
  const { isLoggedIn, isUserLoading } = useAuth();

  if (isUserLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing Admin Control...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          {!isLoggedIn ? (
            <Routes>
              <Route path="/auth" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          ) : (
            <SidebarProvider>
              <div className="flex min-h-screen w-full bg-[#f8fafc]">
                <AppSidebar />
                <main className="flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 lg:p-10">
                  <div className="max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/social-admin" element={<SocialSkillsAdmin />} />
                      <Route path="/therapy-admin" element={<SpeechTherapyAdmin />} />
                      <Route path="/speech-space-admin" element={<SpeechSpaceAdmin />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
              <Toaster />
            </SidebarProvider>
          )}
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
