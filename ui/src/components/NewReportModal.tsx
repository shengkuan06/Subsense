import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, Sparkles, Send, Check } from "lucide-react";
import { Customer, CustomerPlan, CustomerSegment, CustomerStatus, HealthBreakdown, TimelineEvent } from "../types";
import { AVATARS } from "../data";

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCustomer: Customer) => void;
}

export default function NewReportModal({
  isOpen,
  onClose,
  onSubmit,
}: NewReportModalProps) {
  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<CustomerPlan>("Pro Plan");
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment>("Mid-Market");
  const [mrr, setMrr] = useState(299);
  const [csm, setCsm] = useState("Sarah J.");
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  // Preconfigured risk options
  const riskOptions = [
    { id: "flag-1", text: "Decreased user activity over 30 days (-40% login frequency)" },
    { id: "flag-2", text: "Unresolved high-priority support tickets (2+)" },
    { id: "flag-3", text: "Executive/Sponsor departure from client organization" },
    { id: "flag-4", text: "Negative survey response or low NPS Detractor rating" },
    { id: "flag-5", text: "Zero utilization of newly shipped platform features" }
  ];

  const handleFlagToggle = (flagText: string) => {
    if (selectedFlags.includes(flagText)) {
      setSelectedFlags(selectedFlags.filter(f => f !== flagText));
    } else {
      setSelectedFlags([...selectedFlags, flagText]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) return;

    // 1. Calculate health score and churn risk dynamically based on selected flags
    // More flags = worse health and higher risk
    const flagCount = selectedFlags.length;
    let healthScore = 88; // Default good score
    let churnRisk = 12;   // Default good risk
    let status: CustomerStatus = "Healthy";

    if (flagCount > 0) {
      healthScore = Math.max(15, 88 - (flagCount * 18));
      churnRisk = Math.min(95, 12 + (flagCount * 20));
      status = healthScore < 40 ? "Critical" : "At-Risk";
    }

    // 2. Generate random customer ID
    const randomId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create default health breakdown
    const healthBreakdown: HealthBreakdown = {
      usage: Math.max(10, Math.floor(healthScore * 0.9)),
      engagement: Math.max(10, Math.floor(healthScore * 1.1)),
      support: Math.max(15, Math.floor(healthScore * 1.2)),
      outcomes: Math.max(10, Math.floor(healthScore * 1.0))
    };

    // 4. Set timeline events
    const initialTimeline: TimelineEvent[] = [
      {
        id: `ev-new-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        title: `Dynamic Risk Report Registered: ${status} State Identified`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        author: csm,
        avatarUrl: csm === "Sarah J." ? AVATARS.woman1 : AVATARS.alex
      }
    ];

    // Add selected flags as individual timeline alerts
    selectedFlags.forEach((flag, index) => {
      initialTimeline.push({
        id: `ev-flag-${index}-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        title: `Sensor Alert: ${flag}`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        author: "Sensor Bot",
        avatarUrl: AVATARS.genericUser
      });
    });

    const newCustomer: Customer = {
      id: randomId,
      name: companyName,
      plan: selectedPlan,
      mrr: Number(mrr),
      arr: Number(mrr) * 12,
      healthScore,
      churnRisk,
      status,
      segment: selectedSegment,
      renewalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days from now
      csm,
      healthBreakdown,
      riskReasons: selectedFlags,
      timeline: initialTimeline
    };

    onSubmit(newCustomer);
    
    // Reset state
    setCompanyName("");
    setSelectedFlags([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative bg-[#16141F] border border-[#26232F] rounded-2xl w-full max-w-xl shadow-2xl p-6 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#26232F] mb-4 select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface">Generate Retention Risk Report</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-on-surface-variant hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 pl-1">
              
              {/* Company / Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Client Organization / Corporate Account Name
                </label>
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  type="text"
                  placeholder="e.g. Cyberdyne Systems Ltd"
                  className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-2.5 px-3.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Grid 2x2 for parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Billing Plan select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Contract Tier / Plan
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as CustomerPlan)}
                    className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-2.5 px-3.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Pro Plan">Pro Plan</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Segment Tier select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Market Segment Tier
                  </label>
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value as CustomerSegment)}
                    className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-2.5 px-3.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="SMB">SMB</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* MRR select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Contract Monthly Value (MRR $)
                  </label>
                  <input
                    required
                    value={mrr}
                    onChange={(e) => setMrr(Math.max(1, Number(e.target.value)))}
                    type="number"
                    min="1"
                    className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 px-3.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                {/* CSM Assignment select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Account CSM Lead
                  </label>
                  <select
                    value={csm}
                    onChange={(e) => setCsm(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-2.5 px-3.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Sarah J.">Sarah J.</option>
                    <option value="Alex J.">Alex J.</option>
                  </select>
                </div>

              </div>

              {/* Sensor Flags section */}
              <div className="space-y-2 border-t border-[#26232F] pt-4 select-none">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Active Risk Sensor Flags (select any matching symptoms)
                </label>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {riskOptions.map((opt) => {
                    const isChecked = selectedFlags.includes(opt.text);
                    return (
                      <div 
                        key={opt.id}
                        onClick={() => handleFlagToggle(opt.text)}
                        className={`
                          flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all
                          ${isChecked 
                            ? "bg-rose-950/15 border-rose-500/30 text-on-surface" 
                            : "bg-[#0A0A0F]/50 border-border-subtle hover:bg-surface-container/30 text-on-surface-variant"
                          }
                        `}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked ? "bg-rose-500 border-rose-500 text-white" : "border-border-subtle bg-black"}`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="leading-tight">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form submit button */}
              <div className="pt-4 border-t border-[#26232F] flex justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-transparent border border-[#958da1]/30 hover:bg-surface-container/40 text-on-surface font-semibold text-xs rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-container to-secondary hover:brightness-110 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Execute Analysis</span>
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
