// ================================================================
// TodayScreen — the main dashboard (first tab).
// Shows the calorie ring, macro bars, and meal list for today.
// Long-press any meal to delete it.
// ================================================================

import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp }     from '@react-navigation/native-stack';
import { SafeAreaView }                  from 'react-native-safe-area-context';
import { RingChart }                     from '../components/RingChart';
import { MacroBar }                      from '../components/MacroBar';
import { useStore, todayKey }            from '../store/useStore';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { RootStackParamList, MealEntry } from '../types';

const ICONS = ['🥗','🍳','🥩','🍜','🥙','🍱','🥪','🍛','🫐','🍌','🥤','☕','🍎','🥚','🍝','🥦','🍗','🥛','🧆','🫙'];

export function TodayScreen() {
  const navigation  = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { goals, getTotalsForDate, deleteEntry, fetchEntries } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const today  = todayKey();
  const totals = getTotalsForDate(today);

  // Re-fetch from Supabase every time this screen comes into focus
  useFocusEffect(
    useCallback(() => { fetchEntries(); }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  const handleDelete = (entry: MealEntry) => {
    Alert.alert('Remove meal', `Remove "${entry.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteEntry(entry.id) },
    ]);
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />
        }
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Calorie ring card */}
        <View style={styles.ringCard}>
          <RingChart value={totals.calories} goal={goals.calories} size={160} />
          <View style={styles.ringStats}>
            <StatRow label="Consumed"  value={`${Math.round(totals.calories)} kcal`} />
            <StatRow label="Goal"      value={`${goals.calories} kcal`} />
            <StatRow label="Remaining" value={`${Math.max(0, goals.calories - Math.round(totals.calories))} kcal`} accent />
          </View>
        </View>

        {/* Macro bars */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macros</Text>
          <MacroBar label="Protein" value={totals.protein} goal={goals.protein} />
          <MacroBar label="Carbs"   value={totals.carbs}   goal={goals.carbs} />
          <MacroBar label="Fat"     value={totals.fat}      goal={goals.fat} />
        </View>

        {/* Meal list */}
        <View style={styles.mealsRow}>
          <Text style={styles.cardTitle}>Today's meals</Text>
          <Text style={styles.mealCount}>{totals.entries.length} logged</Text>
        </View>

        {totals.entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptySub}>Tap "Log a meal" below to get started</Text>
          </View>
        ) : (
          totals.entries.map((entry, i) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.mealRow}
              onLongPress={() => handleDelete(entry)}
              activeOpacity={0.7}
            >
              <Text style={styles.mealIcon}>{ICONS[i % ICONS.length]}</Text>
              <View style={styles.mealBody}>
                <Text style={styles.mealName} numberOfLines={1}>{entry.name}</Text>
                <Text style={styles.mealMacros}>
                  P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F {Math.round(entry.fat)}g
                </Text>
              </View>
              <Text style={styles.mealCals}>{Math.round(entry.calories)}</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log meal button — fixed to bottom */}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddMeal', { date: today })}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>＋  Log a meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={{ fontSize: Typography.xs, color: Colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: Typography.base, fontWeight: Typography.semibold, color: accent ? Colors.green : Colors.text }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md },

  header:   { marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text },
  date:     { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },

  ringCard: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.lg,
    marginBottom:    Spacing.md,
  },
  ringStats: { flex: 1 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text, marginBottom: Spacing.md },

  mealsRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  mealCount: { fontSize: Typography.sm, color: Colors.textMuted },

  empty: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    padding:         Spacing.xl,
    alignItems:      'center',
  },
  emptyIcon:  { fontSize: 40, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  emptySub:   { fontSize: Typography.sm, color: Colors.textMuted, marginTop: Spacing.xs, textAlign: 'center' },

  mealRow: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    marginBottom:    Spacing.sm,
  },
  mealIcon:   { fontSize: 24 },
  mealBody:   { flex: 1 },
  mealName:   { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  mealMacros: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  mealCals:   { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },

  fabWrap: {
    position:        'absolute',
    bottom: 0, left: 0, right: 0,
    padding:         Spacing.md,
    paddingBottom:   Spacing.lg,
    backgroundColor: Colors.bg,
  },
  fab: {
    backgroundColor: Colors.green,
    borderRadius:    Radius.xl,
    paddingVertical: 16,
    alignItems:      'center',
  },
  fabText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.bg },
});
