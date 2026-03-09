type FeedTone = "accent" | "green" | "amber" | "red";

export type FeedEntry = {
  event: string;
  timestamp: string;
  tone: FeedTone;
};

const toneClasses: Record<FeedTone, string> = {
  accent: "bg-accent shadow-[0_0_14px_rgba(120,255,227,0.28)]",
  green: "bg-green shadow-[0_0_14px_rgba(149,255,106,0.28)]",
  amber: "bg-amber shadow-[0_0_14px_rgba(255,184,77,0.28)]",
  red: "bg-red shadow-[0_0_14px_rgba(255,107,87,0.28)]",
};

export function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  const loopingEntries = [...entries, ...entries];

  return (
    <div className="relative h-[22rem] overflow-hidden">
      <ul className="animate-feed-scroll space-y-3 py-4">
        {loopingEntries.map((entry, index) => (
          <li
            key={`${entry.timestamp}-${entry.event}-${index}`}
            className="flex items-start gap-3 border-b border-line/30 pb-3 font-mono text-[0.78rem] leading-6 text-white/70"
          >
            <span
              className={`mt-2 h-2 w-2 shrink-0 ${toneClasses[entry.tone]} animate-status-flicker`}
            />
            <span className="shrink-0 text-accent/70">{entry.timestamp}</span>
            <span className="text-white/75">{entry.event}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
