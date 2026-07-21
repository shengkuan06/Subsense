import { Customer, Playbook, SegmentMetrics } from "./types";

// Defaults to the local API in dev; set VITE_API_BASE at build time (Vercel)
// to point the deployed dashboard at the hosted API.
const BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

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

// Portfolio retention playbooks (Pillar 3 — recommendation engine).
export async function fetchPlaybooks(): Promise<Playbook[]> {
  const res = await fetch(`${BASE}/playbooks?limit=60`);
  const json = await res.json();
  return (json.data ?? []).map((p: any) => ({
    id: p.id,
    customerId: p.customerId,
    customerName: p.customerName ?? p.customerId,
    plan: PLAN_MAP[p.plan] ?? "Standard",
    mrr: Math.round(p.mrr ?? 0),
    status: (p.status as Playbook["status"]) ?? "At-Risk",
    title: p.title ?? "Recommended action",
    description: p.description ?? "",
    type: (p.type as Playbook["type"]) ?? "ai",
    riskLevel: (p.riskLevel as Playbook["riskLevel"]) ?? "MEDIUM RISK",
    completed: false,
    actionText: p.actionText ?? "Send",
  }));
}

// Per-segment rollups for the Segments view.
export async function fetchSegments(): Promise<SegmentMetrics[]> {
  const res = await fetch(`${BASE}/segments`);
  const json = await res.json();
  return (json.data ?? []).map((s: any) => ({
    name: s.name as SegmentMetrics["name"],
    customerCount: s.customerCount ?? 0,
    avgHealthScore: Math.round(s.avgHealthScore ?? 0),
    churnRiskPercent: Math.round(s.churnRiskPercent ?? 0),
    mrrText: s.mrrText ?? "$0",
    healthBreakdown: {
      healthy: Math.round(s.healthBreakdown?.healthy ?? 0),
      atRisk: Math.round(s.healthBreakdown?.atRisk ?? 0),
      critical: Math.round(s.healthBreakdown?.critical ?? 0),
    },
  }));
}

// Record an executed intervention (fire-and-forget; UI stays optimistic).
export async function logIntervention(customerId: string, playbook: string): Promise<void> {
  try {
    await fetch(`${BASE}/interventions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, playbook, status: "sent" }),
    });
  } catch {
    /* backend offline - optimistic UI already updated */
  }
}
