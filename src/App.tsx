import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import InstallPrompt from "@/components/InstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import DevPageMenu from "@/components/DevPageMenu";

// Route-level code splitting: every page loads on demand so first paint only
// ships the shell (React, router, auth). Heavy deps (gsap, recharts, tldraw,
// jspdf) stay inside the chunks of the pages that use them.
const Home = lazy(() => import("./pages/Home"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminConsole = lazy(() => import("./pages/admin/AdminConsole"));
const AdminFramework = lazy(() => import("./pages/admin/AdminFramework"));
const StaffTrainingHome = lazy(() => import("@/components/staff-training/TrainingHome"));
const StaffModuleRunner = lazy(() => import("@/components/staff-training/ModuleRunner"));
const StaffTrainingPolicies = lazy(() => import("@/components/staff-training/TrainingPolicies"));
const StaffTrainingDocuments = lazy(() => import("@/components/staff-training/TrainingDocuments"));
const StaffTrainingTeam = lazy(() => import("@/components/staff-training/TrainingTeam"));
const StaffTrainingTeamMember = lazy(() => import("@/components/staff-training/TrainingTeamMember"));
const WelcomeWall = lazy(() => import("./pages/display/WelcomeWall"));
const About = lazy(() => import("./pages/About"));
const Membership = lazy(() => import("./pages/Membership"));
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
const PortalCheckIn = lazy(() => import("./pages/portal/PortalCheckIn"));
const PortalKids = lazy(() => import("./pages/portal/PortalKids"));
const PortalBilling = lazy(() => import("./pages/portal/PortalBilling"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RefundPage = lazy(() => import("./pages/RefundPage"));
const SafeguardingPage = lazy(() => import("./pages/SafeguardingPage"));
const Marketing = lazy(() => import("./pages/Marketing"));
const FacilitatorView = lazy(() => import("./pages/mindcast-live/FacilitatorView"));
const LiveJoin = lazy(() => import("./pages/mindcast-live/LiveJoin"));
const MindcastLibrary = lazy(() => import("./pages/mindcast-live/Library"));
const MindcastLesson = lazy(() => import("./pages/mindcast-live/Lesson"));
const LessonEditor = lazy(() => import("./pages/mindcast-live/LessonEditor"));
const CoursebookPrint = lazy(() => import("./pages/mindcast-live/CoursebookPrint"));
const BraceletTap = lazy(() => import("./pages/BraceletTap"));
const Kiosk = lazy(() => import("./pages/Kiosk"));
const DoorScanner = lazy(() => import("./pages/admin/DoorScanner"));
const PortalPass = lazy(() => import("./pages/portal/PortalPass"));
const TryASession = lazy(() => import("./pages/TryASession"));
const RoomRoll = lazy(() => import("./pages/facilitate/RoomRoll"));
const AdminHandbook = lazy(() => import("./pages/admin/AdminHandbook"));

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

// A permanent redirect for a retired path. Unlike <Navigate to="/path">, this
// carries the query string over — /auth?redirect=/live/ABC has to keep its
// redirect through the move to the portal sign-in.
const LegacyRedirect = ({ to }: { to: string }) => {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<LegacyRedirect to="/portal/login" />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/try" element={<TryASession />} />

      {/* Admin — one console; old deep links forward to the right tab.
          Kiosk + Framework stay standalone (hardware / print surfaces). */}
      <Route path="/admin" element={<AdminRoute><AdminConsole /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin?tab=dashboard" replace />} />
      <Route path="/admin/life-groups" element={<Navigate to="/admin?tab=groups" replace />} />
      <Route path="/admin/history" element={<Navigate to="/admin?tab=sessions&sub=history" replace />} />
      <Route path="/admin/scheduling" element={<Navigate to="/admin?tab=sessions&sub=schedule" replace />} />
      <Route path="/admin/kids" element={<Navigate to="/admin?tab=sessions&sub=kids" replace />} />
      <Route path="/admin/moderation" element={<Navigate to="/admin?tab=sessions&sub=moderation" replace />} />
      <Route path="/admin/emails" element={<Navigate to="/admin?tab=sessions&sub=emails" replace />} />
      <Route path="/admin/program" element={<AdminOnlyRoute><Navigate to="/admin?tab=sessions&sub=program" replace /></AdminOnlyRoute>} />
      <Route path="/admin/membership" element={<AdminOnlyRoute><Navigate to="/admin?tab=membership" replace /></AdminOnlyRoute>} />
      <Route path="/admin/applications" element={<AdminOnlyRoute><Navigate to="/admin?tab=membership&sub=applications" replace /></AdminOnlyRoute>} />
      <Route path="/admin/members" element={<AdminOnlyRoute><Navigate to="/admin?tab=membership&sub=members" replace /></AdminOnlyRoute>} />
      <Route path="/admin/households" element={<AdminOnlyRoute><Navigate to="/admin?tab=membership&sub=households" replace /></AdminOnlyRoute>} />
      <Route path="/admin/framework" element={<AdminRoute><AdminFramework /></AdminRoute>} />
      <Route path="/admin/kiosk" element={<AdminRoute><Kiosk /></AdminRoute>} />
      <Route path="/admin/scan" element={<AdminRoute><DoorScanner /></AdminRoute>} />
      <Route path="/facilitate/roll/:room" element={<AdminRoute><RoomRoll /></AdminRoute>} />
      <Route path="/admin/handbook" element={<AdminRoute><AdminHandbook /></AdminRoute>} />

      {/* Staff Training (MC-TRN-001) — staff see their own path; team views admin-only */}
      <Route path="/admin/staff-training" element={<AdminRoute><StaffTrainingHome /></AdminRoute>} />
      <Route path="/admin/staff-training/module/:moduleId" element={<AdminRoute><StaffModuleRunner /></AdminRoute>} />
      <Route path="/admin/staff-training/policies" element={<AdminRoute><StaffTrainingPolicies /></AdminRoute>} />
      <Route path="/admin/staff-training/documents" element={<AdminRoute><StaffTrainingDocuments /></AdminRoute>} />
      <Route path="/admin/staff-training/team" element={<AdminOnlyRoute><StaffTrainingTeam /></AdminOnlyRoute>} />
      <Route path="/admin/staff-training/team/:userId" element={<AdminOnlyRoute><StaffTrainingTeamMember /></AdminOnlyRoute>} />

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
      <Route path="/portal/checkin" element={<ProtectedRoute><PortalCheckIn /></ProtectedRoute>} />
      <Route path="/portal/kids" element={<ProtectedRoute><PortalKids /></ProtectedRoute>} />
      <Route path="/portal/pass" element={<ProtectedRoute><PortalPass /></ProtectedRoute>} />
      <Route path="/portal/admin" element={<Navigate to="/admin" replace />} />
      <Route path="/portal/billing" element={<ProtectedRoute><PortalBilling /></ProtectedRoute>} />

      {/* Sunday Live (facilitator + members) */}
      <Route path="/live" element={<ComingSoon />} />
      <Route path="/live/:code" element={<LiveJoin />} />
      <Route path="/b/:token" element={<BraceletTap />} />
      <Route path="/mindcast-live/library" element={<ProtectedRoute><MindcastLibrary /></ProtectedRoute>} />
      <Route path="/mindcast-live/lesson/:weekNumber" element={<ProtectedRoute><MindcastLesson /></ProtectedRoute>} />
      <Route path="/mindcast-live/facilitate/:weekNumber" element={<AdminRoute><FacilitatorView /></AdminRoute>} />
      <Route path="/mindcast-live/edit/:weekNumber" element={<AdminRoute><LessonEditor /></AdminRoute>} />
      <Route path="/mindcast-live/coursebook" element={<AdminRoute><CoursebookPrint /></AdminRoute>} />
      <Route path="/admin/training" element={<Navigate to="/admin/staff-training" replace />} />
      <Route path="/training" element={<LegacyRedirect to="/admin/staff-training" />} />

      {/* Public displays */}
      <Route path="/display" element={<WelcomeWall />} />
      <Route path="/display/wall" element={<WelcomeWall />} />
      {/* Retired: superseded by the moderated word cloud on the Together slide. */}
      <Route path="/display/goals" element={<Navigate to="/display" replace />} />
      <Route path="/display/wordcloud" element={<Navigate to="/display" replace />} />

      {/* Marketing */}
      <Route path="/about" element={<About />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/pilot" element={<LegacyRedirect to="/membership" />} />
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
      {/* Retired product landing pages — folded into the single Mindcast membership */}
      <Route path="/little-minds" element={<Navigate to="/" replace />} />
      <Route path="/signal" element={<Navigate to="/" replace />} />
      <Route path="/connect" element={<Navigate to="/" replace />} />
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
  ["/portal/checkin", "Check-In · Mindcast Portal"],
  ["/portal/kids", "Kid Sessions · Mindcast Portal"],
  ["/portal/login", "Member Login · Mindcast"],
  ["/mindcast-live/library", "Coursebook Library · Mindcast"],
  ["/mindcast-live/lesson", "Lesson · Mindcast"],
  ["/mindcast-live/facilitate", "Facilitate · Mindcast"],
  ["/mindcast-live/edit", "Edit Lesson · Mindcast"],
  ["/mindcast-live/coursebook", "Coursebook (Print) · Mindcast"],
  ["/admin/dashboard", "Dashboard · Admin"],
  ["/admin/life-groups", "Life Groups · Admin"],
  ["/admin/scan", "Door Scan · Mindcast"],
  ["/portal/pass", "Door Pass · Mindcast Portal"],
  ["/try", "Try a Session · Mindcast"],
  ["/admin/staff-training", "Staff Training · Mindcast"],
  ["/admin", "Admin · Mindcast"],
  ["/workbook", "Workbook · Mindcast"],
  ["/dashboard", "Dashboard · Mindcast"],
  ["/checkin", "Check In · Mindcast"],
  ["/join", "Join a Session · Mindcast"],
  ["/live", "Live Session · Mindcast"],
  ["/membership", "Membership · Mindcast"],
  ["/about", "About · Mindcast"],
  ["/auth", "Sign In · Mindcast"],
  ["/terms", "Terms of Use · Mindcast"],
  ["/privacy", "Privacy Policy · Mindcast"],
  ["/refund", "Refund Policy · Mindcast"],
  ["/safeguarding", "Safeguarding · Mindcast"],
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
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <InstallPrompt />
          <DevPageMenu />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
