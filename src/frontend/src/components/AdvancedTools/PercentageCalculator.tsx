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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function PercentageCalculator() {
  // Mode 1: what is X% of Y
  const [pctA, setPctA] = useState("");
  const [pctB, setPctB] = useState("");
  const [pctResult, setPctResult] = useState<number | null>(null);

  // Mode 2: X is what % of Y
  const [ofA, setOfA] = useState("");
  const [ofB, setOfB] = useState("");
  const [ofResult, setOfResult] = useState<number | null>(null);

  // Mode 3: % change from X to Y
  const [chgA, setChgA] = useState("");
  const [chgB, setChgB] = useState("");
  const [chgResult, setChgResult] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Percentage Calculator</CardTitle>
        <CardDescription>
          Quick percentage calculations — three common types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="of" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="of" className="text-xs flex-1">
              X% of Y
            </TabsTrigger>
            <TabsTrigger value="isWhat" className="text-xs flex-1">
              X is % of Y
            </TabsTrigger>
            <TabsTrigger value="change" className="text-xs flex-1">
              % Change
            </TabsTrigger>
          </TabsList>

          <TabsContent value="of" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                placeholder="20"
                value={pctA}
                onChange={(e) => setPctA(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Of value</Label>
              <Input
                type="number"
                placeholder="500"
                value={pctB}
                onChange={(e) => setPctB(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const a = Number.parseFloat(pctA);
                const b = Number.parseFloat(pctB);
                setPctResult(Number.isNaN(a) || Number.isNaN(b) ? null : (a * b) / 100);
              }}
            >
              Calculate
            </Button>
            {pctResult !== null && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <span className="text-sm text-muted-foreground">
                  {pctA}% of {pctB} =
                </span>
                <p className="text-xl font-bold">{pctResult}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="isWhat" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="number"
                placeholder="150"
                value={ofA}
                onChange={(e) => setOfA(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Of total</Label>
              <Input
                type="number"
                placeholder="500"
                value={ofB}
                onChange={(e) => setOfB(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const a = Number.parseFloat(ofA);
                const b = Number.parseFloat(ofB);
                setOfResult(Number.isNaN(a) || Number.isNaN(b) || b === 0 ? null : (a / b) * 100);
              }}
            >
              Calculate
            </Button>
            {ofResult !== null && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <span className="text-sm text-muted-foreground">
                  {ofA} is what % of {ofB} =
                </span>
                <p className="text-xl font-bold">{ofResult.toFixed(2)}%</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="change" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>From value</Label>
              <Input
                type="number"
                placeholder="100"
                value={chgA}
                onChange={(e) => setChgA(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To value</Label>
              <Input
                type="number"
                placeholder="125"
                value={chgB}
                onChange={(e) => setChgB(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const a = Number.parseFloat(chgA);
                const b = Number.parseFloat(chgB);
                setChgResult(Number.isNaN(a) || Number.isNaN(b) || a === 0 ? null : ((b - a) / a) * 100);
              }}
            >
              Calculate
            </Button>
            {chgResult !== null && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <span className="text-sm text-muted-foreground">
                  Change from {chgA} to {chgB} =
                </span>
                <p
                  className={`text-xl font-bold ${chgResult >= 0 ? "text-green-600" : "text-destructive"}`}
                >
                  {chgResult >= 0 ? "+" : ""}
                  {chgResult.toFixed(2)}%
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
