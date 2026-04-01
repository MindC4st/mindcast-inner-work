import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Eye, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface SessionBookmark {
  id?: string;
  timestamp_seconds: number;
  label: string;
  question: string;
  sort_order: number;
}

interface SessionRow {
  id: string;
  title: string;
  description: string;
  podcast_url: string;
  youtube_id: string;
  session_number: number;
  status: string;
  session_date: string | null;
  cohort_id: string | null;
  bookmarks?: SessionBookmark[];
}

const STATUSES = ["draft", "upcoming", "active", "complete"];

const formatTimestamp = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const parseTimestamp = (str: string): number => {
  const parts = str.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + (parts[1] || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
  return 0;
};

const SessionManager = () => {
  const { cohortId } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [editing, setEditing] = useState<SessionRow | null>(null);
  const [editBookmarks, setEditBookmarks] = useState<SessionBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<SessionRow | null>(null);

  const loadSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("session_number");
    
    if (data) {
      const withBookmarks = await Promise.all(
        data.map(async (s: any) => {
          const { data: bm } = await supabase
            .from("session_bookmarks")
            .select("*")
            .eq("session_id", s.id)
            .order("sort_order");
          return { ...s, bookmarks: bm || [] };
        })
      );
      setSessions(withBookmarks);
    }
    setLoading(false);
  };

  useEffect(() => { loadSessions(); }, []);

  const startNew = () => {
    setEditing({
      id: "",
      title: "",
      description: "",
      podcast_url: "",
      youtube_id: "",
      session_number: sessions.length + 1,
      status: "draft",
      session_date: null,
      cohort_id: cohortId,
    });
    setEditBookmarks([]);
  };

  const startEdit = (s: SessionRow) => {
    setEditing({ ...s });
    setEditBookmarks(s.bookmarks ? [...s.bookmarks] : []);
  };

  const addBookmark = () => {
    setEditBookmarks(prev => [...prev, {
      timestamp_seconds: 0,
      label: "",
      question: "",
      sort_order: prev.length,
    }]);
  };

  const removeBookmark = (idx: number) => {
    setEditBookmarks(prev => prev.filter((_, i) => i !== idx));
  };

  const updateBookmark = (idx: number, field: keyof SessionBookmark, value: any) => {
    setEditBookmarks(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  const save = async () => {
    if (!editing) return;
    try {
      let sessionId = editing.id;
      if (!sessionId) {
        const { data, error } = await supabase
          .from("sessions")
          .insert({
            title: editing.title,
            description: editing.description,
            podcast_url: editing.podcast_url,
            youtube_id: editing.youtube_id,
            session_number: editing.session_number,
            status: editing.status,
            session_date: editing.session_date,
            cohort_id: editing.cohort_id,
          })
          .select()
          .single();
        if (error) throw error;
        sessionId = data.id;
      } else {
        const { error } = await supabase
          .from("sessions")
          .update({
            title: editing.title,
            description: editing.description,
            podcast_url: editing.podcast_url,
            youtube_id: editing.youtube_id,
            session_number: editing.session_number,
            status: editing.status,
            session_date: editing.session_date,
          })
          .eq("id", sessionId);
        if (error) throw error;

        await supabase.from("session_bookmarks").delete().eq("session_id", sessionId);
      }

      if (editBookmarks.length > 0) {
        const { error } = await supabase.from("session_bookmarks").insert(
          editBookmarks.map((b, i) => ({
            session_id: sessionId,
            timestamp_seconds: b.timestamp_seconds,
            label: b.label,
            question: b.question,
            sort_order: i,
          }))
        );
        if (error) throw error;
      }

      toast.success("Session saved");
      setEditing(null);
      loadSessions();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Delete this session and all its bookmarks?")) return;
    await supabase.from("sessions").delete().eq("id", id);
    toast.success("Session deleted");
    loadSessions();
  };

  if (preview) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setPreview(null)} className="mb-4 text-xs tracking-widest">
          <X size={14} /> BACK TO SESSIONS
        </Button>
        <div className="border-2 border-primary/10 p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] tracking-widest text-primary/40">SESSION {preview.session_number}</span>
            <span className={`text-[9px] tracking-widest px-2 py-0.5 border ${
              preview.status === "active" ? "border-green-500 text-green-600" :
              preview.status === "upcoming" ? "border-amber-500 text-amber-600" :
              preview.status === "complete" ? "border-primary/20 text-primary/40" :
              "border-primary/10 text-primary/30"
            }`}>{preview.status.toUpperCase()}</span>
          </div>
          <h2 className="font-display text-xl tracking-wider text-primary mb-2">{preview.title || "Untitled"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{preview.description}</p>
          
          {preview.youtube_id && (
            <div className="aspect-video bg-primary/5 border border-primary/10 mb-6 flex items-center justify-center">
              <span className="text-xs text-primary/40 tracking-widest">YOUTUBE: {preview.youtube_id}</span>
            </div>
          )}
          
          <h3 className="font-display text-xs tracking-widest text-primary/60 mb-3">BOOKMARK MOMENTS ({preview.bookmarks?.length || 0})</h3>
          <div className="space-y-3">
            {preview.bookmarks?.map((b, i) => (
              <div key={i} className="border border-primary/10 p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-primary/60">{formatTimestamp(b.timestamp_seconds)}</span>
                  <span className="text-xs tracking-wider text-primary">{b.label}</span>
                </div>
                <p className="text-sm text-muted-foreground italic">"{b.question}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-widest text-primary">
            {editing.id ? "EDIT SESSION" : "NEW SESSION"}
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)} size="sm">
              <X size={14} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">TITLE</Label>
            <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">SESSION NUMBER</Label>
            <Input type="number" value={editing.session_number} onChange={e => setEditing({ ...editing, session_number: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">YOUTUBE VIDEO ID</Label>
            <Input value={editing.youtube_id} onChange={e => setEditing({ ...editing, youtube_id: e.target.value })} placeholder="e.g. dQw4w9WgXcQ" />
          </div>
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">PODCAST URL (OPTIONAL)</Label>
            <Input value={editing.podcast_url} onChange={e => setEditing({ ...editing, podcast_url: e.target.value })} />
          </div>
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">STATUS</Label>
            <Select value={editing.status} onValueChange={v => setEditing({ ...editing, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] tracking-widest text-primary/60">SESSION DATE</Label>
            <Input type="date" value={editing.session_date || ""} onChange={e => setEditing({ ...editing, session_date: e.target.value || null })} />
          </div>
        </div>

        <div>
          <Label className="text-[10px] tracking-widest text-primary/60">DESCRIPTION</Label>
          <Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xs tracking-widest text-primary/60">BOOKMARK MOMENTS</h3>
            <Button variant="outline" size="sm" onClick={addBookmark} className="text-[10px] tracking-widest">
              <Plus size={12} /> ADD BOOKMARK
            </Button>
          </div>
          <div className="space-y-3">
            {editBookmarks.map((b, i) => (
              <div key={i} className="border border-primary/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-primary/40">BOOKMARK {i + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeBookmark(i)}>
                    <Trash2 size={12} className="text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[9px] tracking-widest text-primary/40">TIMESTAMP (M:SS)</Label>
                    <Input
                      value={formatTimestamp(b.timestamp_seconds)}
                      onChange={e => updateBookmark(i, "timestamp_seconds", parseTimestamp(e.target.value))}
                      placeholder="5:00"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] tracking-widest text-primary/40">LABEL</Label>
                    <Input value={b.label} onChange={e => updateBookmark(i, "label", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-[9px] tracking-widest text-primary/40">REFLECTION QUESTION</Label>
                  <Textarea value={b.question} onChange={e => updateBookmark(i, "question", e.target.value)} rows={2} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save} className="tracking-widest text-xs">
          <Save size={14} /> SAVE SESSION
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg tracking-widest text-primary">SESSION MANAGER</h2>
        <Button onClick={startNew} size="sm" className="text-[10px] tracking-widest">
          <Plus size={12} /> NEW SESSION
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      ) : sessions.length === 0 ? (
        <div className="border-2 border-dashed border-primary/10 p-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">No sessions created yet</p>
          <Button onClick={startNew} variant="outline" size="sm" className="text-[10px] tracking-widest">
            <Plus size={12} /> CREATE FIRST SESSION
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="border border-primary/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-primary/40 w-6">{s.session_number}</span>
                <div>
                  <h3 className="text-sm font-display tracking-wider text-primary">{s.title || "Untitled"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] tracking-widest px-2 py-0.5 border ${
                      s.status === "active" ? "border-green-500 text-green-600" :
                      s.status === "upcoming" ? "border-amber-500 text-amber-600" :
                      s.status === "complete" ? "border-primary/20 text-primary/40" :
                      "border-primary/10 text-primary/30"
                    }`}>{s.status.toUpperCase()}</span>
                    <span className="text-[9px] text-primary/30">{s.bookmarks?.length || 0} bookmarks</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setPreview(s)} title="Preview">
                  <Eye size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => startEdit(s)} title="Edit">
                  <Edit2 size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)} title="Delete">
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionManager;
