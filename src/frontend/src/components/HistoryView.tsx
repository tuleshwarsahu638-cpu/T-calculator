import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Download, Search, Trash2, X } from "lucide-react";
import React, { useState } from "react";

interface HistoryEntry {
  id?: string;
  expression: string;
  result: string;
  timestamp: number | string;
  mode?: string;
}

interface HistoryViewProps {
  history: HistoryEntry[];
  onClear: () => void;
  onDeleteEntry?: (id: string) => void;
}

export function HistoryView({ history, onClear, onDeleteEntry }: HistoryViewProps) {
  const [query, setQuery] = useState("");
  const [confirmExportOpen, setConfirmExportOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const filteredHistory = React.useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (e) =>
        e.expression.toLowerCase().includes(q) ||
        e.result.toLowerCase().includes(q),
    );
  }, [history, query]);

  const handleExport = () => {
    if (history.length === 0) return;
    const lines = history.map((e) => {
      const ts =
        typeof e.timestamp === "string"
          ? e.timestamp
          : new Date(e.timestamp).toISOString();
      return `${ts}\t${e.expression}\t${e.result}`;
    });
    const csv = ["Timestamp\tExpression\tResult", ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calculator-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: number | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Calculation History
          </h3>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmExportOpen(true)}
              className="h-7 text-xs"
              aria-label="Export history"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-destructive hover:text-destructive h-7 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">
            {history.length === 0 ? "No calculations yet" : "No matches found"}
          </p>
          <p className="text-xs mt-1">
            {history.length === 0
              ? "Your history will appear here"
              : "Try a different search term"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-40">
          <div className="space-y-1.5 pr-2">
            {filteredHistory.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="p-2.5 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {entry.expression}
                  </div>
                  <div className="text-sm font-semibold mt-0.5 font-mono text-foreground break-all">
                    = {entry.result}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatTime(entry.timestamp)}
                </div>
                {onDeleteEntry && entry.id && (
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id!)}
                    className="shrink-0 text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete entry"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Export confirmation */}
      <Dialog open={confirmExportOpen} onOpenChange={setConfirmExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export History?</DialogTitle>
            <DialogDescription>
              This will download all {history.length} calculation
              {history.length === 1 ? "" : "s"} as a CSV file to your device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmExportOpen(false)}>
              No
            </Button>
            <Button
              onClick={() => {
                handleExport();
                setConfirmExportOpen(false);
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear History?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {history.length} saved
              calculation{history.length === 1 ? "" : "s"}. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClear();
                setConfirmDeleteOpen(false);
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
