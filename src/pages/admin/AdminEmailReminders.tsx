import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Mail, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminEmailReminders = ({ embedded = false }: { embedded?: boolean }) => {
  const [logs, setLogs] = useState<Tables<"email_reminders">[]>([]);
  const [cohorts, setCohorts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [reminders, cohortsRes] = await Promise.all([
      supabase
        .from("email_reminders")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50),
      supabase.from("cohorts").select("id, name"),
    ]);

    setLogs(reminders.data || []);
    const map: Record<string, string> = {};
    (cohortsRes.data || []).forEach((c) => { map[c.id] = c.name; });
    setCohorts(map);
    setLoading(false);
  };

  const handleSendNow = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-weekly-reminder");
      if (error) throw error;
      toast.success(`Reminders sent: ${JSON.stringify(data.results || [])}`);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message ? err.message : "Failed to send reminders");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-[#0F1E35] text-[#F5F1E8]`}>
      <div className="container max-w-4xl mx-auto px-6 py-12">
        {!embedded && (
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase opacity-50 hover:opacity-100 transition mb-8"
        >
          <ArrowLeft size={12} /> Back to Admin
        </Link>
        )}

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Mail size={24} className="opacity-60" />
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
              Email Reminders
            </h1>
          </div>
          <Button
            onClick={handleSendNow}
            disabled={sending}
            className="bg-[#F5F1E8] text-[#0F1E35] hover:bg-[#F5F1E8]/90 rounded-full px-6 text-xs tracking-wider"
          >
            {sending ? (
              <><Loader2 size={14} className="animate-spin mr-2" /> Sending...</>
            ) : (
              <><Send size={14} className="mr-2" /> Send Now</>
            )}
          </Button>
        </div>

        <p className="text-sm opacity-50 mb-8">
          Reminder emails are sent automatically every Sunday at 8pm NZT. Use "Send Now" to trigger manually for testing.
        </p>

        {loading ? (
          <div className="text-center py-20 opacity-40">
            <Loader2 size={24} className="animate-spin mx-auto mb-3" />
            <p className="text-xs tracking-widest">LOADING LOGS...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Mail size={32} className="mx-auto mb-4" />
            <p className="text-sm">No reminders sent yet</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] tracking-widest uppercase opacity-40">Week</th>
                  <th className="px-4 py-3 text-[10px] tracking-widest uppercase opacity-40">Cohort</th>
                  <th className="px-4 py-3 text-[10px] tracking-widest uppercase opacity-40">Sent At</th>
                  <th className="px-4 py-3 text-[10px] tracking-widest uppercase opacity-40">Recipients</th>
                  <th className="px-4 py-3 text-[10px] tracking-widest uppercase opacity-40">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono">{log.week_number}</td>
                    <td className="px-4 py-3">{cohorts[log.cohort_id as string] || "—"}</td>
                    <td className="px-4 py-3 opacity-60">
                      {new Date(log.sent_at as string).toLocaleDateString("en-NZ", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono">{log.recipient_count}</td>
                    <td className="px-4 py-3">
                      {log.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle size={12} /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmailReminders;
