---
name: modern-animations
description: >-
  Comprehensive guide and component toolkit for cutting-edge web & mobile animations,
  micro-interactions, and visual shaders. Covers Vue Bits, React Bits, Skiper UI (@skiper-ui/skiper2, Dynamic Island),
  Framer Motion, Canvas Shaders, and React Native Reanimated 3.
  Use when building animated UI components, interactive cards, magnetic elements, fluid transitions, text effects, or canvas backgrounds.
---

# 🎨 Modern Animations & Creative UI Mastery (Vue Bits, React Bits, Skiper UI & Reanimated)

This skill equips Antigravity with production-grade recipes, mathematical physics models, and reusable component architectures for modern web and mobile creative animations.

---

## 📚 Categorías de Recursos y Referencias

1. **[Vue Bits & React Bits Catalog](./references/react-bits-vue-bits.md)**:
   - **Text Animations**: `BlurText`, `SplitText`, `VariableProximity`, `TrueFocus`, `ShinyText`, `DecryptedText`, `ScrollVelocity`, `RotatingText`.
   - **Shaders & Backgrounds**: `Aurora`, `Hyperspeed`, `DotGrid`, `Squares`, `Waves`, `Ballpit`, `GridDistortion`, `Iridescence`, `Noise`.
   - **Interactive FX**: `Magnet`, `BlobCursor`, `FollowCursor`, `SplashCursor`, `LaserFlow`, `TiltedCard`, `StarBorder`, `PixelCard`, `SpotlightCard`.
   - **Carousels & Swappers**: `ElasticSlider`, `AnimatedList`, `FlowingMenu`, `Stepper`, `Glitch`, `InfiniteScroll`, `RollingGallery`, `CircularGallery`, `CurvedCarousel`, `CardSwap`, `Stack`.

2. **[Skiper UI & Framer Motion Suite](./references/skiper-ui-framer-motion.md)**:
   - **`@skiper-ui/skiper2` (Dynamic Island)**: Multi-state fluid morphing (idle, timer, call, music, airdrop, notification).
   - **Spring Physics**: Mass, stiffness, damping, and velocity calibration for butter-smooth UI.
   - **Fluid Modals & Drawers**: Shared layout animations (`layoutId`), velocity-based swipe-to-dismiss.
   - **Magnetic Buttons & Shimmer Borders**: Multi-layer lighting, conic gradient spinners, noise overlay.

3. **[React Native Reanimated 3 & Gesture Handler](./references/react-native-reanimated.md)**:
   - Worklets on UI thread (`'worklet;'`).
   - Shared value springs (`withSpring`, `withTiming`, `withSequence`, `withRepeat`).
   - 3D Device Tilt & Gyroscope-inspired parallax.
   - Micro-haptic tactile feedback integration.

4. **[shadcn/ui Component Architecture & Registry](./references/shadcn-ui-architecture.md)**:
   - "Own Your Code" distribution model and Radix UI accessible primitives.
   - Type-safe variant management with `cva` (class-variance-authority).
   - The `cn()` utility (`clsx` + `tailwind-merge`) resolving Tailwind conflicts.
   - CSS Variables & HSL dynamic theming for universal web and mobile design systems.

---

## 🛠️ Reglas Universales de Implementación

### 1. Principio de Rendimiento y Frame-Budget (60 / 120 FPS)
- **Web (DOM)**: Animar exclusivamente `transform` (`translate3d`, `scale`, `rotate`) y `opacity`. Evitar modificar `top`, `left`, `width`, `height` o `margin` dentro de loops de animación para no causar layout reflows.
- **Will-Change**: Aplicar `will-change: transform, opacity` únicamente en elementos en transición activa y removerlo al completar para preservar memoria GPU.
- **Mobile (React Native)**: Toda animación debe ejecutarse en el thread nativo de UI mediante Worklets de Reanimated (`useAnimatedStyle`, `useSharedValue`).

### 2. Curvas de Movimiento y Física de Muelles (Spring Physics)
Para lograr un tacto lujoso y orgánico estilo Apple / Amie / Linear, utilizar estos presets:

```typescript
export const SpringPresets = {
  // Respuesta ultra rápida y precisa (botones, toggles)
  snappy: { stiffness: 400, damping: 30, mass: 0.8 },
  
  // Suave y elegante (modales, cards, menús expansibles)
  gentle: { stiffness: 180, damping: 24, mass: 1 },
  
  // Orgánico con rebote elástico controlado (badges, tooltips, dynamic island)
  bouncy: { stiffness: 300, damping: 18, mass: 0.9 },
  
  // Inercia fluida (carruseles, scroll magnético)
  fluid: { stiffness: 120, damping: 20, mass: 1.2 }
};
```

---

## 🚀 Guía Rápida de Comandos e Instalación

### Skiper UI / Shadcn
```bash
# Instalar componente Dynamic Island de Skiper UI
npx shadcn add @skiper-ui/skiper2

# Instalar dependencias esenciales de animación
npm install framer-motion clsx tailwind-merge lucide-react
```

### React Bits / Vue Bits
```bash
# Dependencias recomendadas para Shaders y 3D
npm install three @types/three gsap @vueuse/core
```

### React Native / Expo
```bash
# Instalar Reanimated & Gesture Handler
npx expo install react-native-reanimated react-native-gesture-handler
```
