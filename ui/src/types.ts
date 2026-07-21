export type CustomerPlan = "Standard" | "Pro Plan" | "Enterprise";
export type CustomerStatus = "Critical" | "At-Risk" | "Healthy";
export type CustomerSegment = "SMB" | "Mid-Market" | "Enterprise";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  time: string;
  author: string;
  avatarUrl: string;
}

export interface HealthBreakdown {
  usage: number;
  engagement: number;
  support: number;
  outcomes: number;
}

export interface Customer {
  id: string;
  name: string;
  plan: CustomerPlan;
  mrr: number;
  arr: number;
  healthScore: number;
  churnRisk: number;
  status: CustomerStatus;
  segment: CustomerSegment;
  renewalDate: string;
  csm: string;
  healthBreakdown: HealthBreakdown;
  riskReasons: string[];
  timeline: TimelineEvent[];
}

export interface Playbook {
  id: string;
  customerId: string;
  customerName: string;
  plan: CustomerPlan;
  mrr: number;
  status: CustomerStatus;
  title: string;
  description: string;
  type: "ai" | "pause" | "winback" | "retry";
  riskLevel: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";
  completed: boolean;
  actionText: string;
}

export interface SegmentMetrics {
  name: CustomerSegment;
  customerCount: number;
  avgHealthScore: number;
  churnRiskPercent: number;
  mrrText: string;
  healthBreakdown: {
    healthy: number;
    atRisk: number;
    critical: number;
  };
}
