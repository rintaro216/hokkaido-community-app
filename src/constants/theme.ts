// 北海道らしいデザイン言語に基づくカラーパレット

export const COLORS = {
  // プライマリカラー（北海道ブルー）
  primary: '#4A90E2',
  primaryLight: '#6BA3E9',
  primaryDark: '#357ABD',

  // セカンダリカラー（雪原ホワイト）
  secondary: '#FFFFFF',
  secondaryLight: '#F8F9FA',
  secondaryDark: '#E9ECEF',

  // アクセントカラー（夕陽オレンジ）
  accent: '#F5A623',
  accentLight: '#F7B955',
  accentDark: '#D4911E',

  // グリーン（森林グリーン）
  success: '#7ED321',
  successLight: '#96DD4A',
  successDark: '#6BB31C',

  // グレー（石炭グレー）
  gray: '#50555C',
  grayLight: '#6C757D',
  grayDark: '#343A40',

  // その他のカラー
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // 背景色
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  // テキストカラー
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',

  // ボーダー・区切り線
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  borderDark: '#CED4DA',

  // 透明度付きカラー
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // 状態カラー
  online: '#28A745',
  offline: '#6C757D',
  recording: '#DC3545',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  title: 32,
} as const;

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const SHADOWS = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
} as const;