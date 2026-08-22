import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Star, Trash2 } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

interface FavoritesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesPanel({ open, onOpenChange }: FavoritesPanelProps) {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" /> Favorites
          </SheetTitle>
        </SheetHeader>

        {favorites.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Koi favorite abhi tak save nahi hua. Calculator display ke ★ icon
            se koi bhi result save kar sakte hain.
          </div>
        ) : (
          <div className="space-y-2 mt-4 pb-4">
            {favorites.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {f.expression}
                  </p>
                  <p className="text-base font-semibold truncate">
                    = {f.result}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFavorite(f.id)}
                  aria-label="Remove favorite"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
