import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mesh-hero flex min-h-screen flex-col justify-center px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl text-brand-700">
          ?
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Profile not found</h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          This profile does not exist or is not publicly visible. Create your own onchain reputation
          profile to get started.
        </p>
        <Link
          href="/?utm_source=not_found&utm_medium=profile_404"
          className="ui-btn ui-btn-primary mt-8 inline-flex"
        >
          Connect wallet
        </Link>
        <Link
          href="/"
          className="mt-4 block text-sm font-medium text-brand-700 hover:text-brand-600"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
