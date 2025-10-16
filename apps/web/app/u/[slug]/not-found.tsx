import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Profile not found</h1>
      <p className="mt-3 text-slate-600">
        This profile does not exist or is not publicly visible. Create your own onchain reputation
        profile to get started.
      </p>
      <Link
        href="/?utm_source=not_found&utm_medium=profile_404"
        className="ui-btn ui-btn-primary mt-8 inline-flex"
      >
        Connect wallet
      </Link>
      <Link href="/" className="mt-4 text-sm text-brand-700 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
