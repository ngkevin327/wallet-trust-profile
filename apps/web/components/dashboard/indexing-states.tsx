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
      <div className="alert alert-error">
        <p className="font-medium">Indexing failed</p>
        <p className="mt-1">
          We could not complete indexing. Try linking again or contact support after repeated
          failures.
        </p>
        <Link href="/faq" className="link-brand mt-2 inline-block">
          Why is my profile empty?
        </Link>
      </div>
    );
  }

  if (status === "indexing") {
    return (
      <div className="alert alert-warning">
        <p className="font-medium">Indexing in progress</p>
        <p className="mt-1">Scores and badges will appear when indexing completes.</p>
      </div>
    );
  }

  return (
    <div className="alert alert-info">
      <p className="font-medium">No activity indexed yet</p>
      <p className="mt-1">
        Connect a wallet with on-chain history, or wait for the first index run to finish.
      </p>
      <Link href="/faq" className="link-brand mt-2 inline-block">
        Learn more
      </Link>
    </div>
  );
}
