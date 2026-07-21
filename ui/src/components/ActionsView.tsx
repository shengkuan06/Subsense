import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldAlert, Sparkles, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Playbook, Customer } from "../types";

interface ActionsViewProps {
  playbooks: Playbook[];
  onExecutePlaybook: (playbookId: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  customers: Customer[];
}

export default function ActionsView({
  playbooks,
  onExecutePlaybook,
  onCustomerSelect,
  customers,
}: ActionsViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "All Playbooks", icon: Zap },
    { id: "ai", label: "AI Guided", icon: Sparkles },
    { id: "pause", label: "Pause offers", icon: Zap },
    { id: "winback", label: "Win-back", icon: Zap },
    { id: "retry", label: "Payment retry", icon: Zap },
  ];

  const filteredPlaybooks = playbooks.filter((p) => {
    if (activeFilter === "all") return true;
    return p.type === activeFilter;
  });

  const handleViewProfileClick = (customerId: string) => {
    // Find customer in database and select
    const customer = customers.find(c => c.id === customerId || customerId.includes(c.id));
    if (customer) {
      onCustomerSelect(customer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Title & Info */}
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2 tracking-tight">Retention Playbooks & Actions</h2>
        <p className="text-sm text-on-surface-variant">
          Recommended actions for at-risk accounts based on recent behavioral sensors
        </p>
      </div>

      {/* Category Pills Filters */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer border
                ${isSelected
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#6f00be] text-white border-transparent shadow-md scale-[1.01]"
                  : "bg-[#16141F] text-on-surface-variant hover:text-on-surface border-border-subtle"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlaybooks.length === 0 ? (
            <div className="col-span-full bg-card-bg border border-border-subtle rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-10 h-10 text-on-surface-variant/40" />
              <p className="font-bold text-on-surface">No playbooks in this category</p>
              <p className="text-xs text-on-surface-variant/60">Try another pill filter category from the selection bar.</p>
            </div>
          ) : (
            filteredPlaybooks.map((playbook) => (
              <motion.div
                layout
                key={playbook.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`
                  bg-card-bg border rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden
                  ${playbook.completed ? "border-emerald-500/30" : "border-border-subtle"}
                `}
              >
                {/* Visual completion accent bar */}
                {playbook.completed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                )}

                {/* Card Header Info */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70">
                        {playbook.customerName}
                      </p>
                      <p className="text-xs text-on-surface-variant/50 mt-1">
                        {playbook.plan} · <span className="text-emerald-400 font-bold">${playbook.mrr}</span>/mo MRR
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 select-none">
                      {playbook.type === "ai" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <Sparkles className="w-3.5 h-3.5" /> AI SUGGESTED
                        </span>
                      )}
                      <span className={`
                        text-[9px] font-bold px-2 py-0.5 rounded border
                        ${playbook.riskLevel === "HIGH RISK"
                          ? "bg-rose-950/20 border-rose-500/20 text-rose-400"
                          : "bg-amber-950/20 border-amber-500/20 text-amber-400"
                        }
                      `}>
                        {playbook.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Playbook Description */}
                  <h3 className="text-sm font-semibold text-on-surface mt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-primary">{playbook.title}</span> 
                    <span className="text-xs font-normal text-on-surface-variant/60">— {playbook.description}</span>
                  </h3>
                </div>

                {/* Footer Interactive Actions */}
                <div className="mt-8 pt-4 border-t border-border-subtle/50 flex justify-end gap-3">
                  {playbook.completed ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs select-none py-2 px-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 animate-fade-in w-full justify-center">
                      <Check className="w-4 h-4" />
                      <span>Playbook executed successfully</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleViewProfileClick(playbook.customerId)}
                        className="px-4 py-2 bg-[#1C1A24] hover:bg-[#2B2933] text-on-surface hover:text-white border border-border-subtle rounded-lg text-xs font-semibold transition-all select-none cursor-pointer"
                      >
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => onExecutePlaybook(playbook.id)}
                        className="px-5 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6f00be] hover:brightness-110 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer select-none"
                      >
                        <span>{playbook.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
