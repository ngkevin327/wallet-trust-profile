import Link from "next/link";
import { CenteredFlowPage } from "../../../components/layout/centered-flow-page";

export default function ProfileNotFound() {
  return (
    <CenteredFlowPage>
      <div className="ui-card-elevated text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 font-display text-2xl font-bold text-brand-800">
          ?
        </div>
        <h1 className="page-title mt-6">Profile not found</h1>
        <p className="page-lead">
          This profile does not exist or is not publicly visible. Create your own onchain reputation
          profile to get started.
        </p>
        <Link
          href="/?utm_source=not_found&utm_medium=profile_404"
          className="ui-btn ui-btn-primary mt-8 inline-flex"
        >
          Connect wallet
        </Link>
        <Link href="/" className="link-brand mt-4 inline-block">
          Back to home
        </Link>
      </div>
    </CenteredFlowPage>
  );
}
