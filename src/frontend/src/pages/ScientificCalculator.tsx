import { useCallback, useEffect, useState } from "react";
import { CalculatorButton } from "../components/CalculatorButton";
import { CalculatorDisplay } from "../components/CalculatorDisplay";
import { useCalculatorContext } from "../context/CalculatorContext";
import { useThumbLayerSettingsContext } from "../context/ThumbLayerSettingsContext";
import { useCalculator } from "../hooks/useCalculator";
import { useSettings } from "../hooks/useSettings";
import { getContrastColor } from "../lib/contrastColor";

export default function ScientificCalculator() {
  const calc = useCalculator();
  const { addHistory, settings: calcSettings } = useCalculatorContext();
  const { settings: thumbSettings } = useThumbLayerSettingsContext();
  const { settings } = useSettings();

  const [display, setDisplay] = useState(calc.display);
  const [expression, setExpression] = useState(calc.expression);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">(
    calcSettings.angleUnit,
  );

  useEffect(() => {
    setDisplay(calc.display);
    setExpression(calc.expression);
  }, [calc.display, calc.expression]);

  const handleButtonPress = useCallback(
    (value: string) => {
      if (settings.hapticFeedback) {
        try {
          navigator.vibrate?.(20);
        } catch {}
      }
      calc.pressButton(value, angleMode);
      if (value === "=" && calc.display !== "Error") {
        addHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          expression: `${expression} =`,
          result: calc.display,
          timestamp: new Date().toISOString(),
          mode: "scientific",
        });
      }
    },
    [calc, expression, settings.hapticFeedback, addHistory, angleMode],
  );

  const contrastText = getContrastColor(thumbSettings.display.backgroundColor);
  const displayStyle: React.CSSProperties = {
    backgroundColor: thumbSettings.display.backgroundColor,
    border: `2px solid ${thumbSettings.display.outlineColor}`,
    ["--display-text" as string]: contrastText,
    ["--display-expr" as string]: `${contrastText}b3`,
  };

  const scientificButtons = [
    ["sin", "sin"],
    ["cos", "cos"],
    ["tan", "tan"],
    ["π", "π"],
    ["sin⁻¹", "sin⁻¹"],
    ["cos⁻¹", "cos⁻¹"],
    ["tan⁻¹", "tan⁻¹"],
    ["e", "e"],
    ["√", "√"],
    ["x²", "x²"],
    ["x³", "x³"],
    ["xʸ", "^"],
    ["log", "log"],
    ["ln", "ln"],
    ["1/x", "1/x"],
    ["|x|", "|x|"],
    ["n!", "n!"],
    ["10^x", "10^x"],
    ["e^x", "e^x"],
    ["(", "("],
    [")", ")"],
  ];

  return (
    <div className="w-full h-full flex-1 flex flex-col">
      {/* Angle mode toggle */}
      <div className="flex items-center justify-end mb-2 px-1">
        <div className="inline-flex rounded-lg border-2 border-border overflow-hidden bg-background">
          <button
            type="button"
            onClick={() => setAngleMode("deg")}
            className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
              angleMode === "deg"
                ? "bg-accent text-accent-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="scientific.angle_deg.button"
          >
            DEG
          </button>
          <div className="w-px bg-border" />
          <button
            type="button"
            onClick={() => setAngleMode("rad")}
            className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
              angleMode === "rad"
                ? "bg-accent text-accent-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="scientific.angle_rad.button"
          >
            RAD
          </button>
        </div>
      </div>

      <CalculatorDisplay
        expression={expression}
        display={display}
        memory={calc.memory}
        runningTotal={calc.runningTotal}
        style={displayStyle}
      />

      {/* Scientific function buttons */}
      <div className="grid grid-cols-5 gap-1 mb-1.5">
        {scientificButtons.map(([label, value]) => (
          <CalculatorButton
            key={`${label}-${value}`}
            label={label}
            value={value}
            type="function"
            onPress={handleButtonPress}
            compact
          />
        ))}
      </div>

      {/* Memory row + Backspace (merged into one compact row) */}
      <div className="grid grid-cols-6 gap-1 mb-1.5">
        {(settings.showMemory
          ? [
              ["MC", "MC"],
              ["MR", "MR"],
              ["MS", "MS"],
              ["M+", "M+"],
              ["M-", "M-"],
              ["⌫", "⌫"],
            ]
          : [["⌫", "⌫"]]
        ).map(([label, value]) => (
          <CalculatorButton
            key={`${label}-${value}`}
            label={label}
            value={value}
            type="function"
            onPress={handleButtonPress}
            compact
            extraClass={!settings.showMemory ? "col-span-6" : ""}
          />
        ))}
      </div>

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-1.5">
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
          label="0"
          value="0"
          type="digit"
          onPress={handleButtonPress}
          span2
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
