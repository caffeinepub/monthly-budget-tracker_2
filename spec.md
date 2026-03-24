# Monthly Budget Tracker

## Current State
- Backend stores GroceryItem (id, name, price, duration) and HouseholdItem (name, quantity) — no category field
- Previous attempts to add categories via backend consistently broke add-category and add-grocery functionality
- Frontend GrocerySection shows items with name, price, duration
- HouseholdSection shows items sorted alphabetically with increment/decrement/delete controls

## Requested Changes (Diff)

### Add
- Category management stored in localStorage (no backend changes)
- Default categories: Kitchen, Toiletries, Cleaning, Food, Other
- Ability to add custom categories from the grocery form
- Category selector dropdown in the grocery add form
- Category badge shown on each grocery item row
- Household items grouped by category (using localStorage item→category mapping)
- Category label shown above each group in HouseholdSection

### Modify
- GrocerySection: add category dropdown to the add form; show category badge on each item row
- HouseholdSection: group items by category instead of flat alphabetical list
- When a grocery item is added, the item name → category mapping is saved to localStorage

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/hooks/useCategories.ts` — localStorage-backed hook for categories list and item→category map
2. Update GrocerySection to include category dropdown and show category badge per item
3. Update HouseholdSection to group items by category using the localStorage mapping
