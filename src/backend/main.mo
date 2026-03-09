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

  public shared ({ caller }) func setSalary(year : Nat, month : Nat, salary : Float) : async () {
    let key : Nat = year * 100 + month;
    let data = switch (monthlyData.get(key)) {
      case (null) {
        {
          salary;
          expenses = [];
          groceryItems = [];
        };
      };
      case (?existingData) {
        {
          salary;
          expenses = existingData.expenses;
          groceryItems = existingData.groceryItems;
        };
      };
    };
    monthlyData.add(key, data);
  };

  public shared ({ caller }) func addExpense(year : Nat, month : Nat, id : Text, name : Text, amount : Float) : async () {
    let key : Nat = year * 100 + month;
    let expense : Expense = { id; name; amount };
    let data = switch (monthlyData.get(key)) {
      case (null) {
        {
          salary = 0.0;
          expenses = [expense];
          groceryItems = [];
        };
      };
      case (?existingData) {
        {
          existingData with
          expenses = existingData.expenses.concat([expense]);
        };
      };
    };
    monthlyData.add(key, data);
  };

  public shared ({ caller }) func deleteExpense(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filteredExpenses = data.expenses.filter(func(e) { e.id != id });
        let newData = { data with expenses = filteredExpenses };
        monthlyData.add(key, newData);
      };
    };
  };

  public shared ({ caller }) func addGroceryItem(year : Nat, month : Nat, id : Text, name : Text, price : Float, duration : Text) : async () {
    let key : Nat = year * 100 + month;
    let groceryItem : GroceryItem = { id; name; price; duration };
    let data = switch (monthlyData.get(key)) {
      case (null) {
        {
          salary = 0.0;
          expenses = [];
          groceryItems = [groceryItem];
        };
      };
      case (?existingData) {
        {
          existingData with
          groceryItems = existingData.groceryItems.concat([groceryItem]);
        };
      };
    };
    monthlyData.add(key, data);
  };

  public shared ({ caller }) func deleteGroceryItem(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filteredItems = data.groceryItems.filter(func(item) { item.id != id });
        let newData = { data with groceryItems = filteredItems };
        monthlyData.add(key, newData);
      };
    };
  };

  public query ({ caller }) func getMonthSummary(year : Nat, month : Nat) : async ?MonthSummary {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { null };
      case (?data) {
        let totalExpenses = data.expenses.foldLeft(0.0, func(acc, e) { acc + e.amount });
        let totalGrocerySpend = data.groceryItems.foldLeft(0.0, func(acc, item) { acc + item.price });
        let savings = data.salary - totalExpenses - totalGrocerySpend;
        ?{
          salary = data.salary;
          expenses = data.expenses;
          groceryItems = data.groceryItems;
          totalExpenses;
          totalGrocerySpend;
          savings;
        };
      };
    };
  };

  public query ({ caller }) func getAllMonths() : async [Nat] {
    monthlyData.keys().toArray();
  };

  public query ({ caller }) func getSalary(year : Nat, month : Nat) : async Float {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { 0.0 };
      case (?data) { data.salary };
    };
  };

  public query ({ caller }) func getExpenses(year : Nat, month : Nat) : async [Expense] {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { [] };
      case (?data) { data.expenses };
    };
  };

  public query ({ caller }) func getGroceryItems(year : Nat, month : Nat) : async [GroceryItem] {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { [] };
      case (?data) { data.groceryItems };
    };
  };
};
