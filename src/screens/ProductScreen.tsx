// ================================================================
// ProductScreen — shows a food product's nutrition details
// and lets you set the serving size before logging.
// The macro preview updates live as you adjust the serving.
// ================================================================

import React, { useState }   from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp }          from '@react-navigation/native-stack';
import { SafeAreaView }                       from 'react-native-safe-area-context';
import { useStore }                           from '../store/useStore';
import { Colors, Spacing, Radius, Typography, MacroColor } from '../theme';
import { RootStackParamList }                 from '../types';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'Product'>;
type Route = RouteProp<RootStackParamList, 'Product'>;

export function ProductScreen() {
  const navigation           = useNavigation<Nav>();
  const { product, date }    = useRoute<Route>().params;
  const { addEntry }         = useStore();
  const [serving, setServing] = useState('100');
  const [saving,  setSaving]  = useState(false);

  const g = parseFloat(serving) || 0;
  const f = g / 100;

  const handleAdd = async () => {
    if (!g) return;
    setSaving(true);
    await addEntry({
      date,
      name:      g === 100 ? product.name : `${product.name} (${g}g)`,
      calories:  product.cal_per100     * f,
      protein:   product.protein_per100 * f,
      carbs:     product.carbs_per100   * f,
      fat:       product.fat_per100     * f,
      source:    product.barcode ? 'barcode' : 'search',
      barcode:   product.barcode,
      off_id:    product.off_id,
      serving_g: g,
    });
    setSaving(false);
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add food</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Product info */}
        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
          <Text style={styles.per100}>Per 100g</Text>
          <View style={styles.pillsRow}>
            {[
              ['kcal',    String(Math.round(product.cal_per100)),     Colors.green],
              ['protein', `${product.protein_per100.toFixed(1)}g`,   MacroColor.protein],
              ['carbs',   `${product.carbs_per100.toFixed(1)}g`,     MacroColor.carbs],
              ['fat',     `${product.fat_per100.toFixed(1)}g`,       MacroColor.fat],
            ].map(([label, val, color]) => (
              <View key={label} style={styles.pill}>
                <Text style={[styles.pillVal, { color }]}>{val}</Text>
                <Text style={styles.pillLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Serving size */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Serving size</Text>
          <View style={styles.servingRow}>
            <TextInput
              style={styles.servingInput}
              value={serving}
              onChangeText={setServing}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.servingUnit}>g</Text>
          </View>
          {/* Quick preset buttons */}
          <View style={styles.presets}>
            {[50, 100, 150, 200, 250].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.preset, serving === String(v) && styles.presetActive]}
                onPress={() => setServing(String(v))}
              >
                <Text style={[styles.presetText, serving === String(v) && styles.presetTextActive]}>
                  {v}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live macro preview for the chosen serving */}
        <View style={styles.card}>
          <Text style={styles.previewLabel}>For {g || 0}g</Text>
          <View style={styles.previewRow}>
            {[
              ['Calories', `${Math.round(product.cal_per100 * f)}`,          'kcal', Colors.green],
              ['Protein',  `${(product.protein_per100 * f).toFixed(1)}`,     'g',    MacroColor.protein],
              ['Carbs',    `${(product.carbs_per100   * f).toFixed(1)}`,     'g',    MacroColor.carbs],
              ['Fat',      `${(product.fat_per100     * f).toFixed(1)}`,     'g',    MacroColor.fat],
            ].map(([label, val, unit, color]) => (
              <View key={label} style={styles.previewStat}>
                <Text style={[styles.previewVal, { color }]}>
                  {val}<Text style={styles.previewUnit}>{unit}</Text>
                </Text>
                <Text style={styles.previewStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add button */}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={[styles.addBtn, (!g || saving) && { opacity: 0.4 }]}
          onPress={handleAdd}
          disabled={!g || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.addBtnText}>Add to log</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  backBtn:  { width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 28, color: Colors.textMuted, lineHeight: 32 },
  title:    { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  card:     { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, margin: Spacing.md, marginTop: 0 },
  productName:  { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text, marginBottom: 4 },
  productBrand: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  per100:       { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  pillsRow:     { flexDirection: 'row', gap: Spacing.sm },
  pill:         { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  pillVal:      { fontSize: Typography.md, fontWeight: Typography.bold },
  pillLabel:    { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  servingRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  servingInput: { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.sm, padding: Spacing.md, fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, textAlign: 'center' },
  servingUnit:  { fontSize: Typography.lg, color: Colors.textMuted },
  presets:         { flexDirection: 'row', gap: Spacing.sm },
  preset:          { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center' },
  presetActive:    { backgroundColor: Colors.greenDim },
  presetText:      { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  presetTextActive:{ color: Colors.green, fontWeight: Typography.bold },
  previewLabel:    { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
  previewRow:      { flexDirection: 'row', gap: Spacing.md },
  previewStat:     { flex: 1, alignItems: 'center' },
  previewVal:      { fontSize: Typography.lg, fontWeight: Typography.bold },
  previewUnit:     { fontSize: Typography.sm, fontWeight: Typography.regular },
  previewStatLabel:{ fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  fabWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, paddingBottom: Spacing.lg, backgroundColor: Colors.bg },
  addBtn:     { backgroundColor: Colors.green, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center' },
  addBtnText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.bg },
});
