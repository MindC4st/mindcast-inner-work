import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import SubAppLanding from "./pages/SubAppLanding";
import AdminLanding from "./pages/AdminLanding";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminSessionEditor from "./pages/admin/AdminSessionEditor";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminLive from "./pages/admin/AdminLive";
import AdminFramework from "./pages/admin/AdminFramework";
import AdminKids from "./pages/admin/AdminKids";
import AdminMembers from "./pages/admin/AdminMembers";
import WorkbookRouter from "./pages/WorkbookRouter";
import Dashboard from "./pages/Dashboard";
import Checkin from "./pages/Checkin";
import WelcomeWall from "./pages/display/WelcomeWall";
import GoalWall from "./pages/display/GoalWall";
import WordCloud from "./pages/display/WordCloud";
import Live from "./pages/Live";
import Resources from "./pages/Resources";
import Membership from "./pages/Membership";
import About from "./pages/About";
import EcosystemPage from "./pages/EcosystemPage";
import Session from "./pages/Session";
import NotFound from "./pages/NotFound";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalWeek from "./pages/portal/PortalWeek";
import PortalWeeks from "./pages/portal/PortalWeeks";
import PortalGroup from "./pages/portal/PortalGroup";
import PortalInsights from "./pages/portal/PortalInsights";
import PortalDownloads from "./pages/portal/PortalDownloads";
import PortalSettings from "./pages/portal/PortalSettings";
import PortalProgress from "./pages/portal/PortalProgress";
import PortalAdmin from "./pages/portal/PortalAdmin";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center"><span className="text-secondary text-xs tracking-widest animate-pulse">LOADING...</span></div>;
  if (!session) return <Navigate to="/portal/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/classic" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/admin" element={<AdminLanding />} />
    <Route path="/admin/sessions" element={<AdminSessions />} />
    <Route path="/admin/sessions/:id" element={<AdminSessionEditor />} />
    <Route path="/admin/history" element={<AdminHistory />} />
    <Route path="/admin/live" element={<AdminLive />} />
    <Route path="/admin/framework" element={<AdminFramework />} />
    <Route path="/admin/kids" element={<AdminKids />} />
    <Route path="/admin/members" element={<AdminMembers />} />
    <Route path="/workbook" element={<ProtectedRoute><Workbook /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/checkin" element={<Checkin />} />
    <Route path="/display" element={<WelcomeWall />} />
    <Route path="/display/goals" element={<GoalWall />} />
    <Route path="/display/wordcloud" element={<WordCloud />} />
    <Route path="/little-minds" element={<SubAppLanding />} />
    <Route path="/signal" element={<SubAppLanding />} />
    <Route path="/connect" element={<SubAppLanding />} />
    <Route path="/live" element={<Live />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/membership" element={<Membership />} />
    <Route path="/about" element={<About />} />
    <Route path="/ecosystem" element={<EcosystemPage />} />
    <Route path="/sessions" element={<Navigate to="/portal/weeks" replace />} />
    <Route path="/session/:sessionId" element={<Session />} />
    <Route path="/portal/login" element={<PortalLogin />} />
    <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
    <Route path="/portal/dashboard" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
    <Route path="/portal/week/:weekNumber" element={<ProtectedRoute><PortalWeek /></ProtectedRoute>} />
    <Route path="/portal/weeks" element={<ProtectedRoute><PortalWeeks /></ProtectedRoute>} />
    <Route path="/portal/group" element={<ProtectedRoute><PortalGroup /></ProtectedRoute>} />
    <Route path="/portal/insights" element={<ProtectedRoute><PortalInsights /></ProtectedRoute>} />
    <Route path="/portal/downloads" element={<ProtectedRoute><PortalDownloads /></ProtectedRoute>} />
    <Route path="/portal/settings" element={<ProtectedRoute><PortalSettings /></ProtectedRoute>} />
    <Route path="/portal/progress" element={<ProtectedRoute><PortalProgress /></ProtectedRoute>} />
    <Route path="/portal/admin" element={<ProtectedRoute><PortalAdmin /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
