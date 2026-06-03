// Charte graphique MboaTune — Thème Premium Violet/Rose
export const Colors = {
  // Couleurs principales
  primary: '#8B5CF6',       // Violet (Accent principal)
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  accent: '#EC4899',        // Rose
  accentLight: '#F472B6',

  // Fonds
  background: '#111827',    // Fond principal sombre
  surface: '#1F2937',       // Surface secondaire
  surfaceLight: '#374151',  // Pour les cartes
  surfaceHighlight: '#4B5563',

  // Textes
  textPrimary: '#FFFFFF',   // Blanc
  textSecondary: '#D1D5DB', // Gris clair
  textMuted: '#9CA3AF',     // Gris discret

  // Utilitaires
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  info: '#3B82F6',

  // Bordures & séparateurs
  border: '#374151',
  divider: '#1F2937',

  // Overlays
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',

  // Gradients
  gradientDark: ['#111827', '#0F172A', '#111827'],
  gradientCard: ['rgba(139,92,246,0.25)', 'rgba(17,24,39,0.95)'],
  gradientAccent: ['#8B5CF6', '#EC4899'],

  // Tab bar
  tabActive: '#FFFFFF',
  tabInactive: '#9CA3AF',

  // Player
  playerBackground: '#111827',
  playerSlider: '#8B5CF6',
  playerSliderInactive: '#374151',

  // Catégories (pour les grilles)
  categories: [
    '#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B',
    '#10B981', '#EF4444', '#6366F1', '#14B8A6',
    '#F97316', '#06B6D4', '#A855F7', '#E11D48',
  ] as const,
};
