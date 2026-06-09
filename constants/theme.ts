// Etlob design tokens

export const colors = {
  // Brand
  primary: '#FFD700',
  primaryDark: '#E6BE00',
  primarySoft: '#FFF4B8',

  // Surfaces
  background: '#FFFBEF',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF7DA',
  surfaceMuted: '#F5EFD9',

  // Text
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textSubtle: '#9A9A9A',
  onPrimary: '#1A1A1A',

  // Accent / semantic
  success: '#2E8B57',
  successSoft: '#DFF5E5',
  danger: '#D9534F',
  warning: '#E89A2C',
  info: '#3D7BD8',

  // Lines
  border: '#EDE3C2',
  divider: '#F1E8C8',

  // Map
  mapBase: '#FFF7DA',
  mapStreet: '#F1E5BA',
  mapPark: '#DCE9C8',
  mapWater: '#C7DCEB',
  riderPin: '#E89A2C',
  customerPin: '#2E8B57',
  restaurantPin: '#D9534F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  section: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
  button: { fontSize: 16, fontWeight: '700' as const, lineHeight: 20 },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  pop: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const theme = { colors, spacing, radius, typography, shadows };
export default theme;
