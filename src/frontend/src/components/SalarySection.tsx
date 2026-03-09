import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, DollarSign, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useIsActorReady, useSalary, useSetSalary } from "../hooks/useQueries";

interface SalarySectionProps {
  year: number;
  month: number;
}

export function SalarySection({ year, month }: SalarySectionProps) {
  const { data: salary, isLoading } = useSalary(year, month);
  const setSalaryMutation = useSetSalary(year, month);
  const isActorReady = useIsActorReady();

  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync input with fetched value
  useEffect(() => {
    if (salary !== undefined && salary !== null) {
      setInputValue(salary > 0 ? String(salary) : "");
    }
  }, [salary]);

  const handleSave = async () => {
    const parsed = Number.parseFloat(inputValue);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Please enter a valid salary amount.");
      return;
    }

    try {
      await setSalaryMutation.mutateAsync(parsed);
      setSaved(true);
      toast.success("Salary saved successfully.");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save salary. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <section className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-primary/10">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-display text-base font-bold text-foreground">
          Monthly Salary
        </h2>
      </div>

      {!isActorReady && !isLoading ? (
        <div className="space-y-2" data-ocid="salary.loading_state">
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Connecting to backend…
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="salary-input"
              className="text-xs text-muted-foreground font-medium"
            >
              Gross salary for this month
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                  $
                </span>
                <Input
                  id="salary-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  data-ocid="salary.input"
                  className="pl-7 font-mono bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={!isActorReady || setSalaryMutation.isPending || saved}
                data-ocid="salary.save_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium min-w-[80px]"
              >
                <AnimatePresence mode="wait">
                  {setSalaryMutation.isPending ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving
                    </motion.span>
                  ) : saved ? (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Save
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {salary !== undefined && salary > 0 && (
            <p className="text-xs text-muted-foreground">
              Current:{" "}
              <span className="text-foreground font-mono font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(salary)}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
