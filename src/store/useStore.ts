// ================================================================
// Zustand global store — all app state lives here.
// Any screen can call useStore() to read or update data.
// Data is fetched from Supabase and cached here in memory.
// ================================================================

import { create }      from 'zustand';
import { supabase }    from '../lib/supabase';
import { MealEntry, Goals, DayTotals } from '../types';

const DEFAULT_GOALS: Goals = {
  calories: 2000,
  protein:  150,
  carbs:    200,
  fat:      65,
};

interface AppState {
  userId:   string | null;
  entries:  MealEntry[];
  goals:    Goals;
  loading:  boolean;

  setUserId:        (id: string | null) => void;
  fetchEntries:     () => Promise<void>;
  fetchGoals:       () => Promise<void>;
  addEntry:         (entry: Omit<MealEntry, 'id' | 'user_id' | 'logged_at'>) => Promise<void>;
  deleteEntry:      (id: string) => Promise<void>;
  saveGoals:        (goals: Goals) => Promise<void>;
  getTotalsForDate: (date: string) => DayTotals;
  getAllEntries:     () => MealEntry[];
}

/** Returns today's date as 'YYYY-MM-DD' in local time */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useStore = create<AppState>((set, get) => ({
  userId:  null,
  entries: [],
  goals:   DEFAULT_GOALS,
  loading: false,

  setUserId: (id) => set({ userId: id }),

  // Loads all meal entries for this user from Supabase
  fetchEntries: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    if (!error && data) set({ entries: data as MealEntry[] });
    set({ loading: false });
  },

  // Loads the user's saved goals from Supabase
  fetchGoals: async () => {
    const { userId } = get();
    if (!userId) return;
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) set({ goals: { calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat } });
  },

  // Saves a new meal entry to Supabase and adds it to local state
  addEntry: async (entry) => {
    const { userId } = get();
    if (!userId) return;
    const newEntry = { ...entry, user_id: userId, logged_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('meal_entries')
      .insert(newEntry)
      .select()
      .single();
    if (!error && data) set((s) => ({ entries: [data as MealEntry, ...s.entries] }));
  },

  // Deletes a meal entry from Supabase and removes it from local state
  deleteEntry: async (id) => {
    await supabase.from('meal_entries').delete().eq('id', id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  // Saves goals to Supabase (upsert = insert or update if exists)
  saveGoals: async (goals) => {
    const { userId } = get();
    if (!userId) return;
    await supabase.from('goals').upsert({
      user_id: userId, ...goals, updated_at: new Date().toISOString(),
    });
    set({ goals });
  },

  // Returns calories/macros totals + entry list for a given date
  getTotalsForDate: (date) => {
    const entries = get().entries.filter((e) => e.date === date);
    return {
      entries,
      calories: entries.reduce((s, e) => s + e.calories, 0),
      protein:  entries.reduce((s, e) => s + e.protein,  0),
      carbs:    entries.reduce((s, e) => s + e.carbs,    0),
      fat:      entries.reduce((s, e) => s + e.fat,      0),
    };
  },

  getAllEntries: () => get().entries,
}));
