import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Percent, Receipt, Tag, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { DiscountCalculator } from "../components/AdvancedTools/DiscountCalculator";
import { GstCalculator } from "../components/AdvancedTools/GstCalculator";
import { PercentageCalculator } from "../components/AdvancedTools/PercentageCalculator";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export default function FinanceCalculator() {
  return (
    <div className="w-full">
      <Tabs defaultValue="emi" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto gap-1 p-1">
          <TabsTrigger value="emi" className="text-xs flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            EMI
          </TabsTrigger>
          <TabsTrigger
            value="compound"
            className="text-xs flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Compound
          </TabsTrigger>
          <TabsTrigger
            value="investment"
            className="text-xs flex items-center gap-1"
          >
            <Landmark className="h-3 w-3" />
            Return
          </TabsTrigger>
        </TabsList>
        <TabsList className="w-full grid grid-cols-3 h-auto gap-1 p-1 mt-1">
          <TabsTrigger value="gst" className="text-xs flex items-center gap-1">
            <Receipt className="h-3 w-3" />
            GST
          </TabsTrigger>
          <TabsTrigger
            value="discount"
            className="text-xs flex items-center gap-1"
          >
            <Tag className="h-3 w-3" />
            Discount
          </TabsTrigger>
          <TabsTrigger
            value="percentage"
            className="text-xs flex items-center gap-1"
          >
            <Percent className="h-3 w-3" />
            Percent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emi" className="mt-4">
          <EmiCalculator />
        </TabsContent>
        <TabsContent value="compound" className="mt-4">
          <CompoundInterestCalculator />
        </TabsContent>
        <TabsContent value="investment" className="mt-4">
          <InvestmentReturnCalculator />
        </TabsContent>
        <TabsContent value="gst" className="mt-4">
          <GstCalculator />
        </TabsContent>
        <TabsContent value="discount" className="mt-4">
          <DiscountCalculator />
        </TabsContent>
        <TabsContent value="percentage" className="mt-4">
          <PercentageCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmiCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8.5");
  const [tenure, setTenure] = useState("5");
  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalAmount: number;
  } | null>(null);

  const calculate = () => {
    const p = Number.parseFloat(principal);
    const r = Number.parseFloat(rate) / 100 / 12;
    const n = Number.parseFloat(tenure) * 12;

    if (!p || !r || !n) return;

    const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    setResult({
      emi: Number.parseFloat(emi.toFixed(2)),
      totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
      totalAmount: Number.parseFloat(totalAmount.toFixed(2)),
    });
  };

  return (
    <div className="tool-form">
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Principal Amount (₹)</Label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1"
            data-ocid="finance.emi.principal.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">
            Interest Rate (% per year)
          </Label>
          <Input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1"
            data-ocid="finance.emi.rate.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Tenure (Years)</Label>
          <Input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            className="mt-1"
            data-ocid="finance.emi.tenure.input"
          />
        </div>
        <Button
          type="button"
          onClick={calculate}
          className="w-full"
          data-ocid="finance.emi.calculate.button"
        >
          Calculate EMI
        </Button>
      </div>

      {result && (
        <div className="tool-result-panel mt-4 space-y-2">
          <div className="tool-result-row">
            <span className="tool-result-label">Monthly EMI</span>
            <span className="tool-result-value text-primary">
              {formatCurrency(result.emi)}
            </span>
          </div>
          <div className="tool-result-row">
            <span className="tool-result-label">Total Interest</span>
            <span className="tool-result-value">
              {formatCurrency(result.totalInterest)}
            </span>
          </div>
          <div className="tool-result-row">
            <span className="tool-result-label">Total Amount</span>
            <span className="tool-result-value">
              {formatCurrency(result.totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [time, setTime] = useState("10");
  const [frequency, setFrequency] = useState("12");
  const [result, setResult] = useState<{
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  const calculate = () => {
    const p = Number.parseFloat(principal);
    const r = Number.parseFloat(rate) / 100;
    const t = Number.parseFloat(time);
    const n = Number.parseFloat(frequency);

    if (!p || !r || !t || !n) return;

    const amount = p * (1 + r / n) ** (n * t);
    const interest = amount - p;

    setResult({
      totalAmount: Number.parseFloat(amount.toFixed(2)),
      totalInterest: Number.parseFloat(interest.toFixed(2)),
    });
  };

  return (
    <div className="tool-form">
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Principal Amount (₹)</Label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1"
            data-ocid="finance.compound.principal.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">
            Annual Interest Rate (%)
          </Label>
          <Input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1"
            data-ocid="finance.compound.rate.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Time (Years)</Label>
          <Input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1"
            data-ocid="finance.compound.time.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Compounding Frequency</Label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
            data-ocid="finance.compound.frequency.select"
          >
            <option value="1">Yearly</option>
            <option value="2">Half-Yearly</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        </div>
        <Button
          type="button"
          onClick={calculate}
          className="w-full"
          data-ocid="finance.compound.calculate.button"
        >
          Calculate
        </Button>
      </div>

      {result && (
        <div className="tool-result-panel mt-4 space-y-2">
          <div className="tool-result-row">
            <span className="tool-result-label">Total Amount</span>
            <span className="tool-result-value text-primary">
              {formatCurrency(result.totalAmount)}
            </span>
          </div>
          <div className="tool-result-row">
            <span className="tool-result-label">Total Interest</span>
            <span className="tool-result-value">
              {formatCurrency(result.totalInterest)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function InvestmentReturnCalculator() {
  const [initial, setInitial] = useState("50000");
  const [final, setFinal] = useState("75000");
  const [result, setResult] = useState<{
    absoluteReturn: number;
    percentageReturn: number;
  } | null>(null);

  const calculate = () => {
    const init = Number.parseFloat(initial);
    const fin = Number.parseFloat(final);

    if (!init || !fin) return;

    const absoluteReturn = fin - init;
    const percentageReturn = (absoluteReturn / init) * 100;

    setResult({
      absoluteReturn: Number.parseFloat(absoluteReturn.toFixed(2)),
      percentageReturn: Number.parseFloat(percentageReturn.toFixed(2)),
    });
  };

  return (
    <div className="tool-form">
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Initial Investment (₹)</Label>
          <Input
            type="number"
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            className="mt-1"
            data-ocid="finance.investment.initial.input"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Final Value (₹)</Label>
          <Input
            type="number"
            value={final}
            onChange={(e) => setFinal(e.target.value)}
            className="mt-1"
            data-ocid="finance.investment.final.input"
          />
        </div>
        <Button
          type="button"
          onClick={calculate}
          className="w-full"
          data-ocid="finance.investment.calculate.button"
        >
          Calculate Return
        </Button>
      </div>

      {result && (
        <div className="tool-result-panel mt-4 space-y-2">
          <div className="tool-result-row">
            <span className="tool-result-label">Absolute Return</span>
            <span
              className={`tool-result-value ${result.absoluteReturn >= 0 ? "text-success" : "text-destructive"}`}
            >
              {formatCurrency(result.absoluteReturn)}
            </span>
          </div>
          <div className="tool-result-row">
            <span className="tool-result-label">Percentage Return</span>
            <span
              className={`tool-result-value ${result.percentageReturn >= 0 ? "text-success" : "text-destructive"}`}
            >
              {formatNumber(result.percentageReturn)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
