import { ImageResponse } from "next/og";
import { fetchPublicProfile } from "../../../lib/api/public-profile";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: { slug: string };
};

export default async function OgImage({ params }: Props) {
  const profile = await fetchPublicProfile(params.slug.toLowerCase());
  const title = profile?.displayName ?? params.slug;
  const index = profile?.reputationIndex;
  const topBadge = profile?.badges[0]?.title;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 64,
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85 }}>Onchain Reputation</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 16 }}>{title}</div>
        {index != null ? (
          <div style={{ fontSize: 40, marginTop: 24 }}>Reputation index: {index}</div>
        ) : (
          <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9 }}>Indexing in progress</div>
        )}
        {topBadge ? (
          <div style={{ fontSize: 24, marginTop: 16, opacity: 0.85 }}>★ {topBadge}</div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
