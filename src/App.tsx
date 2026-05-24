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
import AdminCurriculum from "./pages/admin/AdminCurriculum";
import AdminPresenter from "./pages/admin/AdminPresenter";
import AdminSessionRunner from "./pages/admin/AdminSessionRunner";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminEmailReminders from "./pages/admin/AdminEmailReminders";
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
import Pilot from "./pages/Pilot";
import PilotSuccess from "./pages/PilotSuccess";
import ComingSoon from "./pages/ComingSoon";
import Session from "./pages/Session";
import NotFound from "./pages/NotFound";
import JoinEntry from "./pages/JoinEntry";
import JoinSession from "./pages/JoinSession";
import ResetPassword from "./pages/ResetPassword";
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
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import SafeguardingPage from "./pages/SafeguardingPage";
import SignalLanding from "./pages/SignalLanding";
import LittleMindsLanding from "./pages/LittleMindsLanding";
import ConnectLanding from "./pages/ConnectLanding";
import Marketing from "./pages/Marketing";
import FacilitatorView from "./pages/mindcast-live/FacilitatorView";
import LiveJoin from "./pages/mindcast-live/LiveJoin";
import MindcastLibrary from "./pages/mindcast-live/Library";
import MindcastLesson from "./pages/mindcast-live/Lesson";
import Demo from "./pages/Demo";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground text-xs tracking-widest animate-pulse">LOADING...</span></div>;
  if (!session) return <Navigate to="/portal/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground text-xs tracking-widest animate-pulse">LOADING...</span></div>;
  if (!session) return <Navigate to="/portal/login" replace />;
  if (role !== "facilitator") return <Navigate to="/portal/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/demo" element={<Demo />} />
    <Route path="/classic" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/join" element={<JoinEntry />} />
    <Route path="/join/:code" element={<JoinSession />} />
    <Route path="/admin" element={<AdminRoute><AdminLanding /></AdminRoute>} />
    <Route path="/admin/sessions" element={<AdminRoute><AdminSessions /></AdminRoute>} />
    <Route path="/admin/sessions/:id" element={<AdminRoute><AdminSessionEditor /></AdminRoute>} />
    <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
    <Route path="/admin/live" element={<AdminRoute><AdminLive /></AdminRoute>} />
    <Route path="/admin/framework" element={<AdminRoute><AdminFramework /></AdminRoute>} />
    <Route path="/admin/kids" element={<AdminRoute><AdminKids /></AdminRoute>} />
    <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
    <Route path="/admin/curriculum" element={<AdminRoute><AdminCurriculum /></AdminRoute>} />
    <Route path="/admin/present/:id" element={<AdminRoute><AdminPresenter /></AdminRoute>} />
    <Route path="/admin/session-runner" element={<AdminRoute><AdminSessionRunner /></AdminRoute>} />
    <Route path="/admin/applications" element={<AdminRoute><AdminApplicationsPage /></AdminRoute>} />
    <Route path="/admin/emails" element={<AdminRoute><AdminEmailReminders /></AdminRoute>} />
    <Route path="/workbook" element={<ProtectedRoute><WorkbookRouter /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/checkin" element={<Checkin />} />
    <Route path="/display" element={<WelcomeWall />} />
    <Route path="/display/goals" element={<GoalWall />} />
    <Route path="/display/wordcloud" element={<WordCloud />} />
    <Route path="/little-minds" element={<LittleMindsLanding />} />
    <Route path="/signal" element={<SignalLanding />} />
    <Route path="/connect" element={<ConnectLanding />} />
    <Route path="/live" element={<ComingSoon />} />
    <Route path="/live/:code" element={<LiveJoin />} />
    <Route path="/mindcast-live/library" element={<ProtectedRoute><MindcastLibrary /></ProtectedRoute>} />
    <Route path="/mindcast-live/lesson/:weekNumber" element={<ProtectedRoute><MindcastLesson /></ProtectedRoute>} />
    <Route path="/mindcast-live/facilitate/:weekNumber" element={<AdminRoute><FacilitatorView /></AdminRoute>} />
    <Route path="/resources" element={<ComingSoon />} />
    <Route path="/membership" element={<Navigate to="/pilot" replace />} />
    <Route path="/about" element={<About />} />
    <Route path="/ecosystem" element={<ComingSoon />} />
    <Route path="/pilot" element={<Pilot />} />
    <Route path="/pilot/success" element={<PilotSuccess />} />
    <Route path="/sessions" element={<Navigate to="/portal/weeks" replace />} />
    <Route path="/session/:sessionId" element={<Session />} />
    <Route path="/portal/login" element={<PortalLogin />} />
    <Route path="/reset-password" element={<ResetPassword />} />
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
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/refund" element={<RefundPage />} />
    <Route path="/safeguarding" element={<SafeguardingPage />} />
    <Route path="/marketing" element={<AdminRoute><Marketing /></AdminRoute>} />
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
