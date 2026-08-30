import fs from 'fs';
import path from 'path';

const content = `# 📜 ANDREA DESIGN SYSTEM v1 — CONSTITUCIÓN VISUAL

> **Fuente Única de Verdad** para Andrea App.  
> Cada pantalla debe construirse exclusivamente utilizando los tokens y componentes definidos en este sistema. Si se requiere una pieza nueva, debe formalizarse primero en este documento antes de aplicarse en código.

---

## 1. Principio de Marca
Andrea no es una app de productividad, un dashboard ni una red social.
Debe sentirse:
- **Íntima**
- **Serena**
- **Editorial**
- **Táctil**
- **Cálida**
- **Minimalista**
- **Premium sin lujo excesivo**
- **Emocional sin ser cursi**
- **Moderna sin parecer una plantilla SaaS**

### 🌟 Regla Madre
1. **Una sola acción principal (CTA)** protagonista por pantalla o viewport.
2. **Jerarquía visual clara** con suficiente espacio vacío para respirar.
3. Si un componente no ayuda a **recordar**, **planear**, **descubrir** o **cuidar una relación**, no compite visualmente.

---

## 2. Foundations: Reglas Numéricas

### 📐 Grid y Espaciado (\`Space\`)
Escala geométrica discreta base 4 px:
\`\`\`ts
export const Space = {
  0: 0,
  1: 4,   // Micro-ajustes y paddings mínimos
  2: 8,   // Elementos hermanos muy cercanos / gap iconos
  3: 12,  // Contenido interno de cards e inputs
  4: 16,  // Estándar de card / texto a acción / separación base
  5: 20,  // Padding horizontal estándar de pantalla / card destacada
  6: 24,  // Separar bloques relacionados
  7: 32,  // Separar secciones
  8: 40,  // Márgenes amplios de layout
  9: 48,  // Separar capítulos grandes de una pantalla
  10: 56, // Altura de headers
  11: 64, // Separaciones máximas
} as const;
\`\`\`

#### 🚫 Prohibido:
\`marginTop: 13\`, \`paddingHorizontal: 19\`, \`gap: 11\`, \`borderRadius: 17\`

#### ✅ Permitido:
\`marginTop: Space[4]\`, \`paddingHorizontal: Space[5]\`, \`gap: Space[3]\`

---

### 📱 Tamaños y Layout (\`Layout\`)
\`\`\`ts
export const Layout = {
  screenPadding: 20,
  screenPaddingCompact: 16,
  maxContentWidth: 680,
  headerHeight: 56,
  bottomTabBarHeight: 72,
  touchTarget: 44,
  iconButton: 44,
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,
} as const;
\`\`\`

#### Reglas obligatorias:
- Toda pantalla normal usa \`ScreenWrapper\`.
- En web/desktop, contenido máximo de **680 px**.
- En móvil, padding estándar de **20 px**.
- Full bleed solo para **mapa**, **cámara**, **hero de imagen** o **media**.
- Todo botón o control táctil tiene al menos **44 × 44 px**.
- No más de dos acciones primarias visibles por viewport.
- No uses más de un CTA coral fuerte por pantalla.

---

### 🎨 Color: Roles Semánticos (\`Colors\`)

#### Tokens Base (\`Palette\`):
\`\`\`ts
export const Palette = {
  cream: '#FFF8F2',
  blush: '#FFFCFA',
  white: '#FFFFFF',
  coral: '#EF826A',
  coralSoft: '#FBE0DA',
  lavender: '#9E8ACD',
  lavenderSoft: '#ECE7F7',
  sage: '#83A98C',
  sageSoft: '#E3EEE4',
  butter: '#F4C95D',
  butterSoft: '#FFF3CD',
  plum: '#3A2F38',
  mauve: '#766B72',
  line: 'rgba(58, 47, 56, 0.08)',
  lineStrong: 'rgba(58, 47, 56, 0.14)',
} as const;
\`\`\`

#### Roles Semánticos Obligatorios:
| Situación | Token Obligatorio |
|---|---|
| Fondo de pantalla | \`Colors.light.background\` |
| Card estándar | \`Colors.light.surface\` |
| Card activa / modal | \`Colors.light.surfaceElevated\` |
| Texto principal | \`Colors.light.text\` |
| Texto secundario | \`Colors.light.textSecondary\` |
| CTA principal | \`Colors.light.primary\` |
| Acciones suaves | \`Colors.light.primarySoft\` / \`accentSageSoft\` |
| Bordes | \`Colors.light.border\` |
| Peligro | \`Colors.light.danger\` |
| Éxito / completado | \`Colors.light.success\` |

#### 🚫 Prohibiciones:
- No usar azul brillante genérico de SaaS.
- No usar negro puro \`#000000\`.
- No usar gris de sistema sin token.
- No crear un color "solo para esta pantalla".
- No usar más de un color de acento fuerte por card.
- Coral es para acción/selección/emoción importante, no para decorar todo.

---

### ✍️ Tipografía (\`Typography\`)
Fuente única: **Inter** calibrada.
\`\`\`ts
export const Typography = {
  display:   { fontFamily: 'Inter_700Bold', fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  h1:        { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, letterSpacing: -0.45 },
  h2:        { fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 24, letterSpacing: -0.25 },
  title:     { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 21, letterSpacing: -0.15 },
  body:      { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  label:     { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  caption:   { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 14, letterSpacing: 0.15 },
  button:    { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
} as const;
\`\`\`

#### Regla de jerarquía:
- \`Display\` → máximo una vez por pantalla.
- \`H1\` → título principal de pantalla.
- \`H2\` → título de sección.
- \`Title\` → título de card / item.
- \`Body\` → contenido normal.
- \`BodySmall\` → información secundaria.
- \`Label\` → chips, badges, botones, metadata.
- \`Caption\` → fechas, contador, microcopy.

---

### 🔘 Bordes y Formas (\`Radius\`)
\`\`\`ts
export const Radius = {
  none: 0,
  xs: 8,      // Micro tags, metadata
  sm: 12,     // Inputs, campos compactos
  md: 16,     // Icon buttons, tabs activos
  lg: 20,     // Cards estándar
  xl: 24,     // Hero cards, photo frames, modales
  sheet: 28,  // Bottom sheets
  pill: 999,  // Chips, badges, botones redondos, avatares
} as const;
\`\`\`

---

### ☁️ Elevación y Sombras (\`Shadows\`)
\`\`\`ts
export const Shadows = {
  none: {},
  soft: {
    shadowColor: '#3A2F38',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#3A2F38',
    shadowOpacity: 0.11,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
} as const;
\`\`\`

---

### 🔘 Botones (\`Button\`) — 5 Variantes
1. **Primary**: Coral, texto blanco (Acción protagonista).
2. **Secondary**: Coral suave, texto ciruela (Acción secundaria).
3. **Ghost**: Transparente, texto ciruela/coral (Navegación o acción terciaria).
4. **Destructive**: Rojo suave, texto rojo oscuro (Eliminar).
5. **Icon**: Surface elevated, ciruela (44×44 px, buscar, cerrar, editar).

---

### 🃏 Cards (\`Card\`) — 3 Tipos
1. **Standard**: informativo, resumen (\`padding: 16\`, \`radius: 20\`, \`bg: surface\`, \`border: border\`, \`shadow: none\`).
2. **Interactive**: abre detalle (\`padding: 16\`, \`radius: 20\`, \`bg: surfaceElevated\`, \`border: border\`, \`shadow: soft\`, \`pressScale: 0.98\`).
3. **Hero**: foto, recuerdo principal (\`padding: 20\`, \`radius: 24\`, \`bg: surfaceElevated\`, \`shadow: soft\`).

---

### 🏷️ Iconografía
- **Librería Única**: \`lucide-react-native\`.
- **Tamaño normal**: 20 px.
- **Tamaño pequeño**: 16 px.
- **Tamaño navegación**: 22 px.
- **Grosor**: 1.75–2 px.
- **Cero emojis como iconos UI**.

---

### 🎬 Motion (\`Motion\`)
\`\`\`ts
export const Motion = {
  fast: 140,
  normal: 200,
  slow: 280,
  pressScale: 0.98,
  sheetDuration: 260,
  mapCameraDuration: 420,
} as const;
\`\`\`

---

## 3. Reglas Específicas de Andrea
- **Regla 1: Espacio emocional**. No llenar la pantalla por miedo al vacío. Máximo 2–3 bloques principales visibles al entrar.
- **Regla 2: Color como significado**.
  - **Coral**: Acción importante / relación / selección.
  - **Butter**: Restaurante / deseo / celebración.
  - **Salvia**: Completado / tranquilidad / ritual.
  - **Lavanda**: Futuro / viaje / reflexión.
  - **Ciruela**: Contenido y estructura.
- **Regla 3: Una acción protagonista por pantalla**.
- **Regla 4: Cero decoraciones gratuitas**. Si no comunica estado o jerarquía, se elimina.
- **Regla 5: Datos íntimos no parecen datos**. Un recuerdo debe sentirse como una historia.

---

## 4. Checklist de Revisión
- [ ] ¿Usa \`ScreenWrapper\` y \`Layout.maxContentWidth\`?
- [ ] ¿Todos los colores provienen de \`Colors.light\` sin hex strings hardcodeados?
- [ ] ¿Todos los márgenes y paddings usan \`Space[n]\`?
- [ ] ¿Todos los bordes usan \`Radius[key]\`?
- [ ] ¿Hay una sola acción \`Primary\` por viewport?
- [ ] ¿Todos los botones tienen tamaño mínimo 44×44 px y \`accessibilityLabel\`?
- [ ] ¿Los iconos son de Lucide con grosor consistente?
`;

fs.writeFileSync(path.join(process.cwd(), 'DESIGN_SYSTEM.md'), content, 'utf8');
console.log('✅ DESIGN_SYSTEM.md created at root.');
