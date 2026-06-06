// ================================================================
// MacroBar — animated horizontal progress bar for protein/carbs/fat.
// Turns red if you exceed your goal for that macro.
// ================================================================

import React, { useEffect, useRef }         from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, MacroColor } from '../theme';

interface Props {
  label: string;   // e.g. 'Protein'
  value: number;   // grams consumed
  goal:  number;   // daily goal in grams
}

export function MacroBar({ label, value, goal }: Props) {
  const pct      = Math.min(value / goal, 1);
  const over     = value > goal;
  const color    = over ? Colors.danger : (MacroColor[label.toLowerCase()] ?? Colors.green);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue:         pct,
      duration:        700,
      easing:          Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.nums, over && { color: Colors.danger }]}>
          {Math.round(value)}
          <Text style={styles.goal}> / {goal}g</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { marginBottom: Spacing.sm },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  label: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  nums:  { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  goal:  { fontWeight: Typography.regular, color: Colors.textMuted },
  track: { height: 6, borderRadius: Radius.full, backgroundColor: Colors.surface2, overflow: 'hidden' },
  fill:  { height: 6, borderRadius: Radius.full },
});
