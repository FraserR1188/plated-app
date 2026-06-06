// ================================================================
// SettingsScreen — edit daily goals and export your data as CSV.
// The export button triggers the Android share sheet so you can
// send the file to Google Drive, email, or wherever you like.
// ================================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView }                  from 'react-native-safe-area-context';
import { useStore }                      from '../store/useStore';
import { exportCSV, filterByDateRange }  from '../lib/csv';
import { Colors, Spacing, Radius, Typography } from '../theme';

export function SettingsScreen() {
  const { goals, saveGoals, getAllEntries } = useStore();
  const [calories, setCalories] = useState(String(goals.calories));
  const [protein,  setProtein]  = useState(String(goals.protein));
  const [carbs,    setCarbs]    = useState(String(goals.carbs));
  const [fat,      setFat]      = useState(String(goals.fat));
  const [saving,   setSaving]   = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveGoals({
      calories: parseInt(calories) || 2000,
      protein:  parseInt(protein)  || 150,
      carbs:    parseInt(carbs)    || 200,
      fat:      parseInt(fat)      || 65,
    });
    setSaving(false);
    Alert.alert('Saved', 'Your daily goals have been updated.');
  };

  const doExport = async (entries: ReturnType<typeof getAllEntries>) => {
    if (entries.length === 0) {
      Alert.alert('No data', 'Log some meals first before exporting.');
      return;
    }
    setExporting(true);
    try { await exportCSV(entries); }
    catch (e: any) { Alert.alert('Export failed', e.message ?? 'Something went wrong.'); }
    finally { setExporting(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Settings</Text>

        {/* ── Daily goals ────────────────────────────── */}
        <Text style={styles.section}>Daily goals</Text>
        <View style={styles.card}>
          {[
            ['Calories', 'kcal', calories, setCalories],
            ['Protein',  'g',    protein,  setProtein],
            ['Carbs',    'g',    carbs,    setCarbs],
            ['Fat',      'g',    fat,      setFat],
          ].map(([label, unit, value, setter], i, arr) => (
            <View key={label as string} style={[styles.goalRow, i < arr.length - 1 && styles.goalBorder]}>
              <Text style={styles.goalLabel}>{label as string}</Text>
              <View style={styles.goalRight}>
                <TextInput
                  style={styles.goalInput}
                  value={value as string}
                  onChangeText={setter as (t: string) => void}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={styles.goalUnit}>{unit as string}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.saveBtnText}>Save goals</Text>}
          </TouchableOpacity>
        </View>

        {/* ── CSV Export ─────────────────────────────── */}
        <Text style={styles.section}>Export data</Text>
        <View style={styles.card}>
          <Text style={styles.exportInfo}>
            Export your meal log as a CSV file. Send it to yourself via email or Google Drive,
            then open it alongside your Whoop export in Google Sheets to cross-reference nutrition with recovery.
          </Text>
          <View style={styles.colsBox}>
            <Text style={styles.colsText}>date · time · meal name · calories · protein · carbs · fat · source</Text>
          </View>
          {exporting ? (
            <View style={styles.exportLoading}>
              <ActivityIndicator color={Colors.green} />
              <Text style={styles.exportLoadingText}>Preparing file…</Text>
            </View>
          ) : (
            <View style={styles.exportBtns}>
              <TouchableOpacity style={styles.exportBtnPrimary} onPress={() => {
                const to   = new Date().toISOString().slice(0, 10);
                const from = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
                doExport(filterByDateRange(getAllEntries(), from, to));
              }}>
                <Text style={styles.exportBtnPrimaryText}>📤  Export last 30 days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportBtnSecondary} onPress={() => doExport(getAllEntries())}>
                <Text style={styles.exportBtnSecondaryText}>Export all data</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Whoop tip ──────────────────────────────── */}
        <Text style={styles.section}>Whoop cross-reference</Text>
        <View style={styles.card}>
          {[
            'Export from plated. using the button above',
            'In Whoop app: Profile → My Data → Export',
            'Open both CSVs in Google Sheets — join them on the date column',
            'Use VLOOKUP to match recovery score, HRV and strain against your daily nutrition',
          ].map((step, i) => (
            <View key={i} style={[styles.step, i < 3 && { marginBottom: Spacing.md }]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md },
  heading: { fontSize: Typography.xxl, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.lg },
  section: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  card:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },

  goalRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  goalBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  goalLabel:  { fontSize: Typography.base, color: Colors.text },
  goalRight:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  goalInput:  { backgroundColor: Colors.surface2, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, fontSize: Typography.base, color: Colors.text, fontWeight: Typography.semibold, minWidth: 72, textAlign: 'center' },
  goalUnit:   { fontSize: Typography.sm, color: Colors.textMuted, width: 30 },
  saveBtn:    { backgroundColor: Colors.green, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.md },
  saveBtnText:{ fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.bg },

  exportInfo:          { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 20, marginBottom: Spacing.sm },
  colsBox:             { backgroundColor: Colors.surface2, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  colsText:            { fontSize: Typography.xs, color: Colors.textDim, fontStyle: 'italic' },
  exportLoading:       { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md },
  exportLoadingText:   { fontSize: Typography.base, color: Colors.textMuted },
  exportBtns:          { gap: Spacing.sm },
  exportBtnPrimary:    { backgroundColor: Colors.green, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center' },
  exportBtnPrimaryText:{ fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.bg },
  exportBtnSecondary:  { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center' },
  exportBtnSecondaryText: { fontSize: Typography.base, color: Colors.textMuted },

  step:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  stepNum:     { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.greenDim, borderWidth: 1, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.green },
  stepText:    { flex: 1, fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 20 },
});
