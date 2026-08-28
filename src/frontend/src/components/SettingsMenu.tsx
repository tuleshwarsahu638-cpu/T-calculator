import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, MoreVertical, Settings, Star } from "lucide-react";
import React, { useState } from "react";
import { EXTRA_TOOLS } from "./Navigation";
import { useCalculatorContext } from "../context/CalculatorContext";
import { AboutPanel } from "./AboutPanel";
import { FavoritesPanel } from "./FavoritesPanel";
import SettingsPanel from "./SettingsPanel";

export default function SettingsMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { setActiveTab } = useCalculatorContext();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="settings.open_modal_button"
            className="h-8 w-8 text-foreground/70 hover:text-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-[70vh] overflow-y-auto">
          {/* SECTION 1 — Tools (moved here from the old bottom "More" grid) */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Tools
          </DropdownMenuLabel>
          {EXTRA_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <DropdownMenuItem
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className="gap-2 cursor-pointer text-foreground"
                data-ocid={`tools.link.${tool.id}`}
              >
                <Icon className="h-4 w-4 shrink-0 text-foreground" />
                <span className="whitespace-normal leading-snug text-foreground">{tool.label}</span>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />

          {/* SECTION 2 — General (for every user) */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
            General
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setSettingsOpen(true)}
            className="gap-2 cursor-pointer"
            data-ocid="settings.link"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="whitespace-normal leading-snug">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setFavoritesOpen(true)}
            className="gap-2 cursor-pointer"
            data-ocid="favorites.link"
          >
            <Star className="h-4 w-4 shrink-0" />
            <span className="whitespace-normal leading-snug">Favorites</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setAboutOpen(true)}
            className="gap-2 cursor-pointer"
            data-ocid="about.link"
          >
            <Info className="h-4 w-4 shrink-0" />
            <span className="whitespace-normal leading-snug">About & Privacy</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FavoritesPanel open={favoritesOpen} onOpenChange={setFavoritesOpen} />
      <AboutPanel open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
