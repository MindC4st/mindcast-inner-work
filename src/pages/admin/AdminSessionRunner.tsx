import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import SessionSlideshow from "@/components/session-runner/SessionSlideshow";

// TODO Phase 3: Live Member Sync
// - Use Supabase Realtime to broadcast the current slide index to members
// - Members see a simplified read-only view of the current slide on /dashboard/live
// - Admin controls the pace; members follow
// - Enables hybrid/remote attendance for large-scale events

const AdminSessionRunner = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role !== "facilitator") {
      navigate("/portal/dashboard", { replace: true });
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center">
        <span className="text-[hsl(var(--ivory))] text-xs tracking-widest animate-pulse font-body">LOADING...</span>
      </div>
    );
  }

  if (role !== "facilitator") return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--navy))]">
      {/* Minimal header — hidden in fullscreen */}
      <div className="session-runner-header px-6 py-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 text-[hsl(var(--ivory))]/60 hover:text-[hsl(var(--ivory))] transition-colors text-xs tracking-widest font-body">
          <ArrowLeft size={14} />
          ADMIN
        </Link>
        <div className="text-right">
          <h1 className="font-display text-lg text-[hsl(var(--ivory))] tracking-wider">SESSION RUNNER</h1>
          <p className="text-[hsl(var(--ivory))]/30 text-[10px] tracking-widest font-body">
            Press F or click ⛶ for TV mode
          </p>
        </div>
      </div>

      <SessionSlideshow />
    </div>
  );
};

export default AdminSessionRunner;
