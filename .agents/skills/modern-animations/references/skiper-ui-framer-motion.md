# 📱 Skiper UI & Framer Motion Suite (`@skiper-ui/skiper2`)

Guía de integración para **Skiper UI** y patrones avanzados de **Framer Motion**.

---

## 1. Dynamic Island (`@skiper-ui/skiper2`)

El componente `skiper2` representa una **Isla Dinámica** con morphing fluido entre múltiples estados (`idle`, `timer`, `music`, `call`, `airdrop`, `surprise`).

### Arquitectura de Estados
```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DynamicIslandState =
  | 'idle'
  | 'timer'
  | 'music'
  | 'call'
  | 'surprise_revealed'
  | 'seed_planted';

const BOUNCE_SPRING = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.8
};

export function DynamicIsland({
  state = 'idle',
  title,
  subtitle
}: {
  state: DynamicIslandState;
  title?: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      layout
      transition={BOUNCE_SPRING}
      className={`mx-auto bg-neutral-900 text-white rounded-full overflow-hidden flex items-center justify-between shadow-2xl ${
        state === 'idle'
          ? 'w-28 h-8 px-3'
          : state === 'surprise_revealed'
          ? 'w-72 h-16 px-4'
          : 'w-64 h-12 px-4'
      }`}
    >
      <AnimatePresence mode="popLayout">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-between w-full"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse" />
            <span className="text-xs font-mono">Andrea</span>
          </motion.div>
        )}

        {state === 'surprise_revealed' && (
          <motion.div
            key="surprise"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-10 h-10 rounded-full bg-coral-500/20 flex items-center justify-center text-xl">
              🎁
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-coral-400">¡Sorpresa Revelada!</p>
              <p className="text-xs truncate text-neutral-300">{title || 'Cena en Kibo Omakase'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

---

## 2. Morphing Modals con `layoutId` (Shared Layout Animation)

Permite que una tarjeta pequeña en una lista se expanda suavemente hasta convertirse en una pantalla de detalle completa sin saltos de layout.

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MorphingWishCard({ wish }: { wish: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        layoutId={`card-${wish.id}`}
        onClick={() => setIsOpen(true)}
        className="p-4 bg-white rounded-2xl border border-neutral-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      >
        <motion.h3 layoutId={`title-${wish.id}`} className="font-bold text-lg">
          {wish.title}
        </motion.h3>
        <motion.p layoutId={`price-${wish.id}`} className="text-sm text-coral-600 font-semibold">
          {wish.estimatedPrice}€
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />

            <motion.div
              layoutId={`card-${wish.id}`}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10"
            >
              <motion.h3 layoutId={`title-${wish.id}`} className="font-bold text-2xl mb-2">
                {wish.title}
              </motion.h3>
              <motion.p layoutId={`price-${wish.id}`} className="text-lg text-coral-600 font-bold mb-4">
                {wish.estimatedPrice}€
              </motion.p>
              <p className="text-neutral-600 mb-6">{wish.description}</p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-neutral-900 text-white rounded-full font-semibold"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
```
