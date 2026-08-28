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
import { useState } from "react";

export function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [rate, setRate] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    const amt = Number.parseFloat(amount);
    const exchangeRate = Number.parseFloat(rate);

    if (
      Number.isNaN(amt) ||
      Number.isNaN(exchangeRate) ||
      amt < 0 ||
      exchangeRate <= 0
    ) {
      setError("Please enter valid numbers");
      setResult(null);
      return;
    }

    setResult(amt * exchangeRate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>
          Convert between currencies (manual rate)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              placeholder="USD"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              placeholder="INR"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">
            Exchange Rate (1 {fromCurrency} = ? {toCurrency})
          </Label>
          <Input
            id="rate"
            type="number"
            placeholder="83.5"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <Button onClick={convert} className="w-full">
          Convert
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result !== null && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {amount} {fromCurrency} =
            </p>
            <p className="text-2xl font-bold">
              {result.toFixed(2)} {toCurrency}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
