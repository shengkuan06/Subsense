import { useEffect, useState } from "react";
import { getCustomer, getChurn } from "./api";

const scoreColor = (band: string) =>
  band === "Critical" ? "text-red-400" : band === "At-Risk" ? "text-amber-400" : "text-emerald-400";

function Dim({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#8B8794]">{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-[#26232F] rounded-full">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function Customer360({ id, onBack }: { id: string; onBack: () => void }) {
  const [c, setC] = useState<any>(null);
  const [churn, setChurn] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCustomer(id).then(setC).catch(() => setError("Cannot load this customer."));
    getChurn(id).then(setChurn).catch(() => {});
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!c) return <p className="text-[#8B8794]">Loading…</p>;

  const p = c.profile;
  const h = c.health;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-[#8B8794] hover:text-white text-sm transition-colors">
        ← Back
      </button>

      <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{p.customer_id}</h1>
          <p className="text-[#8B8794] mt-1">
            {p.plan} · {p.segment} · {p.region} · ${p.mrr}/mo
          </p>
        </div>
        <div className="text-right">
          <p className={`text-5xl font-bold ${scoreColor(h.risk_band)}`}>{Math.round(h.score)}</p>
          <p className="text-[#8B8794] text-sm mt-1">{h.risk_band}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Health breakdown</h2>
          <Dim label="Usage (40%)" value={h.usage_dim} />
          <Dim label="Engagement (25%)" value={h.engagement_dim} />
          <Dim label="Support (20%)" value={h.support_dim} />
          <Dim label="Outcomes (15%)" value={h.outcome_dim} />
        </div>

        <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-6">
          <h2 className="font-semibold">Why this account is at risk</h2>
          {churn ? (
            <>
              <p className="text-4xl font-bold text-red-400 my-4">
                {(churn.churn_prob * 100).toFixed(0)}%{" "}
                <span className="text-sm text-[#8B8794] font-normal">churn probability</span>
              </p>
              <ul className="space-y-2">
                {churn.drivers.map((d: any, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm border-t border-[#26232F] pt-2"
                  >
                    <span>{d.feature}</span>
                    <span className={d.impact > 0 ? "text-red-400" : "text-emerald-400"}>
                      {d.direction}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[#8B8794] mt-3">Loading…</p>
          )}
        </div>
      </div>

      <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-6">
        <h2 className="font-semibold mb-1">Recommended action</h2>
        <p className="text-[#8B8794] text-sm mb-4">
          Retention playbooks connect here (Pillar 3).
        </p>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Offer pause
          </button>
          <button className="border border-[#26232F] text-sm px-4 py-2 rounded-lg text-[#8B8794] hover:text-white hover:border-violet-500/50 transition-colors">
            Send win-back
          </button>
          <button className="border border-[#26232F] text-sm px-4 py-2 rounded-lg text-[#8B8794] hover:text-white hover:border-violet-500/50 transition-colors">
            Downgrade plan
          </button>
        </div>
      </div>
    </div>
  );
}
