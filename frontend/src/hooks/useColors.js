// BrazilFit color palette
export const colors = {
  brazil_dark_navy: '#0a1428',
  brazil_navy: '#11263c',
  brazil_green: '#009C3B',
  brazil_yellow: '#ffc71f',
  white: '#ffffff',
  gray_light: '#f3f4f6',
  gray_medium: '#d1d5db',
  gray_dark: '#6b7280',
};

// Gradient backgrounds - using dark navy as base
export const gradients = {
  // Login/primary pages
  loginGradient: `linear-gradient(135deg, ${colors.brazil_dark_navy} 0%, ${colors.brazil_navy} 100%)`,

  // Home screen
  homeGradient: `linear-gradient(135deg, ${colors.brazil_navy} 0%, #1a3a52 100%)`,

  // Wellness - meditation (calm, peaceful)
  meditationGradient: `linear-gradient(135deg, ${colors.brazil_navy} 0%, #0f1f2f 50%, #1a3a52 100%)`,

  // Wellness - breathing (energetic)
  breathingGradient: `linear-gradient(135deg, #1a3a52 0%, ${colors.brazil_navy} 50%, #0a1428 100%)`,

  // Empty states
  emptyStateGradient: `linear-gradient(135deg, ${colors.brazil_dark_navy} 0%, ${colors.brazil_navy} 100%)`,

  // Accent overlay
  overlayGradient: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)`,
};

export const useColors = () => {
  return { colors, gradients };
};
