import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MonthSummary {
    salary: number;
    expenses: Array<Expense>;
    totalExpenses: number;
    totalGrocerySpend: number;
    groceryItems: Array<GroceryItem>;
    savings: number;
}
export interface HouseholdItem {
    name: string;
    quantity: bigint;
}
export interface GroceryItem {
    id: string;
    duration: string;
    name: string;
    price: number;
}
export interface Expense {
    id: string;
    name: string;
    amount: number;
}
export interface backendInterface {
    addExpense(year: bigint, month: bigint, id: string, name: string, amount: number): Promise<void>;
    addGroceryItem(year: bigint, month: bigint, id: string, name: string, price: number, duration: string): Promise<void>;
    decrementHouseholdItem(name: string): Promise<void>;
    deleteExpense(year: bigint, month: bigint, id: string): Promise<void>;
    deleteGroceryItem(year: bigint, month: bigint, id: string): Promise<void>;
    deleteHouseholdItem(name: string): Promise<void>;
    getAllMonths(): Promise<Array<bigint>>;
    getExpenses(year: bigint, month: bigint): Promise<Array<Expense>>;
    getGroceryItems(year: bigint, month: bigint): Promise<Array<GroceryItem>>;
    getHouseholdItems(): Promise<Array<HouseholdItem>>;
    getMonthSummary(year: bigint, month: bigint): Promise<MonthSummary | null>;
    getSalary(year: bigint, month: bigint): Promise<number>;
    incrementHouseholdItem(name: string): Promise<void>;
    setSalary(year: bigint, month: bigint, salary: number): Promise<void>;
}
