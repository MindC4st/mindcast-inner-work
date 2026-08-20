// The Notice → Name → Do ladder.
//
// This is the self-assessment behind "Return to Your Intention". It replaces a
// did-it / didn't-do-it question, which only ever measured compliance and made
// most honest answers feel like failure.
//
// The four rungs are cumulative: each one contains the one before it. That is
// the whole point — someone who noticed something they would previously have
// missed has a real result to record, not a blank. The template says it
// directly: "Sometimes the win is noticing something you would previously have
// missed."
//
// No rung is styled as better than another. There are no ticks, no green, no
// score. Progression is shown over time on the member's own dashboard, and
// nowhere else — never on a shared screen, never to a facilitator.

export const LADDER = [
  {
    value: "didnt_notice",
    label: "I didn't notice it",
    hint: "The week ran away. That is information too.",
  },
  {
    value: "noticed_unnamed",
    label: "I noticed something, but I couldn't name it",
    hint: "Something registered, even if the words weren't there yet.",
  },
  {
    value: "noticed_named",
    label: "I noticed it and named it, but didn't change anything",
    hint: "Seeing it clearly is the step before changing it.",
  },
  {
    value: "noticed_named_did",
    label: "I noticed it, named it, and did something about it",
    hint: "The full loop, at least once.",
  },
] as const;

export type LadderValue = (typeof LADDER)[number]["value"];

/** How far along the ladder a value sits, 0-3. Used for the progress chart. */
export const ladderRung = (v: string | null | undefined) =>
  Math.max(0, LADDER.findIndex((r) => r.value === v));

export const ladderLabel = (v: string | null | undefined) =>
  LADDER.find((r) => r.value === v)?.label ?? "Not recorded";

type Props = {
  value: LadderValue | null;
  onChange: (v: LadderValue) => void;
  disabled?: boolean;
  /** Dark room screen vs the light portal. */
  tone?: "light" | "dark";
};

const IntentionLadder = ({ value, onChange, disabled, tone = "light" }: Props) => {
  const dark = tone === "dark";
  return (
    <fieldset disabled={disabled} className="mt-5">
      <legend className={`text-[10px] tracking-[0.3em] font-body uppercase mb-3 ${
        dark ? "text-[hsl(var(--ivory))]/50" : "text-[hsl(var(--navy-mid))]/70"}`}>
        How far did you get?
      </legend>

      <div className="space-y-2">
        {LADDER.map((rung) => {
          const on = value === rung.value;
          return (
            <button
              key={rung.value}
              type="button"
              onClick={() => onChange(rung.value)}
              aria-pressed={on}
              className={`w-full text-left rounded-sm border px-4 py-3 transition-colors ${
                on
                  ? dark
                    ? "border-[hsl(var(--blue-light))] bg-[hsl(var(--blue))]/25"
                    : "border-[hsl(var(--blue))] bg-[hsl(var(--blue))]/10"
                  : dark
                    ? "border-[hsl(var(--ivory))]/15 hover:border-[hsl(var(--ivory))]/35"
                    : "border-[hsl(var(--warm-border))] bg-white hover:border-[hsl(var(--blue))]/50"
              } disabled:opacity-60`}
            >
              <span className={`block font-body text-sm ${
                dark ? "text-[hsl(var(--ivory))]" : "text-[hsl(var(--navy))]"}`}>
                {rung.label}
              </span>
              <span className={`block font-body text-xs mt-0.5 ${
                dark ? "text-[hsl(var(--ivory))]/45" : "text-[hsl(var(--navy-mid))]/60"}`}>
                {rung.hint}
              </span>
            </button>
          );
        })}
      </div>

      <p className={`font-body text-xs mt-3 leading-relaxed ${
        dark ? "text-[hsl(var(--ivory))]/40" : "text-[hsl(var(--navy-mid))]/60"}`}>
        There is no good or bad answer here, and this is never shown on screen.
        First notice it. Then name it. Then, when you can, do it.
      </p>
    </fieldset>
  );
};

export default IntentionLadder;
