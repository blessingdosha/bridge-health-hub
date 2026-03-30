import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Facilities from "./pages/Facilities";
import Equipment from "./pages/Equipment";
import Requests from "./pages/Requests";
import NewRequest from "./pages/NewRequest";
import MapLocator from "./pages/MapLocator";
import AIRecommendations from "./pages/AIRecommendations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/facilities" element={<Facilities />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/requests" element={<Requests />} />
                      <Route path="/requests/new" element={<NewRequest />} />
                      <Route path="/map" element={<MapLocator />} />
                      <Route path="/ai" element={<AIRecommendations />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
