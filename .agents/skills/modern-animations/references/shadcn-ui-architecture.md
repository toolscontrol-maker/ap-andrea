# 🧱 shadcn/ui Component Architecture & Registry Mastery

Guía completa y referencia técnica para la arquitectura de componentes, distribución de código, accesibilidad y variantes de **shadcn/ui**.

---

## 1. La Filosofía shadcn/ui ("Own Your Code")

A diferencia de las librerías de componentes tradicionales instaladas como dependencias `node_modules` rígidas, **shadcn/ui** es una plataforma de **distribución de código abierto**:

1. **Propiedad Total**: El código vive directamente en tu proyecto (`components/ui/`). Tienes control 100% sobre el markup, estilos y comportamiento.
2. **Primitivas Accesibles (Radix UI)**: Manejo completo de accesibilidad (ARIA), navegación por teclado, focus traps y renderizado en portales.
3. **Composición con Tailwind CSS & CVA**: Gestión declarativa y tipada de variantes mediante `class-variance-authority`.

---

## 2. Los 3 Pilares Técnicos Fundamentales

### 1. La Función `cn()` (`lib/utils.ts`)
Resuelve conflictos de clases en Tailwind CSS fusionando `clsx` y `tailwind-merge`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### 2. Gestión Tipada de Variantes con `cva`
Permite crear componentes con variantes semánticas seguras en TypeScript:

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

---

### 3. Sistema de Tokens con Variables CSS HSL

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 10 78% 63%;          /* Coral Cálido Andrea */
    --primary-foreground: 0 0% 98%;
    --secondary: 260 40% 67%;       /* Lavanda Andrea */
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 140 25% 60%;          /* Verde Salvia */
    --accent-foreground: 240 5.9% 10%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 10 78% 63%;
    --radius: 1rem;
  }
}
```

---

## 3. Catálogo de Componentes Esenciales de shadcn/ui

| Componente | Paquete Primitivo | Uso Principal |
| :--- | :--- | :--- |
| `Dialog` / `Modal` | `@radix-ui/react-dialog` | Modales centrados con backdrop difuminado y focus trap accesible. |
| `Sheet` / `Drawer` | `@radix-ui/react-dialog` + `vaul` | Paneles laterales o inferiores deslizantes tipo iOS. |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Menús contextuales con submenús y atajos de teclado. |
| `Popover` | `@radix-ui/react-popover` | Tarjetas flotantes posicionadas con auto-flip (Floating UI). |
| `Tooltip` | `@radix-ui/react-tooltip` | Píldoras explicativas con retardo y micro-animación. |
| `Command` / `CMDK` | `cmdk` | Paleta de comandos rápida estilo Raycast o Spotlight. |
| `Tabs` | `@radix-ui/react-tabs` | Navegación interna con transiciones de contenido. |
| `Sonner` / `Toaster` | `sonner` | Notificaciones toast ultra-fluidas y apilables. |

---

## 4. Adaptación Universal (React, Next.js, Vue y React Native)

1. **React / Next.js**: CLI nativo `npx shadcn@latest add [component]`.
2. **Vue.js**: Port oficial `shadcn-vue` (`npx shadcn-vue@latest add [component]`) con soporte para Radix Vue.
3. **React Native**: Mismo patrón arquitectónico de `cva` y tokens con StyleSheet / NativeWind.
