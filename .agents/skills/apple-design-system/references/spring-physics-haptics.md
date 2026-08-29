# ⚡ Spring Physics & Tactile Haptic Choreography

Mathematical constants for Apple damped harmonic oscillator springs and tactile haptic event choreography.

---

## 1. Damped Harmonic Oscillator Spring Physics

Apple motion is defined by three physical parameters:
- **Mass ($m$)**: Inertia / weight of the moving element.
- **Stiffness ($k$)**: Tension of the spring (higher = snappier).
- **Damping ($c$)**: Friction reducing oscillation (higher = less bounce).

$$\text{Damping Ratio } \zeta = \frac{c}{2\sqrt{k \cdot m}}$$

### Apple Preset Spring Configurations:

| Preset Name | Mass | Stiffness | Damping | Damping Ratio ($\zeta$) | Behavior & Apple Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Interactive Tap** | `0.8` | `400` | `25` | `0.70` (Subtle bounce) | Button tap scale down (`0.96x`), card touch |
| **Sheet Slide** | `1.0` | `300` | `30` | `0.86` (Near critical) | Bottom sheet expand/collapse, modal presentation |
| **Segment Snap** | `0.6` | `500` | `35` | `1.01` (Snappy, no bounce)| Segmented control thumb slider, tab indicator |
| **Fluid Peek** | `1.2` | `200` | `24` | `0.77` (Organic float) | Dynamic Island expansion, Floating HUD |

---

## 2. Tactile Haptic Feedback Taxonomy

| Haptic Type | Target Event | User Perception |
| :--- | :--- | :--- |
| **`selection`** | Slider tick, SegmentedControl change, Tab change, Date select | Crisp micro-click, zero fatigue |
| **`light`** | Standard button press, filter chip click, card select | Gentle subtle tap |
| **`medium`** | Opening a modal/sheet, dragging to threshold, map pin tap | Noticeable feedback |
| **`heavy`** | Completing a ritual, unlocking a surprise, destructive action | Deep, resonant thud |
| **`notificationSuccess`** | Saving a memory, syncing E2EE key, completing a wish | Double pleasant pulse |
| **`notificationError`** | Validation failure, unauthorized access | Triple rapid buzz |
