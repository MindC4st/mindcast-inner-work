import campaign08Image from "@/assets/campaign-08-three-tracks.jpg";

export default function ThreeTracksCampaign() {
  return (
    <article
      className="relative aspect-[4/5] w-full overflow-hidden"
      style={{ containerType: "inline-size" }}
      aria-label="Three tracks, one theme, one community"
    >
      {/* Background */}
      <img
        src={campaign08Image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Figma gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,250,245,0) 40%, rgba(255,250,245,0.50) 70%, rgba(255,250,245,0.98) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-[7.407cqw]">
        {/* Header */}
        <header className="flex w-full items-center justify-between font-body leading-none">
          <span className="text-[1.667cqw] font-bold tracking-[0.278cqw] text-[#102438]">
            MINDCAST
          </span>

          <span className="text-[1.296cqw] font-semibold tracking-[0.093cqw] text-[#3585AF]">
            CAMPAIGN 08
          </span>
        </header>

        {/* Bottom-right copy */}
        <div className="flex w-full flex-col items-end gap-[1.852cqw] text-right">
          <p className="w-full font-body text-[1.667cqw] font-semibold leading-normal tracking-[0.046cqw] text-[#3585AF]">
            Adults connect. Teens belong. Children play.
          </p>

          <div className="w-full font-display text-[7.407cqw] text-[#102438]">
            <p className="leading-[7.037cqw]">THREE TRACKS.</p>
            <p className="leading-[7.037cqw]">ONE THEME.</p>
            <p className="leading-[7.037cqw]">ONE COMMUNITY.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
