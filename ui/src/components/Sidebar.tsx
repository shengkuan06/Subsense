import React from "react";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Zap, 
  PieChart, 
  Plus,
  ChevronRight
} from "lucide-react";
import { AVATARS } from "../data";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewReport: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  currentTab,
  onTabChange,
  onOpenNewReport,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "at-risk", label: "At-Risk", icon: AlertTriangle },
    { id: "customers", label: "Customers", icon: Users },
    { id: "playbooks", label: "Actions", icon: Zap },
    { id: "segments", label: "Segments", icon: PieChart },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  const sidebarClasses = `
    fixed left-0 top-0 h-full w-[235px] bg-[#12101A] border-r border-border-subtle 
    flex flex-col py-6 z-40 transition-transform duration-300 md:translate-x-0
    ${isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6F00BE] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <span className="font-bold text-white text-lg tracking-wider">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none tracking-tight">SubSense</h1>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest mt-1">
              Customer Health
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive 
                    ? "bg-gradient-to-r from-[#7c3aed] to-[#6f00be] text-white border-l-4 border-primary shadow-[0_4px_12px_rgba(124,58,237,0.2)]" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border-l-4 border-transparent"
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-on-surface-variant group-hover:text-primary"}`} />
                <span className="tracking-wide">{item.label}</span>
                {!isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-on-surface-variant" />
                )}
              </button>
            );
          })}
        </nav>

        {/* New Report Action & Profile (Bottom) */}
        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={() => {
              onOpenNewReport();
              onCloseMobile();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#6f00be] hover:brightness-110 active:scale-95 text-white font-medium text-xs rounded-lg shadow-[0_4px_15px_rgba(124,58,237,0.2)] border border-[#26232F] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" /> 
            <span>New Report</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-surface-container/30 hover:bg-surface-container/60 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden ring-1 ring-border-subtle group-hover:ring-primary/50 transition-all">
              <img 
                className="w-full h-full object-cover" 
                alt="Alex J." 
                src={AVATARS.alex}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">Alex J.</p>
              <p className="text-[10px] text-on-surface-variant truncate">CSM Director</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
