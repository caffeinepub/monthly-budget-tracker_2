import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Expense, GroceryItem, MonthSummary } from "../backend.d";
import { useActor } from "./useActor";

// ── Query keys ────────────────────────────────────────────
export const queryKeys = {
  summary: (year: number, month: number) => ["summary", year, month],
  expenses: (year: number, month: number) => ["expenses", year, month],
  groceryItems: (year: number, month: number) => ["groceryItems", year, month],
  salary: (year: number, month: number) => ["salary", year, month],
};

// ── Actor Ready ───────────────────────────────────────────
export function useIsActorReady() {
  const { actor, isFetching } = useActor();
  return !!actor && !isFetching;
}

// ── Month Summary ─────────────────────────────────────────
export function useMonthSummary(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery<MonthSummary | null>({
    queryKey: queryKeys.summary(year, month),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMonthSummary(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Salary ────────────────────────────────────────────────
export function useSalary(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: queryKeys.salary(year, month),
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getSalary(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSalary(year: number, month: number) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (salary: number) => {
      if (!actor) throw new Error("No actor");
      return actor.setSalary(BigInt(year), BigInt(month), salary);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salary(year, month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary(year, month),
      });
    },
  });
}

// ── Expenses ──────────────────────────────────────────────
export function useExpenses(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: queryKeys.expenses(year, month),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenses(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExpense(year: number, month: number) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      amount,
    }: {
      id: string;
      name: string;
      amount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addExpense(BigInt(year), BigInt(month), id, name, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses(year, month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary(year, month),
      });
    },
  });
}

export function useDeleteExpense(year: number, month: number) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteExpense(BigInt(year), BigInt(month), id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses(year, month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary(year, month),
      });
    },
  });
}

// ── Grocery Items ─────────────────────────────────────────
export function useGroceryItems(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery<GroceryItem[]>({
    queryKey: queryKeys.groceryItems(year, month),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroceryItems(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGroceryItem(year: number, month: number) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      price,
      duration,
    }: {
      id: string;
      name: string;
      price: number;
      duration: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addGroceryItem(
        BigInt(year),
        BigInt(month),
        id,
        name,
        price,
        duration,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groceryItems(year, month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary(year, month),
      });
    },
  });
}

export function useDeleteGroceryItem(year: number, month: number) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGroceryItem(BigInt(year), BigInt(month), id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groceryItems(year, month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary(year, month),
      });
    },
  });
}
