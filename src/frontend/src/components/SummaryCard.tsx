import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  PiggyBank,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMonthSummary } from "../hooks/useQueries";

interface SummaryCardProps {
  year: number;
  month: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface StatTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "positive" | "negative";
  delay?: number;
}

function StatTile({
  label,
  value,
  icon,
  variant = "default",
  delay = 0,
}: StatTileProps) {
  const variantClasses = {
    default: "bg-card border-border",
    positive: "summary-card-positive border",
    negative: "summary-card-negative border",
  };

  const valueClasses = {
    default: "text-foreground",
    positive: "text-success",
    negative: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-xl p-4 border ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <div
          className={`p-1.5 rounded-lg ${
            variant === "positive"
              ? "bg-success/10 text-success"
              : variant === "negative"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted/50 text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`font-mono text-xl font-bold tracking-tight ${valueClasses[variant]}`}
      >
        {value}
      </p>
    </motion.div>
  );
}

export function SummaryCard({ year, month }: SummaryCardProps) {
  const { data: summary, isLoading } = useMonthSummary(year, month);

  const salary = summary?.salary ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const totalGrocery = summary?.totalGrocerySpend ?? 0;
  const savings = summary?.savings ?? 0;
  const isPositive = savings >= 0;

  if (isLoading) {
    return (
      <div
        data-ocid="summary.card"
        className="bg-card border border-border rounded-xl p-5"
        data-testid="summary-loading"
      >
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-muted/30 p-4">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      data-ocid="summary.card"
      className="bg-card border border-border rounded-xl p-5 shadow-card"
      aria-label="Monthly summary"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-display text-base font-bold text-foreground">
          Monthly Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Salary"
          value={formatCurrency(salary)}
          icon={<DollarSign className="h-3.5 w-3.5" />}
          delay={0}
        />
        <StatTile
          label="Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<Receipt className="h-3.5 w-3.5" />}
          delay={0.05}
        />
        <StatTile
          label="Grocery"
          value={formatCurrency(totalGrocery)}
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          delay={0.1}
        />
        <StatTile
          label="Savings"
          value={formatCurrency(savings)}
          icon={
            isPositive ? (
              <PiggyBank className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )
          }
          variant={
            savings !== 0 ? (isPositive ? "positive" : "negative") : "default"
          }
          delay={0.15}
        />
      </div>

      {savings < 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          <TrendingDown className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive font-medium">
            You're spending more than you earn this month.
          </p>
        </motion.div>
      )}

      {savings > 0 && salary > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2"
        >
          <TrendingUp className="h-3.5 w-3.5 text-success flex-shrink-0" />
          <p className="text-xs text-success font-medium">
            You're saving {((savings / salary) * 100).toFixed(1)}% of your
            income this month.
          </p>
        </motion.div>
      )}
    </section>
  );
}
