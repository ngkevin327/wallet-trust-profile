type Props = {
  score: number | null;
  size?: "md" | "lg";
  label?: string;
  pendingLabel?: string;
};

export function ScoreDisplay({
  score,
  size = "lg",
  label = "Reputation index",
  pendingLabel = "Score pending",
}: Props) {
  const isLarge = size === "lg";
  const ringSize = isLarge ? 160 : 120;
  const stroke = isLarge ? 10 : 8;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score != null ? Math.min(100, Math.max(0, score)) / 100 : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div
        className={`relative mt-4 ${isLarge ? "h-40 w-40" : "h-[7.5rem] w-[7.5rem]"}`}
        role="img"
        aria-label={score != null ? `${label} ${score}` : pendingLabel}
      >
        <svg
          className="-rotate-90"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-100"
          />
          {score != null ? (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          ) : null}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score != null ? (
            <span
              className={`font-display font-bold tabular-nums text-brand-800 ${
                isLarge ? "text-5xl" : "text-3xl"
              }`}
            >
              {score}
            </span>
          ) : (
            <span className="max-w-[5rem] text-xs font-medium leading-tight text-slate-500">
              {pendingLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
