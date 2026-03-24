import { useCallback, useEffect, useState } from "react";

const CATEGORIES_KEY = "budgetCategories";
const ITEM_CATEGORY_MAP_KEY = "budgetItemCategoryMap";

const DEFAULT_CATEGORIES = [
  "Kitchen",
  "Toiletries",
  "Cleaning",
  "Food",
  "Other",
];

function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATEGORIES;
}

function loadItemCategoryMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ITEM_CATEGORY_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(loadCategories);
  const [itemCategoryMap, setItemCategoryMap] =
    useState<Record<string, string>>(loadItemCategoryMap);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(
      ITEM_CATEGORY_MAP_KEY,
      JSON.stringify(itemCategoryMap),
    );
  }, [itemCategoryMap]);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  }, []);

  const getCategoryForItem = useCallback(
    (itemName: string): string | undefined => {
      return itemCategoryMap[itemName.toLowerCase().trim()];
    },
    [itemCategoryMap],
  );

  const setCategoryForItem = useCallback(
    (itemName: string, category: string) => {
      const key = itemName.toLowerCase().trim();
      setItemCategoryMap((prev) => ({ ...prev, [key]: category }));
    },
    [],
  );

  return {
    categories,
    addCategory,
    removeCategory,
    getCategoryForItem,
    setCategoryForItem,
  };
}
