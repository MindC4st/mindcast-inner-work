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
import { INK, RULE, SIGNAL_DEEP } from "./WorkbookPage";

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
    // Sits on the page's ruled line, in the page's own voice — a blank the
    // reader fills in, not a form field dropped onto paper.
    style={{ fontFamily: "var(--font-serif)", color: SIGNAL_DEEP, borderColor: RULE }}
    className="inline-block min-w-[10rem] max-w-full bg-transparent border-b-2 italic
               px-2 pb-1 text-[inherit] placeholder:not-italic placeholder:text-[0.62em]
               placeholder:tracking-[0.18em] placeholder:uppercase placeholder:opacity-45
               focus:outline-none focus:ring-0 focus:border-current transition-colors"
  />
);

const JournalDemo = () => {
  const [cue, setCue] = useState("");
  const [action, setAction] = useState("");

  return (
    <div>
      <p
        className="text-[22px] md:text-[28px] leading-[2] italic"
        style={{ fontFamily: "var(--font-serif)", color: INK }}
      >
        {T.lead}{" "}
        <Field value={cue} onChange={setCue} placeholder={T.cuePlaceholder} label="The cue you will notice" />{" "}
        {T.middle}{" "}
        <Field value={action} onChange={setAction} placeholder={T.actionPlaceholder} label="The one small action you will take" />.
      </p>

      <p
        className="font-body text-[15px] leading-[1.75] mt-8 max-w-[52ch]"
        style={{ color: INK, opacity: 0.78 }}
      >
        {T.note}
      </p>

      <p
        className="font-body text-[11px] tracking-[0.06em] mt-8 pt-4 border-t"
        style={{ color: INK, opacity: 0.5, borderColor: RULE }}
      >
        Try the journal — this demo isn't saved.
      </p>
    </div>
  );
};

export default JournalDemo;
