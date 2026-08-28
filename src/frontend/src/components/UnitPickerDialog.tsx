import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export interface PickerUnit {
  id: string;
  label: string;
}

interface UnitPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: PickerUnit[];
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
}

export function UnitPickerDialog({
  open,
  onOpenChange,
  units,
  selectedId,
  onSelect,
  title = "Select Unit",
}: UnitPickerDialogProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;
    return units.filter(
      (u) => u.label.toLowerCase().includes(q) || u.id.toLowerCase().includes(q),
    );
  }, [units, query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setQuery("");
      }}
    >
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search unit..."
            className="pl-9"
          />
        </div>
        <div className="overflow-y-auto -mx-1 px-1 space-y-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              Koi unit nahi mila.
            </p>
          )}
          {filtered.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => {
                onSelect(u.id);
                onOpenChange(false);
                setQuery("");
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                u.id === selectedId
                  ? "bg-primary/15 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
