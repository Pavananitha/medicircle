// Theme definition for MediCircle
export const Colors = {
  // Primary Healthcare Blues & Teals
  primary: '#0284C7', // Sky 600
  primaryLight: '#E0F2FE', // Sky 100
  primaryDark: '#0369A1', // Sky 700

  // Secondary Accents
  secondary: '#0D9488', // Teal 600
  secondaryLight: '#CCFBF1', // Teal 100

  // Backgrounds & Surfaces
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0', // Slate 200

  // Typography
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Status Indicators
  taken: '#16A34A', // Green 600
  takenLight: '#DCFCE7', // Green 100
  upcoming: '#0284C7', // Blue 600
  upcomingLight: '#E0F2FE', // Blue 100
  pending: '#EAB308', // Yellow 500
  pendingLight: '#FEF9C3', // Yellow 100
  skipped: '#64748B', // Slate 500
  skippedLight: '#F1F5F9', // Slate 100
  missed: '#EF4444', // Red 500
  missedLight: '#FEE2E2', // Red 100

  // Alerts & System
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
};
