import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  BarChart3, 
  Heart, 
  Headset, 
  CheckCircle, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  AlertOctagon, 
  ShieldAlert,
  Send
} from "lucide-react";
import { Customer, TimelineEvent } from "../types";
import { AVATARS } from "../data";
import AnimatedNumber from "./AnimatedNumber";

interface CustomerProfileViewProps {
  customer: Customer;
  onBack: () => void;
  onAddToast: (text: string, type: "success" | "error" | "info") => void;
}

export default function CustomerProfileView({
  customer,
  onBack,
  onAddToast,
}: CustomerProfileViewProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(customer.timeline);

  const getHealthColorClass = (score: number) => {
    if (score < 40) return "text-rose-400";
    if (score < 75) return "text-amber-500";
    return "text-emerald-400";
  };

  const getGaugeColorHex = (score: number) => {
    if (score < 40) return "#f43f5e"; // rose-500
    if (score < 75) return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
  };

  const handleActionClick = (actionName: string) => {
    // 1. Add toast feedback
    onAddToast(`Action executed: '${actionName}' initiated for ${customer.id}`, "success");

    // 2. Generate new timeline event dynamically
    const newEvent: TimelineEvent = {
      id: `live-ev-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      title: `Recommended action triggered: ${actionName}`,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      author: "Alex J.",
      avatarUrl: AVATARS.alex
    };

    setTimeline([newEvent, ...timeline]);
  };

  // Needle angle rotation calculation
  // Health score (0 to 100) maps to rotation (-90deg to 90deg)
  const needleRotation = ((customer.healthScore / 100) * 180) - 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col lg:flex-row gap-6 min-h-screen pb-12"
    >
      {/* Main Left Content Panel */}
      <div className="flex-1 space-y-6">
        
        {/* Back Link */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Customer List</span>
        </button>

        {/* Customer Header Info Card */}
        <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                {customer.segment} Cohort
              </span>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 tracking-tight mt-2">
                '{customer.id}'
              </h1>
              <p className="text-sm font-semibold text-on-surface-variant/70 mt-0.5">
                {customer.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-xs text-on-surface-variant font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Status: <strong className="text-emerald-400 font-semibold">Active</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary/70" />
                <span>CSM: <strong className="text-on-surface font-semibold">{customer.csm}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400/70" />
                <span>ARR: <strong className="text-emerald-400 font-semibold"><AnimatedNumber value={customer.arr} prefix="$" /></strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#f59e0b]/70" />
                <span>Renewal Date: <strong className="text-on-surface font-semibold">{customer.renewalDate}</strong></span>
              </div>
            </div>
          </div>

          {/* SVG Health Dial Gauge */}
          <div className="flex flex-col items-center shrink-0 self-center">
            <div className="relative w-44 h-24 overflow-hidden flex items-end justify-center select-none">
              
              {/* Outer Gauge Track Arch (White line outline visual representation) */}
              <div className="w-40 h-40 rounded-full border-[14px] border-surface-container absolute top-0 box-border"></div>
              
              {/* Colored Health level track arch */}
              <div 
                className="w-40 h-40 rounded-full border-[14px] border-transparent absolute top-0 box-border origin-center transition-transform duration-500 ease-out"
                style={{
                  borderTopColor: getGaugeColorHex(customer.healthScore),
                  borderLeftColor: getGaugeColorHex(customer.healthScore),
                  transform: `rotate(${((customer.healthScore / 100) * 180) - 135}deg)`
                }}
              ></div>

              {/* Central Indicator Dial Needle */}
              <motion.div 
                initial={{ rotate: -90 }}
                animate={{ rotate: needleRotation }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-1.5 h-18 bg-on-surface-variant/80 rounded-full absolute bottom-0 origin-bottom shadow-lg"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              />

              {/* Base Needle Dot */}
              <div className="w-4 h-4 rounded-full bg-on-surface absolute bottom-0 translate-y-1.5 shadow"></div>

              {/* Labels */}
              <div className="absolute bottom-0 w-full flex justify-between px-3 text-[10px] font-bold text-on-surface-variant/40 mb-0.5">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <div className="mt-4 text-xs font-semibold text-on-surface-variant">
              Health Score: <span className={`${getHealthColorClass(customer.healthScore)} font-extrabold`}><AnimatedNumber value={customer.healthScore} /> ({customer.status})</span>
            </div>
          </div>
        </div>

        {/* Two Column Grid: Breakdown & Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Health Breakdown progress bars */}
          <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md flex flex-col gap-5 justify-between">
            <h2 className="text-base font-bold text-on-surface tracking-tight flex items-center gap-2 border-b border-border-subtle/50 pb-2">
              <BarChart3 className="w-4.5 h-4.5 text-primary" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Health Breakdown</span>
            </h2>

            <div className="space-y-4">
              {/* Usage */}
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span className="font-semibold text-on-surface">Usage index</span>
                  <span className={`font-bold ${getHealthColorClass(customer.healthBreakdown.usage)}`}><AnimatedNumber value={customer.healthBreakdown.usage} />%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${customer.healthBreakdown.usage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-container to-secondary"
                  />
                </div>
              </div>

              {/* Engagement */}
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span className="font-semibold text-on-surface">Engagement index</span>
                  <span className={`font-bold ${getHealthColorClass(customer.healthBreakdown.engagement)}`}><AnimatedNumber value={customer.healthBreakdown.engagement} />%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${customer.healthBreakdown.engagement}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-primary-container to-secondary"
                  />
                </div>
              </div>

              {/* Support */}
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span className="font-semibold text-on-surface">Support rating</span>
                  <span className={`font-bold ${getHealthColorClass(customer.healthBreakdown.support)}`}><AnimatedNumber value={customer.healthBreakdown.support} />%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${customer.healthBreakdown.support}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary-container to-secondary"
                  />
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span className="font-semibold text-on-surface">Expected outcomes</span>
                  <span className={`font-bold ${getHealthColorClass(customer.healthBreakdown.outcomes)}`}><AnimatedNumber value={customer.healthBreakdown.outcomes} />%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${customer.healthBreakdown.outcomes}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary-container to-secondary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Why at Risk Card */}
          <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface tracking-tight flex items-center gap-2 border-b border-border-subtle/50 pb-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Why this account is at risk</span>
              </h2>
              
              <div className="flex items-baseline gap-2 mt-4 select-none">
                <span className="text-4xl font-extrabold text-rose-500 tracking-tight">
                  <AnimatedNumber value={customer.churnRisk} />%
                </span>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-widest bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/20">
                  Risk Intensity
                </span>
              </div>

              {customer.riskReasons.length === 0 ? (
                <p className="text-xs text-emerald-400 font-semibold mt-4">
                  ✓ No risk flags active for this client cohort.
                </p>
              ) : (
                <ul className="flex flex-col gap-3 text-xs text-on-surface-variant mt-4 font-medium pl-1">
                  {customer.riskReasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-rose-400 mt-0.5 shrink-0 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        {/* Recommended Actions Panel */}
        <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md flex flex-col gap-5 items-center justify-between text-center md:text-left md:flex-row">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Retention Recommendations</h3>
            <p className="text-xs text-on-surface-variant/70 mt-1">Recommended mitigation maneuvers powered by historical playbook success metrics</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => handleActionClick("Offer subscription pause option")}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-container to-secondary hover:brightness-110 text-white font-semibold text-xs rounded-lg shadow cursor-pointer transition-all active:scale-95 text-center"
            >
              Offer pause
            </button>
            <button
              onClick={() => handleActionClick("Schedule 1-on-1 CSM check-in meeting")}
              className="px-5 py-2.5 bg-transparent border border-[#958da1]/40 text-on-surface hover:bg-[#2B2933] font-semibold text-xs rounded-lg transition-all active:scale-95 text-center cursor-pointer"
            >
              Schedule check-in
            </button>
            <button
              onClick={() => handleActionClick("Initiate review of contract terms")}
              className="px-5 py-2.5 bg-transparent border border-[#958da1]/40 text-on-surface hover:bg-[#2B2933] font-semibold text-xs rounded-lg transition-all active:scale-95 text-center cursor-pointer"
            >
              Review contract terms
            </button>
          </div>
        </div>

      </div>

      {/* Right Sidebar Timeline Panel */}
      <aside className="w-full lg:w-[320px] border border-border-subtle bg-sidebar-bg rounded-xl lg:rounded-none lg:border-l lg:border-r-0 lg:border-t-0 lg:border-b-0 flex flex-col p-6 overflow-y-auto">
        <h2 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Activity Timeline</span>
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
        </h2>

        <div className="relative flex flex-col gap-6 pl-2">
          {/* Vertical Timeline connecting rod */}
          <div className="absolute left-6 top-1.5 bottom-1.5 w-0.5 bg-[#2B2933]"></div>

          <AnimatePresence initial={false}>
            {timeline.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-start gap-4 text-xs font-medium"
              >
                {/* Profile Pic Ring */}
                <div className="w-8 h-8 rounded-full border-2 border-sidebar-bg bg-surface-container-highest overflow-hidden z-10 shrink-0 select-none">
                  <img 
                    className="w-full h-full object-cover" 
                    alt={event.author} 
                    src={event.avatarUrl}
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 flex flex-col gap-0.5 pt-0.5">
                  <span className="text-[10px] text-on-surface-variant/40 font-mono">
                    {event.date}
                  </span>
                  <p className="text-on-surface text-xs font-bold leading-tight">
                    {event.title}
                  </p>
                  <span className="text-[10px] text-on-surface-variant/50">
                    {event.time} · {event.author}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

    </motion.div>
  );
}
