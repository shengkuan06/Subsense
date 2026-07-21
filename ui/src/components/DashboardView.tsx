import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, HelpCircle } from "lucide-react";
import { Customer } from "../types";
import AnimatedNumber from "./AnimatedNumber";

interface DashboardViewProps {
  customers: Customer[];
  onTabChange: (tab: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  mrrAtRisk: number;
}

export default function DashboardView({
  customers,
  onTabChange,
  onCustomerSelect,
  mrrAtRisk,
}: DashboardViewProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Stats dynamically computed or precalculated
  const activeCount = 298;
  const totalMRR = 18970;
  const avgHealth = 80.7;

  // Health distribution data
  const healthBars = [
    { label: "Healthy", range: "(85+)", value: 298, pctText: "85%", colorClass: "bg-emerald-500", widthPct: 85 },
    { label: "At Risk", range: "(60-84)", value: 241, pctText: "84%", colorClass: "bg-amber-500", widthPct: 54 },
    { label: "Critical", range: "(<60)", value: "16%", pctText: "16%", colorClass: "bg-red-400", widthPct: 16 }
  ];

  // Churn risk trend data points (Past 30 days metrics)
  const trendData = [
    { label: "0", value: 5, cx: 0, cy: 95 },
    { label: "6-16", value: 12, cx: 20, cy: 80 },
    { label: "16-18", value: 34, cx: 45, cy: 65 },
    { label: "21-25", value: 58, cx: 72, cy: 45 },
    { label: "30-30", value: 91, cx: 100, cy: 10 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Customers */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-card-bg rounded-xl p-6 flex flex-col justify-between h-[160px] border border-border-subtle shadow-md hover:border-primary/50 transition-colors group cursor-default"
        >
          <h3 className="text-sm font-medium text-on-surface-variant flex justify-between items-center">
            Active customers
            <HelpCircle className="w-4 h-4 text-on-surface-variant/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-sans text-teal-400">
                <AnimatedNumber value={activeCount} />
              </span>
              <span className="text-emerald-400 flex items-center text-xs font-semibold">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              ↑ 4% <span className="text-on-surface-variant/60 font-normal">this month</span>
            </p>
          </div>
        </motion.div>

        {/* Total MRR */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-card-bg rounded-xl p-6 flex flex-col justify-between h-[160px] border border-border-subtle shadow-md hover:border-primary/50 transition-colors group cursor-default"
        >
          <h3 className="text-sm font-medium text-on-surface-variant flex justify-between items-center">
            Total MRR
            <HelpCircle className="w-4 h-4 text-on-surface-variant/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-sans text-emerald-400">
                <AnimatedNumber value={totalMRR} prefix="$" />
              </span>
              <span className="text-emerald-400 flex items-center text-xs font-semibold">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              ↑ 2.5% <span className="text-on-surface-variant/60 font-normal">this month</span>
            </p>
          </div>
        </motion.div>

        {/* MRR at risk */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-card-bg rounded-xl p-6 flex flex-col justify-between h-[160px] border border-border-subtle shadow-md hover:border-amber-500/50 transition-all group relative overflow-hidden cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-wide">
              MRR at risk
            </h3>
          </div>
          <div className="z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-sans text-amber-400">
                <AnimatedNumber value={mrrAtRisk} prefix="$" />
              </span>
              <span className="text-amber-500 flex items-center text-xs font-semibold">
                <ArrowDownRight className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-500 mt-1 flex items-center gap-1">
              ↓ 1.2% <span className="text-on-surface-variant/60 font-normal">last week</span>
            </p>
          </div>
        </motion.div>

        {/* Avg Health Score Gauge */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-card-bg rounded-xl p-6 flex flex-col items-center justify-center h-[160px] border border-border-subtle shadow-md hover:border-primary/50 transition-colors relative cursor-default"
        >
          <h3 className="text-sm font-medium text-on-surface-variant absolute top-6 left-6">
            Avg health score
          </h3>
          <div className="relative w-24 h-24 mt-4">
            {/* Circular Progress Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="42" stroke="#26232F" strokeWidth="8"></circle>
              <motion.circle 
                initial={{ strokeDashoffset: 263 }}
                animate={{ strokeDashoffset: 52.6 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                cx="50" 
                cy="50" 
                fill="none" 
                r="42" 
                stroke="url(#purpleGradient)" 
                strokeDasharray="263.8" 
                strokeWidth="8"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED"></stop>
                  <stop offset="100%" stopColor="#A855F7"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold tracking-tight leading-none ${
                avgHealth >= 85 ? "text-emerald-400" :
                avgHealth >= 60 ? "text-amber-400" : "text-rose-400"
              }`}>
                <AnimatedNumber value={avgHealth} />
              </span>
              <span className="text-[9px] font-bold text-emerald-400 mt-1 uppercase tracking-widest">Excellent</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
        
        {/* Customer Health Distribution */}
        <div className="lg:col-span-7 bg-card-bg rounded-xl p-6 border border-border-subtle shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-1">Customer health distribution</h2>
            <p className="text-xs text-on-surface-variant/60">Breakdown of active users based on their engagement indices</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6 my-6">
            {healthBars.map((bar, i) => (
              <div key={bar.label} className="flex items-center gap-4 group">
                <div className="w-20 text-right shrink-0">
                  <span className={`text-xs font-semibold block leading-tight ${
                    bar.label === "Healthy" ? "text-emerald-400" :
                    bar.label === "At Risk" ? "text-amber-400" : "text-rose-400"
                  }`}>{bar.label}</span>
                  <span className="text-[10px] text-on-surface-variant/50">{bar.range}</span>
                </div>
                
                <div className="flex-1 h-10 bg-surface-container rounded relative flex items-center overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${bar.widthPct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    className={`absolute top-0 left-0 h-full ${bar.colorClass} opacity-80 group-hover:opacity-100 transition-all`}
                  />
                  <div className="relative w-full flex justify-between px-4 z-10 select-none">
                    <span className="text-xs font-bold text-bg-brand drop-shadow-sm">{bar.value}</span>
                    <span className="text-xs font-bold text-bg-brand drop-shadow-sm">{bar.pctText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div>
            <div className="flex ml-24 pl-1 pt-2 border-t border-border-subtle text-on-surface-variant/40 font-mono text-[9px] justify-between">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>250</span>
              <span>300</span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-xs text-on-surface-variant/80 font-medium">Healthy (85+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span className="text-xs text-on-surface-variant/80 font-medium">At Risk (60-84)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-400"></span>
                <span className="text-xs text-on-surface-variant/80 font-medium">Critical (&lt;60)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Churn Risk Trend */}
        <div className="lg:col-span-5 bg-card-bg rounded-xl p-6 border border-border-subtle shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Churn risk trend</h2>
              <p className="text-xs text-on-surface-variant/60">Risk migration velocity timeline</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium bg-surface-container px-3 py-1.5 rounded border border-border-subtle hover:text-on-surface transition-colors select-none">
              Last 30 days
            </button>
          </div>

          <div className="flex-1 relative mt-8 min-h-[220px]">
            {/* Y-Axis */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-on-surface-variant/40 font-mono text-[9px] w-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Horizontal Grid Lines */}
            <div className="absolute left-10 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((gridLine) => (
                <div key={gridLine} className="w-full border-b border-border-subtle/40 h-0" />
              ))}
            </div>

            {/* Interactive Area Chart SVG */}
            <div className="absolute left-10 right-0 top-2 bottom-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45"></stop>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="opacity-80" 
                  d="M0,95 C20,88 30,73 50,68 C60,63 70,38 80,43 C90,38 95,18 100,8 L100,100 L0,100 Z" 
                  fill="url(#areaGradient)"
                />

                {/* Stroke Line */}
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M0,95 C20,88 30,73 50,68 C60,63 70,38 80,43 C90,38 95,18 100,8" 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* SVG Point Markers with Hover State */}
                {trendData.map((pt, index) => (
                  <g key={pt.label}>
                    <circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r={hoveredPoint === index ? 5 : 3.5} 
                      fill={hoveredPoint === index ? "#7C3AED" : "#eaddff"} 
                      stroke="#16141F"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(index)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Float Card Dynamic Tooltip on Hover */}
              {hoveredPoint !== null && (
                <div 
                  className="absolute bg-card-bg border border-primary/30 p-2 rounded shadow-xl pointer-events-none text-[11px] z-20 flex flex-col gap-0.5"
                  style={{
                    left: `${trendData[hoveredPoint].cx}%`,
                    top: `${trendData[hoveredPoint].cy - 25}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <p className="font-bold text-on-surface">Time: {trendData[hoveredPoint].label}</p>
                  <p className="font-medium text-primary">Risk Index: {trendData[hoveredPoint].value}%</p>
                </div>
              )}
            </div>

            {/* X-Axis */}
            <div className="absolute left-10 right-0 bottom-0 flex justify-between text-on-surface-variant/40 font-mono text-[9px] pt-2">
              <span>0 (Launch)</span>
              <span>6-16 Days</span>
              <span>16-18 Days</span>
              <span>21-25 Days</span>
              <span>30-30 Days</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-2 mt-4 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] self-center animate-pulse"></span>
            <span className="text-xs text-on-surface-variant/80 font-medium">Churn velocity index</span>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
