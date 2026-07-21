import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Filter, SlidersHorizontal, UserCheck, Calendar, AlertCircle } from "lucide-react";
import { Customer } from "../types";
import AnimatedNumber from "./AnimatedNumber";

interface CustomersViewProps {
  customers: Customer[];
  searchQuery: string;
  onCustomerSelect: (customer: Customer) => void;
}

type SortField = "id" | "name" | "mrr" | "healthScore" | "churnRisk";
type SortOrder = "asc" | "desc";

export default function CustomersView({
  customers,
  searchQuery,
  onCustomerSelect,
}: CustomersViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("healthScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Apply filters
  const processedCustomers = useMemo(() => {
    let result = [...customers];

    if (selectedPlan) {
      result = result.filter(c => c.plan === selectedPlan);
    }
    if (selectedSegment) {
      result = result.filter(c => c.segment === selectedSegment);
    }
    if (selectedStatus) {
      result = result.filter(c => c.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c => c.id.toLowerCase().includes(q) ||
             c.name.toLowerCase().includes(q) ||
             c.csm.toLowerCase().includes(q) ||
             c.plan.toLowerCase().includes(q)
      );
    }

    // Sort sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [customers, selectedPlan, selectedSegment, selectedStatus, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleClearFilters = () => {
    setSelectedPlan("");
    setSelectedSegment("");
    setSelectedStatus("");
    setSortField("healthScore");
    setSortOrder("desc");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2 tracking-tight">Customer Database</h2>
        <p className="text-sm text-on-surface-variant flex items-center gap-1.5 flex-wrap">
          <span>Complete directory of</span>
          <span className="font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
            <AnimatedNumber value={processedCustomers.length} />
          </span>
          <span>matching account profiles and health statistics</span>
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="appearance-none bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-container/30 select-none"
          >
            <option value="">Plan: All</option>
            <option value="Standard">Standard</option>
            <option value="Pro Plan">Pro Plan</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="appearance-none bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-container/30 select-none"
          >
            <option value="">Segment: All</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="SMB">SMB</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-container/30 select-none"
          >
            <option value="">Health Level: All</option>
            <option value="Healthy">Healthy</option>
            <option value="At-Risk">At-Risk</option>
            <option value="Critical">Critical</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" />
        </div>

        {(selectedPlan || selectedSegment || selectedStatus || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-primary hover:text-primary-fixed hover:underline transition-all font-semibold ml-2 select-none"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Directory Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedCustomers.length === 0 ? (
          <div className="col-span-full bg-card-bg border border-border-subtle rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-on-surface-variant/40" />
            <p className="font-bold text-on-surface">No customers found</p>
            <p className="text-xs text-on-surface-variant/60">Try adjusting your active search query or filter sets.</p>
          </div>
        ) : (
          processedCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              onClick={() => onCustomerSelect(customer)}
              whileHover={{ scale: 1.01, borderColor: "rgba(124,58,237,0.3)" }}
              className="bg-card-bg border border-border-subtle rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-primary">{customer.id}</span>
                  <h3 className="text-sm font-bold text-on-surface mt-0.5 line-clamp-1">{customer.name}</h3>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container/30 border border-border-subtle px-2 py-0.5 rounded mt-1.5 inline-block">
                    {customer.segment} · {customer.plan}
                  </span>
                </div>

                <span className={`
                  text-[10px] font-bold px-2 py-1 rounded-full border
                  ${customer.status === "Healthy" 
                    ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                    : customer.status === "At-Risk"
                      ? "bg-amber-950/20 border-amber-500/20 text-amber-400"
                      : "bg-rose-950/20 border-rose-500/20 text-rose-400"
                  }
                `}>
                  {customer.status}
                </span>
              </div>

              {/* Health Score and Churn Risk Indicators */}
              <div className="grid grid-cols-2 gap-4 border-y border-border-subtle/50 py-3 text-xs select-none">
                <div>
                  <span className="text-on-surface-variant/60 text-[10px] block font-semibold uppercase">Health Score</span>
                  <span className={`text-sm font-extrabold mt-0.5 block ${customer.status === "Healthy" ? "text-emerald-400" : customer.status === "At-Risk" ? "text-amber-400" : "text-rose-400"}`}>
                    {customer.healthScore} <span className="text-[10px] font-normal">/ 100</span>
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant/60 text-[10px] block font-semibold uppercase">Churn Risk %</span>
                  <span className={`text-sm font-extrabold mt-0.5 block ${
                    customer.status === "Healthy" ? "text-emerald-400" :
                    customer.status === "At-Risk" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {customer.churnRisk}%
                  </span>
                </div>
              </div>

              {/* CRM Lead and Renewal Dates */}
              <div className="flex justify-between text-[11px] text-on-surface-variant/80">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary/70" />
                  <span>CSM: {customer.csm}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#f59e0b]/70" />
                  <span>Renewal: {customer.renewalDate}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
