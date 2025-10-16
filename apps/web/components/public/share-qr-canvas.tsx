"use client";

import { useEffect, useRef } from "react";

type Props = {
  url: string;
};

export function ShareQrCanvas({ url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    void (async () => {
      const QRCode = await import("qrcode");
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 });
      }
    })();
  }, [url]);

  return <canvas ref={canvasRef} className="rounded-lg border border-slate-200" />;
}
