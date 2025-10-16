"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const QrCanvas = dynamic(
  () => import("./share-qr-canvas").then((m) => m.ShareQrCanvas),
  { ssr: false, loading: () => <p className="text-sm text-slate-500">Generating QR…</p> },
);

type Props = {
  url: string;
};

export function ShareQr({ url }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <p className="mb-2 text-xs text-slate-500">Scan to open profile</p>
      <QrCanvas url={url} />
    </div>
  );
}
