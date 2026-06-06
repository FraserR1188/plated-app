// ================================================================
// Design tokens — all colours, spacing, and type sizes live here.
// Change these to restyle the entire app in one place.
// ================================================================

export const Colors = {
  bg:        '#0D0D0D',   // Main page background (true black for OLED)
  surface:   '#1A1A1A',   // Cards and sheets
  surface2:  '#252525',   // Input backgrounds, nested elements
  border:    '#2E2E2E',   // Dividers and subtle borders

  text:      '#F2F2F7',   // Primary text
  textMuted: '#888888',   // Secondary labels
  textDim:   '#555555',   // Hints and placeholders

  green:     '#00D97E',   // Primary accent (calories, success, buttons)
  greenDim:  '#012916',   // Tinted green background for selected states

  blue:      '#4A9EFF',   // Protein macro colour
  amber:     '#FFB340',   // Carbs macro colour
  coral:     '#FF6B6B',   // Fat macro colour

  danger:    '#FF4444',   // Over-goal / errors
  white:     '#FFFFFF',
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   20,
  xl:   28,
  full: 999,
};

export const Typography = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
  hero: 48,

  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

// Macro colours keyed by macro name (lowercase)
export const MacroColor: Record<string, string> = {
  protein: Colors.blue,
  carbs:   Colors.amber,
  fat:     Colors.coral,
};
