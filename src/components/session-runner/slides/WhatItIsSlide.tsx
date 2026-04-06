import { Check, X } from "lucide-react";

const IS_LIST = [
  "A structured weekly practice for inner work",
  "Evidence-informed — built on real research",
  "A safe, facilitated community space",
  "A place to listen, reflect, discuss, and commit",
];

const ISNT_LIST = [
  "Therapy or counselling",
  "A lecture or passive experience",
  "A place to fix anyone else",
  "Something that works without showing up",
];

const WhatItIsSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">What is Mindcast?</p>
    <div className="grid md:grid-cols-2 gap-12 max-w-5xl">
      <div>
        <h2 className="font-display text-3xl text-[hsl(var(--ivory))] mb-6 tracking-wide">WHAT IT IS</h2>
        <ul className="space-y-4">
          {IS_LIST.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[hsl(var(--ivory))]/80 font-body text-sm">
              <Check size={16} className="text-[hsl(var(--blue))] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-3xl text-[hsl(var(--ivory))] mb-6 tracking-wide">WHAT IT ISN'T</h2>
        <ul className="space-y-4">
          {ISNT_LIST.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[hsl(var(--ivory))]/40 font-body text-sm">
              <X size={16} className="text-destructive/60 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default WhatItIsSlide;
