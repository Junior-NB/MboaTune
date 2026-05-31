// Charte graphique MboaTune — Thème "Ubuntu" (Vert foncé, Orange doré)
export const Colors = {
  // Couleurs principales
  primary: '#D87F30',       // Orange doré (Bouton play, icônes actives)
  primaryDark: '#B8621B',
  primaryLight: '#F0A050',
  accent: '#D87F30',        
  accentLight: '#F0A050',

  // Fonds
  background: '#0F1511',    // Vert très foncé / Noir (Fond principal)
  surface: '#17221A',       // Surface légèrement plus claire
  surfaceLight: '#1F2E23',  // Pour les cartes
  surfaceHighlight: '#2A3C2E',

  // Textes
  textPrimary: '#FFFFFF',   // Blanc
  textSecondary: '#A9BAA3', // Vert-gris clair (Métadonnées)
  textMuted: '#6B7A6A',     

  // Utilitaires
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#D87F30',
  info: '#3498DB',

  // Bordures & séparateurs
  border: '#2A3C2E',
  divider: '#17221A',

  // Overlays
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',

  // Gradients
  gradientDark: ['#0F1511', '#0a0e0b', '#0F1511'] as const,
  gradientCard: ['rgba(216,127,48,0.3)', 'rgba(15,21,17,0.9)'] as const,

  // Tab bar
  tabActive: '#D87F30',
  tabInactive: '#6B7A6A',

  // Player
  playerBackground: '#0F1511',
  playerSlider: '#D87F30',
  playerSliderInactive: '#2A3C2E',

  // Catégories (pour les grilles)
  categories: [
    '#B84335', '#247D68', '#6A3C94', '#B4931A',
    '#A62E5C', '#28588A', '#804E1F', '#4A9A4A',
    '#9B2883', '#5D8B33', '#C05C23', '#2B6E7D',
  ] as const,
};
