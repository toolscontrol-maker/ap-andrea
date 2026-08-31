import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconHeart, IconSparkles, IconLock, IconCheck, IconCalendar, IconBell, IconCamera } from '../ui/Icons';
import { Badge } from '../ui/Badge';

interface AndreaOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingSlide {
  id: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'rose';
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: string; title: string; desc: string }[];
  highlightTip?: string;
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    badge: 'HECHO CON AMOR',
    badgeVariant: 'primary',
    emoji: '🌸',
    title: 'Bienvenida a tu Nido, Andrea',
    subtitle: 'Un espacio íntimo y exclusivo creado solo para ti',
    description:
      'Esta aplicación ha sido diseñada y programada línea a línea por Tonet con todo su cariño. No hay extraños, ni algoritmos, ni anuncios. Es nuestro rincón sagrado para guardar nuestra historia.',
    features: [
      {
        icon: '🔒',
        title: '100% Privado y Cifrado',
        desc: 'Solo nosotros dos tenemos la llave de este espacio.',
      },
      {
        icon: '✨',
        title: 'Nuestra Historia en Vivo',
        desc: 'Desde el 15 de Febrero de 2025 y para toda la vida.',
      },
      {
        icon: '💌',
        title: 'Hecho a Medida',
        desc: 'Cada detalle está pensado para hacerte sonreír cada día.',
      },
    ],
    highlightTip: '💡 Consejo: Puedes usar la app a diario para conectar con Tonet estés donde estés.',
    accentColor: Colors.light.primary,
  },
  {
    id: 'nest',
    badge: 'CONEXIÓN EN VIVO',
    badgeVariant: 'rose',
    emoji: '💓',
    title: 'El Nido & Latidos en Directo',
    subtitle: 'Siente la presencia de Tonet en cualquier momento',
    description:
      'En la pantalla principal tienes el corazón interactivo de nuestra relación. Con un solo toque puedes enviar un latido que hará vibrar y sonar el móvil de Tonet.',
    features: [
      {
        icon: '💓',
        title: 'Latidos de Amor',
        desc: 'Toca el corazón central para mandar un toque cariñoso instantáneo.',
      },
      {
        icon: '💫',
        title: 'Dial de Sintonía',
        desc: 'Elige cómo te sientes hoy con un toque sutil sin necesidad de palabras.',
      },
      {
        icon: '🖤',
        title: '¿Nos vemos hoy?',
        desc: 'Marca si hoy tenemos cita o si toca extrañarse hasta mañana.',
      },
    ],
    highlightTip: '💡 Al tocar la foto de Tonet en el Nido, puedes ver sus deseos y sugerirle fotos.',
    accentColor: '#EF826A',
  },
  {
    id: 'album',
    badge: 'RECUERDOS SEMANALES',
    badgeVariant: 'butter',
    emoji: '📸',
    title: 'Álbum Semanal de Pareja',
    subtitle: 'Una foto cada semana para que ningún momento se olvide',
    description:
      'Cada semana tenemos un marco especial para subir nuestra fotografía favorita juntos, además de fotos individuales. La app calcula los días restantes para que nunca se nos pase.',
    features: [
      {
        icon: '🖼️',
        title: 'Foto Juntos de la Semana',
        desc: 'Sube vuestro selfie o momento más especial de estos 7 días.',
      },
      {
        icon: '⏳',
        title: 'Cuenta Atrás Automática',
        desc: 'Te avisa de cuántos días quedan para renovar a la siguiente semana.',
      },
      {
        icon: '☁️',
        title: 'Guardado en Alta Resolución',
        desc: 'Tus fotos se comprimen con máxima nitidez y se guardan en la nube.',
      },
    ],
    highlightTip: '💡 En tu perfil solo puedes editar tu foto individual; la foto juntos la subís entre los dos.',
    accentColor: '#D4AF37',
  },
  {
    id: 'places',
    badge: 'NUESTROS RINCONES',
    badgeVariant: 'sage',
    emoji: '📍',
    title: 'Mapa de Citas & Restaurantes',
    subtitle: 'Nuestros lugares favoritos de Valencia y del mundo',
    description:
      'Explora el mapa interactivo con todos los restaurantes donde hemos disfrutado, sitios donde nos conocimos, y lugares que queremos visitar juntos.',
    features: [
      {
        icon: '🍽️',
        title: 'Restaurantes con Reserva Directa',
        desc: 'Toca en Don Salvatore o Kibo para llamar por teléfono o agendar mesa.',
      },
      {
        icon: '✨',
        title: 'Hitos Especiales',
        desc: 'Canet d’En Berenguer, Valencia centro, Roma, París y mucho más.',
      },
      {
        icon: '🗺️',
        title: 'Guardar Nuevos Sitios',
        desc: 'Añade cualquier rincón bonito que descubras para ir juntos.',
      },
    ],
    highlightTip: '💡 Puedes filtrar por restaurantes románticos, cafeterías o escapadas.',
    accentColor: '#5E9470',
  },
  {
    id: 'wishes',
    badge: 'ILUSIONES & SORPRESAS',
    badgeVariant: 'secondary',
    emoji: '🎁',
    title: 'Sorpresas & Catálogo de Deseos',
    subtitle: 'Añade lo que te hace ilusión; Tonet lo hará realidad',
    description:
      'Guarda prendas de ropa, perfumes, escapadas o restaurantes que te apetezca probar. Tonet podrá ver tu lista para prepararte sorpresas increíbles sin que te enteres.',
    features: [
      {
        icon: '🛍️',
        title: 'Guarda Enlaces y Fotos',
        desc: 'Añade fotos, precio y el enlace a la tienda oficial.',
      },
      {
        icon: '🤫',
        title: 'Modo Sorpresa Secreto',
        desc: 'Tonet puede convertir tu deseo en una cita secreta en el calendario.',
      },
      {
        icon: '🔐',
        title: 'Solo Tú Puedes Eliminar',
        desc: 'Tus deseos están protegidos: solo tu cuenta de Andrea puede borrarlos.',
      },
    ],
    highlightTip: '💡 Al pulsar sobre cualquier deseo verás todos los detalles y fotos en grande.',
    accentColor: '#9E8ACD',
  },
  {
    id: 'calendar',
    badge: 'NUESTRA VIDA',
    badgeVariant: 'mistBlue',
    emoji: '🗓️',
    title: 'Calendario de Amor & Aya IA',
    subtitle: 'Citas, aniversarios y nuestra cómplice virtual',
    description:
      'Un calendario diseñado para dos. Además, Aya (nuestra inteligencia artificial íntima) nos acompaña con preguntas divertidas y reflexiones para conocernos aún mejor.',
    features: [
      {
        icon: '💍',
        title: 'Hitos & Aniversarios',
        desc: '15 de Febrero (aniversario oficial), 23 de Noviembre y cumpleaños.',
      },
      {
        icon: '💌',
        title: 'Cartas al Futuro',
        desc: 'Cápsulas del tiempo para abrir en fechas señaladas.',
      },
      {
        icon: '🤖',
        title: 'Aya Cómplice',
        desc: 'Preguntas diarias para responder y descubrir sintonía.',
      },
    ],
    highlightTip: '💡 Si hay una sorpresa en camino, la verás en el calendario con un misterioso "🔒 Sorpresa".',
    accentColor: '#5B86A4',
  },
  {
    id: 'notifications',
    badge: 'EN TU IPHONE',
    badgeVariant: 'primary',
    emoji: '📱',
    title: 'Activa Notificaciones en tu iPhone',
    subtitle: 'Sigue estos 3 sencillos pasos para sentir los latidos',
    description:
      'Para que la app funcione como una aplicación nativa en tu iPhone y te lleguen avisos cuando Tonet te mande latidos o sorpresas:',
    features: [
      {
        icon: '1️⃣',
        title: 'Abre en Safari',
        desc: 'Entra a ap-andrea.vercel.app desde el navegador Safari de tu iPhone.',
      },
      {
        icon: '2️⃣',
        title: 'Añadir a Pantalla de Inicio',
        desc: 'Pulsa el botón Compartir (el icono del cuadrado con flecha ⬆️) y selecciona "Añadir a pantalla de inicio".',
      },
      {
        icon: '3️⃣',
        title: 'Abrir y Permitir Avisos',
        desc: 'Abre la app desde el nuevo icono en tu pantalla y pulsa "Permitir" cuando te solicite notificaciones.',
      },
    ],
    highlightTip: '💡 Puedes probar el sonido y la vibración desde la pestaña Ajustes > Probar Notificación 💓.',
    accentColor: Colors.light.primary,
  },
  {
    id: 'ready',
    badge: 'TODO LISTO',
    badgeVariant: 'rose',
    emoji: '✨',
    title: '¡Todo listo para empezar!',
    subtitle: 'Disfruta de tu espacio, mi amor',
    description:
      'Tu espacio está configurado y sincronizado con el de Tonet. Cada momento que vivamos juntos quedará grabado aquí para siempre.',
    features: [
      {
        icon: '🌸',
        title: 'Andrea',
        desc: 'Novia & Amor de mi vida',
      },
      {
        icon: '👨🏻‍💻',
        title: 'Tonet',
        desc: 'Novio & Creador',
      },
      {
        icon: '❤️',
        title: 'Juntos',
        desc: 'Siempre conectados.',
      },
    ],
    highlightTip: '💬 "Gracias por ser mi inspiración cada día. Te quiero con locura." — Tonet',
    accentColor: '#EF826A',
  },
];

export function AndreaOnboardingModal({
  visible,
  onClose,
  onComplete,
}: AndreaOnboardingModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    triggerHaptic('selection');
    if (isLastSlide) {
      triggerHaptic('success');
      onComplete();
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      triggerHaptic('selection');
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic('medium');
    onComplete();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Top Bar: Progress Pills & Close */}
          <View style={styles.topNavRow}>
            {/* Step Indicators */}
            <View style={styles.pillsRow}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pillIndicator,
                    i === currentIndex && styles.pillActive,
                    i < currentIndex && styles.pillCompleted,
                  ]}
                />
              ))}
            </View>

            {!isLastSlide && (
              <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
                <Text style={styles.skipText}>Saltar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Slide Content Scroll */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Emoji & Badge */}
            <View style={styles.headerBlock}>
              <View style={[styles.emojiCircle, { borderColor: currentSlide.accentColor }]}>
                <Text style={styles.emojiText}>{currentSlide.emoji}</Text>
              </View>
              <Badge variant={currentSlide.badgeVariant} size="sm">
                {currentSlide.badge}
              </Badge>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideSubtitle}>{currentSlide.subtitle}</Text>
            <Text style={styles.slideDesc}>{currentSlide.description}</Text>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {currentSlide.features.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={styles.featureIconCircle}>
                    <Text style={{ fontSize: 18 }}>{feat.icon}</Text>
                  </View>
                  <View style={styles.featureTextCol}>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureDesc}>{feat.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Highlight Tip Card */}
            {currentSlide.highlightTip && (
              <View style={styles.tipCard}>
                <Text style={styles.tipText}>{currentSlide.highlightTip}</Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footerRow}>
            {currentIndex > 0 ? (
              <TouchableOpacity style={styles.btnBack} activeOpacity={0.7} onPress={handlePrev}>
                <Text style={styles.btnBackText}>‹ Atrás</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 0.4 }} />
            )}

            <TouchableOpacity
              style={[
                styles.btnNext,
                { backgroundColor: isLastSlide ? '#EF826A' : Colors.light.primary },
              ]}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.btnNextText}>
                {isLastSlide ? 'Entrar a Mi Nido 💖' : 'Siguiente ›'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadows.elevated,
    overflow: 'hidden',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  pillIndicator: {
    height: 4,
    flex: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.12)',
    borderRadius: 2,
  },
  pillActive: {
    backgroundColor: Colors.light.primary,
  },
  pillCompleted: {
    backgroundColor: 'rgba(224, 86, 102, 0.5)',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: Spacing.md,
  },
  skipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#766B72',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  emojiText: {
    fontSize: 30,
  },
  slideTitle: {
    ...Typography.h1,
    fontSize: 22,
    color: '#1E252B',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  slideSubtitle: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#EF826A',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  slideDesc: {
    ...Typography.body,
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  featuresContainer: {
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E252B',
  },
  featureDesc: {
    fontSize: 12,
    color: '#766B72',
    lineHeight: 16,
    marginTop: 1,
  },
  tipCard: {
    backgroundColor: 'rgba(239, 130, 106, 0.08)',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 130, 106, 0.2)',
  },
  tipText: {
    fontSize: 12,
    color: '#52434E',
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 47, 56, 0.06)',
  },
  btnBack: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  btnBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#766B72',
  },
  btnNext: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  btnNextText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
