// ================================================================
// Shared TypeScript types used across the entire app.
// If you add a new field to the database, add it here too.
// ================================================================

export interface MealEntry {
  id: string;
  user_id: string;
  date: string;         // 'YYYY-MM-DD'
  logged_at: string;    // ISO timestamp e.g. '2024-11-01T09:32:00Z'
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'manual' | 'search' | 'barcode';
  barcode?: string;
  off_id?: string;      // Open Food Facts product ID
  serving_g?: number;
}

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: MealEntry[];
}

export interface FoodProduct {
  name: string;
  brand: string;
  cal_per100: number;
  protein_per100: number;
  carbs_per100: number;
  fat_per100: number;
  barcode?: string;
  off_id?: string;
}

// Navigation type definitions — keeps route params type-safe
export type RootStackParamList = {
  MainTabs: undefined;
  AddMeal: { date: string };
  Scanner: undefined;
  Product: { product: FoodProduct; date: string };
};

export type BottomTabParamList = {
  Today: undefined;
  History: undefined;
  Settings: undefined;
};
