import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { ThumbLayerSettings } from "./ThumbLayerSettings";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = [
  { id: "general", label: "⚙️ General" },
  { id: "display", label: "🖥️ Display" },
  { id: "calculator", label: "🔢 Calculator" },
  { id: "ai", label: "🤖 AI" },
  { id: "security", label: "🔒 Security" },
  { id: "backup", label: "💾 Backup" },
  { id: "about", label: "ℹ️ About" },
];

export default function SettingsPanel({
  open,
  onOpenChange,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="text-lg font-bold">⚙️ Settings</SheetTitle>
        </SheetHeader>

        {/* Tab Bar */}
        <div className="overflow-x-auto scrollbar-hide border-b border-border">
          <div className="flex min-w-max px-2 py-1 gap-1">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* DISPLAY TAB */}
          {activeTab === "display" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Display Theme
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["default", "dark", "light", "amoled"] as const).map(
                    (theme) => (
                      <button
                        type="button"
                        key={theme}
                        onClick={() => updateSetting("displayTheme", theme)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize ${
                          settings.displayTheme === theme
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {theme === "default"
                          ? "🌗 Default"
                          : theme === "dark"
                            ? "🌙 Dark"
                            : theme === "light"
                              ? "☀️ Light"
                              : "⬛ AMOLED Black"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Button & Text Size
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as const).map(
                    (size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => updateSetting("buttonSize", size)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize ${
                          settings.buttonSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {size === "small"
                          ? "🔹 Small"
                          : size === "medium"
                            ? "🔷 Medium"
                            : "🔶 Large"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable button press animations
                  </p>
                </div>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(v) => updateSetting("animationsEnabled", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">High Contrast</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase text/button contrast
                  </p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(v) => updateSetting("highContrast", v)}
                />
              </div>
            </div>
          )}

          {/* CALCULATOR TAB */}
          {activeTab === "calculator" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show History</Label>
                  <p className="text-xs text-muted-foreground">
                    Display calculation history
                  </p>
                </div>
                <Switch
                  checked={settings.showHistory}
                  onCheckedChange={(v) => updateSetting("showHistory", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Percent Button</Label>
                  <p className="text-xs text-muted-foreground">
                    Show % button on keypad
                  </p>
                </div>
                <Switch
                  checked={settings.showPercent}
                  onCheckedChange={(v) => updateSetting("showPercent", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Memory Functions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show M+, M-, MR, MC buttons
                  </p>
                </div>
                <Switch
                  checked={settings.showMemory}
                  onCheckedChange={(v) => updateSetting("showMemory", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Haptic Feedback</Label>
                  <p className="text-xs text-muted-foreground">
                    Vibrate on button press
                  </p>
                </div>
                <Switch
                  checked={settings.hapticFeedback}
                  onCheckedChange={(v) => updateSetting("hapticFeedback", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    🔋 Battery Saver
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Turns off glow/3D/animations to save power
                  </p>
                </div>
                <Switch
                  checked={settings.batterySaver}
                  onCheckedChange={(v) => updateSetting("batterySaver", v)}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Decimal Places
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => updateSetting("decimalPlaces", n)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        settings.decimalPlaces === n
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <button
                type="button"
                onClick={resetSettings}
                className="w-full py-2 rounded-lg text-xs font-medium border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
              >
                🔄 Reset All Settings to Default
              </button>
            </div>
          )}

          {/* Colors — folded into Display */}
          {activeTab === "display" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Button & Display Colors
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Customize the look of your calculator buttons and display
                  area.
                </p>
              </div>
              <ThumbLayerSettings />
            </div>
          )}

          {/* Sound — folded into General */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds on button press
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => updateSetting("soundEnabled", v)}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Volume
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>🔇 Mute</span>
                    <span className="font-medium text-foreground">
                      {settings.volume}%
                    </span>
                    <span>🔊 Max</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[settings.volume]}
                    onValueChange={([v]) => updateSetting("volume", v)}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Click Sound</Label>
                  <p className="text-xs text-muted-foreground">
                    Mechanical click on digits
                  </p>
                </div>
                <Switch
                  checked={settings.clickSound}
                  onCheckedChange={(v) => updateSetting("clickSound", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Result Sound</Label>
                  <p className="text-xs text-muted-foreground">
                    Chime when result is shown
                  </p>
                </div>
                <Switch
                  checked={settings.resultSound}
                  onCheckedChange={(v) => updateSetting("resultSound", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Error Sound</Label>
                  <p className="text-xs text-muted-foreground">
                    Alert sound on error
                  </p>
                </div>
                <Switch
                  checked={settings.errorSound}
                  onCheckedChange={(v) => updateSetting("errorSound", v)}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Sound Theme
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["classic", "modern", "retro", "soft"].map((theme) => (
                    <button
                      type="button"
                      key={theme}
                      onClick={() => updateSetting("soundTheme", theme)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize ${
                        settings.soundTheme === theme
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {theme === "classic"
                        ? "🎵 Classic"
                        : theme === "modern"
                          ? "🎶 Modern"
                          : theme === "retro"
                            ? "📻 Retro"
                            : "🎼 Soft"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Save History</Label>
                  <p className="text-xs text-muted-foreground">
                    Store calculation history locally
                  </p>
                </div>
                <Switch
                  checked={settings.saveHistory}
                  onCheckedChange={(v) => updateSetting("saveHistory", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Hide on Background
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Blur app when switching
                  </p>
                </div>
                <Switch
                  checked={settings.hideOnBackground}
                  onCheckedChange={(v) => updateSetting("hideOnBackground", v)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Owner PIN Lock
                </h3>
                <p className="text-xs text-muted-foreground">
                  Admin Mode is protected by a PIN stored only on this
                  device (SHA-256 hashed — the actual PIN is never saved).
                  5 wrong attempts trigger a 1-minute lockout. To set up or
                  change it, open{" "}
                  <span className="font-medium text-foreground">
                    ⋮ menu → Admin Mode
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="space-y-5">
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Free Assistant
                </h3>
                <p className="text-xs text-muted-foreground">
                  Instant, offline, no setup — periodic table, constants,
                  formulas, and step-by-step math. Always free.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  AI+ (Powerful)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Open-ended questions, detailed step-by-step explanations,
                  photo solving, graphing help, science, and finance —
                  powered by Claude. Needs your own API key from
                  console.anthropic.com (usage is billed to you directly).
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage your AI+ key from the AI tab inside the calculator
                itself (mic icon → AI+ tab).
              </p>
            </div>
          )}

          {/* BACKUP TAB */}
          {activeTab === "backup" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Local Backup & Restore
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Save your history, favorites, and settings to a file — and
                  restore them later, even after reinstalling. Nothing is
                  uploaded anywhere; the file stays on your device.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const data = {
                        history: JSON.parse(
                          localStorage.getItem("calcHistory") || "[]",
                        ),
                        favorites: JSON.parse(
                          localStorage.getItem("calcFavorites") || "[]",
                        ),
                        settings: JSON.parse(
                          localStorage.getItem("calcSettings") || "{}",
                        ),
                        thumbLayerSettings: JSON.parse(
                          localStorage.getItem("thumbLayerSettings") || "{}",
                        ),
                        exportDate: new Date().toISOString(),
                        exportVersion: 1,
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `t-calculator-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    📤 Export Backup File
                  </button>

                  <label className="w-full py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center cursor-pointer">
                    📥 Import Backup File
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          try {
                            const data = JSON.parse(reader.result as string);
                            if (data.history)
                              localStorage.setItem(
                                "calcHistory",
                                JSON.stringify(data.history),
                              );
                            if (data.favorites)
                              localStorage.setItem(
                                "calcFavorites",
                                JSON.stringify(data.favorites),
                              );
                            if (data.settings)
                              localStorage.setItem(
                                "calcSettings",
                                JSON.stringify(data.settings),
                              );
                            if (data.thumbLayerSettings)
                              localStorage.setItem(
                                "thumbLayerSettings",
                                JSON.stringify(data.thumbLayerSettings),
                              );
                            alert(
                              "Backup restore ho gaya. App ko reload karein.",
                            );
                            window.location.reload();
                          } catch {
                            alert("Ye file valid backup nahi hai.");
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Clear all calculation history?")) {
                        localStorage.removeItem("calcHistory");
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
                  >
                    🗑️ Clear Calculation History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="space-y-4 text-center py-4">
              <h3 className="text-base font-bold text-foreground">
                TCalc AI
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Basic, Scientific, Programmer, Finance, and AI-assisted math
                — all in one private, offline-first calculator. Full details
                (privacy policy, version) are in{" "}
                <span className="font-medium text-foreground">
                  ⋮ menu → About & Privacy
                </span>
                .
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
