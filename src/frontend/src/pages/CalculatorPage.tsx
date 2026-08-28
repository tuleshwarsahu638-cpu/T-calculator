import { Bell, ChevronDown, History, ShieldCheck, X } from "lucide-react";
import type React from "react";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { APP_NAME } from "../config/appConfig";
import { HistoryView } from "../components/HistoryView";
import { Layout } from "../components/Layout";
import { CORE_TABS } from "../components/Navigation";
import type { CalculatorTab } from "../components/Navigation";
import SettingsMenu from "../components/SettingsMenu";
import { useCalculatorContext } from "../context/CalculatorContext";
import { useThumbLayerSettingsContext } from "../context/ThumbLayerSettingsContext";
import { useSettings } from "../hooks/useSettings";
import AdminAccessGate from "../components/AdminAccessGate";
import AdminPanel from "../components/AdminPanel";
import { AdSlot } from "../components/AdSlot";
import { VersionBanner } from "../components/VersionBanner";
import { useAdminAuth } from "../hooks/useAdminAuth";
import BasicCalculator from "./BasicCalculator";

const DateTimeCalculator = lazy(() => import("./DateTimeCalculator"));
const EducationCalculator = lazy(() => import("./EducationCalculator"));
const EngineeringCalculator = lazy(() => import("./EngineeringCalculator"));
const FinanceCalculator = lazy(() => import("./FinanceCalculator"));
const GraphPlotter = lazy(() => import("./GraphPlotter"));
const HealthCalculator = lazy(() => import("./HealthCalculator"));
const ProgrammerCalculator = lazy(() => import("./ProgrammerCalculator"));
const ScientificCalculator = lazy(() => import("./ScientificCalculator"));
const UnitConverter = lazy(() => import("./UnitConverter"));
const VoiceCalculator = lazy(() => import("./VoiceCalculator"));

const ADMIN_BANNER_KEY = "adminBanner";

export default function CalculatorPage() {
  const { activeTab, setActiveTab, history, clearHistory, deleteHistoryEntry } =
    useCalculatorContext();
  const { settings } = useSettings();

  const [showHistory, setShowHistory] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [adminBanner, setAdminBanner] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [adminGateOpen, setAdminGateOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const auth = useAdminAuth();

  // Tap the title 5 times in 3 seconds to open the Admin Access gate.
  // This only opens the gate UI — it's a local per-device PIN, no backend.
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 3000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (auth.sessionUnlocked) {
        setAdminPanelOpen(true);
      } else {
        setAdminGateOpen(true);
      }
    }
  }, [auth.sessionUnlocked]);

  // Silently warm up every heavy page in the background after the first
  // paint, so by the time the user taps a tab it's already loaded — no
  // visible loading screen, no waiting. Basic Calculator itself is never
  // lazy, so it's always instant regardless of this.
  useEffect(() => {
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
        .requestIdleCallback || ((cb: () => void) => setTimeout(cb, 300));
    idle(() => {
      import("./ScientificCalculator");
      import("./ProgrammerCalculator");
      import("./FinanceCalculator");
      import("./UnitConverter");
      import("./GraphPlotter");
      import("./VoiceCalculator");
      import("./DateTimeCalculator");
      import("./HealthCalculator");
      import("./EducationCalculator");
      import("./EngineeringCalculator");
    });
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem(ADMIN_BANNER_KEY);
        if (raw) {
          const b = JSON.parse(raw);
          setAdminBanner(b?.active && b?.message ? b.message : null);
        } else {
          setAdminBanner(null);
        }
      } catch {
        setAdminBanner(null);
      }
    };
    handleStorage();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleTabChange = (tab: CalculatorTab) => {
    setActiveTab(tab);
    setMoreOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicCalculator />;
      case "scientific":
        return <ScientificCalculator />;
      case "programmer":
        return <ProgrammerCalculator />;
      case "finance":
        return <FinanceCalculator />;
      case "tools":
        return <UnitConverter />;
      case "graph":
        return <GraphPlotter />;
      case "ai":
        return <VoiceCalculator />;
      case "datetime":
        return <DateTimeCalculator />;
      case "health":
        return <HealthCalculator />;
      case "education":
        return <EducationCalculator />;
      case "engineering":
        return <EngineeringCalculator />;
      default:
        return <BasicCalculator />;
    }
  };

  return (
    <Layout>
      <div className="w-full h-full max-w-sm flex flex-col items-center py-4 px-2">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-3 px-1 gap-1">
          {!moreOpen && (
            <button
              type="button"
              className="text-xl font-bold text-primary tracking-tight cursor-default select-none bg-transparent border-0 p-0 shrink-0"
              onClick={handleTitleTap}
              aria-label={APP_NAME}
            >
              {APP_NAME}
            </button>
          )}
          <div
            className={`flex items-center gap-1 overflow-x-auto scrollbar-hide ${moreOpen ? "w-full justify-start" : "ml-auto"}`}
          >
            {CORE_TABS.slice(0, 2).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  data-ocid={`topnav.tab.${tab.id}`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}

            {moreOpen && (
              <>
                {CORE_TABS.slice(2).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      data-ocid={`topnav.tab.${tab.id}`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
                {settings.showHistory && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                    title="History"
                    data-ocid="calc.history.toggle"
                  >
                    <History size={16} />
                  </button>
                )}
                <div className="shrink-0">
                  <SettingsMenu />
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`p-1.5 rounded-lg shrink-0 transition-colors ${moreOpen ? "text-primary bg-primary/15" : "text-muted-foreground hover:bg-muted"}`}
              aria-label={moreOpen ? "Close" : "More"}
              data-ocid="topnav.more.toggle"
            >
              {moreOpen ? <X size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Admin Toast */}
        {adminToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg animate-fade-in">
            <ShieldCheck size={15} />
            {adminToast}
          </div>
        )}

        {/* Admin Banner */}
        {adminBanner && (
          <div className="w-full mb-2 flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-medium px-3 py-2 rounded-xl">
            <Bell size={12} className="shrink-0" />
            <span className="flex-1">{adminBanner}</span>
            <button
              type="button"
              onClick={() => {
                setAdminBanner(null);
                localStorage.removeItem(ADMIN_BANNER_KEY);
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* History Panel */}
        {showHistory && settings.showHistory && (
          <div className="w-full mb-3">
            <HistoryView
              history={history}
              onClear={clearHistory}
              onDeleteEntry={deleteHistoryEntry}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="w-full pb-2 flex-1 flex flex-col min-h-0">
          <Suspense fallback={<div className="flex-1 min-h-[300px]" />}>
            {renderTabContent()}
          </Suspense>
        </div>

        <AdSlot />
      </div>

      <AdminAccessGate
        open={adminGateOpen}
        onOpenChange={setAdminGateOpen}
        onUnlocked={() => setAdminPanelOpen(true)}
      />
      <AdminPanel
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
      />
      <VersionBanner />
    </Layout>
  );
}
