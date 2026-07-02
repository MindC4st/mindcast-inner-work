import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import AdminApplications from "@/components/admin/AdminApplications";

const AdminApplicationsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "facilitator")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast({ title: "Access denied", variant: "destructive" });
          navigate("/");
        }
      });
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-foreground">MINDCAST</Link>
        <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs tracking-widest font-body transition-colors">
          <ArrowLeft size={14} />
          ADMIN
        </Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <AdminApplications />
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
