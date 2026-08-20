// The intention card on the public curriculum page.
//
// ─────────────────────────────────────────────────────────────────────────
// THIS COMPONENT MUST NEVER PERSIST ANYTHING. NOT TO SUPABASE, NOT TO
// localStorage, NOT TO AN EDGE FUNCTION, NOT TO ANALYTICS.
// ─────────────────────────────────────────────────────────────────────────
//
// It is a marketing demonstration on an anonymous public page. Whoever is
// typing has no account, has consented to nothing, and may well be a minor —
// /curriculum is linked from the homepage and the child section is on the same
// page. What they type is a private reflection by any reasonable reading, and
// the only safe place for it is component state that dies with the tab.
//
// It is a separate file for exactly that reason: the rule is enforceable by
// reading one short component, and a reviewer can check the import list in a
// couple of seconds. If a future change needs to save a draft, it does not
// belong here — it belongs behind the member portal's auth.
//
// The visible label is part of the contract, not decoration. Someone typing
// into something that looks like a journal is entitled to know it is not one.

import { useState } from "react";
import { WEEK1_ADULT } from "@/lib/curriculumPublic";

const { intentionTemplate: T } = WEEK1_ADULT;

const Field = ({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    aria-label={label}
    // No name attribute and no form wrapper: nothing here should ever be
    // serialisable as a form submission, including by a browser autofill or a
    // stray Enter key.
    autoComplete="off"
    spellCheck={false}
    maxLength={120}
    className="inline-block min-w-[9rem] max-w-full bg-transparent border-b border-primary/40 focus:border-primary
               px-1 py-0.5 font-body text-foreground placeholder:text-muted-foreground/60
               focus:outline-none focus:ring-0 transition-colors"
  />
);

const JournalDemo = () => {
  const [cue, setCue] = useState("");
  const [action, setAction] = useState("");

  return (
    <div className="bg-card border border-border p-7 md:p-9">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
          My intention
        </p>
        <p className="font-body text-[10px] tracking-wide text-muted-foreground">Week 01</p>
      </div>

      <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed">
        {T.lead}{" "}
        <Field value={cue} onChange={setCue} placeholder={T.cuePlaceholder} label="The cue you will notice" />{" "}
        {T.middle}{" "}
        <Field value={action} onChange={setAction} placeholder={T.actionPlaceholder} label="The one small action you will take" />.
      </p>

      <p className="font-body text-sm text-muted-foreground mt-6 leading-relaxed">{T.note}</p>

      <p className="font-body text-[11px] text-muted-foreground/80 mt-6 pt-5 border-t border-border">
        Try the journal — this demo isn't saved.
      </p>
    </div>
  );
};

export default JournalDemo;
