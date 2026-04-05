import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Workbook from "./Workbook";
import TeenWorkbook from "./TeenWorkbook";
import KidsWorkbook from "./KidsWorkbook";

const WorkbookRouter = () => {
  const { user, loading } = useAuth();
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) { setProfileLoading(false); return; }
    supabase.from("profiles").select("age_group").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setAgeGroup(data?.age_group || "adult");
      setProfileLoading(false);
    });
  }, [user, loading]);

  if (loading || profileLoading) {
    return <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center"><span className="text-white/20 text-xs animate-pulse font-body">Loading...</span></div>;
  }

  if (ageGroup === "teen") return <TeenWorkbook />;
  if (ageGroup === "child" || ageGroup === "kids") return <KidsWorkbook />;
  return <Workbook />;
};

export default WorkbookRouter;
