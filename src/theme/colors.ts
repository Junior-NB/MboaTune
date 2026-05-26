// Charte graphique MboaTune — palette inspirée du logo (Cyan, Orange, Bleu foncé)
export const Colors = {
  // Couleurs principales (tirées du logo)
  primary: '#00BCD4',       // Cyan — CTA, icônes actives, progress bar
  primaryDark: '#0097A7',
  primaryLight: '#26C6DA',
  accent: '#E6872E',        // Orange doré du logo
  accentLight: '#F0A050',

  // Fonds
  background: '#0A0E14',    // Noir bleuté profond — s'accorde mieux avec le bleu du logo
  surface: '#141B24',       // Surface sombre bleutée
  surfaceLight: '#1C2733',  // Surface légèrement plus claire
  surfaceHighlight: '#253342',

  // Textes
  textPrimary: '#FFFFFF',   // Blanc pur — titres, labels
  textSecondary: '#B3B3B3', // Gris clair — métadonnées, sous-titres
  textMuted: '#727272',     // Gris plus sombre — placeholders

  // Utilitaires
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#00BCD4',
  info: '#3498DB',

  // Bordures & séparateurs
  border: '#253342',
  divider: '#1C2733',

  // Overlays
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',

  // Gradients (utilisés comme tableau de couleurs)
  gradientDark: ['#0A0E14', '#0A0E14', '#141B24'] as const,
  gradientAccent: ['#00BCD4', '#0097A7', '#0A0E14'] as const,
  gradientCard: ['rgba(0,188,212,0.3)', 'rgba(10,14,20,0.9)'] as const,

  // Tab bar
  tabActive: '#00BCD4',
  tabInactive: '#727272',

  // Player
  playerBackground: '#0D1117',
  playerSlider: '#00BCD4',
  playerSliderInactive: '#253342',

  // Catégories — couleurs variées pour les genres
  categories: [
    '#E6872E', '#00BCD4', '#8400E7', '#E8115B',
    '#1A4B8C', '#E91429', '#148A08', '#509BF5',
    '#BA5D07', '#D84000', '#27856A', '#503750',
  ] as const,
};

