"use client";

import { useEffect, useState } from "react";
import {
  createDao,
  createProtocol,
  deleteDao,
  deleteProtocol,
  listRegistrySnapshot,
} from "../../../lib/api/admin";

const STORAGE_KEY = "admin_api_key";

export default function AdminRegistryPage() {
  const [apiKey, setApiKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof listRegistrySnapshot>> | null>(
    null,
  );

  const [protocolForm, setProtocolForm] = useState({
    slug: "",
    name: "",
    chainId: 1,
    contract: "",
    category: "defi",
  });

  const [daoForm, setDaoForm] = useState({
    slug: "",
    name: "",
    chainId: 1,
    treasury: "",
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiKey(saved);
      setUnlocked(true);
    }
  }, []);

  async function load() {
    setError(null);
    try {
      const data = await listRegistrySnapshot(apiKey);
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registry");
    }
  }

  useEffect(() => {
    if (unlocked && apiKey) {
      void load();
    }
  }, [unlocked, apiKey]);

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, apiKey);
    setUnlocked(true);
  }

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-xl font-semibold">Internal admin</h1>
        <p className="mt-2 text-sm text-slate-600">Enter the staging admin API key. Not linked from the public site.</p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="X-Admin-Api-Key"
        />
        <button type="button" onClick={unlock} className="ui-btn ui-btn-primary mt-4">
          Continue
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Registry management</h1>
      <p className="mt-1 text-sm text-slate-500">Ops-only tool for protocols and DAOs.</p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <section className="ui-card mt-8">
        <h2 className="font-semibold">Add protocol</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="slug"
            value={protocolForm.slug}
            onChange={(e) => setProtocolForm({ ...protocolForm, slug: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="name"
            value={protocolForm.name}
            onChange={(e) => setProtocolForm({ ...protocolForm, name: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="contract"
            value={protocolForm.contract}
            onChange={(e) => setProtocolForm({ ...protocolForm, contract: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="category"
            value={protocolForm.category}
            onChange={(e) => setProtocolForm({ ...protocolForm, category: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
        </div>
        <button
          type="button"
          className="ui-btn ui-btn-primary mt-3"
          onClick={() =>
            void createProtocol(apiKey, protocolForm).then(() => load()).catch((e) => setError(String(e)))
          }
        >
          Create protocol
        </button>
      </section>

      <section className="ui-card mt-6">
        <h2 className="font-semibold">Add DAO</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="slug"
            value={daoForm.slug}
            onChange={(e) => setDaoForm({ ...daoForm, slug: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="name"
            value={daoForm.name}
            onChange={(e) => setDaoForm({ ...daoForm, name: e.target.value })}
            className="rounded border px-2 py-1 text-sm"
          />
          <input
            placeholder="treasury"
            value={daoForm.treasury}
            onChange={(e) => setDaoForm({ ...daoForm, treasury: e.target.value })}
            className="rounded border px-2 py-1 text-sm sm:col-span-2"
          />
        </div>
        <button
          type="button"
          className="ui-btn ui-btn-primary mt-3"
          onClick={() =>
            void createDao(apiKey, daoForm).then(() => load()).catch((e) => setError(String(e)))
          }
        >
          Create DAO
        </button>
      </section>

      {snapshot ? (
        <section className="mt-8 space-y-6">
          <div>
            <h2 className="font-semibold">Protocols ({snapshot.protocolCount})</h2>
            <ul className="mt-2 divide-y text-sm">
              {snapshot.protocols.map((p) => (
                <li key={p.slug} className="flex items-center justify-between py-2">
                  <span>
                    {p.slug} · chain {p.chainId} · {p.category}
                  </span>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      if (confirm(`Deactivate protocol ${p.slug}?`)) {
                        void deleteProtocol(apiKey, p.id).then(() => load());
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">DAOs ({snapshot.daoCount})</h2>
            <ul className="mt-2 divide-y text-sm">
              {snapshot.daos.map((d) => (
                <li key={d.slug} className="flex items-center justify-between py-2">
                  <span>
                    {d.slug} · treasury {d.treasury ?? "—"}
                  </span>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      if (confirm(`Deactivate DAO ${d.slug}?`)) {
                        void deleteDao(apiKey, d.id).then(() => load());
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
