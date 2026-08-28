import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, PinOff, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { FreeAiHistoryItem } from "../hooks/useFreeAiHistory";

interface FreeAiHistoryPanelProps {
  items: FreeAiHistoryItem[];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSelect: (item: FreeAiHistoryItem) => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FreeAiHistoryPanel({
  items,
  onTogglePin,
  onDelete,
  onClear,
  onSelect,
  onClose,
}: FreeAiHistoryPanelProps) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const pinned = items.filter((i) => i.pinned);
  const others = items.filter((i) => !i.pinned);

  const Box = ({ item }: { item: FreeAiHistoryItem }) => (
    <div
      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 space-y-1 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium shrink-0">
          {item.category}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatDate(item.savedAt)}
        </span>
      </div>
      <p className="text-xs font-medium text-foreground line-clamp-2">
        {item.question}
      </p>
      <p className="text-[11px] text-muted-foreground line-clamp-2">
        {item.answer}
      </p>
      <div className="flex items-center justify-end gap-1 pt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          className="p-1 rounded text-muted-foreground hover:text-primary"
          aria-label={item.pinned ? "Unpin" : "Pin"}
        >
          {item.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-1 rounded text-muted-foreground hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">History</h3>
        <div className="flex items-center gap-1">
          {others.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="text-destructive hover:text-destructive h-7 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Abhi tak koi solved question nahi hai.
        </p>
      ) : (
        <ScrollArea className="h-64">
          <div className="space-y-3 pr-2">
            {pinned.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
                  Pinned
                </p>
                <div className="space-y-1.5">
                  {pinned.map((item) => (
                    <Box key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div className="space-y-1.5">
                {pinned.length > 0 && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
                    All
                  </p>
                )}
                <div className="space-y-1.5">
                  {others.map((item) => (
                    <Box key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear History?</DialogTitle>
            <DialogDescription>
              This removes all unpinned questions ({others.length}). Pinned
              questions are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClear();
                setConfirmClearOpen(false);
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
