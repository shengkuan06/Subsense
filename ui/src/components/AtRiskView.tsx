import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowDown, HelpCircle, RefreshCw, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Customer, CustomerStatus, CustomerSegment } from "../types";
import AnimatedNumber from "./AnimatedNumber";

interface AtRiskViewProps {
  customers: Customer[];
  searchQuery: string;
  onCustomerSelect: (customer: Customer) => void;
}

type SortField = "id" | "mrr" | "healthScore" | "churnRisk";
type SortOrder = "asc" | "desc";

export default function AtRiskView({
  customers,
  searchQuery,
  onCustomerSelect,
}: AtRiskViewProps) {
  // Filters state
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("churnRisk");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filtering the list of only critical or at-risk customers by default as per the mockup
  const baseAtRiskCustomers = useMemo(() => {
    return customers.filter(c => c.status === "Critical" || c.status === "At-Risk");
  }, [customers]);

  // Apply search query & custom drop-down filters
  const processedCustomers = useMemo(() => {
    let result = [...baseAtRiskCustomers];

    // Status filter
    if (selectedStatus) {
      result = result.filter(c => c.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Segment filter
    if (selectedSegment) {
      result = result.filter(c => c.segment.toLowerCase() === selectedSegment.toLowerCase());
    }

    // Search query filter (matches customer ID, name, CSM, or plan)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c => c.id.toLowerCase().includes(q) ||
             c.name.toLowerCase().includes(q) ||
             c.csm.toLowerCase().includes(q) ||
             c.plan.toLowerCase().includes(q)
      );
    }

    // Sort sorting logic
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle custom string logic if needed
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [baseAtRiskCustomers, selectedStatus, selectedSegment, searchQuery, sortField, sortOrder]);

  const totalMRRAtRisk = useMemo(() => {
    return processedCustomers.reduce((acc, c) => acc + c.mrr, 0);
  }, [processedCustomers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleClearFilters = () => {
    setSelectedStatus("");
    setSelectedSegment("");
    setSortField("churnRisk");
    setSortOrder("desc");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full space-y-6"
    >
      {/* Page Header */}
      <div className="shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2 tracking-tight">At-risk accounts</h2>
          <p className="text-sm text-on-surface-variant">
            <AnimatedNumber value={processedCustomers.length} /> active customers · <span className="text-rose-400 font-semibold"><AnimatedNumber value={totalMRRAtRisk} prefix="$" /> MRR at risk</span>
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="relative group">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-container/30 select-none"
          >
            <option value="">Risk band: All</option>
            <option value="critical">Critical</option>
            <option value="at-risk">At-Risk</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" />
        </div>

        <div className="relative group">
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="appearance-none bg-[#0A0A0F] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-container/30 select-none"
          >
            <option value="">Segment: All</option>
            <option value="enterprise">Enterprise</option>
            <option value="mid-market">Mid-Market</option>
            <option value="smb">SMB</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" />
        </div>

        {(selectedStatus || selectedSegment || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-primary hover:text-primary-fixed hover:underline transition-all flex items-center gap-1 cursor-pointer font-semibold ml-2 select-none"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Data Table Card */}
      <div className="bg-card-bg border border-border-subtle rounded-xl flex-1 flex flex-col overflow-hidden shadow-lg">
        <div className="overflow-auto flex-1">
          {processedCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-4">
              <AlertCircle className="w-12 h-12 text-on-surface-variant/40 animate-bounce" />
              <div>
                <p className="text-base font-bold text-on-surface">No accounts match the current filters</p>
                <p className="text-xs text-on-surface-variant/60 max-w-xs mt-1">Try relaxing your search terms or risk state dropdown selections.</p>
              </div>
              <button onClick={handleClearFilters} className="bg-surface-container px-4 py-2 border border-border-subtle text-xs rounded hover:text-primary font-bold transition-all select-none">
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-[#16141F] z-10 border-b border-border-subtle select-none">
                <tr className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70">
                  <th 
                    onClick={() => handleSort("id")}
                    className="py-4 px-6 cursor-pointer hover:text-on-surface transition-colors"
                  >
                    Customer ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-4 px-6">Plan</th>
                  <th 
                    onClick={() => handleSort("mrr")}
                    className="py-4 px-6 cursor-pointer hover:text-on-surface transition-colors"
                  >
                    MRR {sortField === "mrr" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    onClick={() => handleSort("healthScore")}
                    className="py-4 px-6 cursor-pointer hover:text-on-surface transition-colors"
                  >
                    Health score {sortField === "healthScore" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    onClick={() => handleSort("churnRisk")}
                    className="py-4 px-6 cursor-pointer hover:text-on-surface transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Churn risk % {sortField === "churnRisk" && (sortOrder === "asc" ? "↑" : "↓")}
                      <HelpCircle className="w-3.5 h-3.5 text-on-surface-variant/40" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              
              <tbody className="text-xs divide-y divide-border-subtle font-medium">
                {processedCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => onCustomerSelect(customer)}
                    className="hover:bg-surface-container/30 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-on-surface font-semibold group-hover:text-primary transition-colors">
                      {customer.id}
                      <span className="block text-[10px] text-on-surface-variant/60 font-normal mt-0.5">
                        {customer.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {customer.plan}
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-semibold">
                      ${customer.mrr.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${customer.status === "Critical" ? "text-rose-400" : "text-amber-400"}`}>
                        {customer.healthScore}
                      </span>{" "}
                      <span className={`text-[10px] font-medium opacity-60 ${customer.status === "Critical" ? "text-rose-400" : "text-amber-400"}`}>
                        ({customer.status})
                      </span>
                    </td>
                    <td className={`py-4 px-6 font-bold ${customer.status === "Critical" ? "text-rose-400" : "text-amber-400"}`}>
                      {customer.churnRisk}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`
                        inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold select-none
                        ${customer.status === "Critical" 
                          ? "bg-rose-950/20 border border-rose-500/20 text-rose-400" 
                          : "bg-amber-950/20 border border-amber-500/20 text-amber-400"
                        }
                      `}>
                        {customer.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
