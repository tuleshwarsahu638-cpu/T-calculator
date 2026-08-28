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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function GstCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("18");
  const [type, setType] = useState<"exclusive" | "inclusive">("exclusive");
  const [result, setResult] = useState<{
    tax: number;
    net: number;
    gross: number;
  } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const amt = Number.parseFloat(amount);
    const gstRate = Number.parseFloat(rate);

    if (Number.isNaN(amt) || Number.isNaN(gstRate) || amt <= 0 || gstRate < 0) {
      setError("Please enter valid positive numbers");
      setResult(null);
      return;
    }

    let tax: number;
    let net: number;
    let gross: number;

    if (type === "exclusive") {
      net = amt;
      tax = (amt * gstRate) / 100;
      gross = amt + tax;
    } else {
      gross = amt;
      net = amt / (1 + gstRate / 100);
      tax = amt - net;
    }

    setResult({ tax, net, gross });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GST Calculator</CardTitle>
        <CardDescription>Calculate GST/Tax amount</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>GST Type</Label>
          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as "exclusive" | "inclusive")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exclusive" id="exclusive" />
              <Label htmlFor="exclusive" className="font-normal">
                Exclusive (add GST)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inclusive" id="inclusive" />
              <Label htmlFor="inclusive" className="font-normal">
                Inclusive (remove GST)
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">GST Rate (%)</Label>
          <Input
            id="rate"
            type="number"
            placeholder="18"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Calculate GST
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Net Amount:</span>
              <span className="text-sm">₹{result.net.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">GST Amount:</span>
              <span className="text-sm font-bold">
                ₹{result.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Gross Amount:</span>
              <span className="text-sm">₹{result.gross.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
