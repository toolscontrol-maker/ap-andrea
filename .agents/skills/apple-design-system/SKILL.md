---
name: apple-design-system
description: >-
  Comprehensive guide and component engineering toolkit for Apple's Human Interface Guidelines (HIG),
  iOS 17/18 design patterns, Materials & Vibrancy, Continuous Squircles, SF Pro / New York typography,
  Interactive Spring Physics, Grouped Inset Lists, and Tactile Haptics.
---

# 🍎 Apple Design System & Human Interface Guidelines (HIG) Mastery

This skill equips Antigravity with production-grade recipes, mathematical models, and component blueprints for crafting software that looks, feels, and moves like Apple's finest native applications (Apple Journal, Apple Maps, Flighty, Things 3, Apple Health).

---

## 📚 Architectural References

1. **[Materials & Vibrancy](./references/materials-and-vibrancy.md)**:
   - 4-Tier Material hierarchy: Ultra Thin, Thin, Regular, Thick.
   - Translucency fills, progressive Gaussian blurs (`backdrop-filter: blur()`), and saturated color boost.
   - Specular hairline borders (`0.5px`–`1px`) and top-edge chamfer highlights (`inset 0 1px 0 rgba(...)`).

2. **[Continuous Squircles & Radii Geometry](./references/continuous-squircles-radii.md)**:
   - Superellipse mathematics ($|x/a|^{4.5} + |y/b|^{4.5} = 1$) and $G2$ continuous curvature.
   - Standardized Apple Radii Scale (`8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `pill`).
   - Grouped Inset List container dimensions, nested corner radius harmony ($R_{outer} = R_{inner} + \text{padding}$).

3. **[Typography & Tracking Hierarchy](./references/typography-sf-pro-newyork.md)**:
   - SF Pro and New York editorial pairing.
   - Optical tracking table (exact negative letter spacing for Large Title down to micro caption).
   - Dynamic type scaling and line-height balance.

4. **[Spring Physics & Tactile Haptic Choreography](./references/spring-physics-haptics.md)**:
   - Damped harmonic oscillator springs (`mass`, `stiffness`, `damping`) for touch scale (`0.96x`), sheet swipe, and toggle snap.
   - Tactile haptic feedback taxonomy (`selection`, `light`, `medium`, `heavy`, `notificationSuccess`, `notificationError`).

5. **[Apple Component Blueprints](./references/apple-component-blueprints.md)**:
   - `AppleCard`: Inset grouped card with material blur and specular highlights.
   - `InsetGroupedList`: Apple Settings & Health style list with icon blocks and indented separators.
   - `SegmentedControl`: Apple sliding glass pill with spring thumb animation.
   - `PressableScale`: Universal spring touch container.
   - `GlassHeader`: Floating dynamic blur navigation bar.

---

## 📐 Golden Rules of Apple HIG Design

1. **Deference**: Content is the protagonist. UI chrome (bars, borders, cards) must be unobtrusive, translucent, and softly layered.
2. **Depth & Hierarchy**: Use translucent materials and soft elevation shadows instead of harsh, high-contrast borders.
3. **Continuous Motion**: Every interactive state transition must be driven by physical springs, never abrupt linear cuts.
4. **Touch & Haptic Feedback**: Every primary action must provide subtle, well-calibrated tactile feedback.
5. **No Clutter / Quiet Luxury**: Minimize decorative icons; prioritize bold typography, whitespace, and organic imagery.
