import { Customer, Playbook, SegmentMetrics } from "./types";

// Profile photos matching the mockups
export const AVATARS = {
  alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuCio2tEU0suYqPYYwrtI878jWzu16iSDlzn2OlzNPo6XEUWKaHAJsMRbKGpLoc6q3GcJ3ACHr8VZekBHJe0l8fXzsA_EnwJfo-UtNIlPfQQLU-C4dUn3IJZvvvJM2TY3d5ZY-L2P4maJIZdHRLyPF6DP7es1Lk-TVbxtPt9vH5LNCUwO8Y3qJjlWoHlRY45B15n6Mg6OXDu45PpjVJ8JQEzAK-hxOxiWd3NN_SQoN1TLV3vmbYcQMEBlDI1MbPLf-t4JkyZTPOhzQ91",
  woman1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwjEYgwrkUmAqkamLG25mq3v_GQ0X5ZQtiduzEICXwVJhPf98Prrgza8iuZKiGrCUVbMJck_CQ1PvIT0SA7aCkWaMlyAqKumsSVG7MYdB_pGDKlL2aFZHwDtvGLmZaGsthYuNWlh1ERtpWxkVDUVl7EtueyM1zcbi4S_cagrfGVBlurmQqh7WQ7VgkL7qudCfJL3XYy1nvz0e2Z2FGgZQLNoM_X-bzEfIkleU2TjdCIlBnIwFL7qEIrzbqku2LlXaSkG6_2dlfX30z",
  woman2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOsJmiAvg0gzm6XIEX_G4JJO4FrztvSUPaxVS8FTdBOjpmRMhxIILVx_7tasbCORI5EO7rsuJN_IA0xqPBG1nB-RD8FEF0UEQ65zzMIIGsctd0JJlPdZPcQd4LN2rGwh_r9T7Uzxt67z4t2v39t-Nr13rCKUZguUb4p_lSBI7XV4ZFA4TPMTd6qfpiUq9nCNU6TanK5O6NlxQnDXYRSbTjAWc3rBAeA10mDLF1XzsgyAmdwn99KBh7NQnDLJFhwceVs7_moJz_MKId",
  man1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvZHVfEQwouDlVJhwbRwpzm3cudFiqTs3Nakc0sh0wgQmiOMLMfADABwOEp8WjWy8DDJTcJJHB9wuHwbBUBS98RP9Wg3gBBNGJASpgKn-gseTfXj4LI1dK_u7BDI5lX442rzYC1mflV8caZzTYVaB8FNk7vlyrtdtjW17gNAAQo0S8CbTXBqhQNHahjnsHDYkZFammjzYJQUsNScXl_TynuYITvvY5_GILq1ht676otLg473ZUpvCb13bMxDCp5q_iILNx8Dj9umEI",
  woman3: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMWd7w4sPAw5InIUTpTToGLzQTEOtqJw5tT9pAokSWvMO_7m4QETDZegpscTQFaueRFjq1kItWQOcr5ufcAGrlt1q0GARaI1joZM8lAzTUgrw1A0bmhsAhJYuwwvbrBRAGR6m-HXbNWQTWNtcm7NuRbJROPovJmUcxmAxhDjkXBmh1EEagtCysTaOZHPSbHkTuxjBRoDWmWouu9Mn3TTr63WxcmQ0FZF0kmYCtWpZ-Y-qL89xkiMw5Yo7xMNuGsr5_SyoEEMJf11lz",
  man2: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtWffIRgFZEJXYTO98yHrPZU7AUjPhJrW6x_UZ-SeUgNajHyQlclkIW2bKrN498zk98qWKZdcdsbbKL3c0yC0TeeY3ocqvnaPmdgTWppP1agOllMen95AnVADGoCjQF9hcLB39C_Px09FuEvcRaeZLfY8TB_INzIJ5Dnxjw3xj2DUVHrWHkbgrA43AkJd0ACnfKWog-JgRn-N7HI5ep0f5UeZEO9HIC71Rufplh5m3IdeVSlghqs0FXksNKkHouEY7v9lYRp83dPyF",
  woman4: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiYy7Xv7GMCRkhduTDmySy31x9goCvwBA-4G1X18VuBjR2CMvCjiiwfELa8-MgpJD71tD6o_PeTrALuJVRyAsrZavB2_hCUpPDnNfIGCGceLS2R1dgwRwR_gJ-xy5KLAWSs_3shlgx1h_unoSpO06rOOruhkDoGENxczldDsQIHH52PTza7n3L17gc3jIG2M2Nlst_FUI7y3tyxSM3G1PSHBIf7V0fMc4a46gVEP-iJAMkkpKHzOcnpbyWqoFB1FGWTihJXkuin6XY",
  genericUser: "https://lh3.googleusercontent.com/aida-public/AB6AXuACp1rkqe9sZxnJyUbhySdjbxFrHD-P3OfwqfHOE-pASHYIe5pLS76eaFgXolXkEyGz3V-HVIa8uhTcPXsAyQ_bmjgmLOeAdx4rcYAnddVTZPbjt14jnPxYTwBw85meN9EnuKMrtEZ3uzYe4ahfTiHNGAJHGktypDXGKStcHEGH0xntA8tJyzfb9Lj1nNvxIKZqBKkmykURHGTtkUK9T7hu0mCr5HzSjI9PmXptndj9tyPvceVV2zXUFoSbMIUn5u3AQby-q4tUHb_p"
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CUST-9382",
    name: "AeroSpace Tech Corp",
    plan: "Pro Plan",
    mrr: 299,
    arr: 35880,
    healthScore: 24,
    churnRisk: 92,
    status: "Critical",
    segment: "Mid-Market",
    renewalDate: "2026-11-20",
    csm: "Sarah J.",
    healthBreakdown: { usage: 15, engagement: 20, support: 30, outcomes: 25 },
    riskReasons: [
      "Critically low platform utilization (-50% MoM)",
      "3 outstanding high-priority tickets",
      "CSAT feedback scored 2/10 on last onboarding call"
    ],
    timeline: [
      { id: "e1", date: "Jul 15, 2026", title: "Onboarding CSAT Feedback: 2/10", time: "11:20 AM", author: "Sarah J.", avatarUrl: AVATARS.woman1 },
      { id: "e2", date: "Jul 10, 2026", title: "Usage dropped below 20% critical threshold", time: "09:00 AM", author: "System Sensor", avatarUrl: AVATARS.genericUser }
    ]
  },
  {
    id: "CUST-4501",
    name: "CloudVibe Solutions",
    plan: "Enterprise",
    mrr: 499,
    arr: 59880,
    healthScore: 35,
    churnRisk: 88,
    status: "Critical",
    segment: "Enterprise",
    renewalDate: "2026-12-05",
    csm: "Sarah J.",
    healthBreakdown: { usage: 25, engagement: 30, support: 40, outcomes: 35 },
    riskReasons: [
      "Unresolved critical API failures reported",
      "Executive sponsor left the organization in June",
      "Total session duration down 45% over past 30 days"
    ],
    timeline: [
      { id: "e3", date: "Jun 28, 2026", title: "Sponsor Departure Alert flagged", time: "02:15 PM", author: "Sarah J.", avatarUrl: AVATARS.woman1 },
      { id: "e4", date: "Jun 22, 2026", title: "API Integration Ticket opened", time: "04:30 PM", author: "DevSupport Bot", avatarUrl: AVATARS.genericUser }
    ]
  },
  {
    id: "CUST-1127",
    name: "SwiftPay Logistics",
    plan: "Standard",
    mrr: 99,
    arr: 11880,
    healthScore: 42,
    churnRisk: 75,
    status: "At-Risk",
    segment: "SMB",
    renewalDate: "2026-10-12",
    csm: "Alex J.",
    healthBreakdown: { usage: 35, engagement: 42, support: 55, outcomes: 45 },
    riskReasons: [
      "Fewer logins per week (dropped from 8 to 2)",
      "Unresolved integration hurdles with external CRM",
      "Negative score on NPS survey"
    ],
    timeline: [
      { id: "e5", date: "Jul 18, 2026", title: "CRM Integration struggle reported", time: "01:05 PM", author: "Alex J.", avatarUrl: AVATARS.alex },
      { id: "e6", date: "Jul 05, 2026", title: "NPS Survey completed: Detractor (5)", time: "08:12 AM", author: "NPS Bot", avatarUrl: AVATARS.genericUser }
    ]
  },
  {
    id: "CUST-7630",
    name: "Nova Creative Agency",
    plan: "Pro Plan",
    mrr: 299,
    arr: 35880,
    healthScore: 48,
    churnRisk: 68,
    status: "At-Risk",
    segment: "Mid-Market",
    renewalDate: "2026-09-30",
    csm: "Sarah J.",
    healthBreakdown: { usage: 40, engagement: 45, support: 60, outcomes: 50 },
    riskReasons: [
      "Adoption is limited to single team workspace",
      "Stalled feature configuration in dashboard",
      "Failed payment attempts (resolved later but shows instability)"
    ],
    timeline: [
      { id: "e7", date: "Jun 30, 2026", title: "Billing payment failed (Auto-resolved on retry)", time: "08:00 AM", author: "BillingEngine", avatarUrl: AVATARS.genericUser },
      { id: "e8", date: "Jun 15, 2026", title: "Workspace training requested", time: "10:30 AM", author: "Sarah J.", avatarUrl: AVATARS.woman1 }
    ]
  },
  {
    id: "CUST-3215",
    name: "Apex Retailers",
    plan: "Enterprise",
    mrr: 499,
    arr: 59880,
    healthScore: 51,
    churnRisk: 61,
    status: "At-Risk",
    segment: "Enterprise",
    renewalDate: "2026-08-15",
    csm: "Sarah J.",
    healthBreakdown: { usage: 48, engagement: 50, support: 52, outcomes: 53 },
    riskReasons: [
      "Upcoming renewal on Aug 15 with zero license expansion",
      "CSM contact frequency is low over the last 90 days",
      "Core dashboard loading latency issues reported"
    ],
    timeline: [
      { id: "e9", date: "Jul 02, 2026", title: "Renewal conversation scheduled", time: "03:00 PM", author: "Sarah J.", avatarUrl: AVATARS.woman1 },
      { id: "e10", date: "Jun 20, 2026", title: "Latency complaints received from users", time: "11:45 AM", author: "DevSupport Bot", avatarUrl: AVATARS.genericUser }
    ]
  },
  {
    id: "CUST-8496",
    name: "ByteCraft Studio",
    plan: "Standard",
    mrr: 99,
    arr: 11880,
    healthScore: 58,
    churnRisk: 54,
    status: "At-Risk",
    segment: "SMB",
    renewalDate: "2027-01-10",
    csm: "Alex J.",
    healthBreakdown: { usage: 52, engagement: 55, support: 62, outcomes: 58 },
    riskReasons: [
      "User license utilization at 40%",
      "Competitor research patterns identified in support searches",
      "Low interactions with key automation playbooks"
    ],
    timeline: [
      { id: "e11", date: "Jul 11, 2026", title: "Competitor comparison search identified", time: "11:15 AM", author: "IntelBot", avatarUrl: AVATARS.genericUser },
      { id: "e12", date: "Jun 25, 2026", title: "Feature review meeting", time: "02:00 PM", author: "Alex J.", avatarUrl: AVATARS.alex }
    ]
  },
  {
    id: "CUST-6721",
    name: "Stellar MedTech",
    plan: "Pro Plan",
    mrr: 299,
    arr: 35880,
    healthScore: 60,
    churnRisk: 48,
    status: "At-Risk",
    segment: "Mid-Market",
    renewalDate: "2026-11-01",
    csm: "Alex J.",
    healthBreakdown: { usage: 55, engagement: 58, support: 65, outcomes: 60 },
    riskReasons: [
      "Customer contact has not responded to past two monthly check-ins",
      "Adoption of newly shipped features is extremely flat",
      "Slight decline in active weekly seats"
    ],
    timeline: [
      { id: "e13", date: "Jul 12, 2026", title: "No-show for monthly alignment session", time: "04:00 PM", author: "Alex J.", avatarUrl: AVATARS.alex },
      { id: "e14", date: "Jun 12, 2026", title: "Check-in rescheduled by customer", time: "10:00 AM", author: "Alex J.", avatarUrl: AVATARS.alex }
    ]
  },
  {
    id: "CUST-2943",
    name: "PixelLab Games",
    plan: "Standard",
    mrr: 99,
    arr: 11880,
    healthScore: 63,
    churnRisk: 42,
    status: "At-Risk",
    segment: "SMB",
    renewalDate: "2026-09-18",
    csm: "Alex J.",
    healthBreakdown: { usage: 58, engagement: 61, support: 67, outcomes: 65 },
    riskReasons: [
      "Usage pattern is heavily seasonal (peaks during game jams)",
      "Primary admin changed to a new engineer with no platform training",
      "Active team size decreased by 3 members"
    ],
    timeline: [
      { id: "e15", date: "Jun 22, 2026", title: "Admin Role hand-off detected", time: "09:30 AM", author: "Security Bot", avatarUrl: AVATARS.genericUser },
      { id: "e16", date: "Jun 18, 2026", title: "Workspace cleanup initiated", time: "01:15 PM", author: "Alex J.", avatarUrl: AVATARS.alex }
    ]
  },

  // Seeded Customer corresponding to the detailed Profile mockup screen '3668-QPYBK'
  {
    id: "3668-QPYBK",
    name: "Infrasec Global",
    plan: "Enterprise",
    mrr: 3750, // $45,000 ARR
    arr: 45000,
    healthScore: 42,
    churnRisk: 68,
    status: "At-Risk",
    segment: "Enterprise",
    renewalDate: "Oct 15, 2024",
    csm: "Sarah J.",
    healthBreakdown: { usage: 35, engagement: 48, support: 52, outcomes: 40 },
    riskReasons: [
      "Decreased login frequency in last 30 days",
      "Unresolved critical support tickets (2)",
      "Negative feedback in recent survey",
      "No feature adoption for 6 months"
    ],
    timeline: [
      { id: "p1", date: "Oct 01, 2024", title: "Support ticket #1023 closed", time: "7:35 AM", author: "Alex J.", avatarUrl: AVATARS.man1 },
      { id: "p2", date: "Sep 28, 2024", title: "Quarterly review scheduled", time: "7:35 AM", author: "Sarah J.", avatarUrl: AVATARS.woman3 },
      { id: "p3", date: "Sep 25, 2024", title: "Product feature feedback", time: "8:30 AM", author: "Support Analyst", avatarUrl: AVATARS.man2 },
      { id: "p4", date: "Sep 20, 2024", title: "Usage alert triggered", time: "7:25 PM", author: "Alert Sensor", avatarUrl: AVATARS.woman4 }
    ]
  },

  // Additional mock customers to hit the 298 active customer stat smoothly and show filter variety
  {
    id: "CUST-8021",
    name: "Zenith Marketing",
    plan: "Pro Plan",
    mrr: 299,
    arr: 35880,
    healthScore: 89,
    churnRisk: 8,
    status: "Healthy",
    segment: "Mid-Market",
    renewalDate: "2027-04-15",
    csm: "Alex J.",
    healthBreakdown: { usage: 90, engagement: 88, support: 92, outcomes: 86 },
    riskReasons: [],
    timeline: [
      { id: "h1", date: "Jul 18, 2026", title: "Quarterly expansion discussion", time: "11:00 AM", author: "Alex J.", avatarUrl: AVATARS.alex }
    ]
  },
  {
    id: "CUST-5510",
    name: "Delta Fintech",
    plan: "Enterprise",
    mrr: 1500,
    arr: 180000,
    healthScore: 92,
    churnRisk: 4,
    status: "Healthy",
    segment: "Enterprise",
    renewalDate: "2027-05-10",
    csm: "Sarah J.",
    healthBreakdown: { usage: 95, engagement: 91, support: 96, outcomes: 90 },
    riskReasons: [],
    timeline: [
      { id: "h2", date: "Jul 10, 2026", title: "NPS Survey feedback: Promoter (10)", time: "09:30 AM", author: "NPS Bot", avatarUrl: AVATARS.genericUser }
    ]
  },
  {
    id: "CUST-3319",
    name: "Echo Design Co",
    plan: "Standard",
    mrr: 99,
    arr: 11880,
    healthScore: 81,
    churnRisk: 15,
    status: "Healthy",
    segment: "SMB",
    renewalDate: "2027-02-14",
    csm: "Alex J.",
    healthBreakdown: { usage: 82, engagement: 79, support: 85, outcomes: 80 },
    riskReasons: [],
    timeline: []
  }
];

// Seeded retention playbook lists matching the mockups
export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: "play-1",
    customerId: "CUST-820394",
    customerName: "Acme CyberSec (C-820394)",
    plan: "Enterprise", // matches Premium/Enterprise styling
    mrr: 199,
    status: "At-Risk",
    title: "Offer annual discount",
    description: "engaged but price sensitive",
    type: "ai",
    riskLevel: "HIGH RISK",
    completed: false,
    actionText: "Send Offer"
  },
  {
    id: "play-2",
    customerId: "C-710455",
    customerName: "Global Logistics (C-710455)",
    plan: "Enterprise",
    mrr: 999,
    status: "Critical",
    title: "Retry payment & Offer pause",
    description: "usage down 60%",
    type: "retry",
    riskLevel: "HIGH RISK",
    completed: false,
    actionText: "Retry Payment"
  },
  {
    id: "play-3",
    customerId: "C-639210",
    customerName: "MicroCraft (C-639210)",
    plan: "Standard",
    mrr: 49,
    status: "At-Risk",
    title: "Send personalized win-back email sequence",
    description: "viewed competitors",
    type: "winback",
    riskLevel: "MEDIUM RISK",
    completed: false,
    actionText: "Send Sequence"
  },
  {
    id: "play-4",
    customerId: "C-541923",
    customerName: "Standard Corp (C-541923)",
    plan: "Standard",
    mrr: 99,
    status: "At-Risk",
    title: "Suggest a temporary pause",
    description: "project-based user",
    type: "pause",
    riskLevel: "MEDIUM RISK",
    completed: false,
    actionText: "Suggest Pause"
  }
];

// Seeded segment data matching the segment screens
export const INITIAL_SEGMENT_METRICS: SegmentMetrics[] = [
  {
    name: "SMB",
    customerCount: 8500,
    avgHealthScore: 82,
    churnRiskPercent: 12,
    mrrText: "$1.2M",
    healthBreakdown: { healthy: 60, atRisk: 30, critical: 10 }
  },
  {
    name: "Mid-Market",
    customerCount: 1800,
    avgHealthScore: 76,
    churnRiskPercent: 15,
    mrrText: "$4.5M",
    healthBreakdown: { healthy: 50, atRisk: 35, critical: 15 }
  },
  {
    name: "Enterprise",
    customerCount: 250,
    avgHealthScore: 68,
    churnRiskPercent: 20,
    mrrText: "$12.8M",
    healthBreakdown: { healthy: 40, atRisk: 40, critical: 20 }
  }
];
