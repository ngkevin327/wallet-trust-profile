"use client";

import { useEffect, useState } from "react";
import { checkSlugAvailability } from "../../lib/api/profile";

type Props = {
  value: string;
  onChange: (slug: string) => void;
  currentSlug?: string;
};

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function SlugInput({ value, onChange, currentSlug }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!value || value === currentSlug) {
      setError(null);
      return;
    }

    if (value.length < 3 || value.length > 30 || !SLUG_PATTERN.test(value)) {
      setError("Use 3–30 lowercase letters, numbers, and hyphens");
      return;
    }

    const timer = setTimeout(() => {
      setChecking(true);
      checkSlugAvailability(value)
        .then((res) => {
          if (!res.available) {
            setError("Slug is taken or reserved");
          } else {
            setError(null);
          }
        })
        .catch(() => setError("Could not verify slug availability"))
        .finally(() => setChecking(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [value, currentSlug]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor="profile-slug">
        Vanity slug
      </label>
      <input
        id="profile-slug"
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        placeholder="your-name"
      />
      <p className="mt-1 text-xs text-slate-500">
        Public URL: <span className="font-mono">/u/{value || "your-slug"}</span>
        {checking ? " · checking…" : null}
      </p>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
