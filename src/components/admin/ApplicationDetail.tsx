import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateNZ, parseDob, ageAtStart } from "@/lib/applyValidation";

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

type Status = "new" | "shortlisted" | "met" | "offered" | "declined" | "withdrawn";
const STATUS_ORDER: Status[] = ["new", "shortlisted", "met", "offered", "declined", "withdrawn"];

export function ApplicationDetail({
  application,
  onBack,
  onStatusChange,
}: {
  application: Application | null;
  onBack: () => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!application) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select an application to view details
      </div>
    );
  }

  const dob = parseDob({
    day: application.date_of_birth.split("-")[2],
    month: application.date_of_birth.split("-")[1],
    year: application.date_of_birth.split("-")[0],
  });
  const age = dob ? ageAtStart(dob) : null;

  const genderLabel = application.gender
    ? application.gender === "another"
      ? `Another (${application.gender_self_described || "not specified"})`
      : application.gender.charAt(0).toUpperCase() + application.gender.slice(1)
    : "Not provided";

  const handleSaveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("pilot_applications" as any)
      .update({ notes })
      .eq("id", application.id);
    if (error) {
      console.error("Failed to save notes:", error);
    }
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-8 p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Back to list"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-2xl md:text-3xl text-primary">
          {application.first_name} {application.last_name}
        </h1>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Email</span>
          <a href={`mailto:${application.email}`} className="text-foreground hover:underline">
            {application.email}
          </a>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Phone</span>
          <a href={`tel:${application.phone}`} className="text-foreground hover:underline">
            {application.phone}
          </a>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Date of birth</span>
          <span className="text-foreground">
            {dob ? formatDateNZ(dob) : application.date_of_birth}
            {age !== null && ` (age ${age} on 13 Oct 2026)`}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Gender</span>
          <span className="text-foreground">{genderLabel}</span>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Submitted</span>
          <span className="text-foreground">
            {new Date(application.submitted_at).toLocaleString("en-NZ", {
              timeZone: "Pacific/Auckland",
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">IP hash</span>
          <span className="font-mono text-xs text-muted-foreground">{application.ip_hash || "â€”"}</span>
        </div>
      </div>

      {/* Status workflow */}
      <div className="border-t border-border pt-6">
        <h2 className="font-display text-xl text-primary mb-4">Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(application.id, s)}
              disabled={saving}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                application.status === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes (internal) */}
      <div className="border-t border-border pt-6">
        <h2 className="font-display text-xl text-primary mb-4">Internal notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="input-underline w-full font-body resize-y"
          placeholder="Internal notes â€” not visible to applicant"
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="mt-3 btn-outlined text-sm disabled:opacity-50"
        >
          {saving ? "Savingâ€¦" : "Save notes"}
        </button>
      </div>

      {/* Answers - full width, unstyled for reading */}
      <div className="border-t border-border pt-6 space-y-8">
        <h2 className="font-display text-xl text-primary">Answers</h2>

        <div className="space-y-2">
          <p className="font-serif italic text-lg text-foreground leading-relaxed">
            <span className="font-display font-medium mr-2">1.</span>
            If money were no barrier, what would you actually be doing with your life?
          </p>
          <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
            {application.q1_money_no_barrier}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-serif italic text-lg text-foreground leading-relaxed">
            <span className="font-display font-medium mr-2">2.</span>
            What would the version of you from ten years ago be most surprised to hear about your life now?
          </p>
          <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
            {application.q2_ten_years_ago}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-serif italic text-lg text-foreground leading-relaxed">
            <span className="font-display font-medium mr-2">3.</span>
            Tell us about something you once believed you weren't the kind of person who could do â€” until you did it.
          </p>
          <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
            {application.q3_didnt_think_could}
          </p>
        </div>

        {application.anything_else && (
          <div className="space-y-2">
            <p className="font-serif italic text-lg text-foreground leading-relaxed">
              <span className="font-display font-medium mr-2">Anything else:</span>
            </p>
            <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
              {application.anything_else}
            </p>
          </div>
        )}
      </div>

      {/* User agent (debug) */}
      {application.user_agent && (
        <details className="border-t border-border pt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer mb-2">User agent</summary>
          <pre className="whitespace-pre-wrap font-mono">{application.user_agent}</pre>
        </details>
      )}
    </div>
  );
}