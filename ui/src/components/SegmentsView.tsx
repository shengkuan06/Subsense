import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, HelpCircle, ArrowUpRight, BarChart2 } from "lucide-react";
import { SegmentMetrics } from "../types";
import { INITIAL_SEGMENT_METRICS } from "../data";
import { fetchSegments } from "../api";
import AnimatedNumber from "./AnimatedNumber";

export default function SegmentsView() {
  const [segments, setSegments] = useState<SegmentMetrics[]>(INITIAL_SEGMENT_METRICS);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Load real segment rollups from the API; keep mock data if the backend is offline.
  useEffect(() => {
    fetchSegments()
      .then((list) => {
        if (list.length) setSegments(list);
      })
      .catch(() => {
        /* backend offline - keep mock data */
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2 tracking-tight">Customer Segment Analysis</h2>
        <p className="text-sm text-on-surface-variant">
          Analyze customer health indicators, risk distribution, and contract metrics across market tiers
        </p>
      </div>

      {/* Segment Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map((segment) => {
          // Calculate gauge offset based on avg health score (0-100 translates to rotation or SVG dashoffset)
          // 0 health score = max rotation/dashoffset, 100 = full colored arc
          return (
            <motion.div 
              key={segment.name}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[300px]"
            >
              {/* Card Header */}
              <div>
                <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors flex justify-between items-center">
                  <span>{segment.name} Segment</span>
                  <HelpCircle className="w-4 h-4 text-on-surface-variant/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-on-surface-variant/70">Customer Count:</span>
                  <span className="text-sm font-extrabold text-teal-400">
                    <AnimatedNumber value={segment.customerCount} />
                  </span>
                </div>
              </div>

              {/* ARC GAUGE GRAPH */}
              <div className="relative flex justify-center py-4 select-none">
                <div className="w-32 h-16 relative overflow-hidden">
                  {/* Gauge Arc Track */}
                  <div className="absolute inset-0 border-[8px] border-surface-container rounded-t-full"></div>
                  {/* Gauge Colored Arc (Dynamic width using clip path) */}
                  <div 
                    className="absolute inset-0 border-[8px] border-emerald-500 rounded-t-full border-b-transparent origin-bottom transition-transform duration-1000 ease-out" 
                    style={{
                      transform: `rotate(${((segment.avgHealthScore / 100) * 180) - 180}deg)`
                    }}
                  ></div>
                </div>

                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-on-surface-variant/50 tracking-wider">Avg Health</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-2xl font-bold tracking-tight ${
                      segment.avgHealthScore >= 85 ? "text-emerald-400" :
                      segment.avgHealthScore >= 60 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      <AnimatedNumber value={segment.avgHealthScore} />
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 font-bold" />
                  </div>
                </div>
              </div>

              {/* Grid Metrics and Breakdown Bar */}
              <div className="mt-4 pt-4 border-t border-border-subtle/50 space-y-4">
                <div className="flex justify-between text-xs text-on-surface-variant/80">
                  <span>
                    Churn Risk: <span className="text-rose-400 font-extrabold"><AnimatedNumber value={segment.churnRiskPercent} />%</span>
                  </span>
                  <span>
                    MRR: <span className="text-emerald-400 font-extrabold">{segment.mrrText}</span>
                  </span>
                </div>

                {/* Stacked Health Breakdown Bar */}
                <div className="space-y-1.5 select-none">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">
                    Health Breakdown
                  </span>
                  
                  {/* Multi-segmented full pill bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-surface-container">
                    <div className="bg-tertiary h-full" style={{ width: `${segment.healthBreakdown.healthy}%` }}></div>
                    <div className="bg-amber-500 h-full" style={{ width: `${segment.healthBreakdown.atRisk}%` }}></div>
                    <div className="bg-red-400 h-full" style={{ width: `${segment.healthBreakdown.critical}%` }}></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono font-bold px-0.5">
                    <span className="text-emerald-400"><AnimatedNumber value={segment.healthBreakdown.healthy} />%</span>
                    <span className="text-amber-400"><AnimatedNumber value={segment.healthBreakdown.atRisk} />%</span>
                    <span className="text-rose-400"><AnimatedNumber value={segment.healthBreakdown.critical} />%</span>
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Bottom Chart Card */}
      <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-md">
        <h3 className="text-base font-bold text-on-surface mb-8 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          <span>Average Health Score Comparison Across Segments</span>
        </h3>

        <div className="relative h-[220px] flex flex-col justify-between">
          
          {/* Vertical Background Grid lines */}
          <div className="absolute inset-0 flex justify-between px-16 select-none pointer-events-none">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="h-full border-l border-border-subtle/20"></div>
            ))}
          </div>

          {/* Horizontal Comparison Bars */}
          <div className="relative z-10 space-y-6 py-2">
            {segments.map((segment, index) => {
              return (
                <div 
                  key={segment.name} 
                  className="flex items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Segment Label */}
                  <span className="w-16 text-right pr-4 text-xs font-semibold text-on-surface-variant/80 select-none">
                    {segment.name}
                  </span>

                  {/* Horizontal Bar container */}
                  <div className="flex-1 relative">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${segment.avgHealthScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.15 }}
                      className="h-8 bg-gradient-to-r from-[#7c3aed] to-[#6f00be] rounded-r-md flex items-center justify-end px-3 shadow-[0_0_10px_rgba(124,58,237,0.15)] hover:brightness-110 group-hover:scale-[1.005] transition-all relative overflow-hidden"
                    >
                      <span className="font-bold text-xs text-white z-10 select-none">
                        <AnimatedNumber value={segment.avgHealthScore} />
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between pl-16 mt-4 font-mono text-[9px] text-on-surface-variant/40">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50</span>
            <span>60</span>
            <span>70</span>
            <span>80</span>
            <span>90</span>
            <span>100 (Max)</span>
          </div>

        </div>
      </div>

    </motion.div>
  );
}
