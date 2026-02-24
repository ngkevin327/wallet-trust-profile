"use client";

import type { ProfileOwnerDto } from "@onchain-reputation/shared";
import { useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/page-header";
import { SlugInput } from "../../../components/settings/slug-input";
import { VisibilityToggle } from "../../../components/settings/visibility-toggle";
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
    if (
      slug !== profile.slug &&
      !window.confirm("Changing your slug will break existing links. Continue?")
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ displayName, slug, visibility });
      setMessage("Profile updated");
      setProfile((prev) => (prev ? { ...prev, displayName, slug, visibility } : prev));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="page-content">
        <p className="text-slate-500">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Profile settings"
        lead="Display name, public URL slug, and visibility."
        backHref="/dashboard"
        backLabel="← Dashboard"
      />

      <div className="ui-card space-y-6">
        <div>
          <label className="label-field" htmlFor="display-name">
            Display name
          </label>
          <input
            id="display-name"
            maxLength={128}
            className="input-field"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <SlugInput value={slug} onChange={setSlug} currentSlug={profile.slug} />

        <VisibilityToggle value={visibility} onChange={setVisibility} />

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="ui-btn ui-btn-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {message ? (
          <p className="alert alert-info" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
