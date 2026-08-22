import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Droplets, Flame, Heart } from "lucide-react";
import { useState } from "react";

type SubTab = "bmi" | "bmr" | "bodyfat" | "water" | "calories";

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
}

interface BmrResult {
  bmr: number;
  tdee: number;
}

function calculateBMI(weight: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  let category = "";
  let color = "";
  if (bmi < 18.5) {
    category = "Underweight";
    color = "text-blue-500";
  } else if (bmi < 25) {
    category = "Normal";
    color = "text-green-500";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "text-amber-500";
  } else {
    category = "Obese";
    color = "text-red-500";
  }
  return { bmi: Number(bmi.toFixed(1)), category, color };
}

function calculateBMR(
  weight: number,
  heightCm: number,
  age: number,
  gender: "male" | "female",
): BmrResult {
  let bmr: number;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * heightCm - 4.33 * age;
  }
  return { bmr: Math.round(bmr), tdee: Math.round(bmr * 1.2) };
}

function calculateBodyFat(
  bmi: number,
  age: number,
  gender: "male" | "female",
): number {
  const factor = gender === "male" ? 1 : 0;
  const bodyFat = 1.2 * bmi + 0.23 * age - 10.8 * factor - 5.4;
  return Number(Math.max(2, bodyFat).toFixed(1));
}

function calculateWaterIntake(
  weight: number,
  activity: "low" | "moderate" | "high",
): number {
  const base = weight * 0.033;
  const multipliers = { low: 1, moderate: 1.2, high: 1.5 };
  return Number((base * multipliers[activity]).toFixed(1));
}

function calculateCalories(
  weight: number,
  heightCm: number,
  age: number,
  gender: "male" | "female",
  activity: string,
): number {
  const bmr = calculateBMR(weight, heightCm, age, gender).bmr;
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.2));
}

export default function HealthCalculator() {
  const [subTab, setSubTab] = useState<SubTab>("bmi");

  // BMI
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);

  // BMR
  const [bmrWeight, setBmrWeight] = useState("");
  const [bmrHeight, setBmrHeight] = useState("");
  const [bmrAge, setBmrAge] = useState("");
  const [bmrGender, setBmrGender] = useState<"male" | "female">("male");
  const [bmrResult, setBmrResult] = useState<BmrResult | null>(null);

  // Body Fat
  const [bfWeight, setBfWeight] = useState("");
  const [bfHeight, setBfHeight] = useState("");
  const [bfAge, setBfAge] = useState("");
  const [bfGender, setBfGender] = useState<"male" | "female">("male");
  const [bfResult, setBfResult] = useState<number | null>(null);

  // Water
  const [waterWeight, setWaterWeight] = useState("");
  const [waterActivity, setWaterActivity] = useState<
    "low" | "moderate" | "high"
  >("moderate");
  const [waterResult, setWaterResult] = useState<number | null>(null);

  // Calories
  const [calWeight, setCalWeight] = useState("");
  const [calHeight, setCalHeight] = useState("");
  const [calAge, setCalAge] = useState("");
  const [calGender, setCalGender] = useState<"male" | "female">("male");
  const [calActivity, setCalActivity] = useState("moderate");
  const [calResult, setCalResult] = useState<number | null>(null);

  const tabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: "bmi", label: "BMI", icon: Heart },
    { id: "bmr", label: "BMR", icon: Activity },
    { id: "bodyfat", label: "Body Fat", icon: Activity },
    { id: "water", label: "Water", icon: Droplets },
    { id: "calories", label: "Calories", icon: Flame },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Heart className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Health</h3>
          <p className="text-xs text-muted-foreground">
            BMI, BMR, body fat, water, calories
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`health.tab.${t.id}`}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* BMI */}
      {subTab === "bmi" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                placeholder="70"
                data-ocid="health.bmi.weight.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                placeholder="175"
                data-ocid="health.bmi.height.input"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const w = Number.parseFloat(bmiWeight);
              const h = Number.parseFloat(bmiHeight);
              if (w > 0 && h > 0) setBmiResult(calculateBMI(w, h));
            }}
            className="w-full"
            data-ocid="health.bmi.button"
          >
            Calculate BMI
          </Button>
          {bmiResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="health.bmi.result"
            >
              <p className="text-3xl font-bold text-foreground">
                {bmiResult.bmi}
              </p>
              <p className={`text-sm font-medium mt-1 ${bmiResult.color}`}>
                {bmiResult.category}
              </p>
            </div>
          )}
        </div>
      )}

      {/* BMR */}
      {subTab === "bmr" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={bmrWeight}
                onChange={(e) => setBmrWeight(e.target.value)}
                placeholder="70"
                data-ocid="health.bmr.weight.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={bmrHeight}
                onChange={(e) => setBmrHeight(e.target.value)}
                placeholder="175"
                data-ocid="health.bmr.height.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                value={bmrAge}
                onChange={(e) => setBmrAge(e.target.value)}
                placeholder="30"
                data-ocid="health.bmr.age.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender</Label>
              <select
                value={bmrGender}
                onChange={(e) =>
                  setBmrGender(e.target.value as "male" | "female")
                }
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                data-ocid="health.bmr.gender.select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const w = Number.parseFloat(bmrWeight);
              const h = Number.parseFloat(bmrHeight);
              const a = Number.parseInt(bmrAge);
              if (w > 0 && h > 0 && a > 0)
                setBmrResult(calculateBMR(w, h, a, bmrGender));
            }}
            className="w-full"
            data-ocid="health.bmr.button"
          >
            Calculate BMR
          </Button>
          {bmrResult && (
            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2"
              data-ocid="health.bmr.result"
            >
              <div className="tool-result-row">
                <span className="tool-result-label">BMR</span>
                <span className="tool-result-value">
                  {bmrResult.bmr} kcal/day
                </span>
              </div>
              <div className="tool-result-row">
                <span className="tool-result-label">TDEE (sedentary)</span>
                <span className="tool-result-value">
                  {bmrResult.tdee} kcal/day
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body Fat */}
      {subTab === "bodyfat" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={bfWeight}
                onChange={(e) => setBfWeight(e.target.value)}
                placeholder="70"
                data-ocid="health.bf.weight.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={bfHeight}
                onChange={(e) => setBfHeight(e.target.value)}
                placeholder="175"
                data-ocid="health.bf.height.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                value={bfAge}
                onChange={(e) => setBfAge(e.target.value)}
                placeholder="30"
                data-ocid="health.bf.age.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender</Label>
              <select
                value={bfGender}
                onChange={(e) =>
                  setBfGender(e.target.value as "male" | "female")
                }
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                data-ocid="health.bf.gender.select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const w = Number.parseFloat(bfWeight);
              const h = Number.parseFloat(bfHeight);
              const a = Number.parseInt(bfAge);
              if (w > 0 && h > 0 && a > 0) {
                const bmi = w / (h / 100) ** 2;
                setBfResult(calculateBodyFat(bmi, a, bfGender));
              }
            }}
            className="w-full"
            data-ocid="health.bf.button"
          >
            Calculate Body Fat
          </Button>
          {bfResult !== null && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="health.bf.result"
            >
              <p className="text-3xl font-bold text-foreground">{bfResult}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Body Fat Percentage
              </p>
            </div>
          )}
        </div>
      )}

      {/* Water */}
      {subTab === "water" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Weight (kg)</Label>
            <Input
              type="number"
              value={waterWeight}
              onChange={(e) => setWaterWeight(e.target.value)}
              placeholder="70"
              data-ocid="health.water.weight.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Activity Level</Label>
            <select
              value={waterActivity}
              onChange={(e) =>
                setWaterActivity(e.target.value as typeof waterActivity)
              }
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
              data-ocid="health.water.activity.select"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button
            type="button"
            onClick={() => {
              const w = Number.parseFloat(waterWeight);
              if (w > 0) setWaterResult(calculateWaterIntake(w, waterActivity));
            }}
            className="w-full"
            data-ocid="health.water.button"
          >
            Calculate Water Intake
          </Button>
          {waterResult !== null && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="health.water.result"
            >
              <p className="text-3xl font-bold text-foreground">
                {waterResult} L
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Daily Water Intake
              </p>
            </div>
          )}
        </div>
      )}

      {/* Calories */}
      {subTab === "calories" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Weight (kg)</Label>
              <Input
                type="number"
                value={calWeight}
                onChange={(e) => setCalWeight(e.target.value)}
                placeholder="70"
                data-ocid="health.cal.weight.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height (cm)</Label>
              <Input
                type="number"
                value={calHeight}
                onChange={(e) => setCalHeight(e.target.value)}
                placeholder="175"
                data-ocid="health.cal.height.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                value={calAge}
                onChange={(e) => setCalAge(e.target.value)}
                placeholder="30"
                data-ocid="health.cal.age.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender</Label>
              <select
                value={calGender}
                onChange={(e) =>
                  setCalGender(e.target.value as "male" | "female")
                }
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                data-ocid="health.cal.gender.select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Activity Level</Label>
            <select
              value={calActivity}
              onChange={(e) => setCalActivity(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
              data-ocid="health.cal.activity.select"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
          <Button
            type="button"
            onClick={() => {
              const w = Number.parseFloat(calWeight);
              const h = Number.parseFloat(calHeight);
              const a = Number.parseInt(calAge);
              if (w > 0 && h > 0 && a > 0)
                setCalResult(
                  calculateCalories(w, h, a, calGender, calActivity),
                );
            }}
            className="w-full"
            data-ocid="health.cal.button"
          >
            Calculate Calories
          </Button>
          {calResult !== null && (
            <div
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-ocid="health.cal.result"
            >
              <p className="text-3xl font-bold text-foreground">{calResult}</p>
              <p className="text-xs text-muted-foreground mt-1">kcal/day</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
