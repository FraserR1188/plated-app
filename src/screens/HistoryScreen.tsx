// ================================================================
// HistoryScreen — shows last 7 or 30 days of nutrition data.
// Displays a daily average summary card at the top,
// then a row per day with a bar and macro breakdown.
// ================================================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore }     from '../store/useStore';
import { Colors, Spacing, Radius, Typography, MacroColor } from '../theme';

type Range = '7d' | '30d';

export function HistoryScreen() {
  const { entries, goals } = useStore();
  const [range, setRange]  = useState<Range>('7d');
  const days               = range === '7d' ? 7 : 30;

  // Build array of past N days, newest first
  const dayArray = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });

  const dayData = dayArray.map((date) => {
    const dayEntries = entries.filter((e) => e.date === date);
    return {
      date,
      calories: dayEntries.reduce((s, e) => s + e.calories, 0),
      protein:  dayEntries.reduce((s, e) => s + e.protein,  0),
      carbs:    dayEntries.reduce((s, e) => s + e.carbs,    0),
      fat:      dayEntries.reduce((s, e) => s + e.fat,      0),
      count:    dayEntries.length,
    };
  });

  const logged = dayData.filter((d) => d.count > 0);
  const avg = logged.length ? {
    calories: Math.round(logged.reduce((s, d) => s + d.calories, 0) / logged.length),
    protein:  Math.round(logged.reduce((s, d) => s + d.protein,  0) / logged.length),
    carbs:    Math.round(logged.reduce((s, d) => s + d.carbs,    0) / logged.length),
    fat:      Math.round(logged.reduce((s, d) => s + d.fat,      0) / logged.length),
  } : null;

  const formatDate = (dateStr: string) => {
    const d   = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const yd = new Date(now); yd.setDate(yd.getDate() - 1);
    const ydStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
    if (dateStr === todayStr) return 'Today';
    if (dateStr === ydStr)    return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>History</Text>

        {/* 7d / 30d toggle */}
        <View style={styles.rangePicker}>
          {(['7d', '30d'] as Range[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnOn]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.rangeTxt, range === r && styles.rangeTxtOn]}>
                {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Averages card */}
        {avg ? (
          <View style={styles.avgCard}>
            <Text style={styles.avgLabel}>Daily average · {logged.length} days logged</Text>
            <View style={styles.avgRow}>
              {[
                ['Calories', `${avg.calories}`, 'kcal', Colors.green],
                ['Protein',  `${avg.protein}g`,  '',   MacroColor.protein],
                ['Carbs',    `${avg.carbs}g`,     '',   MacroColor.carbs],
                ['Fat',      `${avg.fat}g`,       '',   MacroColor.fat],
              ].map(([label, val, unit, color]) => (
                <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: Typography.md, fontWeight: Typography.bold, color }}>{val}</Text>
                  {unit ? <Text style={{ fontSize: Typography.xs, color: Colors.textMuted }}>{unit}</Text> : null}
                  <Text style={{ fontSize: Typography.xs, color: Colors.textDim, marginTop: 2 }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No data logged in this period yet.</Text>
          </View>
        )}

        {/* Day rows */}
        {dayData.map((day) => {
          const pct  = Math.min(day.calories / goals.calories, 1);
          const over = day.calories > goals.calories;
          return (
            <View key={day.date} style={styles.dayRow}>
              <View style={styles.dayTop}>
                <Text style={styles.dayName}>{formatDate(day.date)}</Text>
                <Text style={[styles.dayCals, over && { color: Colors.danger }]}>
                  {day.count === 0 ? '—' : `${Math.round(day.calories)} kcal`}
                </Text>
              </View>
              {day.count > 0 && (
                <>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: over ? Colors.danger : Colors.green }]} />
                  </View>
                  <Text style={styles.dayMacros}>
                    P {Math.round(day.protein)}g · C {Math.round(day.carbs)}g · F {Math.round(day.fat)}g · {day.count} meal{day.count !== 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </View>
          );
        })}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md },
  heading: { fontSize: Typography.xxl, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.md },
  rangePicker:  { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.full, padding: 4, marginBottom: Spacing.md },
  rangeBtn:     { flex: 1, paddingVertical: 8, borderRadius: Radius.full, alignItems: 'center' },
  rangeBtnOn:   { backgroundColor: Colors.green },
  rangeTxt:     { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  rangeTxtOn:   { color: Colors.bg, fontWeight: Typography.bold },
  avgCard:      { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  avgLabel:     { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
  avgRow:       { flexDirection: 'row' },
  emptyCard:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  emptyText:    { fontSize: Typography.base, color: Colors.textMuted },
  dayRow:       { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  dayTop:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayName:      { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  dayCals:      { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  barTrack:     { height: 5, backgroundColor: Colors.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill:      { height: 5, borderRadius: 3 },
  dayMacros:    { fontSize: Typography.xs, color: Colors.textMuted },
});
