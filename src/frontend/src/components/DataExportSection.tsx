import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Database, Download, FileJson } from "lucide-react";
import React, { useState } from "react";

function gatherAllLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    } catch {
      // skip
    }
  }
  return data;
}

export default function DataExportSection() {
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const allData = gatherAllLocalData();
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        appVersion: "1.0.0",
        data: allData,
      };
      const json = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calculator-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportHistory = () => {
    try {
      const raw = localStorage.getItem("calc_history");
      const history = raw ? JSON.parse(raw) : [];
      const csv = [
        "Expression,Result,Timestamp",
        ...history.map(
          (h: { expression: string; result: string; timestamp: number }) =>
            `"${h.expression}","${h.result}","${new Date(h.timestamp).toISOString()}"`,
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calc-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  const storageKeys = localStorage.length;
  const historyRaw = localStorage.getItem("calc_history");
  const historyCount = historyRaw ? JSON.parse(historyRaw).length : 0;

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage Keys</span>
            <Badge variant="secondary">{storageKeys}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Calculation History</span>
            <Badge variant="secondary">{historyCount} entries</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage Location</span>
            <Badge variant="outline" className="text-xs">
              Device Only
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Export Options
          </CardTitle>
          <CardDescription className="text-xs">
            All data is stored on your device. Export to backup or transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full gap-2"
            variant={exported ? "outline" : "default"}
          >
            {exported ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Exported Successfully!
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export All Data (JSON)"}
              </>
            )}
          </Button>

          <Button
            onClick={handleExportHistory}
            variant="outline"
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Export History (CSV)
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            📱 Data stays on your device — no server involved
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
