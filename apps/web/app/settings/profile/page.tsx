"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SlugInput } from "../../../components/settings/slug-input";
import { api } from "../../../lib/api/client";
import { updateProfile } from "../../../lib/api/profile";
import { getAccessToken } from "../../../lib/auth/token";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileOwnerDto | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    api.getMyProfile().then((p) => {
      const data = p as ProfileOwnerDto;
      setProfile(data);
      setDisplayName(data.displayName ?? "");
      setSlug(data.slug);
      setVisibility(data.visibility);
    });
  }, []);

  async function handleSave() {
    if (!profile) {
      return;
    }
    if (slug !== profile.slug && !window.confirm("Changing your slug will break existing links. Continue?")) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ displayName, slug, visibility });
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <p className="text-slate-500">Loading settings…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">Profile settings</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="display-name">
            Display name
          </label>
          <input
            id="display-name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <SlugInput value={slug} onChange={setSlug} currentSlug={profile.slug} />

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="visibility">
            Visibility
          </label>
          <select
            id="visibility"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "public" | "private")}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </main>
  );
}
