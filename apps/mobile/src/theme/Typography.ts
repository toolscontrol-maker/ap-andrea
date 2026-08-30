// apps/mobile/src/theme/Typography.ts

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Typography = {
  family: FontFamily,
  display: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },

  h1: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.45,
  },

  h2: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: -0.25,
  },

  h3: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.2,
  },

  headline: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
  },

  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
  },

  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },

  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
  },

  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0,
  },

  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },

  callout: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },

  subheadline: {
    fontFamily: FontFamily.medium,
    fontSize: 13.5,
    lineHeight: 18,
    letterSpacing: -0.1,
  },

  footnote: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: 0,
  },

  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.15,
  },

  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },

  captionBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },

  overline: {
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },

  calendarDay: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
} as const;
