import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type ConversionType = "length" | "mass" | "temperature";

const conversions = {
  length: {
    "m-km": 0.001,
    "km-m": 1000,
    "m-cm": 100,
    "cm-m": 0.01,
    "m-ft": 3.28084,
    "ft-m": 0.3048,
  },
  mass: {
    "kg-g": 1000,
    "g-kg": 0.001,
    "kg-lb": 2.20462,
    "lb-kg": 0.453592,
  },
  temperature: {
    "c-f": (c: number) => (c * 9) / 5 + 32,
    "f-c": (f: number) => ((f - 32) * 5) / 9,
    "c-k": (c: number) => c + 273.15,
    "k-c": (k: number) => k - 273.15,
  },
};

export function UnitConverter() {
  const [type, setType] = useState<ConversionType>("length");
  const [value, setValue] = useState("");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    const val = Number.parseFloat(value);

    if (Number.isNaN(val)) {
      setError("Please enter a valid number");
      setResult(null);
      return;
    }

    const key = `${from}-${to}` as keyof typeof conversions.length;

    if (type === "temperature") {
      const tempConversions = conversions.temperature as any;
      const conversionFn = tempConversions[key];
      if (conversionFn) {
        setResult(conversionFn(val));
      } else {
        setError("Invalid conversion");
        setResult(null);
      }
    } else {
      const typeConversions = conversions[type] as any;
      const factor = typeConversions[key];
      if (factor) {
        setResult(val * factor);
      } else {
        setError("Invalid conversion");
        setResult(null);
      }
    }
  };

  const getUnits = () => {
    if (type === "length") return ["m", "km", "cm", "ft"];
    if (type === "mass") return ["kg", "g", "lb"];
    return ["c", "f", "k"];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
        <CardDescription>Convert between different units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Conversion Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as ConversionType)}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="mass">Mass</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            placeholder="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger id="from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getUnits().map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger id="to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getUnits().map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={convert} className="w-full">
          Convert
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result !== null && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold">
              {result.toFixed(4)} {to}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
