import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Layers3,
  Loader2,
  PenLine,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import Ripple from "@/components/brand/Ripple";
import LessonOnePreview from "@/components/curriculum/LessonOnePreview";
import logoWordmark from "@/assets/logo-blue-wordmark.png";
import {
  useCurriculumWeeks,
  type CurriculumWeek,
  type Track,
} from "@/hooks/useCurriculumWeeks";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import {
  BLOCKS,
  CURRICULUM_OVERVIEW,
  CURRICULUM_SUBHEADLINE,
  NOTICE_NAME_DO,
  RHYTHM,
  SHARED_LANGUAGE_COPY,
  SHARED_LANGUAGE_TAGLINE,
  WEEK1_THEME,
} from "@/lib/curriculumPublic";

/* -------------------------------------------------------------------------- */
/* Binder data                                                                */
/* -------------------------------------------------------------------------- */

type TabKey =
  | "notes"
  | "phases"
  | "worksheets"
  | "reflection"
  | "shop";

type BinderTab = {
  key: TabKey;
  number: string;
  label: string;
  icon: LucideIcon;
};

const TABS: BinderTab[] = [
  {
    key: "notes",
    number: "01",
    label: "Notes",
    icon: BookOpen,
  },
  {
    key: "phases",
    number: "02",
    label: "Phases",
    icon: Layers3,
  },
  {
    key: "worksheets",
    number: "03",
    label: "Worksheets",
    icon: FileText,
  },
  {
    key: "reflection",
    number: "04",
    label: "Reflection",
    icon: PenLine,
  },
  {
    key: "shop",
    number: "05",
    label: "Shop",
    icon: ShoppingBag,
  },
];

const PHASE_COPY: Record<
  number,
  {
    focus: string;
    description: string;
  }
> = {
  1: {
    focus: "Learn to see what is already happening.",
    description:
      "Build awareness of attention, emotions, assumptions and the signals shaping everyday behaviour.",
  },
  2: {
    focus: "Question what you have been carrying.",
    description:
      "Notice inherited rules, protective patterns and old stories that may no longer fit the life you are living.",
  },
  3: {
    focus: "Choose what you want to practise instead.",
    description:
      "Turn insight into clearer boundaries, steadier habits and small responses you can repeat in real life.",
  },
  4: {
    focus: "Live the work where it matters.",
    description:
      "Bring the year together through relationships, contribution, direction and the choices that shape ordinary days.",
  },
};

const TRACKS: Array<{
  key: Track;
  label: string;
}> = [
  {
    key: "adult",
    label: "Adult",
  },
  {
    key: "teen",
    label: "Teen",
  },
  {
    key: "child",
    label: "Child",
  },
];

const TRACK_COPY: Record<
  Track,
  {
    title: string;
    body: string;
  }
> = {
  adult: {
    title: "Reflect, write, return.",
    body: "Private prompts, a practical intention and a digital journal that keeps the work from disappearing after the session.",
  },
  teen: {
    title: "Make it relevant.",
    body: "Age-appropriate questions connected to identity, relationships, school, online life and growing independence.",
  },
  child: {
    title: "Make it visible.",
    body: "Simple language, pictures, movement and paper activities that help children notice, name and practise.",
  },
};

type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  currency: string;
};

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

const Eyebrow = ({
  children,
}: {
  children: ReactNode;
}) => (
  <p className="font-body text-[9px] font-bold uppercase tracking-[0.32em] text-[hsl(var(--silver))] sm:text-[10px]">
    {children}
  </p>
);

const EmbossedWordmark = ({
  className = "h-4 w-32",
}: {
  className?: string;
}) => (
  <span
    role="img"
    aria-label="Mindcast"
    className={`curriculum-emboss block ${className}`}
    style={{
      WebkitMaskImage: `url(${logoWordmark})`,
      maskImage: `url(${logoWordmark})`,
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const PageHeading = ({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) => (
  <div>
    <Eyebrow>{eyebrow}</Eyebrow>

    <h2 className="mt-2 max-w-[18ch] font-serif text-[clamp(2.2rem,4vw,4.35rem)] font-medium leading-[0.92] tracking-[-0.025em] text-[#4e463c]">
      {children}
    </h2>
  </div>
);

const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{
    value: T;
    label: string;
  }>;
  onChange: (value: T) => void;
  label: string;
}) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex rounded-full border border-[#d9d0c0] bg-[#eee8dc] p-1"
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={`min-h-9 rounded-full px-3 font-body text-[9px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-[10px] ${
          value === option.value
            ? "bg-[#fffaf2] text-[#4e463c] shadow-sm"
            : "text-[#776d61] hover:text-[#4e463c]"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const BinderRings = () => (
  <div
    className="relative hidden h-full border-r border-[#cdbda5] lg:block"
    aria-hidden="true"
  >
    <div className="absolute inset-y-0 right-0 w-px bg-white/70" />

    {[20, 50, 80].map((top) => (
      <div
        key={top}
        className="absolute right-[-18px] h-11 w-11 -translate-y-1/2 rounded-full border border-[#b5a88d] shadow-[0_4px_9px_rgba(92,67,31,0.2)]"
        style={{
          top: `${top}%`,
          background:
            "linear-gradient(135deg,#b3a68c 0%,#f4ecdd 24%,#d3c7ac 47%,#fffaf0 70%,#c0b298 100%)",
        }}
      >
        <span className="absolute inset-[7px] rounded-full bg-[#efe4d3] shadow-[inset_0_2px_4px_rgba(96,70,35,0.28),0_1px_0_rgba(255,255,255,0.85)]" />
      </div>
    ))}
  </div>
);

/* WAI-ARIA tabs keyboard pattern for the bespoke binder tablists: roving
   tabindex plus Arrow/Home/End activation. The visual structure is too
   page-specific for the ui/tabs primitive, so the behaviour is restored
   by hand. */
const moveTabFocus = (
  event: KeyboardEvent,
  tab: TabKey,
  onChange: (tab: TabKey) => void,
  idPrefix: string,
) => {
  const keys = TABS.map((item) => item.key);
  const index = keys.indexOf(tab);
  let next: number;

  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      next = (index + 1) % keys.length;
      break;
    case "ArrowLeft":
    case "ArrowUp":
      next = (index - 1 + keys.length) % keys.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = keys.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  const key = keys[next];
  onChange(key);
  document.getElementById(`${idPrefix}${key}`)?.focus();
};

const BinderTabs = ({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}) => (
  <div
    role="tablist"
    aria-label="Life Binder sections"
    aria-orientation="vertical"
    className="hidden h-full min-h-0 flex-col justify-center gap-2 py-6 lg:flex"
  >
    {TABS.map((item) => {
      const active = item.key === tab;
      const Icon = item.icon;

      return (
        <button
          key={item.key}
          type="button"
          role="tab"
          id={`binder-tab-${item.key}`}
          aria-selected={active}
          aria-controls="binder-page"
          tabIndex={active ? 0 : -1}
          onClick={() => onChange(item.key)}
          onKeyDown={(event) => moveTabFocus(event, tab, onChange, "binder-tab-")}
          className={`group relative min-h-0 flex-1 rounded-r-2xl border px-4 py-2 text-left transition-[transform,background-color,border-color,box-shadow] focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            active
              ? "-translate-x-3 border-[#d9c8ad] bg-[#fffaf2] shadow-[7px_9px_20px_rgba(92,67,31,0.11)]"
              : "border-[#ddcfba] bg-[#ebe2d3] hover:-translate-x-1 hover:bg-[#f4ecdf]"
          }`}
        >
          <span className="flex items-start justify-between gap-2">
            <span
              className={`font-display text-lg leading-none ${
                active
                  ? "text-primary"
                  : "text-[#5a5044]/25"
              }`}
            >
              {item.number}
            </span>

            <Icon
              size={15}
              strokeWidth={1.7}
              className={
                active
                  ? "text-primary"
                  : "text-[#5a5044]/25"
              }
            />
          </span>

          <span className="mt-1 block font-body text-[9px] font-bold uppercase tracking-[0.14em] text-[#5c5144] xl:text-[10px]">
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

const MobileTabs = ({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}) => (
  <div
    role="tablist"
    aria-label="Life Binder sections"
    className="flex gap-1 overflow-x-auto border-b border-[#ddcfbb] bg-[#eee5d7] p-2 lg:hidden"
  >
    {TABS.map((item) => {
      const active = item.key === tab;
      const Icon = item.icon;

      return (
        <button
          key={item.key}
          type="button"
          role="tab"
          id={`binder-tab-m-${item.key}`}
          aria-selected={active}
          aria-controls="binder-page"
          tabIndex={active ? 0 : -1}
          onClick={() => onChange(item.key)}
          onKeyDown={(event) => moveTabFocus(event, tab, onChange, "binder-tab-m-")}
          className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 font-body text-[9px] font-bold uppercase tracking-[0.12em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            active
              ? "bg-[#fffaf2] text-primary shadow-sm"
              : "text-[#6d6255]"
          }`}
        >
          <Icon size={14} strokeWidth={1.7} />

          {item.label}
        </button>
      );
    })}
  </div>
);

const PaperPage = ({
  tab,
  children,
}: {
  tab: TabKey;
  children: ReactNode;
}) => {
  const tabMeta =
    TABS.find((item) => item.key === tab) ?? TABS[0];

  return (
    <article
      id="binder-page"
      role="tabpanel"
      aria-labelledby={`binder-tab-${tab}`}
      className="curriculum-paper relative h-full min-h-0 overflow-hidden rounded-r-[22px] border"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#eadfce] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg text-primary">
              {tabMeta.number}
            </span>

            <span className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-[#51483e]">
              {tabMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <EmbossedWordmark className="h-3 w-[112px]" />
              <span className="font-body text-[7px] font-semibold uppercase tracking-[0.24em] text-[#9b8b76]">
                The Life Binder
              </span>
            </div>

            <Ripple size={17} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 [scrollbar-color:#c8bca8_transparent] sm:p-7 lg:p-8">
          {children}
        </div>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Notes                                                                      */
/* -------------------------------------------------------------------------- */

const NotesPage = ({
  onOpenPhases,
  onOpenWorksheets,
}: {
  onOpenPhases: () => void;
  onOpenWorksheets: () => void;
}) => (
  <div className="grid min-h-full items-center gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:gap-12">
    <div>
      <EmbossedWordmark className="h-6 w-[190px] sm:h-7 sm:w-[220px]" />

      <div className="mt-6">
        <Eyebrow>Interactive curriculum explorer</Eyebrow>
      </div>

      <h1 className="mt-4 max-w-[760px] font-serif text-[clamp(3.1rem,5vw,5.25rem)] font-medium leading-[0.88] tracking-[-0.035em] text-[#4d453b]">
        The Mindcast
        <br />
        Curriculum.
      </h1>

      <p
        className="mt-5 max-w-2xl text-[clamp(1.2rem,2vw,1.75rem)] italic leading-snug text-[#75614c]"
        style={{
          fontFamily: "var(--font-serif)",
        }}
      >
        {CURRICULUM_SUBHEADLINE}
      </p>

      <p className="mt-5 max-w-2xl font-body text-sm leading-6 text-[#6d655c] sm:text-base sm:leading-7">
        {CURRICULUM_OVERVIEW}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOpenPhases}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_8px_18px_-12px_rgba(16,36,56,0.55)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
        >
          Open phase one
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={onOpenWorksheets}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-primary/40 bg-[#fffaf2] px-6 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary hover:bg-[#f8efe1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
        >
          See a worksheet
        </button>
      </div>
    </div>

    <div className="rounded-2xl border border-[#dfd0ba] bg-[linear-gradient(145deg,rgba(250,245,236,0.92),rgba(239,229,213,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6">
      <div className="flex items-end justify-between gap-5 border-b border-[#d9cfbf] pb-4">
        <div>
          <Eyebrow>The shape of the year</Eyebrow>

          <p className="mt-2 font-serif text-3xl font-semibold leading-none tracking-[-0.02em] text-[#4e463c] sm:text-4xl">
            4 × 13 WEEKS
          </p>
        </div>

        <span className="font-display text-5xl leading-none text-primary/20">
          52
        </span>
      </div>

      <ol className="mt-3">
        {BLOCKS.map((block) => (
          <li
            key={block.number}
            className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-[#ddd4c7] py-3 last:border-b-0"
          >
            <span className="font-display text-xl text-primary/50">
              0{block.number}
            </span>

            <span className="font-serif text-xl font-semibold text-[#4e463c] sm:text-2xl">
              {block.name}
            </span>

            <span className="font-body text-[8px] font-bold uppercase tracking-[0.18em] text-[#71808e]">
              {block.weeks[0]}–{block.weeks[1]}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 font-body text-xs leading-5 text-[#6d655c]">
        Adults, teens and children explore the same weekly
        idea through three age-appropriate experiences.
      </p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Phases                                                                     */
/* -------------------------------------------------------------------------- */

const PhasesPage = ({
  track,
  setTrack,
  activePhase,
  setActivePhase,
  selectedWeekNumber,
  setSelectedWeekNumber,
}: {
  track: Track;
  setTrack: (track: Track) => void;
  activePhase: number;
  setActivePhase: (phase: number) => void;
  selectedWeekNumber: number;
  setSelectedWeekNumber: (week: number) => void;
}) => {
  const { weeks, loading } = useCurriculumWeeks(track);

  // Week 1 opens the full lesson preview — it takes over the page rather than
  // rendering somewhere below the fold of the fixed-height binder sheet. Week 1
  // is the default selection, so the preview is the landing view for the tab.
  const [previewOpen, setPreviewOpen] = useState(
    selectedWeekNumber === 1,
  );

  const phase =
    BLOCKS.find(
      (block) => block.number === activePhase,
    ) ?? BLOCKS[0];

  const phaseCopy = PHASE_COPY[phase.number];

  // Lesson title for the active track. The Notion-pulled titles live in the
  // per-track columns (adult/teen/kids); weekly_theme — when a week has one —
  // is the shared idea underneath, shown as the second line.
  const titleFor = (week: CurriculumWeek): string =>
    week.track_titles?.[track] ||
    week.weekly_theme ||
    week.title ||
    `Week ${week.week_number}`;

  const phaseWeeks = useMemo(
    () =>
      weeks.filter(
        (week) =>
          week.week_number >= phase.weeks[0] &&
          week.week_number <= phase.weeks[1],
      ),
    [phase.weeks, weeks],
  );

  const selectedWeek =
    phaseWeeks.find(
      (week) =>
        week.week_number === selectedWeekNumber,
    ) ?? phaseWeeks[0];

  const choosePhase = (
    number: number,
    firstWeek: number,
  ) => {
    setActivePhase(number);
    setSelectedWeekNumber(firstWeek);
    setPreviewOpen(false);
  };

  const chooseWeek = (weekNumber: number) => {
    setSelectedWeekNumber(weekNumber);
    setPreviewOpen(weekNumber === 1);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col justify-between gap-5 border-b border-[#e4dccf] pb-5 xl:flex-row xl:items-end">
        <PageHeading eyebrow="Four phases · fifty-two weeks">
          Explore the year.
        </PageHeading>

        <SegmentedControl
          value={track}
          label="Choose a curriculum track"
          options={TRACKS.map((item) => ({
            value: item.key,
            label: item.label,
          }))}
          onChange={setTrack}
        />
      </div>

      {previewOpen ? (
        <div className="mt-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5a6a] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft size={14} /> Back to the year
            </button>
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a96a0]">
              Week 1 ·{" "}
              {
                TRACKS.find(
                  (item) => item.key === track,
                )?.label
              }{" "}
              lens
            </p>
          </div>
          <LessonOnePreview track={track} />
        </div>
      ) : (
        <>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BLOCKS.map((block) => {
          const active =
            block.number === activePhase;

          return (
            <button
              key={block.number}
              type="button"
              aria-pressed={active}
              onClick={() =>
                choosePhase(
                  block.number,
                  block.weeks[0],
                )
              }
              className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-[#dfd1bc] bg-[#f5ede1] text-[#4e463c] hover:border-primary/50"
              }`}
            >
              <span className="block font-body text-[8px] font-bold uppercase tracking-[0.18em] opacity-65">
                Phase 0{block.number}
              </span>

              <span className="mt-1 block font-display text-lg tracking-[0.08em]">
                {block.name.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-2xl border border-[#ddd4c7] bg-[#f4efe7]/80 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Eyebrow>
                Phase 0{phase.number} · Weeks{" "}
                {phase.weeks[0]}–{phase.weeks[1]}
              </Eyebrow>

              <h3 className="mt-3 font-serif text-4xl font-medium leading-none tracking-[-0.025em] text-[#4e463c] sm:text-5xl">
                {phase.name}
              </h3>
            </div>

            <span className="font-display text-6xl leading-none text-primary/15">
              0{phase.number}
            </span>
          </div>

          <p
            className="mt-5 text-xl italic leading-snug text-[#75614c] sm:text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
            }}
          >
            {phaseCopy.focus}
          </p>

          <p className="mt-3 font-body text-sm leading-6 text-[#6d655c]">
            {phaseCopy.description}
          </p>

          <div className="mt-6 border-t border-[#d9cfbf] pt-5">
            <Eyebrow>
              Selected week · {TRACK_COPY[track].title}
            </Eyebrow>

            <p className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#4e463c]">
              {selectedWeek
                ? titleFor(selectedWeek)
                : `Week ${selectedWeekNumber}`}
            </p>

            {selectedWeek?.weekly_theme &&
            selectedWeek.weekly_theme !==
              titleFor(selectedWeek) ? (
              <p className="mt-2 font-body text-xs leading-5 text-[#6d655c]">
                Shared idea: {selectedWeek.weekly_theme}
              </p>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[#ddd4c7] bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-[#e6ded2] px-4 py-3 sm:px-5">
            <Eyebrow>
              The weeks ·{" "}
              {
                TRACKS.find(
                  (item) => item.key === track,
                )?.label
              }{" "}
              lens
            </Eyebrow>

            <span className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#8a96a0]">
              Select a week
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#c8bca8_transparent]">
            {loading
              ? Array.from(
                  {
                    length: 7,
                  },
                  (_, index) => (
                    <div
                      key={index}
                      className="flex animate-pulse gap-4 border-b border-[#eee8de] px-5 py-4"
                    >
                      <span className="h-5 w-7 rounded bg-[#e7e0d5]" />
                      <span className="h-5 flex-1 rounded bg-[#eee8de]" />
                    </div>
                  ),
                )
              : phaseWeeks.map((week) => {
                  const active =
                    week.week_number ===
                    selectedWeekNumber;

                  return (
                    <button
                      key={week.id}
                      type="button"
                      onClick={() =>
                        chooseWeek(
                          week.week_number,
                        )
                      }
                      className={`grid w-full grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-[#eee8de] px-4 py-3 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5 ${
                        active
                          ? "bg-[#f7efe2]"
                          : "hover:bg-[#faf7f1]"
                      }`}
                    >
                      <span
                        className={`font-display text-lg ${
                          active
                            ? "text-primary"
                            : "text-[#4e463c]/30"
                        }`}
                      >
                        {String(
                          week.week_number,
                        ).padStart(2, "0")}
                      </span>

                      <span>
                        <span className="block font-body text-xs font-semibold leading-5 text-[#4e463c] sm:text-sm">
                          {titleFor(week)}
                        </span>

                        {week.weekly_theme &&
                        week.weekly_theme !==
                          titleFor(week) ? (
                          <span className="mt-0.5 block font-body text-[10px] leading-4 text-[#71808e]">
                            Shared idea: {week.weekly_theme}
                          </span>
                        ) : null}

                        {week.week_number === 1 ? (
                          <span className="mt-0.5 block font-body text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                            Open the lesson preview
                          </span>
                        ) : null}
                      </span>

                      <ArrowRight
                        size={14}
                        className={
                          active
                            ? "text-primary"
                            : "text-[#4e463c]/20"
                        }
                      />
                    </button>
                  );
                })}
          </div>
        </section>
      </div>

      {/* Week 1 opens the full lesson preview — handled by previewOpen above;
          nothing renders below the fold. */}
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Worksheets                                                                 */
/* -------------------------------------------------------------------------- */

const WORKSHEET_LABELS: Record<
  Track,
  Array<{
    label: string;
    prompt: string;
  }>
> = {
  adult: [
    {
      label: "My reflection",
      prompt: "What did I notice?",
    },
    {
      label: "My intention",
      prompt: "When I notice… I will…",
    },
    {
      label: "Midweek",
      prompt: "What happened when I tried it?",
    },
    {
      label: "Friday check-in",
      prompt: "Notice it. Name it. Do it.",
    },
  ],
  teen: [
    {
      label: "What stood out?",
      prompt: "The part I kept thinking about…",
    },
    {
      label: "What will I try?",
      prompt: "One small thing I can test…",
    },
    {
      label: "Midweek",
      prompt: "What did I notice in real life?",
    },
    {
      label: "Friday check-in",
      prompt: "What would I do next time?",
    },
  ],
  child: [
    {
      label: "Notice it",
      prompt: "Draw or write what you noticed.",
    },
    {
      label: "Name it",
      prompt: "What could you call it?",
    },
    {
      label: "Do it",
      prompt: "What is one small thing to try?",
    },
    {
      label: "Come back",
      prompt: "What happened when you tried?",
    },
  ],
};

const WorksheetPreview = ({
  track,
  theme,
}: {
  track: Track;
  theme: string;
}) => (
  <div className="mx-auto flex h-full max-h-[520px] w-full max-w-[410px] flex-col overflow-hidden rounded-sm border border-[#ddcfbb] bg-[#fffaf2] shadow-[0_18px_38px_rgba(92,67,31,0.13)]">
    <div className="flex items-start justify-between border-b border-[#d8cbb7] px-5 py-4">
      <div>
        <p className="font-body text-[8px] font-bold uppercase tracking-[0.26em] text-primary">
          Week 01 · {track}
        </p>

        <h3 className="mt-2 font-serif text-2xl font-semibold leading-none text-[#4e463c]">
          {theme.toUpperCase()}
        </h3>
      </div>

      <Ripple size={24} />
    </div>

    <div className="min-h-0 flex-1 px-5 py-4">
      {WORKSHEET_LABELS[track].map((item) => (
        <div
          key={item.label}
          className="mb-4 last:mb-0"
        >
          <p className="font-body text-[8px] font-bold uppercase tracking-[0.24em] text-primary">
            {item.label}
          </p>

          <p
            className="mt-1 text-sm italic text-[#766a5e]"
            style={{
              fontFamily: "var(--font-serif)",
            }}
          >
            {item.prompt}
          </p>

          <div className="mt-2 space-y-2">
            <div className="border-b border-[#cdd7de]" />
            <div className="border-b border-[#cdd7de]" />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between border-t border-[#d7e0e6] px-5 py-3">
      <span className="font-body text-[7px] uppercase tracking-[0.2em] text-[#9aa6ae]">
        mindcast.co.nz
      </span>

      <span className="font-display text-[10px] tracking-[0.18em] text-primary">
        NOTICE IT. NAME IT. DO IT.
      </span>
    </div>
  </div>
);

const WorksheetsPage = ({
  weekOneTheme,
}: {
  weekOneTheme: string;
}) => {
  const [worksheetTrack, setWorksheetTrack] =
    useState<Track>("adult");

  return (
    <div className="grid min-h-full gap-7 xl:grid-cols-[0.85fr_1.15fr] xl:items-center xl:gap-10">
      <div>
        <PageHeading eyebrow="One clear sheet at a time">
          Take the week
          <br />
          home with you.
        </PageHeading>

        <p className="mt-4 max-w-xl font-body text-sm leading-6 text-[#6d655c] sm:text-base sm:leading-7">
          The worksheet mirrors the live session, then
          gives the week somewhere to land. No stacked
          previews and no worksheets hidden inside the
          phase browser.
        </p>

        <div className="mt-5">
          <SegmentedControl
            value={worksheetTrack}
            label="Choose a worksheet preview"
            options={TRACKS.map((item) => ({
              value: item.key,
              label: item.label,
            }))}
            onChange={(value) => setWorksheetTrack(value as Track)}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-[#ddd4c7] bg-[#f4efe7]/80 p-5">
          <Eyebrow>The weekly return</Eyebrow>

          <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            {RHYTHM.map((step, index) => (
              <li
                key={`${step.day}-${step.title}`}
                className="relative rounded-xl bg-white p-3 shadow-sm"
              >
                <p className="font-display text-lg tracking-[0.1em] text-primary">
                  {step.day}
                </p>

                <p className="mt-1 font-body text-[10px] font-semibold leading-4 text-[#4e463c]">
                  {step.title}
                </p>

                {index < RHYTHM.length - 1 ? (
                  <span
                    className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-primary/50 sm:block xl:hidden 2xl:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 border-l-2 border-primary pl-4">
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-primary">
            Included for visitors
          </p>

          <p className="mt-2 font-body text-xs leading-5 text-[#6d655c] sm:text-sm">
            Every visitor receives the worksheet for the
            session they attend. Adult members can also
            save their responses to a private digital journal;
            teen and child worksheets stay paper-first.
          </p>
        </div>
      </div>

      <div className="min-h-[430px] xl:h-full xl:max-h-[560px]">
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.div
            key={worksheetTrack}
            initial={{
              opacity: 0,
              x: 16,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -10,
            }}
            transition={{
              duration: 0.22,
            }}
            className="h-full"
          >
            <WorksheetPreview
              track={worksheetTrack}
              theme={weekOneTheme}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Reflection                                                                 */
/* -------------------------------------------------------------------------- */

const ReflectionPage = () => (
  <div className="flex min-h-full flex-col">
    <div className="grid gap-5 border-b border-[#e4dccf] pb-5 xl:grid-cols-[1fr_0.9fr] xl:items-end">
      <PageHeading eyebrow="One idea · three experiences">
        A shared language,
        <br />
        not a shared script.
      </PageHeading>

      <p className="font-body text-sm leading-6 text-[#6d655c] xl:pb-1">
        Adults, teens and children explore the same weekly
        theme in separate, age-appropriate rooms. The
        connection happens afterwards—in the language a
        household can use together.
      </p>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {TRACKS.map((track, index) => (
        <article
          key={track.key}
          className="rounded-2xl border border-[#ddd4c7] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between">
            <span className="font-display text-2xl tracking-[0.12em] text-[#4e463c]">
              {track.label.toUpperCase()}
            </span>

            <span className="font-display text-xl text-primary/25">
              0{index + 1}
            </span>
          </div>

          <p className="mt-3 font-body text-xs leading-5 text-[#6d655c] sm:text-sm sm:leading-6">
            {TRACK_COPY[track.key].body}
          </p>
        </article>
      ))}
    </div>

    <div className="mt-5 grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-[#ddd4c7] bg-[#f7efe2] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Ripple size={24} />

          <Eyebrow>Shared language at home</Eyebrow>
        </div>

        <p className="mt-4 font-serif text-2xl font-semibold leading-tight text-[#4e463c] sm:text-3xl">
          {SHARED_LANGUAGE_TAGLINE}
        </p>

        <p className="mt-3 max-w-2xl font-body text-xs leading-5 text-[#6d655c] sm:text-sm sm:leading-6">
          {SHARED_LANGUAGE_COPY}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {NOTICE_NAME_DO.map((item, index) => (
            <span
              key={item}
              className="flex items-center gap-3"
            >
              <span className="font-display text-xl tracking-[0.12em] text-[#4e463c] sm:text-2xl">
                {item}
              </span>

              {index <
              NOTICE_NAME_DO.length - 1 ? (
                <span className="text-primary">
                  →
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#ddd4c7] bg-[#f4efe7]/80 p-5 sm:p-6">
        <Eyebrow>A year that remembers</Eyebrow>

        <p className="mt-3 font-serif text-2xl font-semibold leading-tight text-[#4e463c] sm:text-3xl">
          WE COME BACK BEFORE WE MOVE ON.
        </p>

        <p className="mt-3 font-body text-xs leading-5 text-[#6d655c] sm:text-sm sm:leading-6">
          Each Sunday begins by returning to the previous
          intention. There is no failure state here—only
          a growing record of what you noticed.
        </p>

        <div
          className="mt-5 flex h-14 items-end gap-[2px]"
          aria-label="Fifty-two weeks across four phases"
        >
          {Array.from(
            {
              length: 52,
            },
            (_, index) => (
              <span
                key={index}
                className="flex-1 bg-primary"
                style={{
                  height: `${
                    30 +
                    ((index % 13) / 12) * 70
                  }%`,
                  opacity:
                    0.24 +
                    Math.floor(index / 13) *
                      0.17,
                }}
              />
            ),
          )}
        </div>

        <div className="mt-2 flex justify-between">
          {BLOCKS.map((block) => (
            <span
              key={block.number}
              className="font-body text-[7px] font-bold uppercase tracking-[0.12em] text-[#71808e]"
            >
              {block.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Shop                                                                       */
/* -------------------------------------------------------------------------- */

const ShopPage = () => {
  const [products, setProducts] = useState<
    ShopProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const {
        data,
        error: productError,
      } = await db
        .from("shop_products")
        .select(
          "id, slug, name, description, image_url, price_cents, currency",
        )
        .in("slug", [
          "home-practice-bundle",
          "life-binder",
          "highlighter-set",
        ])
        .eq("is_active", true);

      if (!active) return;

      const order = [
        "home-practice-bundle",
        "life-binder",
        "highlighter-set",
      ];
      const rows = ((data ?? []) as ShopProduct[]).sort(
        (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
      );

      // Life Binder — show the cream variant as the thumbnail.
      const lifeBinder = rows.find((p) => p.slug === "life-binder");
      if (lifeBinder) {
        const { data: creamVariant } = (await db
          .from("shop_product_variants")
          .select("image_url")
          .eq("product_id", lifeBinder.id)
          .eq("name", "Cream")
          .maybeSingle()) as {
          data: { image_url: string | null } | null;
        };
        if (!active) return;
        if (creamVariant?.image_url) {
          lifeBinder.image_url = creamVariant.image_url;
        }
      }

      setProducts(rows);

      setError(Boolean(productError));
      setLoading(false);
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col justify-between gap-5 border-b border-[#e4dccf] pb-5 sm:flex-row sm:items-end">
        <PageHeading eyebrow="Pulled directly from the MINDCAST shop">
          Tools for
          <br />
          intentional living.
        </PageHeading>

        <Link
          to="/shop"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-primary/30 bg-white px-5 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
        >
          View the full shop
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        {loading ? (
          <div className="grid h-full min-h-[360px] place-items-center">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={24}
              />

              <p className="mt-3 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#71808e]">
                Loading shop products
              </p>
            </div>
          </div>
        ) : products.length ? (
          <div className="grid h-full gap-4 md:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.slug}`}
                className="group flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#ddd4c7] bg-white shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_30px_rgba(16,36,56,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#eee8dc]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <ShoppingBag
                        className="text-primary/25"
                        size={34}
                        strokeWidth={1.3}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-semibold leading-tight text-[#4e463c] sm:text-2xl">
                      {product.name}
                    </h3>

                    <span className="shrink-0 font-display text-xl text-primary">
                      {formatMoney(
                        product.price_cents,
                        product.currency,
                      )}
                    </span>
                  </div>

                  {product.description ? (
                    <p className="mt-3 line-clamp-3 font-body text-xs leading-5 text-[#6d655c] sm:text-sm">
                      {product.description}
                    </p>
                  ) : null}

                  <span className="mt-auto inline-flex items-center gap-2 pt-4 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                    Open product
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid h-full min-h-[360px] place-items-center rounded-2xl border border-[#ddd4c7] bg-[#f4efe7]/70 p-8 text-center">
            <div>
              <ShoppingBag
                className="mx-auto text-primary/30"
                size={32}
                strokeWidth={1.4}
              />

              <p className="mt-4 font-serif text-2xl font-semibold text-[#4e463c]">
                {error
                  ? "THE SHOP COULDN'T LOAD HERE."
                  : "PRODUCTS ARE BEING ADDED."}
              </p>

              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-primary underline underline-offset-4"
              >
                Open the shop
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

const Curriculum = () => {
  const [tab, setTab] =
    useState<TabKey>("notes");

  const [track, setTrack] =
    useState<Track>("adult");

  const [activePhase, setActivePhase] =
    useState(1);

  const [
    selectedWeekNumber,
    setSelectedWeekNumber,
  ] = useState(1);

  const reduceMotion = useReducedMotion();

  const { weeks } =
    useCurriculumWeeks("adult");

  const weekOneTheme =
    weeks.find(
      (week) => week.week_number === 1,
    )?.weekly_theme || WEEK1_THEME;

  const openPhaseOne = () => {
    setActivePhase(1);
    setSelectedWeekNumber(1);
    setTab("phases");
  };

  return (
    <div className="curriculum-room h-[100svh] overflow-hidden">
      <SiteHeader />

      <main className="h-full px-2 pb-2 pt-[72px] sm:px-4 sm:pb-4 lg:px-6">
        <section
          aria-label="Interactive MINDCAST Life Binder"
          className="curriculum-binder-cover relative mx-auto h-full max-h-[880px] w-full max-w-[1240px] overflow-hidden rounded-[24px] border sm:rounded-[30px]"
        >
          <div className="absolute inset-y-0 left-[52px] hidden w-px bg-[#cdbb9f] shadow-[1px_0_rgba(255,255,255,0.82)] lg:block" />

          <MobileTabs
            tab={tab}
            onChange={setTab}
          />

          <div className="h-[calc(100%_-_61px)] p-2.5 sm:p-4 lg:h-full lg:p-5">
            <div className="grid h-full min-h-0 lg:grid-cols-[54px_minmax(0,1fr)_142px] xl:grid-cols-[58px_minmax(0,1fr)_154px]">
              <BinderRings />

              <div
                className="min-h-0 lg:pl-5"
                style={{
                  perspective: 1400,
                }}
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  <motion.div
                    key={tab}
                    className="h-full min-h-0"
                    initial={
                      reduceMotion
                        ? {
                            opacity: 0,
                          }
                        : {
                            opacity: 0,
                            x: 18,
                            rotateY: -4,
                          }
                    }
                    animate={{
                      opacity: 1,
                      x: 0,
                      rotateY: 0,
                    }}
                    exit={
                      reduceMotion
                        ? {
                            opacity: 0,
                          }
                        : {
                            opacity: 0,
                            x: -10,
                            rotateY: 3,
                          }
                    }
                    transition={{
                      duration: reduceMotion
                        ? 0.12
                        : 0.28,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    style={{
                      transformOrigin:
                        "left center",
                    }}
                  >
                    <PaperPage tab={tab}>
                      {tab === "notes" ? (
                        <NotesPage
                          onOpenPhases={
                            openPhaseOne
                          }
                          onOpenWorksheets={() =>
                            setTab(
                              "worksheets",
                            )
                          }
                        />
                      ) : null}

                      {tab === "phases" ? (
                        <PhasesPage
                          track={track}
                          setTrack={setTrack}
                          activePhase={
                            activePhase
                          }
                          setActivePhase={
                            setActivePhase
                          }
                          selectedWeekNumber={
                            selectedWeekNumber
                          }
                          setSelectedWeekNumber={
                            setSelectedWeekNumber
                          }
                        />
                      ) : null}

                      {tab ===
                      "worksheets" ? (
                        <WorksheetsPage
                          weekOneTheme={
                            weekOneTheme
                          }
                        />
                      ) : null}

                      {tab ===
                      "reflection" ? (
                        <ReflectionPage />
                      ) : null}

                      {tab === "shop" ? (
                        <ShopPage />
                      ) : null}
                    </PaperPage>
                  </motion.div>
                </AnimatePresence>
              </div>

              <BinderTabs
                tab={tab}
                onChange={setTab}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Curriculum;
