import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationsList } from "@/components/admin/ApplicationsList";
import { ApplicationDetail } from "@/components/admin/ApplicationDetail";
import { InterestList } from "@/components/admin/InterestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string | null;
  gender_self_described: string | null;
  q1_money_no_barrier: string;
  q2_ten_years_ago: string;
  q3_didnt_think_could: string;
  anything_else: string | null;
  status: string;
  notes: string | null;
  submitted_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

export default function AdminApplications() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (selectedId) {
      supabase
        .from("pilot_applications" as any)
        .select("*")
        .eq("id", selectedId)
        .single()
        .then(({ data }) => setSelectedApp(data as unknown as Application | null));
    } else {
      setSelectedApp(null);
    }
  }, [selectedId]);

  const handleStatusChange = async (id: string, status: Application["status"]) => {
    const { error } = await supabase
      .from("pilot_applications" as any)
      .update({ status })
      .eq("id", id);
    if (!error && selectedApp?.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-primary">Pilot Applications</h1>
      </div>

      <Tabs defaultValue="applications" className="w-full h-full flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interest">Interest List</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="flex-1 flex overflow-hidden">
          <div className="flex w-full h-full">
            {/* List pane */}
            <div className="w-full md:w-1/2 lg:w-2/5 border-r border-border h-full overflow-y-auto pr-4">
              <ApplicationsList
                onSelect={(app) => setSelectedId(app.id)}
                selectedId={selectedId}
              />
            </div>

            {/* Detail pane */}
            <div className="w-full md:w-1/2 lg:w-3/5 h-full flex flex-col">
              <ApplicationDetail
                application={selectedApp}
                onBack={() => setSelectedId(null)}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interest" className="flex-1 overflow-y-auto p-4">
          <InterestList />
        </TabsContent>
      </Tabs>
    </div>
  );
}