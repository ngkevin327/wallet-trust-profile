"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy route — redirect to canonical public profile URL */
export default function LegacyProfileRedirectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.slug) {
      router.replace(`/u/${params.slug.toLowerCase()}`);
    }
  }, [params.slug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">Redirecting to profile…</p>
    </div>
  );
}
