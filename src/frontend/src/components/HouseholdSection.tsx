import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Minus, Plus, Trash2 } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import {
  useDecrementHouseholdItem,
  useDeleteHouseholdItem,
  useHouseholdItems,
  useIncrementHouseholdItem,
} from "../hooks/useQueries";

function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type HouseholdItem = {
  name: string;
  quantity: bigint | number;
};

function groupItemsByCategory(
  items: HouseholdItem[],
  getCategoryForItem: (name: string) => string | undefined,
): Map<string, HouseholdItem[]> {
  const groups = new Map<string, HouseholdItem[]>();

  for (const item of items) {
    const cat = getCategoryForItem(item.name) ?? "Uncategorized";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(item);
  }

  // Sort items within each group alphabetically
  for (const [, groupItems] of groups) {
    groupItems.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Sort groups: named categories alphabetically, Uncategorized last
  const sortedGroups = new Map<string, HouseholdItem[]>();
  const sortedKeys = [...groups.keys()]
    .filter((k) => k !== "Uncategorized")
    .sort();
  if (groups.has("Uncategorized")) sortedKeys.push("Uncategorized");

  for (const key of sortedKeys) {
    sortedGroups.set(key, groups.get(key)!);
  }

  return sortedGroups;
}

export function HouseholdSection() {
  const { data: items, isLoading } = useHouseholdItems();
  const decrement = useDecrementHouseholdItem();
  const increment = useIncrementHouseholdItem();
  const deleteItem = useDeleteHouseholdItem();
  const { getCategoryForItem } = useCategories();

  const allItems = items ?? [];
  const grouped = groupItemsByCategory(allItems, getCategoryForItem);

  // flat list for index tracking across groups
  const flatItems = [...grouped.values()].flat();

  if (isLoading) {
    return (
      <Card data-ocid="household.loading_state">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Home className="w-4 h-4 text-primary" />
            Household Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-12 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!allItems.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Home className="w-4 h-4 text-primary" />
            Household Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-ocid="household.empty_state"
            className="flex flex-col items-center justify-center py-10 text-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Home className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              No household items yet. Add groceries to build your inventory.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Home className="w-4 h-4 text-primary" />
          Household Items
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {allItems.length} item{allItems.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...grouped.entries()].map(([category, groupItems]) => (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </span>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground/60">
                  {groupItems.length}
                </span>
              </div>

              {/* Items in group */}
              <ul className="space-y-2">
                {groupItems.map((item) => {
                  const idx = flatItems.findIndex((f) => f.name === item.name);
                  const ocidIndex = idx + 1;
                  const qty = Number(item.quantity);
                  const isEmpty = qty === 0;
                  return (
                    <li
                      key={item.name}
                      data-ocid={`household.item.${ocidIndex}`}
                      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                        isEmpty
                          ? "border-red-500/40 bg-red-500/10"
                          : "border-border/50 bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isEmpty
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {capitalize(item.name)}
                        </span>
                        {isEmpty && (
                          <span className="text-xs text-red-400 font-medium">
                            Finished
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          data-ocid={`household.decrement_button.${ocidIndex}`}
                          disabled={decrement.isPending || isEmpty}
                          onClick={() => decrement.mutate(item.name)}
                          aria-label={`Remove one ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span
                          className={`min-w-[2.5rem] text-center text-sm font-bold ${
                            isEmpty ? "text-red-400" : "text-primary"
                          }`}
                        >
                          {qty}x
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          data-ocid={`household.increment_button.${ocidIndex}`}
                          disabled={increment.isPending}
                          onClick={() => increment.mutate(item.name)}
                          aria-label={`Add one ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          data-ocid={`household.delete_button.${ocidIndex}`}
                          disabled={deleteItem.isPending}
                          onClick={() => deleteItem.mutate(item.name)}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
