"use client";

type LastUpdatedProps = {
  iso: string | null | undefined;
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    return "Updated just now";
  }
  if (hours < 24) {
    return `Updated ${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export function LastUpdated({ iso }: LastUpdatedProps) {
  if (!iso) {
    return <p className="text-sm text-slate-500">Not indexed yet</p>;
  }

  const stale = Date.now() - new Date(iso).getTime() > 24 * 60 * 60 * 1000;

  return (
    <p
      className={`text-sm ${stale ? "text-amber-700" : "text-slate-500"}`}
      title={new Date(iso).toLocaleString()}
    >
      {formatRelative(iso)}
      {stale ? " · data may be stale" : ""}
    </p>
  );
}
