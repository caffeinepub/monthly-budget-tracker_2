import { Toaster } from "@/components/ui/sonner";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { ExpensesSection } from "./components/ExpensesSection";
import { GrocerySection } from "./components/GrocerySection";
import { MonthNavigator } from "./components/MonthNavigator";
import { SalarySection } from "./components/SalarySection";
import { SummaryCard } from "./components/SummaryCard";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header border-b border-border/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-none">
              Monthly Budget Tracker
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your finances with clarity
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Month Navigator */}
        <MonthNavigator
          monthLabel={monthLabel}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {/* Summary */}
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <SummaryCard year={year} month={month} />
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in-up stagger-2 opacity-0 space-y-6">
            <SalarySection year={year} month={month} />
            <ExpensesSection year={year} month={month} />
          </div>
          <div className="animate-fade-in-up stagger-3 opacity-0">
            <GrocerySection year={year} month={month} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-destructive">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.028 255)",
            border: "1px solid oklch(0.26 0.03 255)",
            color: "oklch(0.93 0.01 240)",
          },
        }}
      />
    </div>
  );
}

export default App;
