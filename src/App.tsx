import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import InstallPrompt from "@/components/InstallPrompt";
import DevPageMenu from "@/components/DevPageMenu";

// Route-level code splitting: every page loads on demand so first paint only
// ships the shell (React, router, auth). Heavy deps (gsap, recharts, tldraw,
// jspdf) stay inside the chunks of the pages that use them.
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminLanding = lazy(() => import("./pages/AdminLanding"));
const AdminHistory = lazy(() => import("./pages/admin/AdminHistory"));
const AdminFramework = lazy(() => import("./pages/admin/AdminFramework"));
const AdminKids = lazy(() => import("./pages/admin/AdminKids"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminEmailReminders = lazy(() => import("./pages/admin/AdminEmailReminders"));
const WorkbookRouter = lazy(() => import("./pages/WorkbookRouter"));
const WelcomeWall = lazy(() => import("./pages/display/WelcomeWall"));
const GoalWall = lazy(() => import("./pages/display/GoalWall"));
const WordCloud = lazy(() => import("./pages/display/WordCloud"));
const About = lazy(() => import("./pages/About"));
const Pilot = lazy(() => import("./pages/Pilot"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
const Kiosk = lazy(() => import("./pages/Kiosk"));
const AdminScheduling = lazy(() => import("./pages/admin/AdminScheduling"));
const AdminHouseholds = lazy(() => import("./pages/admin/AdminHouseholds"));
const AdminMembership = lazy(() => import("./pages/admin/AdminMembership"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
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
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLanding /></AdminRoute>} />
      <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
      <Route path="/admin/framework" element={<AdminRoute><AdminFramework /></AdminRoute>} />
      <Route path="/admin/kids" element={<AdminRoute><AdminKids /></AdminRoute>} />
      <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
      <Route path="/admin/applications" element={<AdminRoute><AdminApplicationsPage /></AdminRoute>} />
      <Route path="/admin/emails" element={<AdminRoute><AdminEmailReminders /></AdminRoute>} />
      <Route path="/admin/kiosk" element={<AdminRoute><Kiosk /></AdminRoute>} />
      <Route path="/admin/scheduling" element={<AdminRoute><AdminScheduling /></AdminRoute>} />
      <Route path="/admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />
      <Route path="/admin/households" element={<AdminOnlyRoute><AdminHouseholds /></AdminOnlyRoute>} />
      <Route path="/admin/membership" element={<AdminOnlyRoute><AdminMembership /></AdminOnlyRoute>} />

      {/* Portal (life-group companion) */}
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
      <Route path="/workbook" element={<ProtectedRoute><WorkbookRouter /></ProtectedRoute>} />

      {/* Sunday Live (facilitator + members) */}
      <Route path="/live" element={<ComingSoon />} />
      <Route path="/live/:code" element={<LiveJoin />} />
      <Route path="/b/:token" element={<BraceletTap />} />
      <Route path="/mindcast-live/library" element={<ProtectedRoute><MindcastLibrary /></ProtectedRoute>} />
      <Route path="/mindcast-live/lesson/:weekNumber" element={<ProtectedRoute><MindcastLesson /></ProtectedRoute>} />
      <Route path="/mindcast-live/facilitate/:weekNumber" element={<AdminRoute><FacilitatorView /></AdminRoute>} />

      {/* Public displays */}
      <Route path="/display" element={<WelcomeWall />} />
      <Route path="/display/goals" element={<GoalWall />} />
      <Route path="/display/wordcloud" element={<WordCloud />} />

      {/* Marketing */}
      <Route path="/about" element={<About />} />
      <Route path="/pilot" element={<Pilot />} />
      <Route path="/little-minds" element={<LittleMindsLanding />} />
      <Route path="/signal" element={<SignalLanding />} />
      <Route path="/connect" element={<ConnectLanding />} />
      <Route path="/marketing" element={<AdminRoute><Marketing /></AdminRoute>} />

      {/* Legal */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/safeguarding" element={<SafeguardingPage />} />

      {/* Retired routes → forwarded to the current equivalents (Phase 5).
          Files remain in the repo for one more sweep, then get removed. */}
      <Route path="/classic" element={<Navigate to="/" replace />} />
      <Route path="/ecosystem" element={<Navigate to="/" replace />} />
      <Route path="/resources" element={<Navigate to="/" replace />} />
      <Route path="/membership" element={<Navigate to="/pilot" replace />} />
      <Route path="/sessions" element={<Navigate to="/portal/weeks" replace />} />
      {/* Legacy admin session runner retired — consolidated onto mindcast-live */}
      <Route path="/admin/sessions" element={<Navigate to="/mindcast-live/library" replace />} />
      <Route path="/admin/sessions/:id" element={<Navigate to="/mindcast-live/library" replace />} />
      <Route path="/admin/live" element={<Navigate to="/mindcast-live/library" replace />} />
      <Route path="/admin/present/:id" element={<Navigate to="/mindcast-live/library" replace />} />
      <Route path="/admin/session-runner" element={<Navigate to="/mindcast-live/library" replace />} />
      <Route path="/dashboard" element={<Navigate to="/portal/dashboard" replace />} />
      <Route path="/checkin" element={<Navigate to="/portal/dashboard" replace />} />
      <Route path="/join" element={<Navigate to="/live" replace />} />
      <Route path="/join/:code" element={<Navigate to="/live" replace />} />
      <Route path="/session/:sessionId" element={<Navigate to="/portal/weeks" replace />} />

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
const DEFAULT_TITLE = "Mindcast — Tune Into Your Inner Self";
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
          <InstallPrompt />
          <DevPageMenu />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
