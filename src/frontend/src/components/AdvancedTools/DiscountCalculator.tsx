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

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [result, setResult] = useState<{
    discounted: number;
    savings: number;
    final: number;
  } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const price = Number.parseFloat(originalPrice);
    const disc = Number.parseFloat(discount);
    const taxRate = tax ? Number.parseFloat(tax) : 0;

    if (
      Number.isNaN(price) ||
      Number.isNaN(disc) ||
      price <= 0 ||
      disc < 0 ||
      disc > 100
    ) {
      setError("Please enter valid values (discount 0-100%)");
      setResult(null);
      return;
    }

    if (!Number.isNaN(taxRate) && (taxRate < 0 || taxRate > 100)) {
      setError("Tax rate must be between 0-100%");
      setResult(null);
      return;
    }

    const savings = (price * disc) / 100;
    const discounted = price - savings;
    const final = discounted + (discounted * taxRate) / 100;

    setResult({ discounted, savings, final });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount Calculator</CardTitle>
        <CardDescription>Calculate final price after discount</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price</Label>
          <Input
            id="originalPrice"
            type="number"
            placeholder="1000"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            id="discount"
            type="number"
            placeholder="20"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax">Tax (%) - Optional</Label>
          <Input
            id="tax"
            type="number"
            placeholder="0"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Calculate
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Savings:</span>
              <span className="text-sm text-green-600">
                -₹{result.savings.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Discounted Price:</span>
              <span className="text-sm">₹{result.discounted.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                Final Price (with tax):
              </span>
              <span className="text-sm font-bold">
                ₹{result.final.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
