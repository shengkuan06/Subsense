import React, { useState } from "react";
import { Search, Bell, Settings, Menu, X, ArrowDown } from "lucide-react";
import { AVATARS } from "../data";

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenMobileMenu: () => void;
  mrrAtRisk: number;
}

export default function Header({
  onSearchChange,
  searchQuery,
  onOpenMobileMenu,
  mrrAtRisk,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const mockAlerts = [
    { id: "a1", text: "Usage dropped 45% for CloudVibe Solutions", type: "critical" },
    { id: "a2", text: "New high-risk report generated for CUST-3215", type: "warn" },
    { id: "a3", text: "Payment retry succeeded for Acme CyberSec", type: "success" }
  ];

  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-border-subtle flex justify-between items-center px-4 md:px-8 z-30">
      
      {/* Mobile Menu & Small Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button 
          onClick={onOpenMobileMenu}
          className="md:hidden text-on-surface-variant hover:text-primary p-1.5 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Search Box */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0A0A0F] border border-border-subtle rounded-lg py-1.5 pl-10 pr-8 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
            placeholder="Search accounts by ID or Name..."
            type="text"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trailing Indicators */}
      <div className="flex items-center gap-4 md:gap-6 ml-4">
        
        {/* Pulsing Risk Counter (Amber / Red indicator) */}
        <div className="hidden lg:flex items-center gap-2 bg-rose-950/20 border border-rose-500/20 px-3.5 py-1.5 rounded-full select-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase">
            MRR at risk:
          </span>
          <span className="text-sm font-bold text-rose-400">
            ${mrrAtRisk.toLocaleString()}
          </span>
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
            }}
            className={`w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container/40 rounded-full transition-all relative ${showNotifications ? "text-primary bg-surface-container/30" : ""}`}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C3AED] ring-2 ring-[#0A0A0F] animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#16141F] border border-[#26232F] rounded-xl shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#26232F]">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Active Health Alerts</h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="flex gap-2 p-2 rounded bg-[#0A0A0F]/60 text-xs text-on-surface border-l-2 border-primary">
                    <div className="flex-1">
                      <p className="font-medium text-on-surface-variant">{alert.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
            }}
            className={`w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container/40 rounded-full transition-all ${showSettings ? "text-primary bg-surface-container/30" : ""}`}
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-[#16141F] border border-[#26232F] rounded-xl shadow-2xl p-4 z-50 text-xs">
              <h4 className="font-bold text-on-surface mb-2 uppercase tracking-wider">Preferences</h4>
              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Live Risk Modeling</span>
                  <input type="checkbox" defaultChecked className="rounded bg-black border-border-subtle accent-primary" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Instant Slack Sync</span>
                  <input type="checkbox" defaultChecked className="rounded bg-black border-border-subtle accent-primary" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Auto-Assign CS Tickets</span>
                  <input type="checkbox" className="rounded bg-black border-border-subtle accent-primary" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Circle */}
        <div className="w-8 h-8 rounded-full border border-border-subtle overflow-hidden ring-1 ring-transparent hover:ring-primary/40 transition-all select-none">
          <img 
            alt="Alex J." 
            className="w-full h-full object-cover" 
            src={AVATARS.woman1}
            referrerPolicy="no-referrer"
          />
        </div>

      </div>
    </header>
  );
}
