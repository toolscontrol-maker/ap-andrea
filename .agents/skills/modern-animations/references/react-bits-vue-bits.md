# 🌌 React Bits & Vue Bits Component Recipes & Implementations

Colección de recetas arquitectónicas y código reutilizable basado en el catálogo de **React Bits** y su port oficial **Vue Bits**.

---

## 1. Text Animations

### `BlurText` (React / Next.js & Vue)
Efecto editorial donde el texto aparece palabra por palabra o letra por letra, pasando de desenfoque (`blur(10px)`) a nitidez con elevación suave en el eje Y.

```tsx
// React / Framer Motion Implementation
import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
}

export function BlurText({
  text,
  delay = 50,
  className = '',
  animateBy = 'words'
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 8 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="inline-block mr-[0.25em]"
        >
          {el}
        </motion.span>
      ))}
    </span>
  );
}
```

---

### `TrueFocus` (Hover Focus Lens)
Marco delimitador con esquinas que viaja suavemente hacia la palabra sobre la que se posiciona el cursor.

```tsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function TrueFocus({ sentence = 'Construir recuerdos juntos', manualMode = false }) {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [boxPos, setBoxPos] = useState({ left: 0, width: 0, height: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = wordRefs.current[currentIndex];
    if (el && containerRef.current) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setBoxPos({
        left: rect.left - parentRect.left - 4,
        top: rect.top - parentRect.top - 2,
        width: rect.width + 8,
        height: rect.height + 4
      });
    }
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="relative inline-flex flex-wrap gap-2 text-2xl font-serif">
      <motion.div
        className="absolute border border-coral-500 rounded-md pointer-events-none"
        animate={{ ...boxPos }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-coral-500" />
        <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-coral-500" />
        <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-coral-500" />
        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-coral-500" />
      </motion.div>

      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => (wordRefs.current[i] = el)}
          onMouseEnter={() => setCurrentIndex(i)}
          className={`cursor-pointer transition-colors duration-200 ${
            currentIndex === i ? 'text-coral-600 font-medium' : 'text-neutral-500'
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
```

---

## 2. Interactive Cards & Micro-Interactions

### `TiltedCard` (3D Perspective Spring Card)
Tarjeta interactiva que se inclina en 3D (`perspective: 1000px`, `rotateX`, `rotateY`) siguiendo el movimiento del cursor, con brillo radial dinámico (*glare overlay*).

```tsx
import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function TiltedCard({
  children,
  maxTilt = 12,
  glare = true,
  className = ''
}: {
  children: React.ReactNode;
  maxTilt?: number;
  glare?: boolean;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);

    if (glare) {
      setGlarePos({
        x: (e.clientX - rect.left) / rect.width * 100,
        y: (e.clientY - rect.top) / rect.height * 100,
        opacity: 0.18
      });
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div style={{ perspective: 1000 }} className="inline-block">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className={`relative overflow-hidden rounded-2xl ${className}`}
      >
        {children}

        {glare && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8), transparent 60%)`
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
```

---

### `Magnet` (Magnetic Attraction Component)
Atrae botones o iconos hacia el cursor cuando este entra en un radio de proximidad.

```tsx
import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export function Magnet({
  children,
  pullStrength = 0.35,
  radius = 120
}: {
  children: React.ReactNode;
  pullStrength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    if (dist < radius) {
      x.set((e.clientX - centerX) * pullStrength);
      y.set((e.clientY - centerY) * pullStrength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
```

---

## 3. Backgrounds & Shaders

### `AuroraBackground` (Liquid Mesh Gradient)
Fondo ambiental etéreo con movimiento orgánico de gradientes radiales continuos.

```css
@keyframes aurora-wave {
  0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
  50% { transform: translate3d(-3%, 4%, 0) rotate(180deg) scale(1.08); }
  100% { transform: translate3d(0, 0, 0) rotate(360deg) scale(1); }
}

.aurora-canvas {
  background: radial-gradient(circle at 10% 20%, rgba(239, 130, 106, 0.15), transparent 45%),
              radial-gradient(circle at 80% 80%, rgba(158, 138, 205, 0.15), transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(131, 169, 140, 0.12), transparent 60%);
  filter: blur(40px);
  animation: aurora-wave 18s ease-in-out infinite alternate;
}
```
