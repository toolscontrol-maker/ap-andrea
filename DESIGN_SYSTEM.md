# Andrea Design System & Engineering Handbook

Este documento define los **estándares universales, tokens y principios de diseño** de la aplicación **Andrea**. Toda pantalla, componente o módulo añadido debe respetar estrictamente estas reglas.

---

## 1. Principios Fundamentales de Diseño

1. **Una Casa Digital, No una Red Social**:
   - Andrea es un espacio íntimo, cálido y privado.
   - Prohibido cualquier tipo de racha de culpa, métrica de rendimiento amoroso o ranking.

2. **Geometría Orgánica y Suave**:
   - Esquinas redondeadas suaves (*squircles*): `Radii.lg (16px)`, `Radii.xl (20px)` y `Radii.2xl (24px)`.
   - Bordes ultra-finos translúcidos: `1px solid rgba(58, 47, 56, 0.08)`.
   - Sombras ambientales de dos capas (sin sombras duras ni cortes negros).

3. **Responsividad Universal**:
   - Toda pantalla debe envolverse con `<ScreenWrapper>`.
   - En pantallas anchas (escritorio y tablet), el contenido se autocentra con un ancho máximo de `680px` (`Layout.maxContentWidth`), manteniendo márgenes limpios y respirables.

4. **Feedback Táctil Inmediato**:
   - Todos los elementos interactivos deben usar opacidad activa (`activeOpacity={0.7}`) o micro-animaciones al tocar.

---

## 2. Tokens del Sistema (`src/theme/`)

### Escala de Espaciado (8-Point Grid)
```typescript
import { Spacing } from '../theme/tokens';

Spacing.xs   // 4px
Spacing.sm   // 8px
Spacing.md   // 12px
Spacing.lg   // 16px
Spacing.xl   // 20px
Spacing['2xl'] // 24px
Spacing['3xl'] // 32px
Spacing['4xl'] // 40px
```

### Paleta Emocional Semántica
```typescript
import { Colors } from '../theme/colors';

Colors.light.background      // #FFF8F2 (Crema cálido)
Colors.light.surface         // #FFFCFA (Blanco rosado)
Colors.light.surfaceElevated // #FFFFFF (Blanco puro elevado)
Colors.light.primary         // #EF826A (Coral suave)
Colors.light.secondary       // #9E8ACD (Lila lavanda)
Colors.light.sage            // #83A98C (Verde salvia)
Colors.light.butter          // #F4C95D (Amarillo mantequilla)
Colors.light.mistBlue        // #87AFC7 (Azul niebla)
Colors.light.text            // #3A2F38 (Ciruela profunda)
Colors.light.textSecondary   // #766B72 (Gris malva)
```

### Tipografía Global Unificada (Inter)
```typescript
import { Typography, FontFamily } from '../theme/Typography';

FontFamily.regular   // 'Inter_400Regular'
FontFamily.medium    // 'Inter_500Medium'
FontFamily.semiBold  // 'Inter_600SemiBold'
FontFamily.bold      // 'Inter_700Bold'

Typography.display    // 28px / 34px / Bold (-0.7px tracking)
Typography.h1         // 24px / 30px / Bold (-0.45px tracking)
Typography.h2         // 18px / 23px / Bold (-0.25px tracking)
Typography.title      // 16px / 21px / SemiBold (-0.15px tracking)
Typography.body       // 15px / 21px / Regular (0px tracking)
Typography.bodySmall  // 13px / 18px / Regular (0px tracking)
Typography.label      // 12px / 16px / SemiBold (+0.15px tracking)
Typography.caption    // 11px / 14px / Medium (+0.2px tracking)
Typography.calendarDay// 14px / 18px / Medium (-0.1px tracking)
```

---

## 3. Biblioteca de Componentes UI Reutilizables (`src/components/ui/`)

| Componente | Uso |
| :--- | :--- |
| `<ScreenWrapper>` | Envoltura obligatoria de pantalla (scroll, safe area, max-width clamp). |
| `<Card>` | Tarjetas base con variantes (`default`, `elevated`, `subtle`, `interactive`). |
| `<Button>` | Botón interactivo con variantes (`primary`, `secondary`, `sage`, `butter`, `mistBlue`, `outline`, `ghost`). |
| `<Badge>` | Píldoras informativas con color de fondo suave y tipografía nítida. |
| `<SectionHeader>` | Cabecera estándar de pantalla con título, subtítulo y acción opcional. |
| `<EmptyState>` | Estados vacíos poéticos y acogedores con icono y llamada a la acción. |
| `<Input>` / `<TextArea>` | Entradas de texto con focus rings suaves y labels jerárquicos. |
| `<SegmentedControl>` | Barra deslizante de filtros o pestañas de navegación interna. |
| `<ModalWrapper>` | Ventanas modales centradas con backdrop suave y cabecera limpia. |

---

## 4. Reglas de Implementación en Código

- ❌ **Prohibido**: Escribir colores hexadecimales en línea (ej. `color: '#EF826A'`).
- ✅ **Obligatorio**: Usar `Colors.light.primary`.
- ❌ **Prohibido**: Valores numéricos arbitrarios de margen o padding (ej. `margin: 13`).
- ✅ **Obligatorio**: Usar `Spacing.md`, `Spacing.lg`, etc.
- ❌ **Prohibido**: Pantallas sin contención responsive en web.
- ✅ **Obligatorio**: Toda vista debe usar `<ScreenWrapper>`.
