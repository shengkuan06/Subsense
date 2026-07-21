import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import AtRiskList from "./AtRiskList";
import Customer360 from "./Customer360";
import { getOverview } from "./api";

type Page = "dashboard" | "atrisk" | "customers" | "actions" | "segments";

const NAV: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "atrisk", label: "At-Risk" },
  { key: "customers", label: "Customers" },
  { key: "actions", label: "Actions" },
  { key: "segments", label: "Segments" },
];

function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="bg-[#16141F] border border-[#26232F] rounded-xl p-8 text-center">
        <p className="text-[#8B8794]">
          Pillar 3 — recommendations and interventions connect here once the
          endpoints land.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selected, setSelected] = useState<string | null>(null);
  const [mrrAtRisk, setMrrAtRisk] = useState<number | null>(null);

  useEffect(() => {
    getOverview()
      .then((d) => setMrrAtRisk(d.mrr_at_risk))
      .catch(() => {});
  }, []);

  const go = (p: Page) => {
    setPage(p);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex">
      <aside className="w-60 shrink-0 bg-[#0D0B14] border-r border-[#26232F] p-4 flex flex-col gap-1">
        <div className="px-3 py-4 mb-2">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            SubSense
          </span>
        </div>
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => go(n.key)}
            className={`text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
              page === n.key && !selected
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium"
                : "text-[#8B8794] hover:text-white hover:bg-[#16141F]"
            }`}
          >
            {n.label}
          </button>
        ))}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#26232F] flex items-center justify-between px-6">
          <span className="text-sm text-[#8B8794]">
            Smart subscription &amp; customer experience optimization
          </span>
          {mrrAtRisk != null && (
            <span className="text-xs bg-amber-500/15 text-amber-400 px-3 py-1.5 rounded-md font-medium">
              ${mrrAtRisk.toLocaleString()} MRR at risk
            </span>
          )}
        </header>

        <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
          {selected ? (
            <Customer360 id={selected} onBack={() => setSelected(null)} />
          ) : page === "dashboard" ? (
            <Dashboard />
          ) : page === "atrisk" ? (
            <AtRiskList mode="alerts" onSelect={setSelected} />
          ) : page === "customers" ? (
            <AtRiskList mode="all" onSelect={setSelected} />
          ) : page === "actions" ? (
            <Placeholder title="Actions" />
          ) : (
            <Placeholder title="Segments" />
          )}
        </main>
      </div>
    </div>
  );
}
