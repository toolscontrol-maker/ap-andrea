# 📐 Proportions, Geometry & Responsiveness Architecture

Comprehensive guide on mathematical aspect ratios, concentric geometry, and responsive cross-device layout engineering.

---

## 1. 🔢 Canonical UI Aspect Ratios

| Ratio | Decimal | Component Archetype | Andrea App Application |
| :--- | :--- | :--- | :--- |
| **`1:1`** | `1.000` | Square | Avatares de pareja, miniaturas en cuadrícula de fotos, iconos de categoría, botones HUD circulares. |
| **`4:5`** | `0.800` | Retrato Editorial (*Runway*) | Tarjetas de recuerdos fotográficos, retratos de pareja en el diario. |
| **`3:4`** | `0.750` | Retrato Clásico | Tarjetas de deseos (*wishlist cards*), fichas de restaurantes. |
| **`1:1.414`** | `0.707` | Rectángulo $\sqrt{2}$ (Norma DIN) | Tarjetas de lectura, entradas de diario (Apple Journal), notas de gratitud. |
| **`1:1.618`** | `0.618` | **Proporción Áurea ($\phi$)** | Tarjetas hero principales (Semilla del día, resumen semanal). |
| **`16:9`** | `1.777` | Panorámica | Banners de ciudades en el mapa, cabeceras de viajes. |

---

## 2. 📱 Breakpoint Scale & Multi-Device Adapters

```typescript
export const Breakpoints = {
  compactPhone: 375,   // < 375px (iPhone SE)
  standardPhone: 430,  // 375px - 430px (iPhone 15/16 Pro)
  largePhone: 600,     // 430px - 600px (iPhone Pro Max, Plus)
  tablet: 1024,        // 600px - 1024px (iPad, Android tablets)
  desktop: 1440,       // > 1024px (Desktop web monitors)
};
```

### Reglas de Adaptación:
1. **Contenedor Máximo Centrado (`maxWidth: 680px`)**:
   En pantallas grandes (Web / Desktop / iPad), el contenido se centra en un contenedor de ancho máximo `680px`, evitando que la app parezca un teléfono estirado y manteniendo la intimidad del diseño.
2. **Atmósfera Full Bleed**:
   El fondo, la paleta cromática y los desenfoques de fondo se extienden al 100% de la ventana.
3. **Cuadrículas Adaptativas (1 Columna en Móvil ➔ 2 Columnas en Tablet/Desktop)**:
   Las cuadrículas de deseos y recuerdos pasan fluidamente de 1 columna a 2 columnas cuando el ancho es $\ge 600\text{px}$.

---

## 3. 📐 La Regla de Concentricidad de Radios

Para evitar esquinas visualmente discordantes en tarjetas con contenido anidado:

$$R_{\text{interior}} = \max\left(0, \; R_{\text{exterior}} - \text{Padding}\right)$$

```tsx
const outerRadius = 20;
const padding = 12;
const innerRadius = getConcentricRadius(outerRadius, padding); // 8px
```

---

## 4. 👆 Ergonomía Táctil y Zona del Pulgar (*Thumb Zone*)

1. **Objetivo Táctil Mínimo**:
   Todos los elementos interactivos tienen un área de contacto mínima de **$44 \times 44\text{pt}$** (Apple HIG).
2. **Jerarquía Ergonómica**:
   - **Zona Cómoda (Inferior 60%)**: Barra de pestañas, botones principales de acción (*Sembrar momento*, *Guardar deseo*), barra de chat.
   - **Zona de Información (Superior 40%)**: Títulos de cabecera, Dynamic Island, estado de sincronización cifrada.
