import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Nfc, ShieldCheck, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";

type Row = {
  name: string | null; display_name: string | null; email: string | null;
  nfc_id: string | null; age_group: string | null; membership_status: string | null;
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-body text-foreground">{value || "—"}</p>
  </div>
);

const AdminProfile = () => {
  const { user, role } = useAuth();
  const [row, setRow] = useState<Row | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await db
        .from("profiles")
        .select("name, display_name, email, nfc_id, age_group, membership_status")
        .eq("user_id", user.id).maybeSingle();
      if (data) {
        setRow(data);
        setDisplayName(data.display_name || "");
      }
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await db
      .from("profiles").update({ display_name: displayName.trim() }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setRow((r) => (r ? { ...r, display_name: displayName.trim() } : r));
    toast.success("Display name saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-wider">Profile</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">Your staff account and how you appear on the welcome wall.</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
        <ShieldCheck size={16} className="text-primary" />
        <p className="text-sm font-body text-foreground">
          Signed in as <span className="font-semibold">{row?.email || user?.email}</span>
          <span className="ml-2 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] tracking-[0.15em] uppercase">{role || "staff"}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={row?.name || ""} />
        <Field label="Membership" value={row?.membership_status || ""} />
        <Field label="Age group" value={row?.age_group || ""} />
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1 flex items-center gap-1.5"><Nfc size={11} /> NFC bracelet</p>
          <p className="text-sm font-body text-foreground">{row?.nfc_id || "Not linked"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <label className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground block mb-2">Display name on the welcome wall</label>
        <div className="flex gap-3">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How members see you on screen"
            className="flex-1 bg-transparent border border-border rounded-md px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
          />
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-body tracking-widest uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
          </button>
        </div>
        <p className="text-[11px] font-body text-muted-foreground mt-3">
          Member-facing settings (reminders, live display, privacy) live in{" "}
          <Link to="/portal/settings" className="text-primary underline underline-offset-2">portal settings</Link>.
        </p>
      </div>
    </div>
  );
};

export default AdminProfile;
