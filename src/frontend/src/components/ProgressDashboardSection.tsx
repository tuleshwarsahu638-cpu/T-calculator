import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Calculator,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProgressStats {
  totalOperations: number;
  addCount: number;
  subtractCount: number;
  multiplyCount: number;
  divideCount: number;
  scientificCount: number;
  todayCount: number;
  weekCount: number;
}

function getProgressStats(): ProgressStats {
  const stats: ProgressStats = {
    totalOperations: 0,
    addCount: 0,
    subtractCount: 0,
    multiplyCount: 0,
    divideCount: 0,
    scientificCount: 0,
    todayCount: 0,
    weekCount: 0,
  };

  try {
    const raw = localStorage.getItem("calcHistory");
    if (!raw) return stats;
    const history: Array<{
      expression: string;
      result: string;
      timestamp: string;
    }> = JSON.parse(raw);

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    for (const entry of history) {
      stats.totalOperations++;
      const expr = entry.expression || "";
      if (expr.includes("+")) stats.addCount++;
      if (expr.includes("-")) stats.subtractCount++;
      if (expr.includes("×") || expr.includes("*")) stats.multiplyCount++;
      if (expr.includes("÷") || expr.includes("/")) stats.divideCount++;
      if (
        expr.includes("sin") ||
        expr.includes("cos") ||
        expr.includes("tan") ||
        expr.includes("√") ||
        expr.includes("log")
      ) {
        stats.scientificCount++;
      }
      if (entry.timestamp && now - new Date(entry.timestamp).getTime() < oneDayMs)
        stats.todayCount++;
      if (entry.timestamp && now - new Date(entry.timestamp).getTime() < oneWeekMs)
        stats.weekCount++;
    }
  } catch {
    // ignore
  }

  return stats;
}

export default function ProgressDashboardSection() {
  const [stats, setStats] = useState<ProgressStats>(getProgressStats());

  useEffect(() => {
    setStats(getProgressStats());
  }, []);

  const total = stats.totalOperations || 1;
  const operations = [
    {
      label: "Addition (+)",
      count: stats.addCount,
      color: "bg-green-500",
      pct: Math.round((stats.addCount / total) * 100),
    },
    {
      label: "Subtraction (−)",
      count: stats.subtractCount,
      color: "bg-blue-500",
      pct: Math.round((stats.subtractCount / total) * 100),
    },
    {
      label: "Multiply (×)",
      count: stats.multiplyCount,
      color: "bg-yellow-500",
      pct: Math.round((stats.multiplyCount / total) * 100),
    },
    {
      label: "Division (÷)",
      count: stats.divideCount,
      color: "bg-orange-500",
      pct: Math.round((stats.divideCount / total) * 100),
    },
    {
      label: "Scientific",
      count: stats.scientificCount,
      color: "bg-purple-500",
      pct: Math.round((stats.scientificCount / total) * 100),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Ops</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalOperations}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.todayCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.weekCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Scientific</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.scientificCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operation Breakdown Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Operation Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {operations.map((op) => (
            <div key={op.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">{op.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{op.count}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {op.pct}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${op.color}`}
                  style={{ width: `${op.pct}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Visual Pie-like chart using CSS */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Usage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {operations
              .filter((op) => op.count > 0)
              .map((op) => (
                <div key={op.label} className="flex items-center gap-1 text-xs">
                  <div className={`w-3 h-3 rounded-full ${op.color}`} />
                  <span className="text-muted-foreground">
                    {op.label.split(" ")[0]}: {op.pct}%
                  </span>
                </div>
              ))}
          </div>
          {stats.totalOperations === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No calculations yet. Start using the calculator to see stats!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
