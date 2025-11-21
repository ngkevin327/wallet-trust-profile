"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  createdAt: string;
  reputationIndex: number;
  scoringVersion: string;
};

type Props = {
  points: Point[];
};

export function ScoreTrendChart({ points }: Props) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-slate-500">
        Score history will appear after at least two indexing runs complete.
      </p>
    );
  }

  const data = [...points]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString(),
      index: p.reputationIndex,
      version: p.scoringVersion,
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => [value, "Index"]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { version?: string } | undefined;
              return row?.version ? `Scoring v${row.version}` : "";
            }}
          />
          <Line type="monotone" dataKey="index" stroke="#4f46e5" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
