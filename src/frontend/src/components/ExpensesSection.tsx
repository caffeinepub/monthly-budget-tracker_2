import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Plus, Receipt, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Expense } from "../backend.d";
import {
  useAddExpense,
  useDeleteExpense,
  useExpenses,
  useIsActorReady,
} from "../hooks/useQueries";

interface ExpensesSectionProps {
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

interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ExpenseItem({
  expense,
  index,
  onDelete,
  isDeleting,
}: ExpenseItemProps) {
  const ocidIndex = index + 1;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ duration: 0.2 }}
      data-ocid={`expense.item.${ocidIndex}`}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/40 hover:border-border/70 transition-colors group"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-1.5 h-1.5 rounded-full bg-chart-2 flex-shrink-0" />
        <span className="text-sm text-foreground font-medium truncate">
          {expense.name}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="font-mono text-sm text-foreground font-semibold">
          {formatCurrency(expense.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          data-ocid={`expense.delete_button.${ocidIndex}`}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`Delete expense: ${expense.name}`}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export function ExpensesSection({ year, month }: ExpensesSectionProps) {
  const { data: expenses, isLoading } = useExpenses(year, month);
  const addExpenseMutation = useAddExpense(year, month);
  const deleteExpenseMutation = useDeleteExpense(year, month);
  const isActorReady = useIsActorReady();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmedName = name.trim();
    const parsedAmount = Number.parseFloat(amount);

    if (!trimmedName) {
      toast.error("Please enter an expense name.");
      return;
    }
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      const id = crypto.randomUUID();
      await addExpenseMutation.mutateAsync({
        id,
        name: trimmedName,
        amount: parsedAmount,
      });
      setName("");
      setAmount("");
      toast.success(`"${trimmedName}" added.`);
    } catch {
      toast.error("Failed to add expense. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExpenseMutation.mutateAsync(id);
      toast.success("Expense removed.");
    } catch {
      toast.error("Failed to delete expense.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <section className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-chart-2/10">
          <Receipt className="h-4 w-4 text-chart-2" />
        </div>
        <h2 className="font-display text-base font-bold text-foreground">
          Expenses
        </h2>
        {expenses && expenses.length > 0 && (
          <span className="ml-auto text-xs font-mono text-muted-foreground bg-muted/40 rounded-full px-2 py-0.5">
            {expenses.length}
          </span>
        )}
      </div>

      {/* Add form */}
      <div className="space-y-2 mb-4 p-3 bg-muted/20 rounded-lg border border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              placeholder="e.g., Netflix subscription"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="expense.name_input"
              className="h-8 text-sm border-border/60 focus:border-primary/60"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Amount</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                $
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                data-ocid="expense.amount_input"
                className="h-8 pl-6 text-sm font-mono border-border/60 focus:border-primary/60"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!isActorReady || addExpenseMutation.isPending}
          data-ocid="expense.add_button"
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-8"
        >
          {addExpenseMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add Expense
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="expense.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : expenses && expenses.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-1.5">
            {expenses.map((expense, index) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                index={index}
                onDelete={handleDelete}
                isDeleting={deletingId === expense.id}
              />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="expense.empty_state"
          className="text-center py-8 text-muted-foreground"
        >
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No expenses recorded yet.</p>
          <p className="text-xs mt-1 opacity-70">
            Add your first expense above.
          </p>
        </motion.div>
      )}
    </section>
  );
}
