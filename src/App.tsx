import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Route-level code splitting: every page loads on demand so first paint only
// ships the shell (React, router, auth). Heavy deps (gsap, recharts, tldraw,
// jspdf) stay inside the chunks of the pages that use them.
const Index = lazy(() => import("./pages/Index"));
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminLanding = lazy(() => import("./pages/AdminLanding"));
const AdminSessions = lazy(() => import("./pages/admin/AdminSessions"));
const AdminSessionEditor = lazy(() => import("./pages/admin/AdminSessionEditor"));
const AdminHistory = lazy(() => import("./pages/admin/AdminHistory"));
const AdminLive = lazy(() => import("./pages/admin/AdminLive"));
const AdminFramework = lazy(() => import("./pages/admin/AdminFramework"));
const AdminKids = lazy(() => import("./pages/admin/AdminKids"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminCurriculum = lazy(() => import("./pages/admin/AdminCurriculum"));
const AdminPresenter = lazy(() => import("./pages/admin/AdminPresenter"));
const AdminSessionRunner = lazy(() => import("./pages/admin/AdminSessionRunner"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminEmailReminders = lazy(() => import("./pages/admin/AdminEmailReminders"));
const WorkbookRouter = lazy(() => import("./pages/WorkbookRouter"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkin = lazy(() => import("./pages/Checkin"));
const WelcomeWall = lazy(() => import("./pages/display/WelcomeWall"));
const GoalWall = lazy(() => import("./pages/display/GoalWall"));
const WordCloud = lazy(() => import("./pages/display/WordCloud"));
const About = lazy(() => import("./pages/About"));
const Pilot = lazy(() => import("./pages/Pilot"));
const PilotSuccess = lazy(() => import("./pages/PilotSuccess"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Session = lazy(() => import("./pages/Session"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JoinEntry = lazy(() => import("./pages/JoinEntry"));
const JoinSession = lazy(() => import("./pages/JoinSession"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const PortalWeek = lazy(() => import("./pages/portal/PortalWeek"));
const PortalWeeks = lazy(() => import("./pages/portal/PortalWeeks"));
const PortalGroup = lazy(() => import("./pages/portal/PortalGroup"));
const PortalInsights = lazy(() => import("./pages/portal/PortalInsights"));
const PortalDownloads = lazy(() => import("./pages/portal/PortalDownloads"));
const PortalSettings = lazy(() => import("./pages/portal/PortalSettings"));
const PortalProgress = lazy(() => import("./pages/portal/PortalProgress"));
const PortalAdmin = lazy(() => import("./pages/portal/PortalAdmin"));
const PortalBilling = lazy(() => import("./pages/portal/PortalBilling"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RefundPage = lazy(() => import("./pages/RefundPage"));
const SafeguardingPage = lazy(() => import("./pages/SafeguardingPage"));
const SignalLanding = lazy(() => import("./pages/SignalLanding"));
const LittleMindsLanding = lazy(() => import("./pages/LittleMindsLanding"));
const ConnectLanding = lazy(() => import("./pages/ConnectLanding"));
const Marketing = lazy(() => import("./pages/Marketing"));
const FacilitatorView = lazy(() => import("./pages/mindcast-live/FacilitatorView"));
const LiveJoin = lazy(() => import("./pages/mindcast-live/LiveJoin"));
const MindcastLibrary = lazy(() => import("./pages/mindcast-live/Library"));
const MindcastLesson = lazy(() => import("./pages/mindcast-live/Lesson"));
const BraceletTap = lazy(() => import("./pages/BraceletTap"));
const Demo = lazy(() => import("./pages/Demo"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <span className="text-muted-foreground text-xs tracking-widest animate-pulse">LOADING...</span>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/portal/login" replace />;
  return <>{children}</>;
};

// Session-admin UI: reachable by facilitators (run a live session) and admins.
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isStaff, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/portal/login" replace />;
  if (!isStaff) return <Navigate to="/portal/dashboard" replace />;
  return <>{children}</>;
};

// Admin-only UI (payments, member/household management). Facilitators excluded.
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/portal/login" replace />;
  if (!isAdmin) return <Navigate to="/portal/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
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
      <Route path="/b/:token" element={<BraceletTap />} />
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
      <Route path="/portal/billing" element={<ProtectedRoute><PortalBilling /></ProtectedRoute>} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/safeguarding" element={<SafeguardingPage />} />
      <Route path="/marketing" element={<AdminRoute><Marketing /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Per-route document titles so browser tabs, history and search results are
// meaningful. Longest prefix wins; falls back to the brand default.
const DEFAULT_TITLE = "Mindcast — Weekly Gathering for Growth";
const TITLE_MAP: [string, string][] = [
  ["/portal/dashboard", "Dashboard · Mindcast Portal"],
  ["/portal/weeks", "Weekly Sessions · Mindcast Portal"],
  ["/portal/week", "Week · Mindcast Portal"],
  ["/portal/group", "Group · Mindcast Portal"],
  ["/portal/insights", "Insights · Mindcast Portal"],
  ["/portal/downloads", "Downloads · Mindcast Portal"],
  ["/portal/settings", "Settings · Mindcast Portal"],
  ["/portal/progress", "Progress · Mindcast Portal"],
  ["/portal/login", "Member Login · Mindcast"],
  ["/mindcast-live/library", "Coursebook Library · Mindcast"],
  ["/mindcast-live/lesson", "Lesson · Mindcast"],
  ["/mindcast-live/facilitate", "Facilitate · Mindcast"],
  ["/admin", "Admin · Mindcast"],
  ["/workbook", "Workbook · Mindcast"],
  ["/dashboard", "Dashboard · Mindcast"],
  ["/checkin", "Check In · Mindcast"],
  ["/join", "Join a Session · Mindcast"],
  ["/live", "Live Session · Mindcast"],
  ["/pilot", "Founding Pilot · Mindcast"],
  ["/about", "About · Mindcast"],
  ["/auth", "Sign In · Mindcast"],
  ["/terms", "Terms of Use · Mindcast"],
  ["/privacy", "Privacy Policy · Mindcast"],
  ["/refund", "Refund Policy · Mindcast"],
  ["/safeguarding", "Safeguarding · Mindcast"],
  ["/little-minds", "Little Minds · Mindcast"],
  ["/signal", "Signal · Mindcast"],
  ["/connect", "Connect · Mindcast"],
];

const RouteTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = TITLE_MAP
      .filter(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix))
      .sort((a, b) => b[0].length - a[0].length)[0];
    document.title = match ? match[1] : DEFAULT_TITLE;
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <RouteTitle />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
