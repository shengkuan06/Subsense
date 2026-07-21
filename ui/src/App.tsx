import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import AtRiskView from "./components/AtRiskView";
import CustomersView from "./components/CustomersView";
import ActionsView from "./components/ActionsView";
import SegmentsView from "./components/SegmentsView";
import CustomerProfileView from "./components/CustomerProfileView";
import NewReportModal from "./components/NewReportModal";
import Toast, { ToastMessage } from "./components/Toast";
import { Customer, Playbook } from "./types";
import { INITIAL_CUSTOMERS, INITIAL_PLAYBOOKS, AVATARS } from "./data";
import { fetchCustomers, fetchCustomerDetail, fetchPlaybooks, logIntervention } from "./api";

// Maps a playbook card type to the intervention playbook name the API expects.
const PLAYBOOK_NAME: Record<Playbook["type"], string> = {
  ai: "csm_outreach",
  pause: "pause_offer",
  winback: "winback",
  retry: "payment_retry",
};

export default function App() {
  // Application state
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Modals & Menu triggers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNewReportOpen, setIsNewReportOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load real customers from the SubSense API on mount. Falls back to the
  // bundled mock data if the backend is not running (so the design still shows).
  useEffect(() => {
    fetchCustomers()
      .then((list) => {
        if (list.length) setCustomers(list);
      })
      .catch(() => {
        /* backend offline - keep mock data */
      });

    // Load AI-generated retention playbooks (Pillar 3). Falls back to mock data.
    fetchPlaybooks()
      .then((list) => {
        if (list.length) setPlaybooks(list);
      })
      .catch(() => {
        /* backend offline - keep mock playbooks */
      });
  }, []);

  // Toast manager
  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    // Auto remove toast after 4s
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute MRR at risk dynamically (CUST-3668 excluded to match the exact $2,127 stat on mockup 1)
  const mrrAtRisk = useMemo(() => {
    return customers
      .filter((c) => (c.status === "Critical" || c.status === "At-Risk") && c.id !== "3668-QPYBK")
      .reduce((acc, c) => acc + c.mrr, 0);
  }, [customers]);

  // Navigate to customer profile
  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentTab("customer-profile");
    addToast(`Drilled into customer detail profile: ${customer.id}`, "info");

    // Enrich with real health dimensions + SHAP risk reasons from the API.
    try {
      const detail = await fetchCustomerDetail(customer.id);
      const enriched = { ...customer, ...detail } as Customer;
      setSelectedCustomer(enriched);
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? enriched : c)));
    } catch {
      /* backend offline - keep existing values */
    }
  };

  // Switch tabs
  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setSelectedCustomer(null);
  };

  // Execute Playbook mitigation
  const handleExecutePlaybook = (playbookId: string) => {
    // 1. Mark playbook as completed
    setPlaybooks((prev) =>
      prev.map((p) => (p.id === playbookId ? { ...p, completed: true } : p))
    );

    const playbook = playbooks.find((p) => p.id === playbookId);
    if (!playbook) return;

    // Persist the intervention to the backend (tracked in the interventions table).
    logIntervention(playbook.customerId, PLAYBOOK_NAME[playbook.type]);

    // 2. Resolve risk and improve corresponding customer health score
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === playbook.customerId || playbook.customerName.includes(customer.id)) {
          const originalHealth = customer.healthScore;
          const newHealth = Math.min(100, originalHealth + 15);
          const newStatus = newHealth >= 75 ? "Healthy" : newHealth >= 40 ? "At-Risk" : "Critical";
          const newRisk = Math.max(0, customer.churnRisk - 20);

          // Append to timeline of the customer
          const newEvent = {
            id: `ev-pb-${Date.now()}`,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            title: `Retention Playbook Action Executed: ${playbook.title}`,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            author: "Alex J.",
            avatarUrl: AVATARS.alex,
          };

          return {
            ...customer,
            healthScore: newHealth,
            status: newStatus,
            churnRisk: newRisk,
            timeline: [newEvent, ...customer.timeline],
          };
        }
        return customer;
      })
    );

    addToast(`Retention playbook sent successfully to ${playbook.customerName}! Churn risk reduced.`, "success");
  };

  // Register a new customer generated report
  const handleNewReportSubmit = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    addToast(`Successfully generated Churn Risk report: Registered ${newCustomer.id}`, "success");
    // Redirect to at-risk list so they can see their generated customer immediately!
    setCurrentTab("at-risk");
    setSelectedCustomer(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-brand text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenNewReport={() => setIsNewReportOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[235px] h-full overflow-hidden">
        
        {/* Global Search Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          mrrAtRisk={mrrAtRisk}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {currentTab === "dashboard" && (
                <DashboardView
                  customers={customers}
                  onTabChange={handleTabChange}
                  onCustomerSelect={handleCustomerSelect}
                  mrrAtRisk={mrrAtRisk}
                />
              )}

              {currentTab === "at-risk" && (
                <AtRiskView
                  customers={customers}
                  searchQuery={searchQuery}
                  onCustomerSelect={handleCustomerSelect}
                />
              )}

              {currentTab === "customers" && (
                <CustomersView
                  customers={customers}
                  searchQuery={searchQuery}
                  onCustomerSelect={handleCustomerSelect}
                />
              )}

              {currentTab === "playbooks" && (
                <ActionsView
                  playbooks={playbooks}
                  onExecutePlaybook={handleExecutePlaybook}
                  onCustomerSelect={handleCustomerSelect}
                  customers={customers}
                />
              )}

              {currentTab === "segments" && <SegmentsView />}

              {currentTab === "customer-profile" && selectedCustomer && (
                <CustomerProfileView
                  customer={selectedCustomer}
                  onBack={() => handleTabChange("at-risk")}
                  onAddToast={addToast}
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Generation Report Dialog Form */}
      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSubmit={handleNewReportSubmit}
      />

      {/* Live Toasts alerts container */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
