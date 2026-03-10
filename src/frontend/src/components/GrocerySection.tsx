import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Clock,
  Loader2,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { GroceryItem } from "../backend.d";
import {
  useAddGroceryItem,
  useDeleteGroceryItem,
  useGroceryItems,
  useIsActorReady,
} from "../hooks/useQueries";

interface GrocerySectionProps {
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

interface GroceryItemRowProps {
  item: GroceryItem;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function GroceryItemRow({
  item,
  index,
  onDelete,
  isDeleting,
}: GroceryItemRowProps) {
  const ocidIndex = index + 1;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ duration: 0.2 }}
      data-ocid={`grocery.item.${ocidIndex}`}
      className="flex flex-col py-2.5 px-3 rounded-lg bg-muted/20 border border-border/40 hover:border-border/70 transition-colors group gap-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1.5 h-1.5 rounded-full bg-chart-1 flex-shrink-0" />
          <span className="text-sm text-foreground font-medium truncate">
            {item.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="font-mono text-sm text-foreground font-semibold">
            {formatCurrency(item.price)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            data-ocid={`grocery.delete_button.${ocidIndex}`}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
            aria-label={`Delete grocery item: ${item.name}`}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      {item.duration && (
        <div className="flex items-center gap-1 pl-3.5">
          <Clock className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
          <span className="text-xs text-muted-foreground italic truncate">
            {item.duration}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function GrocerySection({ year, month }: GrocerySectionProps) {
  const { data: groceryItems, isLoading } = useGroceryItems(year, month);
  const addGroceryMutation = useAddGroceryItem(year, month);
  const deleteGroceryMutation = useDeleteGroceryItem(year, month);
  const isActorReady = useIsActorReady();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmedName = name.trim();
    const parsedPrice = Number.parseFloat(price);
    const trimmedDuration = duration.trim();

    if (!trimmedName) {
      toast.error("Please enter an item name.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const id = crypto.randomUUID();
      await addGroceryMutation.mutateAsync({
        id,
        name: trimmedName,
        price: parsedPrice,
        duration: trimmedDuration,
      });
      setName("");
      setPrice("");
      setDuration("");
      toast.success(`"${trimmedName}" added to grocery list.`);
    } catch {
      toast.error("Failed to add grocery item. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteGroceryMutation.mutateAsync(id);
      toast.success("Item removed from grocery list.");
    } catch {
      toast.error("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const totalSpend =
    groceryItems?.reduce((sum, item) => sum + item.price, 0) ?? 0;

  return (
    <section className="bg-card border border-border rounded-xl p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 rounded bg-chart-1/10">
          <ShoppingCart className="h-4 w-4 text-chart-1" />
        </div>
        <h2 className="font-display text-base font-bold text-foreground">
          Grocery List
        </h2>
        {groceryItems && groceryItems.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {formatCurrency(totalSpend)}
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-muted/40 rounded-full px-2 py-0.5">
              {groceryItems.length}
            </span>
          </div>
        )}
      </div>

      {/* Add form */}
      <div className="space-y-2 mb-4 p-3 bg-muted/20 rounded-lg border border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Item</Label>
            <Input
              placeholder="e.g., Whole milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="grocery.name_input"
              className="h-8 text-sm border-border/60 focus:border-primary/60"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Price</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                $
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                data-ocid="grocery.price_input"
                className="h-8 pl-6 text-sm font-mono border-border/60 focus:border-primary/60"
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            How long did it last?{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            placeholder="e.g., lasted 3 days, finished in a week"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onKeyDown={handleKeyDown}
            data-ocid="grocery.duration_input"
            className="h-8 text-sm border-border/60 focus:border-primary/60"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!isActorReady || addGroceryMutation.isPending}
          data-ocid="grocery.add_button"
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-8"
        >
          {addGroceryMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add Grocery Item
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2" data-ocid="grocery.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : groceryItems && groceryItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-1.5">
              {groceryItems.map((item, index) => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="grocery.empty_state"
            className="text-center py-8 text-muted-foreground"
          >
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No grocery items yet.</p>
            <p className="text-xs mt-1 opacity-70">
              Add items and note how long they lasted.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
