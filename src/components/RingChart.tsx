// ================================================================
// RingChart — the animated circular calorie progress ring.
// Uses react-native-svg for the circle and React Native's
// Animated API for a smooth fill animation on load.
// ================================================================

import React, { useEffect, useRef }   from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle }                from 'react-native-svg';
import { Colors, Typography }         from '../theme';

interface Props {
  value:   number;   // calories consumed so far
  goal:    number;   // daily calorie goal
  size?:   number;   // diameter in px (default 160)
  stroke?: number;   // ring thickness in px (default 12)
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RingChart({ value, goal, size = 160, stroke = 12 }: Props) {
  const radius      = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct         = Math.min(value / goal, 1);
  const over        = value > goal;
  const color       = over ? Colors.danger : Colors.green;
  const progress    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue:         pct,
      duration:        800,
      easing:          Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const strokeDashoffset = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [circumference, 0],
  });

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size} height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        {/* Background track */}
        <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={Colors.surface2} strokeWidth={stroke} />
        {/* Animated fill */}
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.centre}>
        <Text style={[styles.value, { color }]}>{Math.round(value)}</Text>
        <Text style={styles.unit}>kcal</Text>
        <Text style={styles.sub}>
          {over
            ? `${Math.round(value - goal)} over`
            : `${Math.round(goal - value)} left`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  value:  { fontSize: Typography.xl, fontWeight: Typography.bold, lineHeight: Typography.xl + 4 },
  unit:   { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  sub:    { fontSize: Typography.xs, color: Colors.textDim, marginTop: 2 },
});
