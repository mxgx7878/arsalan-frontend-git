import { useState } from "react";
import {
  HiOutlineTruck,
  HiOutlineCalendar,
  HiOutlineMap,
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineChartBar,
} from "react-icons/hi";

import VehicleReport from "./tabs/VehicleReport";
import VehicleMonthlyReport from "./tabs/VehicleMonthlyReport";
import RideReport from "./tabs/RideReport";
import MarketVsOwnReport from "./tabs/MarketVsOwnReport";
import PartyReport from "./tabs/PartyReport";
import InvoiceReport from "./tabs/InvoiceReport";
import ExpenseReport from "./tabs/ExpenseReport";
import ProfitLossReport from "./tabs/ProfitLossReport";
import PartnerReport from "./tabs/PartnerReport";
import DailySummaryReport from "./tabs/DailySummaryReport";
import PendingDueReport from "./tabs/PendingDueReport";

const TABS = [
  { id: "vehicle",          label: "Per Vehicle",        icon: HiOutlineTruck,         component: VehicleReport },
  { id: "vehicle-monthly",  label: "Vehicle Monthly",    icon: HiOutlineCalendar,      component: VehicleMonthlyReport },
  { id: "rides",            label: "Ride Report",        icon: HiOutlineMap,           component: RideReport },
  { id: "market-vs-own",   label: "Market vs Own",      icon: HiOutlineScale,         component: MarketVsOwnReport },
  { id: "party",            label: "Party / Client",     icon: HiOutlineUserGroup,     component: PartyReport },
  { id: "invoices",         label: "Invoice Report",     icon: HiOutlineDocumentText,  component: InvoiceReport },
  { id: "expenses",         label: "Expense Report",     icon: HiOutlineCurrencyDollar, component: ExpenseReport },
  { id: "profit-loss",      label: "Profit & Loss",      icon: HiOutlineTrendingUp,    component: ProfitLossReport },
  { id: "partner",          label: "Partner Report",     icon: HiOutlineUsers,         component: PartnerReport },
  { id: "daily-summary",    label: "Daily Summary",      icon: HiOutlineClipboardList, component: DailySummaryReport },
  { id: "pending-due",      label: "Pending & Due",      icon: HiOutlineClock,         component: PendingDueReport },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("vehicle");

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <HiOutlineChartBar className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Reports</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Financial and operational insights across all modules
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-0">
        {/* ── Tab Sidebar ──────────────────────────────── */}
        <div className="lg:w-52 flex-shrink-0">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    : "text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical stack */}
          <div className="hidden lg:flex flex-col gap-1 bg-slate-900 border border-slate-800 rounded-xl p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                  activeTab === tab.id
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active Report ────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}