import { useCallback, useEffect, useState } from "react";
import { CalculatorButton } from "../components/CalculatorButton";
import { CalculatorDisplay } from "../components/CalculatorDisplay";
import { useCalculatorContext } from "../context/CalculatorContext";
import { useThumbLayerSettingsContext } from "../context/ThumbLayerSettingsContext";
import { useCalculator, safeEval } from "../hooks/useCalculator";
import { useFavorites } from "../hooks/useFavorites";
import { useSettings } from "../hooks/useSettings";
import { playErrorSound, playResultSound } from "../lib/sounds";
import { getContrastColor } from "../lib/contrastColor";

export default function BasicCalculator() {
  const calc = useCalculator();
  const { addHistory, history } = useCalculatorContext();
  const { settings: thumbSettings } = useThumbLayerSettingsContext();
  const { settings } = useSettings();
  const { addFavorite, isFavorite } = useFavorites();

  const [display, setDisplay] = useState(calc.display);
  const [expression, setExpression] = useState(calc.expression);
  const [lastFullExpression, setLastFullExpression] = useState("");
  const [keyScale, setKeyScale] = useState(() => {
    const saved = Number(localStorage.getItem("basicKeyScale"));
    return saved >= 70 && saved <= 130 ? saved : 100;
  });

  useEffect(() => {
    localStorage.setItem("basicKeyScale", String(keyScale));
  }, [keyScale]);

  useEffect(() => {
    setDisplay(calc.display);
    setExpression(calc.expression);
  }, [calc.display, calc.expression]);

  const handleButtonPress = useCallback(
    (value: string) => {
      if (settings.hapticFeedback) {
        try {
          navigator.vibrate?.(value === "=" ? [15, 30, 15] : 20);
        } catch {}
      }
      calc.pressButton(value);
      if (value === "=") {
        if (calc.display === "Error") {
          if (settings.soundEnabled && settings.errorSound) {
            playErrorSound(settings.volume, settings.soundTheme);
          }
        } else {
          if (settings.soundEnabled && settings.resultSound) {
            playResultSound(settings.volume, settings.soundTheme);
          }
          setLastFullExpression(expression);
          addHistory({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            expression: `${expression} =`,
            result: calc.display,
            timestamp: new Date().toISOString(),
            mode: "basic",
          });
        }
      }
    },
    [calc, expression, settings.hapticFeedback, settings.soundEnabled, settings.errorSound, settings.resultSound, settings.volume, settings.soundTheme, addHistory],
  );

  const contrastText = getContrastColor(thumbSettings.display.backgroundColor);
  const displayStyle: React.CSSProperties = {
    backgroundColor: thumbSettings.display.backgroundColor,
    border: `2px solid ${thumbSettings.display.outlineColor}`,
    ["--display-text" as string]: contrastText,
    ["--display-expr" as string]: `${contrastText}b3`,
  };

  const basicHistory = history.filter((h) => h.mode === "basic");

  // Apply the user's decimal-places setting to the displayed value only
  // (internal calculation precision is untouched).
  const formattedDisplay = (() => {
    if (display === "Error" || display.endsWith(".") || !display.includes("."))
      return display;
    const num = Number.parseFloat(display);
    if (Number.isNaN(num) || !Number.isFinite(num)) return display;
    return num.toFixed(settings.decimalPlaces);
  })();

  // Live preview: while an expression is being built (before "="), show
  // what it currently evaluates to. Pressing "=" is still what confirms
  // the final result and saves it to history — this is just a peek.
  const livePreview = (() => {
    if (calc.isResult || !expression || display === "Error") return null;
    try {
      const attempt = safeEval(expression + display);
      if (!Number.isFinite(attempt)) return null;
      return Number.parseFloat(attempt.toFixed(settings.decimalPlaces)).toString();
    } catch {
      return null;
    }
  })();

  return (
    <div className="w-full h-full flex-1 flex flex-col">
      <CalculatorDisplay
        expression={expression || (calc.isResult ? lastFullExpression : "")}
        display={formattedDisplay}
        memory={calc.memory}
        runningTotal={calc.runningTotal}
        style={displayStyle}
        history={basicHistory}
        onSwipeDelete={() => handleButtonPress("⌫")}
        onSaveFavorite={() => {
          if (expression || display !== "0") {
            addFavorite(expression || display, display, "basic");
          }
        }}
        onEditExpression={
          calc.isResult && lastFullExpression
            ? () => calc.loadExpression(lastFullExpression)
            : undefined
        }
        isFavorite={isFavorite(expression || display, display)}
        livePreview={livePreview}
        onUndo={calc.undo}
        onRedo={calc.redo}
        canUndo={calc.canUndo}
        canRedo={calc.canRedo}
      />

      {/* Local slider — only scales this keypad's number size. Drag right
          to enlarge, left to shrink (never below a safe minimum). This is
          separate from Settings > Button Size, which affects the whole app. */}
      <div className="flex items-center gap-2 px-1 mb-1.5">
        <span className="text-[10px] text-muted-foreground shrink-0">A</span>
        <input
          type="range"
          min={70}
          max={130}
          value={keyScale}
          onChange={(e) => setKeyScale(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary"
          aria-label="Keypad number size"
        />
        <span className="text-sm text-muted-foreground shrink-0">A</span>
      </div>

      <div
        className="grid grid-cols-4 gap-1 flex-1 min-h-0"
        style={{ gridTemplateRows: "repeat(5, 1fr)", ["--key-scale" as string]: keyScale / 100 }}
      >
        <CalculatorButton
          label="AC"
          value="AC"
          type="function"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="+/-"
          value="+/-"
          type="function"
          onPress={handleButtonPress}
        />
        {settings.showPercent ? (
          <CalculatorButton
            label="%"
            value="%"
            type="function"
            onPress={handleButtonPress}
          />
        ) : (
          <CalculatorButton
            label="C"
            value="C"
            type="function"
            onPress={handleButtonPress}
          />
        )}
        <CalculatorButton
          label="÷"
          value="÷"
          type="operator"
          onPress={handleButtonPress}
        />

        <CalculatorButton
          label="7"
          value="7"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="8"
          value="8"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="9"
          value="9"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="×"
          value="×"
          type="operator"
          onPress={handleButtonPress}
        />

        <CalculatorButton
          label="4"
          value="4"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="5"
          value="5"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="6"
          value="6"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="-"
          value="-"
          type="operator"
          onPress={handleButtonPress}
        />

        <CalculatorButton
          label="1"
          value="1"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="2"
          value="2"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="3"
          value="3"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="+"
          value="+"
          type="operator"
          onPress={handleButtonPress}
        />

        <CalculatorButton
          label="⌫"
          value="⌫"
          type="function"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="0"
          value="0"
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="."
          value="."
          type="digit"
          onPress={handleButtonPress}
        />
        <CalculatorButton
          label="="
          value="="
          type="equals"
          onPress={handleButtonPress}
        />
      </div>
    </div>
  );
}
