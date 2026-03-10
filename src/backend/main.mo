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

  public type HouseholdItem = {
    name : Text;
    quantity : Nat;
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
  var householdItems = Map.empty<Text, HouseholdItem>();

  public shared ({ caller }) func setSalary(year : Nat, month : Nat, salary : Float) : async () {
    let key : Nat = year * 100 + month;
    let data = switch (monthlyData.get(key)) {
      case (null) { { salary; expenses = []; groceryItems = [] } };
      case (?existing) { { salary; expenses = existing.expenses; groceryItems = existing.groceryItems } };
    };
    monthlyData.add(key, data);
  };

  public shared ({ caller }) func addExpense(year : Nat, month : Nat, id : Text, name : Text, amount : Float) : async () {
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

  public shared ({ caller }) func addGroceryItem(year : Nat, month : Nat, id : Text, name : Text, price : Float, duration : Text) : async () {
    let key : Nat = year * 100 + month;
    let groceryItem : GroceryItem = { id; name; price; duration };

    // Update monthly grocery items
    let data = switch (monthlyData.get(key)) {
      case (null) { { salary = 0.0; expenses = []; groceryItems = [groceryItem] } };
      case (?existing) {
        { salary = existing.salary; expenses = existing.expenses; groceryItems = existing.groceryItems.concat([groceryItem]) };
      };
    };
    monthlyData.add(key, data);

    // Increment corresponding household item
    let itemName = name.trim(#char ' ').toLower();
    switch (householdItems.get(itemName)) {
      case (null) {
        let newItem : HouseholdItem = { name = itemName; quantity = 1 };
        householdItems.add(itemName, newItem);
      };
      case (?existing) {
        let updatedItem : HouseholdItem = { existing with quantity = existing.quantity + 1 };
        householdItems.add(itemName, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteExpense(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filtered = data.expenses.filter(func(e : Expense) : Bool { e.id != id });
        monthlyData.add(key, { salary = data.salary; expenses = filtered; groceryItems = data.groceryItems });
      };
    };
  };

  public shared ({ caller }) func deleteGroceryItem(year : Nat, month : Nat, id : Text) : async () {
    let key : Nat = year * 100 + month;
    switch (monthlyData.get(key)) {
      case (null) { () };
      case (?data) {
        let filtered = data.groceryItems.filter(func(item : GroceryItem) : Bool { item.id != id });
        monthlyData.add(key, { salary = data.salary; expenses = data.expenses; groceryItems = filtered });
      };
    };
  };

  public query ({ caller }) func getMonthSummary(year : Nat, month : Nat) : async ?MonthSummary {
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

  public query ({ caller }) func getHouseholdItems() : async [HouseholdItem] {
    householdItems.values().toArray();
  };

  public shared ({ caller }) func incrementHouseholdItem(name : Text) : async () {
    let itemName = name.trim(#char ' ').toLower();
    switch (householdItems.get(itemName)) {
      case (null) {
        let newItem : HouseholdItem = { name = itemName; quantity = 1 };
        householdItems.add(itemName, newItem);
      };
      case (?existing) {
        let updatedItem : HouseholdItem = { existing with quantity = existing.quantity + 1 };
        householdItems.add(itemName, updatedItem);
      };
    };
  };

  public shared ({ caller }) func decrementHouseholdItem(name : Text) : async () {
    let itemName = name.trim(#char ' ').toLower();
    switch (householdItems.get(itemName)) {
      case (null) { () };
      case (?existing) {
        // Keep item at 0 instead of removing it
        let newQuantity = if (existing.quantity > 0) { existing.quantity - 1 } else { 0 };
        let updatedItem : HouseholdItem = { existing with quantity = newQuantity };
        householdItems.add(itemName, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteHouseholdItem(name : Text) : async () {
    let itemName = name.trim(#char ' ').toLower();
    householdItems.remove(itemName);
  };
};
