# 🎨 Mapbox Studio & Editorial Cartography Guide

Rules, color palettes, and techniques for creating *Quiet Luxury* and editorial cartography for intimate relationship applications.

---

## 1. The Quiet Luxury Color Palette

Standard road maps (like Google Maps) are visually aggressive with bright yellow highways, saturated greens, and blue oceans. Editorial luxury maps prioritize calming, organic tones that make memory pins pop:

| Layer | Hex Color | Role |
| :--- | :--- | :--- |
| **Background / Land** | `#FAF7F2` | Warm Parisian stone / atelier cream |
| **Water / Rivers / Ocean** | `#ECE8E1` / `#E2EBF0` | Soft limestone water or misty powder blue |
| **Parks & Greenery** | `#EDF3EE` | Desaturated sage mist |
| **Minor Road Network** | `#FFFFFF` (opacity 0.7) | Subtle hairline lanes |
| **Major Highways / Arterials** | `#E8E3DA` | Elegant muted stone lines |
| **Building Footprints** | `#F3EFE9` | Soft 3D extrusions with minimal contrast |
| **Labels & Typography** | `#7D7280` / `#2B2129` | Editorial grotesque typography with wide letter-spacing |

---

## 2. Style Specification JSON Structure

Mapbox styles follow the open Mapbox Style Specification:

```json
{
  "version": 8,
  "name": "Andrea Quiet Luxury",
  "metadata": { "mapbox:autocomposite": true },
  "sources": {
    "composite": {
      "url": "mapbox://mapbox.mapbox-streets-v8",
      "type": "vector"
    }
  },
  "sprite": "mapbox://sprites/mapbox/light-v11",
  "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": { "background-color": "#FAF7F2" }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "composite",
      "source-layer": "water",
      "paint": { "fill-color": "#E2EBF0" }
    },
    {
      "id": "road-minor",
      "type": "line",
      "source": "composite",
      "source-layer": "road",
      "filter": ["==", "class", "street"],
      "paint": {
        "line-color": "#FFFFFF",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.8, 16, 2.5]
      }
    }
  ]
}
```

---

## 3. Dynamic Style Switching without Flickering

When toggling between Light and Dark or Satellite modes at runtime:
- Preserve sources and layers by updating only `map.setStyle(newStyleUrl, { diff: true })`.
- Listen for `style.load` to re-bind custom GeoJSON layers if required.
