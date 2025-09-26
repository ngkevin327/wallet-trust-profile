import type { ProfileStatusDto } from "@onchain-reputation/shared";
import Link from "next/link";

type Props = {
  status: ProfileStatusDto;
};

export function IndexingStates({ status }: Props) {
  if (status === "active") {
    return null;
  }

  if (status === "failed") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-medium">Indexing failed</p>
        <p className="mt-1">
          We could not complete indexing. Try linking again or contact support after repeated
          failures.
        </p>
        <Link href="/faq" className="mt-2 inline-block font-medium underline">
          Why is my profile empty?
        </Link>
      </div>
    );
  }

  if (status === "indexing") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Indexing in progress</p>
        <p className="mt-1">Scores and badges will appear when indexing completes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <p className="font-medium">No activity indexed yet</p>
      <p className="mt-1">
        Connect a wallet with on-chain history, or wait for the first index run to finish.
      </p>
      <Link href="/faq" className="mt-2 inline-block text-brand-700 hover:underline">
        Learn more
      </Link>
    </div>
  );
}
