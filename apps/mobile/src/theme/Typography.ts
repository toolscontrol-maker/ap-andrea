/**
 * Andrea Design System v1 — Typography Tokens
 */

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
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
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
    lineHeight: 24,
    letterSpacing: -0.25,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.15,
  },
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
} as const;
