import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Activity,
  BarChart2,
  DollarSign,
  Download,
  Settings2,
  Shield,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import { AdminAnalytics } from "./AdminAnalytics";
import { AppMonitoringSection } from "./AppMonitoringSection";
import DataExportSection from "./DataExportSection";
import { FeatureControlSection } from "./FeatureControlSection";
import { MonetizationConfigSection } from "./MonetizationConfigSection";
import { ProviderConfigSection } from "./ProviderConfigSection";
import ProgressDashboardSection from "./ProgressDashboardSection";
import { SecurityControlSection } from "./SecurityControlSection";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "earning", label: "Earning System", icon: DollarSign },
  { id: "providers", label: "Providers", icon: Sliders },
  { id: "features", label: "Features", icon: Settings2 },
  { id: "export", label: "Export", icon: Download },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "monitor", label: "Crash Log", icon: Activity },
];

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border bg-amber-50 dark:bg-amber-950/30">
          <SheetTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base font-bold">
            <Shield className="h-5 w-5 flex-shrink-0" />
            Admin Mode — Owner Control Panel
          </SheetTitle>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/80 font-medium mt-0.5 pl-7">
            Real, on-device data only. Only visible to you.
          </p>
        </SheetHeader>

        {/* Tab Bar - horizontally scrollable */}
        <div className="overflow-x-auto scrollbar-hide border-b border-border bg-muted/30">
          <div className="flex min-w-max px-2 py-1 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "progress" && <ProgressDashboardSection />}
          {activeTab === "earning" && <MonetizationConfigSection />}
          {activeTab === "providers" && <ProviderConfigSection />}
          {activeTab === "features" && <FeatureControlSection />}
          {activeTab === "export" && <DataExportSection />}
          {activeTab === "security" && <SecurityControlSection />}
          {activeTab === "monitor" && <AppMonitoringSection />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
