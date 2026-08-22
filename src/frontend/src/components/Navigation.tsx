import {
  BarChart3,
  Binary,
  BrainCircuit,
  Calculator,
  CalendarDays,
  Cpu,
  FlaskConical,
  GraduationCap,
  Heart,
  Landmark,
  Wrench,
} from "lucide-react";
import type React from "react";

export type CalculatorTab =
  | "basic"
  | "scientific"
  | "programmer"
  | "finance"
  | "tools"
  | "graph"
  | "ai"
  | "datetime"
  | "health"
  | "education"
  | "engineering";

interface NavigationProps {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
}

export interface TabDef {
  id: CalculatorTab;
  label: string;
  icon: React.ElementType;
}

// Always-visible core tabs — kept short and clean. Everything else lives in
// the ⋮ menu under "Tools" so the bottom bar never feels crowded.
export const CORE_TABS: TabDef[] = [
  { id: "basic", label: "Basic", icon: Calculator },
  { id: "scientific", label: "Sci", icon: FlaskConical },
  { id: "programmer", label: "Prog", icon: Binary },
  { id: "ai", label: "AI", icon: BrainCircuit },
];

// Exported so the ⋮ menu (SettingsMenu > Tools) can list the same set —
// single source of truth for what these tools are.
export const EXTRA_TOOLS: TabDef[] = [
  { id: "finance", label: "Finance", icon: Landmark },
  { id: "tools", label: "Unit/Currency", icon: Wrench },
  { id: "graph", label: "Graph", icon: BarChart3 },
  { id: "datetime", label: "Date/Time", icon: CalendarDays },
  { id: "health", label: "Health", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "engineering", label: "Engineering", icon: Cpu },
];

function NavButton({
  tab,
  isActive,
  onClick,
}: {
  tab: TabDef;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      data-ocid={`nav.tab.${tab.id}`}
      aria-label={tab.label}
      aria-pressed={isActive}
    >
      <Icon
        className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
      />
      <span
        className={`text-[10px] font-medium leading-none ${isActive ? "font-semibold" : ""}`}
      >
        {tab.label}
      </span>
    </button>
  );
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="w-full bg-card border-t border-border sticky bottom-0 z-40 shadow-subtle">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around px-1 py-1.5">
          {CORE_TABS.map((tab) => (
            <NavButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
