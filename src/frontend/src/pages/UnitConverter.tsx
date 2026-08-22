import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRightLeft,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Ruler,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CurrencyConverter } from "../components/AdvancedTools/CurrencyConverter";
import { type PickerUnit, UnitPickerDialog } from "../components/UnitPickerDialog";
import { useConversionHistory } from "../hooks/useConversionHistory";
import { useUnitFavorites } from "../hooks/useUnitFavorites";

interface UnitCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  // factor = how many of the category's SI/base unit one of this unit equals
  // (e.g. for Length with base = meter, "km" has factor 1000)
  units: { id: string; label: string; factor: number }[];
}

// Every category below runs largest-practical-unit → smallest-practical-unit,
// so users always find both the "big" and "small" version of a measurement.
// Only units with a fixed, universally-agreed conversion are included —
// regional/informal measures without one fixed definition (e.g. "bigha",
// "seer") are intentionally left out rather than guessed.
const CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Length",
    icon: Ruler,
    units: [
      { id: "ly", label: "Light Year", factor: 9.4607e15 },
      { id: "km", label: "Kilometer (km)", factor: 1000 },
      { id: "mi", label: "Mile", factor: 1609.344 },
      { id: "nmi", label: "Nautical Mile", factor: 1852 },
      { id: "furlong", label: "Furlong", factor: 201.168 },
      { id: "hm", label: "Hectometer (hm)", factor: 100 },
      { id: "dam", label: "Decameter (dam)", factor: 10 },
      { id: "yd", label: "Yard", factor: 0.9144 },
      { id: "m", label: "Meter (m)", factor: 1 },
      { id: "ft", label: "Foot", factor: 0.3048 },
      { id: "in", label: "Inch", factor: 0.0254 },
      { id: "dm", label: "Decimeter (dm)", factor: 0.1 },
      { id: "cm", label: "Centimeter (cm)", factor: 0.01 },
      { id: "mm", label: "Millimeter (mm)", factor: 0.001 },
      { id: "um", label: "Micrometer (µm)", factor: 0.000001 },
      { id: "nm", label: "Nanometer (nm)", factor: 1e-9 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    icon: Ruler,
    units: [
      { id: "t", label: "Metric Ton", factor: 1000000 },
      { id: "q", label: "Quintal", factor: 100000 },
      { id: "kg", label: "Kilogram (kg)", factor: 1000 },
      { id: "st", label: "Stone", factor: 6350.29 },
      { id: "lb", label: "Pound (lb)", factor: 453.592 },
      { id: "pav", label: "पाव / Pav (250 g)", factor: 250 },
      { id: "oz", label: "Ounce (oz)", factor: 28.3495 },
      { id: "hg", label: "Hectogram (hg)", factor: 100 },
      { id: "tola", label: "Tola", factor: 11.6638 },
      { id: "g", label: "Gram (g)", factor: 1 },
      { id: "carat", label: "Carat", factor: 0.2 },
      { id: "grain", label: "Grain", factor: 0.0647989 },
      { id: "dg", label: "Decigram (dg)", factor: 0.1 },
      { id: "cg", label: "Centigram (cg)", factor: 0.01 },
      { id: "mg", label: "Milligram (mg)", factor: 0.001 },
      { id: "ug", label: "Microgram (µg)", factor: 0.000001 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    icon: Ruler,
    units: [
      { id: "c", label: "Celsius (°C)", factor: 1 },
      { id: "f", label: "Fahrenheit (°F)", factor: 1 },
      { id: "k", label: "Kelvin (K)", factor: 1 },
      { id: "r", label: "Rankine (°R)", factor: 1 },
    ],
  },
  {
    id: "area",
    label: "Area",
    icon: Ruler,
    units: [
      { id: "km2", label: "Square Kilometer (km²)", factor: 1000000 },
      { id: "mi2", label: "Square Mile", factor: 2589988.11 },
      { id: "ha", label: "Hectare", factor: 10000 },
      { id: "ac", label: "Acre", factor: 4046.86 },
      { id: "yd2", label: "Square Yard", factor: 0.836127 },
      { id: "m2", label: "Square Meter (m²)", factor: 1 },
      { id: "ft2", label: "Square Foot", factor: 0.092903 },
      { id: "in2", label: "Square Inch", factor: 0.00064516 },
      { id: "cm2", label: "Square Centimeter (cm²)", factor: 0.0001 },
      { id: "mm2", label: "Square Millimeter (mm²)", factor: 0.000001 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    icon: Ruler,
    units: [
      { id: "m3", label: "Cubic Meter (m³)", factor: 1000 },
      { id: "kl", label: "Kilolitre", factor: 1000 },
      { id: "bbl", label: "Barrel (oil)", factor: 158.987 },
      { id: "gal_uk", label: "Gallon (UK)", factor: 4.54609 },
      { id: "gal", label: "Gallon (US)", factor: 3.78541 },
      { id: "l", label: "Litre (L)", factor: 1 },
      { id: "qt", label: "Quart (US)", factor: 0.946353 },
      { id: "pt", label: "Pint (US)", factor: 0.473176 },
      { id: "cup", label: "Cup", factor: 0.236588 },
      { id: "dl", label: "Decilitre (dL)", factor: 0.1 },
      { id: "fl_oz", label: "Fluid Ounce", factor: 0.0295735 },
      { id: "cl", label: "Centilitre (cL)", factor: 0.01 },
      { id: "tbsp", label: "Tablespoon", factor: 0.0147868 },
      { id: "tsp", label: "Teaspoon", factor: 0.00492892 },
      { id: "ml", label: "Millilitre (mL)", factor: 0.001 },
      { id: "cm3", label: "Cubic Centimeter (cc / cm³)", factor: 0.001 },
      { id: "ul", label: "Microlitre (µL)", factor: 0.000001 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    icon: Ruler,
    units: [
      { id: "mach", label: "Mach (sea level)", factor: 343 },
      { id: "kph", label: "km/h", factor: 0.277778 },
      { id: "mph", label: "mph", factor: 0.44704 },
      { id: "knot", label: "Knot", factor: 0.514444 },
      { id: "mps", label: "m/s", factor: 1 },
      { id: "fps", label: "ft/s", factor: 0.3048 },
    ],
  },
  {
    id: "time",
    label: "Time",
    icon: Ruler,
    units: [
      { id: "century", label: "Century", factor: 3153600000 },
      { id: "decade", label: "Decade", factor: 315360000 },
      { id: "y", label: "Year", factor: 31536000 },
      { id: "mo", label: "Month (avg)", factor: 2629800 },
      { id: "wk", label: "Week", factor: 604800 },
      { id: "d", label: "Day", factor: 86400 },
      { id: "h", label: "Hour", factor: 3600 },
      { id: "min", label: "Minute", factor: 60 },
      { id: "s", label: "Second", factor: 1 },
      { id: "ms", label: "Millisecond (ms)", factor: 0.001 },
      { id: "us", label: "Microsecond (µs)", factor: 0.000001 },
      { id: "ns", label: "Nanosecond (ns)", factor: 1e-9 },
    ],
  },
  {
    id: "data",
    label: "Data",
    icon: Ruler,
    units: [
      { id: "pb", label: "Petabyte (PB)", factor: 1125899906842624 },
      { id: "tb", label: "Terabyte (TB)", factor: 1099511627776 },
      { id: "gb", label: "Gigabyte (GB)", factor: 1073741824 },
      { id: "mb", label: "Megabyte (MB)", factor: 1048576 },
      { id: "kb", label: "Kilobyte (KB)", factor: 1024 },
      { id: "b", label: "Byte (B)", factor: 1 },
      { id: "bit", label: "Bit", factor: 0.125 },
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    icon: Ruler,
    units: [
      { id: "atm", label: "Atmosphere (atm)", factor: 101325 },
      { id: "bar", label: "Bar", factor: 100000 },
      { id: "psi", label: "PSI", factor: 6894.76 },
      { id: "mpa", label: "Megapascal (MPa)", factor: 1000000 },
      { id: "kpa", label: "Kilopascal (kPa)", factor: 1000 },
      { id: "inhg", label: "Inch of Mercury (inHg)", factor: 3386.39 },
      { id: "mmhg", label: "mmHg (Torr)", factor: 133.322 },
      { id: "mbar", label: "Millibar", factor: 100 },
      { id: "pa", label: "Pascal (Pa)", factor: 1 },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    icon: Ruler,
    units: [
      { id: "kwh", label: "Kilowatt-hour (kWh)", factor: 3600000 },
      { id: "mj", label: "Megajoule (MJ)", factor: 1000000 },
      { id: "btu", label: "BTU", factor: 1055.06 },
      { id: "kcal", label: "Kilocalorie (kcal)", factor: 4184 },
      { id: "wh", label: "Watt-hour (Wh)", factor: 3600 },
      { id: "kj", label: "Kilojoule (kJ)", factor: 1000 },
      { id: "cal", label: "Calorie (cal)", factor: 4.184 },
      { id: "j", label: "Joule (J)", factor: 1 },
      { id: "erg", label: "Erg", factor: 1e-7 },
      { id: "ev", label: "Electron-volt (eV)", factor: 1.602e-19 },
    ],
  },
  {
    id: "power",
    label: "Power",
    icon: Ruler,
    units: [
      { id: "gw", label: "Gigawatt (GW)", factor: 1000000000 },
      { id: "mw", label: "Megawatt (MW)", factor: 1000000 },
      { id: "hp", label: "Horsepower (hp)", factor: 745.7 },
      { id: "ps", label: "Metric Horsepower (PS)", factor: 735.49875 },
      { id: "kw", label: "Kilowatt (kW)", factor: 1000 },
      { id: "w", label: "Watt (W)", factor: 1 },
      { id: "js", label: "Joule per second (J/s)", factor: 1 },
      { id: "btuh", label: "BTU per hour (BTU/h)", factor: 0.29307107 },
      { id: "kcalh", label: "Kilocalorie per hour (kcal/h)", factor: 1.163 },
      { id: "ftlbs", label: "Foot-pound per second (ft·lbf/s)", factor: 1.355818 },
      { id: "mwatt", label: "Milliwatt (mW)", factor: 0.001 },
      { id: "uw", label: "Microwatt (µW)", factor: 0.000001 },
      { id: "nw", label: "Nanowatt (nW)", factor: 1e-9 },
      { id: "pw", label: "Picowatt (pW)", factor: 1e-12 },
      { id: "ergs", label: "Erg per second (erg/s)", factor: 1e-7 },
    ],
  },
];

// Smart Unit Recognition — reads free text like "5 kg to lb" or "10km in miles"
// and figures out the category + both units + the value, so the user
// doesn't have to manually pick a category and two units every time.
interface SmartParseResult {
  categoryId: string;
  fromUnit: string;
  toUnit: string;
  value: number;
}

function smartParseUnitQuery(raw: string): SmartParseResult | null {
  const text = raw.trim().toLowerCase();
  const valueMatch = text.match(/-?\d+(\.\d+)?/);
  if (!valueMatch) return null;
  const value = Number.parseFloat(valueMatch[0]);

  // Split around a connector word ("to"/"in"/"->") if present, otherwise
  // just look for any two distinct unit mentions in the whole string.
  const parts = text.split(/\s+(?:to|in|as|into|->)\s+/);
  const beforeText = parts[0] || text;
  const afterText = parts[1] || "";

  const findUnit = (segment: string) => {
    for (const cat of CATEGORIES) {
      for (const u of cat.units) {
        const idPattern = new RegExp(`\\b${u.id}\\b`, "i");
        const shortLabel = u.label.split(" ")[0].toLowerCase().replace(/[()]/g, "");
        const labelPattern = new RegExp(`\\b${shortLabel}\\b`, "i");
        if (idPattern.test(segment) || labelPattern.test(segment)) {
          return { categoryId: cat.id, unitId: u.id };
        }
      }
    }
    return null;
  };

  const fromMatch = findUnit(beforeText);
  const toMatch = afterText ? findUnit(afterText) : findUnit(beforeText.slice(valueMatch.index! + valueMatch[0].length));

  if (!fromMatch || !toMatch || fromMatch.categoryId !== toMatch.categoryId) {
    return null;
  }

  return {
    categoryId: fromMatch.categoryId,
    fromUnit: fromMatch.unitId,
    toUnit: toMatch.unitId,
    value,
  };
}

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;

  let celsius = value;
  if (from === "f") celsius = (value - 32) * (5 / 9);
  if (from === "k") celsius = value - 273.15;
  if (from === "r") celsius = (value - 491.67) * (5 / 9);

  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  if (to === "k") return celsius + 273.15;
  if (to === "r") return (celsius + 273.15) * (9 / 5);

  return celsius;
}

function UnitConverterCore() {
  const [activeCategory, setActiveCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [inputValue, setInputValue] = useState("1");
  const [pickerOpen, setPickerOpen] = useState<"from" | "to" | null>(null);
  const [smartQuery, setSmartQuery] = useState("");
  const [smartError, setSmartError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { favorites, isFavorite, toggleFavorite } = useUnitFavorites();
  const { items: historyItems, addEntry: addHistoryEntry, clearHistory: clearConversionHistory } = useConversionHistory();
  const [showConvHistory, setShowConvHistory] = useState(false);

  const QUICK_VALUES = ["1", "5", "10", "100"];

  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0],
    [activeCategory],
  );

  const pickerUnits: PickerUnit[] = useMemo(
    () => category.units.map((u) => ({ id: u.id, label: u.label })),
    [category],
  );

  const fromLabel = category.units.find((u) => u.id === fromUnit)?.label ?? fromUnit;
  const toLabel = category.units.find((u) => u.id === toUnit)?.label ?? toUnit;

  const result = useMemo(() => {
    const val = Number.parseFloat(inputValue);
    if (Number.isNaN(val)) return "0";

    if (activeCategory === "temperature") {
      return convertTemperature(val, fromUnit, toUnit).toFixed(4).replace(/\.?0+$/, "");
    }

    const fromFactor =
      category.units.find((u) => u.id === fromUnit)?.factor || 1;
    const toFactor = category.units.find((u) => u.id === toUnit)?.factor || 1;
    const baseValue = val * fromFactor;
    const converted = baseValue / toFactor;

    // Very large/small results (e.g. light-years, electron-volts) need
    // scientific-ish precision rather than getting rounded away to 0.
    if (Math.abs(converted) > 0 && (Math.abs(converted) < 0.000001 || Math.abs(converted) >= 1e15)) {
      return converted.toExponential(4);
    }
    return converted.toFixed(8).replace(/\.?0+$/, "");
  }, [inputValue, fromUnit, toUnit, category, activeCategory]);

  useEffect(() => {
    const val = Number.parseFloat(inputValue);
    if (Number.isNaN(val) || !inputValue.trim()) return;
    const timer = setTimeout(() => {
      addHistoryEntry({
        category: activeCategory,
        fromLabel,
        toLabel,
        inputValue,
        result,
      });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setFromUnit(cat.units[0].id);
      setToUnit(cat.units[1]?.id || cat.units[0].id);
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleSmartSearch = () => {
    if (!smartQuery.trim()) return;
    const parsed = smartParseUnitQuery(smartQuery);
    if (!parsed) {
      setSmartError(true);
      return;
    }
    setSmartError(false);
    setActiveCategory(parsed.categoryId);
    setFromUnit(parsed.fromUnit);
    setToUnit(parsed.toUnit);
    setInputValue(String(parsed.value));
  };

  const applyFavorite = (fav: (typeof favorites)[number]) => {
    setActiveCategory(fav.category);
    setFromUnit(fav.fromUnit);
    setToUnit(fav.toUnit);
  };

  const handleCopyResult = () => {
    navigator.clipboard
      ?.writeText(result)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Smart Unit Recognition */}
      <div className="space-y-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={smartQuery}
            onChange={(e) => {
              setSmartQuery(e.target.value);
              setSmartError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSmartSearch()}
            placeholder='Try "5 kg to lb" or "10 km in miles"'
            className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-16 text-sm"
            data-ocid="converter.smart.input"
          />
          <button
            type="button"
            onClick={handleSmartSearch}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
          >
            Go
          </button>
        </div>
        {smartError && (
          <p className="text-[11px] text-destructive px-1">
            Samajh nahi aaya — neeche se category/unit manually select karein.
          </p>
        )}
      </div>

      {/* Favorites + History toggle */}
      <div className="flex items-center justify-between gap-2">
        {favorites.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
            {favorites.map((fav) => (
              <button
                type="button"
                key={fav.id}
                onClick={() => applyFavorite(fav)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-medium whitespace-nowrap"
              >
                <Star className="h-3 w-3 fill-current" />
                {fav.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => setShowConvHistory((v) => !v)}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium"
        >
          <Clock className="h-3 w-3" />
          {showConvHistory ? "Back" : "History"}
        </button>
      </div>

      {showConvHistory ? (
        <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Conversions
            </h3>
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={clearConversionHistory}
                className="text-[11px] text-destructive"
              >
                Clear
              </button>
            )}
          </div>
          {historyItems.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Abhi tak koi conversion nahi hui.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {historyItems.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => {
                    setActiveCategory(h.category);
                    setFromUnit(
                      category.units.find((u) => u.label === h.fromLabel)?.id ||
                        CATEGORIES.find((c) => c.id === h.category)?.units[0].id ||
                        fromUnit,
                    );
                    setInputValue(h.inputValue);
                    setShowConvHistory(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-xs"
                >
                  <span className="font-medium text-foreground">
                    {h.inputValue} {h.fromLabel.split(" ")[0]}
                  </span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-medium text-foreground">
                    {h.result} {h.toLabel.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Category selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`converter.category.${cat.id}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px]">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conversion area */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">From</Label>
            <button
              type="button"
              onClick={() =>
                toggleFavorite({
                  category: activeCategory,
                  fromUnit,
                  toUnit,
                  label: `${fromLabel.split(" ")[0]} → ${toLabel.split(" ")[0]}`,
                })
              }
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-amber-500"
              aria-label="Toggle favorite"
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  isFavorite(activeCategory, fromUnit, toUnit)
                    ? "fill-amber-500 text-amber-500"
                    : ""
                }`}
              />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
              data-ocid="converter.from.input"
            />
            <button
              type="button"
              onClick={() => setPickerOpen("from")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[130px] flex items-center justify-between gap-1"
              data-ocid="converter.from.select"
            >
              <span className="truncate">{fromLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>
          {/* Quick value chips */}
          <div className="flex gap-1.5">
            {QUICK_VALUES.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setInputValue(v)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  inputValue === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapUnits}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            data-ocid="converter.swap.button"
          >
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">To</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={result}
              readOnly
              className="flex-1 h-9 rounded-md border border-input bg-muted px-3 text-sm"
              data-ocid="converter.to.input"
            />
            <button
              type="button"
              onClick={handleCopyResult}
              className="h-9 w-9 shrink-0 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Copy result"
              data-ocid="converter.copy.button"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen("to")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[110px] flex items-center justify-between gap-1"
              data-ocid="converter.to.select"
            >
              <span className="truncate">{toLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      <UnitPickerDialog
        open={pickerOpen === "from"}
        onOpenChange={(v) => setPickerOpen(v ? "from" : null)}
        units={pickerUnits}
        selectedId={fromUnit}
        onSelect={setFromUnit}
        title={`${category.label} — From Unit`}
      />
      <UnitPickerDialog
        open={pickerOpen === "to"}
        onOpenChange={(v) => setPickerOpen(v ? "to" : null)}
        units={pickerUnits}
        selectedId={toUnit}
        onSelect={setToUnit}
        title={`${category.label} — To Unit`}
      />
    </div>
  );
}

export default function UnitConverter() {
  return (
    <div className="w-full">
      <Tabs defaultValue="unit" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="unit" className="flex-1 gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> Unit
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex-1 gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Currency
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unit" className="mt-4">
          <UnitConverterCore />
        </TabsContent>
        <TabsContent value="currency" className="mt-4">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
