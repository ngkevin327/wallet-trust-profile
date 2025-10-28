import Link from "next/link";

type Props = {
  scoringVersion?: string | null;
  lastUpdated?: string | null;
  lastUpdatedAt?: string | null;
  hideWhenIndexingFailed?: boolean;
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) {
    return "just now";
  }
  if (hours < 48) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ProfileFooter({
  scoringVersion,
  lastUpdated,
  lastUpdatedAt,
  hideWhenIndexingFailed,
}: Props) {
  if (hideWhenIndexingFailed) {
    return null;
  }

  const updatedIso = lastUpdatedAt ?? lastUpdated;
  const parts: string[] = [];

  if (scoringVersion) {
    parts.push(`Scoring v${scoringVersion}`);
  }
  if (updatedIso) {
    parts.push(`Updated ${formatRelative(updatedIso)}`);
  }

  if (!parts.length) {
    return null;
  }

  return (
    <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
      <p>{parts.join(" · ")}</p>
      <Link href="/#faq" className="mt-1 inline-block text-brand-700 hover:underline">
        How scores work
      </Link>
    </footer>
  );
}
