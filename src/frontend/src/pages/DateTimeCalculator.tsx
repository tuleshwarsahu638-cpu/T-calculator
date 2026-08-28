import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";

interface DateResult {
  days: number;
  weeks: number;
  months: number;
  years: number;
  totalDays: number;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  nextBirthday: string;
  daysUntilBirthday: number;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function diffDates(start: Date, end: Date): DateResult {
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += daysInMonth(end.getFullYear(), end.getMonth());
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    days: Math.abs(days),
    weeks: Math.floor(Math.abs(totalDays) / 7),
    months: Math.abs(months),
    years: Math.abs(years),
    totalDays: Math.abs(totalDays),
  };
}

function calculateAge(birthDate: Date): AgeResult {
  const today = new Date();
  const diff = diffDates(birthDate, today);

  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysUntil = Math.floor(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    years: diff.years,
    months: diff.months,
    days: diff.days,
    nextBirthday: nextBirthday.toLocaleDateString(),
    daysUntilBirthday: daysUntil,
  };
}

function addToDate(
  date: Date,
  amount: number,
  unit: "days" | "weeks" | "months" | "years",
): Date {
  const result = new Date(date);
  switch (unit) {
    case "days":
      result.setDate(result.getDate() + amount);
      break;
    case "weeks":
      result.setDate(result.getDate() + amount * 7);
      break;
    case "months":
      result.setMonth(result.getMonth() + amount);
      break;
    case "years":
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  return result;
}

type SubTab = "diff" | "age" | "add";

export default function DateTimeCalculator() {
  const [subTab, setSubTab] = useState<SubTab>("diff");

  // Date difference
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [diffResult, setDiffResult] = useState<DateResult | null>(null);

  // Age
  const [birthDate, setBirthDate] = useState("");
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);

  // Add/subtract
  const [baseDate, setBaseDate] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<"days" | "weeks" | "months" | "years">(
    "days",
  );
  const [addResult, setAddResult] = useState<string | null>(null);

  const calculateDiff = () => {
    if (!startDate || !endDate) return;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return;
    setDiffResult(diffDates(s, e));
  };

  const calculateAgeFn = () => {
    if (!birthDate) return;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return;
    setAgeResult(calculateAge(d));
  };

  const calculateAdd = () => {
    if (!baseDate || !amount) return;
    const d = new Date(baseDate);
    const amt = Number.parseInt(amount);
    if (Number.isNaN(d.getTime()) || Number.isNaN(amt)) return;
    const result = addToDate(d, amt, unit);
    setAddResult(result.toLocaleDateString());
  };

  const tabs: { id: SubTab; label: string }[] = [
    { id: "diff", label: "Date Diff" },
    { id: "age", label: "Age" },
    { id: "add", label: "Add/Sub" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Date & Time</h3>
          <p className="text-xs text-muted-foreground">
            Calculate dates, ages, and intervals
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              subTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`datetime.tab.${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Difference */}
      {subTab === "diff" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-ocid="datetime.start_date.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-ocid="datetime.end_date.input"
            />
          </div>
          <Button
            type="button"
            onClick={calculateDiff}
            className="w-full"
            data-ocid="datetime.diff.button"
          >
            <Clock className="h-4 w-4 mr-2" />
            Calculate Difference
          </Button>

          {diffResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2"
              data-ocid="datetime.diff.result"
            >
              <div className="tool-result-row">
                <span className="tool-result-label">Total Days</span>
                <span className="tool-result-value">
                  {diffResult.totalDays.toLocaleString()}
                </span>
              </div>
              <div className="tool-result-row">
                <span className="tool-result-label">Weeks</span>
                <span className="tool-result-value">{diffResult.weeks}</span>
              </div>
              <div className="tool-result-row">
                <span className="tool-result-label">Months</span>
                <span className="tool-result-value">{diffResult.months}</span>
              </div>
              <div className="tool-result-row">
                <span className="tool-result-label">Years</span>
                <span className="tool-result-value">{diffResult.years}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground text-center">
                {diffResult.years}y {diffResult.months}m {diffResult.days}d
              </div>
            </div>
          )}
        </div>
      )}

      {/* Age Calculator */}
      {subTab === "age" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Birth Date</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              data-ocid="datetime.birth_date.input"
            />
          </div>
          <Button
            type="button"
            onClick={calculateAgeFn}
            className="w-full"
            data-ocid="datetime.age.button"
          >
            Calculate Age
          </Button>

          {ageResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2"
              data-ocid="datetime.age.result"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">
                    {ageResult.years}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Years</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">
                    {ageResult.months}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Months</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">
                    {ageResult.days}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Days</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <div className="tool-result-row">
                  <span className="tool-result-label">Next Birthday</span>
                  <span className="tool-result-value">
                    {ageResult.nextBirthday}
                  </span>
                </div>
                <div className="tool-result-row">
                  <span className="tool-result-label">Days Until</span>
                  <span className="tool-result-value">
                    {ageResult.daysUntilBirthday} days
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Subtract */}
      {subTab === "add" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Base Date</Label>
            <Input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              data-ocid="datetime.base_date.input"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 30"
                data-ocid="datetime.amount.input"
              />
            </div>
            <div className="w-28 space-y-2">
              <Label className="text-xs">Unit</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as typeof unit)}
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                data-ocid="datetime.unit.select"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            onClick={calculateAdd}
            className="w-full"
            data-ocid="datetime.add.button"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Calculate
          </Button>

          {addResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="datetime.add.result"
            >
              <p className="text-xs text-muted-foreground">Result Date</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {addResult}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
