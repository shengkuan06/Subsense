import { useEffect, useState } from "react";
import { getAlerts, getCustomers } from "./api";

const badge = (band: string) =>
  band === "Critical"
    ? "bg-red-500/15 text-red-400"
    : band === "At-Risk"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-emerald-500/15 text-emerald-400";

export default function AtRiskList({
  mode,
  onSelect,
}: {
  mode: "alerts" | "all";
  onSelect: (id: string) => void;
}) {
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRes(null);
    const fetcher = mode === "alerts" ? getAlerts() : getCustomers(100);
    fetcher.then(setRes).catch(() => setError("Cannot reach the API. Is the backend running?"));
  }, [mode]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!res) return <p className="text-[#8B8794]">Loading…</p>;

  const title = mode === "alerts" ? "At-risk accounts" : "All customers";
  const subtitle =
    mode === "alerts"
      ? `${res.meta.total_at_risk} active customers · $${res.meta.mrr_at_risk.toLocaleString()} MRR at risk`
      : `${res.meta.total} customers`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-[#8B8794] text-sm mt-1">{subtitle}</p>
      </div>

      <div className="bg-[#16141F] border border-[#26232F] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0D0B14] text-[#8B8794]">
            <tr>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Plan</th>
              <th className="text-right p-3 font-medium">MRR</th>
              <th className="text-right p-3 font-medium">Health</th>
              <th className="text-right p-3 font-medium">Churn risk</th>
              <th className="text-left p-3 pl-6 font-medium">Band</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c: any) => (
              <tr
                key={c.customer_id}
                onClick={() => onSelect(c.customer_id)}
                className="border-t border-[#26232F] hover:bg-violet-500/5 cursor-pointer transition-colors"
              >
                <td className="p-3 font-medium">{c.customer_id}</td>
                <td className="p-3 text-[#8B8794]">{c.plan}</td>
                <td className="p-3 text-right">${c.mrr}</td>
                <td className="p-3 text-right">{c.health_score ?? "—"}</td>
                <td className="p-3 text-right">
                  {c.churn_prob != null ? `${(c.churn_prob * 100).toFixed(0)}%` : "—"}
                </td>
                <td className="p-3 pl-6">
                  {c.risk_band && (
                    <span className={`px-2 py-1 rounded-md text-xs ${badge(c.risk_band)}`}>
                      {c.risk_band}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
