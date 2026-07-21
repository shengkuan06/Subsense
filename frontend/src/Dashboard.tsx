import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getOverview } from "./api";

const BAND_COLORS: Record<string, string> = {
  Healthy: "#10b981",
  "At-Risk": "#f59e0b",
  Critical: "#ef4444",
};

function Tile({ label, value, accent }: { label: string; value: string | number; accent?: "amber" | "gradient" }) {
  const valueClass =
    accent === "amber"
      ? "text-amber-400"
      : accent === "gradient"
        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
        : "text-white";
  return (
    <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-5">
      <p className="text-[#8B8794] text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverview().then(setD).catch(() => setError("Cannot reach the API. Is the backend running?"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!d) return <p className="text-[#8B8794]">Loading…</p>;

  const bands = ["Healthy", "At-Risk", "Critical"].map((name) => ({
    name,
    value: d.bands[name] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[#8B8794] text-sm mt-1">Portfolio health at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Tile label="Active customers" value={d.active_customers} />
        <Tile label="Total MRR" value={`$${d.total_mrr.toLocaleString()}`} />
        <Tile label="MRR at risk" value={`$${d.mrr_at_risk.toLocaleString()}`} accent="amber" />
        <Tile label="Avg health score" value={d.avg_health_score} accent="gradient" />
      </div>

      <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-5">
        <h2 className="font-semibold mb-1">Customer health distribution</h2>
        <p className="text-[#8B8794] text-sm mb-4">Active customers by risk band</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bands} barSize={64}>
            <XAxis dataKey="name" stroke="#8B8794" axisLine={false} tickLine={false} />
            <YAxis stroke="#8B8794" axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#26232F" }}
              contentStyle={{ background: "#16141F", border: "1px solid #26232F", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {bands.map((b) => (
                <Cell key={b.name} fill={BAND_COLORS[b.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
