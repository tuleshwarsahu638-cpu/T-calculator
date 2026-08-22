import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, BarChart3, RefreshCw, TrendingUp } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

interface FeatureStat {
  featureName: string;
  usageCount: number;
}

const OPERATION_STATS_KEY = "operationStats";
const CALC_HISTORY_KEY = "calcHistory";

function loadStats(): FeatureStat[] {
  const stats: FeatureStat[] = [];
  try {
    const raw = localStorage.getItem(OPERATION_STATS_KEY);
    if (raw) {
      const parsed: Record<string, number> = JSON.parse(raw);
      for (const [key, count] of Object.entries(parsed)) {
        stats.push({ featureName: key, usageCount: Number(count) });
      }
    }
  } catch {}

  // Derive from calc history if no operation stats
  if (stats.length === 0) {
    try {
      const raw = localStorage.getItem(CALC_HISTORY_KEY);
      if (raw) {
        const history: { expression?: string }[] = JSON.parse(raw);
        const counts: Record<string, number> = {
          addition: 0,
          subtraction: 0,
          multiplication: 0,
          division: 0,
          percent: 0,
          squareRoot: 0,
          scientific: 0,
          other: 0,
        };
        for (const entry of history) {
          const expr = entry.expression || "";
          if (expr.includes("+")) counts.addition++;
          else if (expr.includes("-")) counts.subtraction++;
          else if (expr.includes("×")) counts.multiplication++;
          else if (expr.includes("÷")) counts.division++;
          else if (expr.includes("%")) counts.percent++;
          else if (expr.includes("√")) counts.squareRoot++;
          else if (/sin|cos|tan|log|ln/.test(expr)) counts.scientific++;
          else counts.other++;
        }
        for (const [key, count] of Object.entries(counts)) {
          if (count > 0) stats.push({ featureName: key, usageCount: count });
        }
      }
    } catch {}
  }

  return stats.sort((a, b) => b.usageCount - a.usageCount);
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<FeatureStat[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    setAnalytics(loadStats());
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  const totalUsage = analytics.reduce((sum, f) => sum + f.usageCount, 0);
  const featureCount = analytics.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Analytics Overview
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="text-xs gap-1 h-7"
          data-ocid="admin.analytics.button"
        >
          <RefreshCw size={11} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3" />
              Total Usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              interactions logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Active Features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              features tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Feature Usage Breakdown
          </CardTitle>
          <CardDescription>
            Usage statistics from local device data
            <span className="ml-2 text-xs opacity-60">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <div className="space-y-3">
              {analytics.map((feature) => {
                const percentage =
                  totalUsage > 0 ? (feature.usageCount / totalUsage) * 100 : 0;
                return (
                  <div key={feature.featureName} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {feature.featureName.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-muted-foreground">
                        {feature.usageCount} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No usage data available yet</p>
              <p className="text-xs mt-1">
                Feature usage will appear here as users interact with the app
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
