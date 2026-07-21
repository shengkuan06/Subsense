import { Customer } from "./types";

const BASE = "http://127.0.0.1:8000/api";

const PLAN_MAP: Record<string, Customer["plan"]> = {
  Basic: "Standard",
  Pro: "Pro Plan",
  Enterprise: "Enterprise",
};

function mapListRow(row: any): Customer {
  const health = Math.round(row.health_score ?? 0);
  const mrr = Math.round(row.mrr ?? 0);
  return {
    id: row.customer_id,
    name: row.name ?? row.customer_id,
    plan: PLAN_MAP[row.plan] ?? "Standard",
    mrr,
    arr: mrr * 12,
    healthScore: health,
    churnRisk: Math.round((row.churn_prob ?? 0) * 100),
    status: (row.risk_band as Customer["status"]) ?? "Healthy",
    segment: (row.segment as Customer["segment"]) ?? "SMB",
    renewalDate: "2026-12-31",
    csm: "Alex J.",
    healthBreakdown: { usage: health, engagement: health, support: health, outcomes: health },
    riskReasons: [],
    timeline: [],
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE}/customers?limit=500`);
  const json = await res.json();
  return (json.data ?? []).map(mapListRow);
}

export async function fetchCustomerDetail(id: string): Promise<Partial<Customer>> {
  const [cRes, chRes] = await Promise.all([
    fetch(`${BASE}/customers/${id}`),
    fetch(`${BASE}/customers/${id}/churn`),
  ]);
  const c = (await cRes.json()).data ?? {};
  const ch = (await chRes.json()).data ?? {};
  const h = c.health ?? {};
  return {
    healthBreakdown: {
      usage: Math.round(h.usage_dim ?? 0),
      engagement: Math.round(h.engagement_dim ?? 0),
      support: Math.round(h.support_dim ?? 0),
      outcomes: Math.round(h.outcome_dim ?? 0),
    },
    riskReasons: (ch.drivers ?? []).map((d: any) => `${d.feature} — ${d.direction}`),
  };
}
