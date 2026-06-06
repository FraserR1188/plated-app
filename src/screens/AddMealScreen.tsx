// ================================================================
// AddMealScreen — search food database or enter manually.
// Opens as a modal sheet from the Today screen.
// Typing triggers a debounced search against Open Food Facts.
// Tapping a result navigates to ProductScreen.
// ================================================================

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp }          from '@react-navigation/native-stack';
import { SafeAreaView }                       from 'react-native-safe-area-context';
import { searchFood }                         from '../lib/openfoodfacts';
import { useStore }                           from '../store/useStore';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { FoodProduct, RootStackParamList }    from '../types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'AddMeal'>;
type Route = RouteProp<RootStackParamList, 'AddMeal'>;

export function AddMealScreen() {
  const navigation   = useNavigation<Nav>();
  const { date }     = useRoute<Route>().params;
  const { addEntry } = useStore();

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<FoodProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [name,  setName]  = useState('');
  const [cals,  setCals]  = useState('');
  const [prot,  setProt]  = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat,   setFat]   = useState('');
  const [saving, setSaving] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout>>();

  const handleQueryChange = (text: string) => {
    setQuery(text);
    clearTimeout(timer.current);
    if (text.trim().length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchFood(text.trim())); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 600);
  };

  const handleManualAdd = async () => {
    if (!name.trim() || !cals) return;
    setSaving(true);
    await addEntry({
      date,
      name:     name.trim(),
      calories: parseFloat(cals)  || 0,
      protein:  parseFloat(prot)  || 0,
      carbs:    parseFloat(carbs) || 0,
      fat:      parseFloat(fat)   || 0,
      source:   'manual',
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log a meal</Text>
          <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scanner')}>
            <Text style={styles.scanText}>📷  Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search food database…"
            placeholderTextColor={Colors.textDim}
            returnKeyType="search"
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={Colors.green} style={{ marginLeft: 8 }} />}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Search results */}
          {results.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={styles.result}
              onPress={() => navigation.navigate('Product', { product: p, date })}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName} numberOfLines={1}>{p.name}</Text>
                {p.brand ? <Text style={styles.resultBrand}>{p.brand}</Text> : null}
                <View style={styles.pillRow}>
                  {[`${Math.round(p.cal_per100)} kcal`, `P ${Math.round(p.protein_per100)}g`, `C ${Math.round(p.carbs_per100)}g`, `F ${Math.round(p.fat_per100)}g`].map((t) => (
                    <View key={t} style={styles.pill}><Text style={styles.pillText}>{t}</Text></View>
                  ))}
                  <Text style={styles.per100}>per 100g</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or enter manually</Text>
            <View style={styles.divLine} />
          </View>

          {/* Manual form */}
          <View style={styles.form}>
            <Field label="Meal name"       value={name}  onChange={setName}  placeholder="e.g. Chicken salad" />
            <Field label="Calories (kcal)" value={cals}  onChange={setCals}  placeholder="0" numeric />
            <View style={styles.threeCol}>
              <View style={{ flex: 1 }}><Field label="Protein g" value={prot}  onChange={setProt}  placeholder="0" numeric /></View>
              <View style={{ flex: 1 }}><Field label="Carbs g"   value={carbs} onChange={setCarbs} placeholder="0" numeric /></View>
              <View style={{ flex: 1 }}><Field label="Fat g"     value={fat}   onChange={setFat}   placeholder="0" numeric /></View>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, (!name.trim() || !cals) && { opacity: 0.4 }]}
              onPress={handleManualAdd}
              disabled={!name.trim() || !cals || saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color={Colors.bg} />
                : <Text style={styles.addBtnText}>Add to log</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, numeric }: {
  label: string; value: string; onChange: (t: string) => void; placeholder: string; numeric?: boolean;
}) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={{ fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <TextInput style={{ backgroundColor: Colors.surface2, borderRadius: Radius.sm, padding: Spacing.sm + 2, fontSize: Typography.base, color: Colors.text }} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={Colors.textDim} keyboardType={numeric ? 'decimal-pad' : 'default'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingBottom: Spacing.sm },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.xs },
  backText: { fontSize: 28, color: Colors.textMuted, lineHeight: 32 },
  title: { flex: 1, fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  scanBtn: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  scanText: { fontSize: Typography.sm, color: Colors.text, fontWeight: Typography.medium },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: Spacing.md, marginTop: 0, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.text, paddingVertical: Spacing.md },
  result: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center' },
  resultName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text, marginBottom: 2 },
  resultBrand: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.xs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  pill: { backgroundColor: Colors.surface2, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: Typography.xs, color: Colors.textMuted },
  per100: { fontSize: Typography.xs, color: Colors.textDim },
  chevron: { fontSize: Typography.lg, color: Colors.textDim, paddingLeft: Spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', margin: Spacing.md, gap: Spacing.sm },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  form: { padding: Spacing.md, paddingTop: 0 },
  threeCol: { flexDirection: 'row', gap: Spacing.sm },
  addBtn: { backgroundColor: Colors.green, borderRadius: Radius.xl, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  addBtnText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.bg },
});
