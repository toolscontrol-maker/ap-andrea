# 📐 Continuous Squircles & Radii Geometry

Reference for Apple's Superellipse ($G2$ continuous curvature) geometry and standardized component radii scale.

---

## 1. The Mathematics of Apple Squircles

A standard CSS or React Native `border-radius` uses a circular arc, which has an abrupt change in curvature where the straight line meets the circle ($G1$ continuity).
Apple designs use **Lamé Superellipses** ($G2$ curvature continuity):

$$\left|\frac{x}{a}\right|^{n} + \left|\frac{y}{b}\right|^{n} = 1 \quad (n \approx 4.5 \text{ to } 5)$$

This eliminates visible "corners" and gives Apple hardware and software its signature organic smoothness.

---

## 2. Standardized Apple Radii Scale

| Token | Radius Value | Component Target |
| :--- | :--- | :--- |
| **`xs`** | `8px` | Micro badges, inline tags, small icon containers |
| **`sm`** | `12px` | Text input boxes, segmented control thumbs, nested chips |
| **`md`** | `16px` | Standard buttons, list item selection pills |
| **`lg`** | `20px` | Grouped inset list cards, medium widgets |
| **`xl`** | `24px` | Large feature cards, Apple Journal entries, photo frames |
| **`2xl`**| `32px` | Modal dialogs, bottom sheets, search panels |
| **`full`**| `9999px` | Floating action pills, status dots, circular avatar frames |

---

## 3. Nested Corner Radius Rule (Concentric Harmony)

When nesting a child container inside a parent container, the child's corner radius must follow the formula:

$$R_{\text{child}} = \max\left(0, \; R_{\text{parent}} - \text{Padding}\right)$$

Example:
- Parent Card: $R_{\text{parent}} = 20\text{px}$, Padding = $8\text{px}$.
- Child Image/Button: $R_{\text{child}} = 20 - 8 = 12\text{px}$.
*Result: Perfectly concentric margins with zero corner collision.*
