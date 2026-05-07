import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppAuthGate } from "@/components/auth/AppAuthGate";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Facilities from "./pages/Facilities";
import HospitalDetail from "./pages/HospitalDetail";
import Equipment from "./pages/Equipment";
import Requests from "./pages/Requests";
import RequestPatientVisit from "./pages/RequestPatientVisit";
import NewRequest from "./pages/NewRequest";
import MapLocator from "./pages/MapLocator";
import AIRecommendations from "./pages/AIRecommendations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ChangePassword from "./pages/ChangePassword";
import Team from "./pages/Team";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Patients from "./pages/Patients";
import PatientNew from "./pages/PatientNew";
import PatientDetail from "./pages/PatientDetail";

const queryClient = new QueryClient();

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
              path="/change-password"
              element={
                <AppAuthGate>
                  <ChangePassword />
                </AppAuthGate>
              }
            />
            <Route
              path="/*"
              element={
                <AppAuthGate>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/facilities" element={<Facilities />} />
                      <Route path="/hospitals/:id" element={<HospitalDetail />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/requests" element={<Requests />} />
                      <Route path="/requests/new" element={<NewRequest />} />
                      <Route
                        path="/requests/:id/visit"
                        element={<RequestPatientVisit />}
                      />
                      <Route path="/map" element={<MapLocator />} />
                      <Route path="/ai" element={<AIRecommendations />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/patients/new" element={<PatientNew />} />
                      <Route path="/patients/:id" element={<PatientDetail />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                </AppAuthGate>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
