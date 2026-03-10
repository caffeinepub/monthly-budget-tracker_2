import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  public type Expense = {
    id : Text;
    name : Text;
    amount : Float;
  };

  public type GroceryItem = {
    id : Text;
    name : Text;
    price : Float;
    duration : Text;
  };

  public type MonthlyData = {
    salary : Float;
    expenses : [Expense];
    groceryItems : [GroceryItem];
  };

  public type MonthSummary = {
    salary : Float;
    expenses : [Expense];
    groceryItems : [GroceryItem];
    totalExpenses : Float;
    totalGrocerySpend : Float;
    savings : Float;
  };

  var monthlyData = Map.empty<Nat, MonthlyData>();

  public shared func setSalary(year : Nat, month : Nat, salary : Float) : async () {
    let key : Nat = year * 100 + month;
    let data = switch (monthlyData.get(key)) {
      case (null) { { salary; expenses = []; groceryItems = [] } };
      case (?existing) { { salary; expenses = existing.expenses; groceryItems = existing.groceryItems } };
    };
    monthlyData.add(key, data);
  };

  public shared func addExpense(year : Nat, month : Nat, id : Text, name : Text, amount : Float) : async () {
    let key : Nat = year * 100 + month;
    let expense : Expense = { id; name; amount };
    let data = switch (monthlyData.get(key)) {
      case (null) { { salary = 0.0; expenses = [expense]; groceryItems = [] } };
      case (?existing) {
        { salary = existing.salary; expenses = existing.expenses.concat([expense]); groceryItems = existing.groceryItems };
      };
    };
    monthlyData.add(key, data);
  };

  public shared func deleteExpense(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filtered = data.expenses.filter(func(e : Expense) : Bool { e.id != id });
        monthlyData.add(key, { salary = data.salary; expenses = filtered; groceryItems = data.groceryItems });
      };
    };
  };

  public shared func addGroceryItem(year : Nat, month : Nat, id : Text, name : Text, price : Float, duration : Text) : async () {
    let key : Nat = year * 100 + month;
    let item : GroceryItem = { id; name; price; duration };
    let data = switch (monthlyData.get(key)) {
      case (null) { { salary = 0.0; expenses = []; groceryItems = [item] } };
      case (?existing) {
        { salary = existing.salary; expenses = existing.expenses; groceryItems = existing.groceryItems.concat([item]) };
      };
    };
    monthlyData.add(key, data);
  };

  public shared func deleteGroceryItem(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filtered = data.groceryItems.filter(func(item : GroceryItem) : Bool { item.id != id });
        monthlyData.add(key, { salary = data.salary; expenses = data.expenses; groceryItems = filtered });
      };
    };
  };

  public query func getMonthSummary(year : Nat, month : Nat) : async ?MonthSummary {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { null };
      case (?data) {
        let totalExpenses = data.expenses.foldLeft(0.0, func(acc : Float, e : Expense) : Float { acc + e.amount });
        let totalGrocerySpend = data.groceryItems.foldLeft(0.0, func(acc : Float, g : GroceryItem) : Float { acc + g.price });
        let savings = data.salary - totalExpenses - totalGrocerySpend;
        ?{ salary = data.salary; expenses = data.expenses; groceryItems = data.groceryItems; totalExpenses; totalGrocerySpend; savings };
      };
    };
  };

  public query func getAllMonths() : async [Nat] {
    monthlyData.keys().toArray();
  };

  public query func getSalary(year : Nat, month : Nat) : async Float {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { 0.0 };
      case (?data) { data.salary };
    };
  };

  public query func getExpenses(year : Nat, month : Nat) : async [Expense] {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { [] };
      case (?data) { data.expenses };
    };
  };

  public query func getGroceryItems(year : Nat, month : Nat) : async [GroceryItem] {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { [] };
      case (?data) { data.groceryItems };
    };
  };
};
