/**
 * Application theme configuration
 * Uses brand colors from DTC Logo: Blue (#0D47A1, #1565C0, #4A9FD8) and Orange (#FF9500)
 * Supports both light and dark color schemes
 */
export const appTheme: any = {
  colors: {
    // Brand blue palette - from dark to light
    blue: [
      '#E8F4FD',      // 0 - Lightest blue
      '#C4E0F7',      // 1
      '#99CBEF',      // 2
      '#6EB5E8',      // 3
      '#4A9FD8',      // 4 - Light brand blue
      '#2E89C8',      // 5
      '#1E6BA3',      // 6
      '#1565C0',      // 7 - Medium brand blue (primary)
      '#0D47A1',      // 8 - Dark brand blue
      '#092C6B',      // 9 - Darkest
    ],
    // Brand orange palette
    orange: [
      '#FFF3E0',      // 0 - Lightest orange
      '#FFE0B2',      // 1
      '#FFCC80',      // 2
      '#FFB74D',      // 3
      '#FFA500',      // 4 - Brand orange
      '#FF9500',      // 5 - Bright brand orange
      '#FB8500',      // 6
      '#F57C00',      // 7
      '#E65100',      // 8
      '#BF360C',      // 9 - Darkest orange
    ],
    // Neutral grays
    gray: [
      '#FFFFFF',
      '#F8F9FA',
      '#F1F3F5',
      '#E9ECEF',
      '#DEE2E6',
      '#CED4DA',
      '#ADB5BD',
      '#868E96',
      '#495057',
      '#212529',
    ],
  },

  primaryColor: 'blue',
  primaryShade: 7, // Medium blue (#1565C0)

  components: {
    Button: {
      defaultProps: {
        color: 'blue',
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    Badge: {
      defaultProps: {
        color: 'blue',
      },
    },

    ActionIcon: {
      defaultProps: {
        color: 'blue',
      },
    },

    AppShell: {
      styles: {
        header: {
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: '#1a1a1a',
            borderBottomColor: '#2d2d2d',
          },
        },
        navbar: {
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: '#1a1a1a',
          },
        },
      },
    },
  },

  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};
