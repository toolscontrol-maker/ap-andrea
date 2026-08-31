import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WishlistItemType, WishlistStatus } from '@andrea/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows } from '../../theme/tokens';
import { PhotoUploadField } from '../ui/PhotoUploadField';
import { IconSparkles } from '../ui/Icons';
import { extractLinkMetadata } from '../../utils/linkMetadata';
import { triggerHaptic } from '../../utils/haptics';

export type WishWizardStep = 'category' | 'link' | 'details' | 'media_and_soul';

export interface NewWishData {
  title: string;
  description?: string;
  sourceUrl?: string;
  externalImageUrl?: string;
  images?: string[];
  type: WishlistItemType;
  status: WishlistStatus;
  brand?: string;
  storeName?: string;
  estimatedPrice?: number;
  isForSelf?: boolean;
  phoneNumber?: string;
  color?: string;
  size?: string;
  desiredFor?: string;
  occasion?: string;
}

interface AddWishWizardModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveWish: (data: NewWishData) => void;
}

interface CategoryOption {
  id: WishlistItemType;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'restaurant',
    icon: '🍽️',
    title: 'Restaurante & Gastro',
    subtitle: 'Cenas, gastrobares, rincones con encanto',
    accentColor: '#D97706',
    bgColor: '#FEF3C7',
  },
  {
    id: 'fashion',
    icon: '👗',
    title: 'Moda & Regalos',
    subtitle: 'Prendas, bolsos, zapatos, complementos',
    accentColor: '#DB2777',
    bgColor: '#FCE7F3',
  },
  {
    id: 'trip',
    icon: '✈️',
    title: 'Viaje & Escapada',
    subtitle: 'Destinos soñados, hoteles, vuelos, cabañas',
    accentColor: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: 'home',
    icon: '🏡',
    title: 'Hogar & Deco',
    subtitle: 'Muebles, lámparas, detalles para el nido',
    accentColor: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    id: 'beauty',
    icon: '💄',
    title: 'Belleza & Cuidado',
    subtitle: 'Perfumes, tratamientos, cosmética, bienestar',
    accentColor: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  {
    id: 'experience',
    icon: '🎟️',
    title: 'Experiencia & Plan',
    subtitle: 'Spas, conciertos, espectáculos, talleres',
    accentColor: '#EA580C',
    bgColor: '#FFEDD5',
  },
];

export function AddWishWizardModal({
  visible,
  onClose,
  onSaveWish,
}: AddWishWizardModalProps) {
  const [step, setStep] = useState<WishWizardStep>('category');

  // Form State
  const [type, setType] = useState<WishlistItemType>('restaurant');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [colorOrSize, setColorOrSize] = useState('');
  const [occasion, setOccasion] = useState('');
  const [status, setStatus] = useState<WishlistStatus>('dreaming');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isForSelf, setIsForSelf] = useState(true);

  // Link Extraction State
  const [isExtractingLink, setIsExtractingLink] = useState(false);
  const [extractedSource, setExtractedSource] = useState<string | null>(null);

  // Reset form whenever modal opens
  useEffect(() => {
    if (visible) {
      setStep('category');
      setType('restaurant');
      setTitle('');
      setDescription('');
      setUrl('');
      setBrand('');
      setStoreName('');
      setPrice('');
      setPhone('');
      setColorOrSize('');
      setOccasion('');
      setStatus('dreaming');
      setImageUrl('');
      setGalleryImages([]);
      setIsForSelf(true);
      setExtractedSource(null);
      setIsExtractingLink(false);
    }
  }, [visible]);

  // URL Auto-extraction handler
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    if (!newUrl || newUrl.trim().length < 5) {
      setExtractedSource(null);
      return;
    }

    const trimmed = newUrl.trim();
    if (
      trimmed.includes('.') &&
      (trimmed.startsWith('http') ||
        trimmed.includes('www.') ||
        trimmed.includes('.com') ||
        trimmed.includes('.es') ||
        trimmed.includes('.org') ||
        trimmed.includes('.co'))
    ) {
      setIsExtractingLink(true);
      try {
        const meta = await extractLinkMetadata(trimmed);
        if (meta) {
          triggerHaptic('selection');
          setExtractedSource(meta.brand || meta.domain || 'tienda');

          if (meta.title && !title) setTitle(meta.title);
          if (meta.brand && !brand) setBrand(meta.brand);
          if (meta.type && step === 'link') setType(meta.type);
          if (meta.phoneNumber && !phone) setPhone(meta.phoneNumber);
          if (meta.estimatedPrice !== undefined && meta.estimatedPrice > 0 && !price) {
            setPrice(meta.estimatedPrice.toString());
          }
          if (meta.galleryImages && meta.galleryImages.length > 0) {
            setGalleryImages(meta.galleryImages);
            if (!imageUrl) setImageUrl(meta.galleryImages[0]);
          } else if (meta.imageUrl && !imageUrl) {
            setGalleryImages([meta.imageUrl]);
            setImageUrl(meta.imageUrl);
          }
          if (meta.description && !description) {
            setDescription(meta.description);
          }
        }
      } catch (err) {
        console.warn('[WishWizard] Error extracting metadata:', err);
      } finally {
        setIsExtractingLink(false);
      }
    }
  };

  const handleSelectCoverImage = (img: string) => {
    triggerHaptic('light');
    setImageUrl(img);
  };

  const handleRemoveGalleryImage = (img: string) => {
    triggerHaptic('light');
    setGalleryImages((prev) => {
      const updated = prev.filter((i) => i !== img);
      if (imageUrl === img) {
        setImageUrl(updated[0] || '');
      }
      return updated;
    });
  };

  const handleCustomPhotoAdded = (val: string | null) => {
    if (val) {
      setImageUrl(val);
      setGalleryImages((prev) => [val, ...prev.filter((i) => i !== val)]);
    } else {
      setImageUrl('');
    }
  };

  // Step Progress Calculation
  const getStepProgress = () => {
    switch (step) {
      case 'category':
        return 0.25;
      case 'link':
        return 0.5;
      case 'details':
        return 0.75;
      case 'media_and_soul':
        return 1.0;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'category':
        return 'Paso 1 de 4 · Categoría';
      case 'link':
        return 'Paso 2 de 4 · Enlace & Origen';
      case 'details':
        return 'Paso 3 de 4 · Información';
      case 'media_and_soul':
        return 'Paso 4 de 4 · Fotos & Ilusión';
    }
  };

  const handleNextStep = () => {
    triggerHaptic('selection');
    if (step === 'category') {
      setStep('link');
    } else if (step === 'link') {
      setStep('details');
    } else if (step === 'details') {
      if (!title.trim()) {
        Alert.alert('Falta el nombre', 'Por favor introduce un nombre o título para el deseo antes de continuar.');
        return;
      }
      setStep('media_and_soul');
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step === 'media_and_soul') {
      setStep('details');
    } else if (step === 'details') {
      setStep('link');
    } else if (step === 'link') {
      setStep('category');
    }
  };

  const handleCategorySelect = (selectedType: WishlistItemType) => {
    triggerHaptic('selection');
    setType(selectedType);
    setStep('link');
  };

  const handleFinalSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Falta el nombre', 'Introduce al menos un nombre o idea para el deseo.');
      setStep('details');
      return;
    }

    triggerHaptic('heavy');

    const wishData: NewWishData = {
      title: title.trim(),
      description: description.trim() || undefined,
      sourceUrl: url.trim() || undefined,
      externalImageUrl: imageUrl.trim() || (galleryImages.length > 0 ? galleryImages[0] : undefined),
      images: galleryImages.length > 0 ? galleryImages : (imageUrl ? [imageUrl] : undefined),
      type,
      status,
      brand: brand.trim() || undefined,
      storeName: storeName.trim() || undefined,
      estimatedPrice: price ? parseFloat(price) : undefined,
      isForSelf,
      phoneNumber: phone.trim() || undefined,
      color: colorOrSize.trim() || undefined,
      occasion: occasion.trim() || undefined,
    };

    onSaveWish(wishData);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          style={styles.keyboardAvoidContainer}
        >
          <View style={styles.modalCard}>
            {/* Top Navigation & Progress Bar */}
            <View style={styles.modalTopBar}>
              <View style={styles.topBarLeft}>
                {step !== 'category' && (
                  <TouchableOpacity
                    onPress={handlePrevStep}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.backBtnText}>←</Text>
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={styles.stepBadgeText}>{getStepTitle()}</Text>
                  <Text style={styles.modalTitle}>
                    {step === 'category'
                      ? '¿Qué te gustaría guardar?'
                      : step === 'link'
                      ? '¿Tienes enlace o tienda?'
                      : step === 'details'
                      ? 'Detalles del deseo'
                      : 'Foto & Estado emocional'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Line */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${getStepProgress() * 100}%` }]} />
            </View>

            {/* Step Body */}
            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ═══════════════════════════════════════════════════════
                  PASO 1: CATEGORÍA
                  ═══════════════════════════════════════════════════════ */}
              {step === 'category' && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepSubtitle}>
                    Elige el tipo de ilusión para personalizar los campos y sugerencias
                  </Text>

                  <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => {
                      const isSelected = type === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryCard,
                            isSelected && styles.categoryCardSelected,
                            { borderColor: isSelected ? cat.accentColor : 'rgba(58, 47, 56, 0.08)' },
                          ]}
                          activeOpacity={0.75}
                          onPress={() => handleCategorySelect(cat.id)}
                        >
                          <View style={[styles.categoryIconCircle, { backgroundColor: cat.bgColor }]}>
                            <Text style={styles.categoryIconText}>{cat.icon}</Text>
                          </View>
                          <View style={styles.categoryInfo}>
                            <Text
                              style={[
                                styles.categoryTitle,
                                isSelected && { color: cat.accentColor, fontWeight: '700' },
                              ]}
                            >
                              {cat.title}
                            </Text>
                            <Text style={styles.categoryDesc} numberOfLines={2}>
                              {cat.subtitle}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={[styles.checkCircle, { backgroundColor: cat.accentColor }]}>
                              <Text style={styles.checkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* ═══════════════════════════════════════════════════════
                  PASO 2: ENLACE O AUTOCOMPLETADO
                  ═══════════════════════════════════════════════════════ */}
              {step === 'link' && (
                <View style={styles.stepContainer}>
                  <View style={styles.selectedCategoryHeader}>
                    <Text style={styles.selectedCatIcon}>
                      {CATEGORIES.find((c) => c.id === type)?.icon}
                    </Text>
                    <Text style={styles.selectedCatText}>
                      Categoría:{' '}
                      <Text style={{ fontWeight: '700', color: Colors.light.primary }}>
                        {CATEGORIES.find((c) => c.id === type)?.title}
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.inputSectionTitle}>
                    {type === 'restaurant'
                      ? 'Enlace de Google Maps / TheFork / Web'
                      : type === 'trip'
                      ? 'Enlace de Booking, Airbnb o vuelo'
                      : type === 'home'
                      ? 'Enlace de tienda de decoración'
                      : type === 'experience'
                      ? 'Enlace del plan o entradas'
                      : 'Enlace web o de tienda (autocompleta)'}
                  </Text>
                  <Text style={styles.inputSectionDesc}>
                    Pega el enlace web y extraeremos automáticamente el nombre, fotos y precios.
                  </Text>

                  <View style={styles.inputWithIconWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        type === 'restaurant'
                          ? 'https://maps.app.goo.gl/... o web...'
                          : type === 'trip'
                          ? 'https://booking.com/... o airbnb...'
                          : type === 'home'
                          ? 'https://zarahome.com/... o ikea...'
                          : 'https://sezane.com/... o web...'
                      }
                      placeholderTextColor={Colors.light.textMuted}
                      value={url}
                      onChangeText={handleUrlChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {isExtractingLink && (
                    <View style={styles.extractingStatusCard}>
                      <ActivityIndicator size="small" color={Colors.light.primary} />
                      <Text style={styles.extractingStatusText}>
                        Leyendo enlace y extrayendo detalles mágicos...
                      </Text>
                    </View>
                  )}

                  {extractedSource && !isExtractingLink && (
                    <View style={styles.extractedCard}>
                      <View style={styles.extractedCardHeader}>
                        <IconSparkles size={16} color="#059669" />
                        <Text style={styles.extractedCardTitle}>
                          ¡Información detectada desde {extractedSource}!
                        </Text>
                      </View>
                      <Text style={styles.extractedCardDesc}>
                        Hemos rellenado título, fotos y detalles. Puedes revisarlos en el siguiente paso.
                      </Text>
                    </View>
                  )}

                  <View style={styles.fastManualOptionWrapper}>
                    <TouchableOpacity
                      style={styles.fastManualBtn}
                      activeOpacity={0.7}
                      onPress={handleNextStep}
                    >
                      <Text style={styles.fastManualBtnText}>
                        {url.trim() ? 'Continuar con este enlace →' : 'No tengo enlace, rellenar a mano →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ═══════════════════════════════════════════════════════
                  PASO 3: DETALLES SEGÚN CATEGORÍA
                  ═══════════════════════════════════════════════════════ */}
              {step === 'details' && (
                <View style={styles.stepContainer}>
                  {/* Título Principal */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>
                      {type === 'restaurant'
                        ? 'Nombre del restaurante o gastrobar *'
                        : type === 'trip'
                        ? 'Destino o escapada soñada *'
                        : type === 'home'
                        ? 'Mueble o elemento de decoración *'
                        : type === 'experience'
                        ? 'Nombre de la experiencia o plan *'
                        : 'Nombre de la prenda o regalo *'}
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        type === 'restaurant'
                          ? 'ej. Don Salvatore / Desde 1911 / Sacha'
                          : type === 'trip'
                          ? 'ej. Escapada a Menorca / Cabaña Dolomitas'
                          : type === 'home'
                          ? 'ej. Lámpara de sobremesa lino'
                          : type === 'experience'
                          ? 'ej. Concierto a la luz de las velas'
                          : 'ej. Bolso Claude Piel Caramelo'
                      }
                      placeholderTextColor={Colors.light.textMuted}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  {/* Campos específicos: Restaurante */}
                  {type === 'restaurant' && (
                    <>
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.inputLabel}>Ubicación o Barrio</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. Ruzafa, Valencia"
                            placeholderTextColor={Colors.light.textMuted}
                            value={brand}
                            onChangeText={setBrand}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>Tipo de cocina / Ocasión</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. Italiano romántico"
                            placeholderTextColor={Colors.light.textMuted}
                            value={occasion}
                            onChangeText={setOccasion}
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>📞 Teléfono del local (reserva en 1 toque)</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. +34 963 74 82 90"
                          placeholderTextColor={Colors.light.textMuted}
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </>
                  )}

                  {/* Campos específicos: Moda / Belleza / Regalo */}
                  {(type === 'fashion' || type === 'beauty' || type === 'other') && (
                    <>
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.inputLabel}>Marca o Tienda</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. Sézane, Zara, Diptyque"
                            placeholderTextColor={Colors.light.textMuted}
                            value={brand}
                            onChangeText={setBrand}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>Precio aprox. (€)</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. 120"
                            placeholderTextColor={Colors.light.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Talla / Color / Acabado</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. Talla S / Color Caramelo / Oro 18k"
                          placeholderTextColor={Colors.light.textMuted}
                          value={colorOrSize}
                          onChangeText={setColorOrSize}
                        />
                      </View>
                    </>
                  )}

                  {/* Campos específicos: Viaje & Escapada */}
                  {type === 'trip' && (
                    <>
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.inputLabel}>Alojamiento / Transporte</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. Hotel Boutique / Airbnb"
                            placeholderTextColor={Colors.light.textMuted}
                            value={brand}
                            onChangeText={setBrand}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>Presupuesto aprox. (€)</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. 450"
                            placeholderTextColor={Colors.light.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Época o fechas tentativas</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. Primavera 2026 / Fin de semana largo"
                          placeholderTextColor={Colors.light.textMuted}
                          value={occasion}
                          onChangeText={setOccasion}
                        />
                      </View>
                    </>
                  )}

                  {/* Campos específicos: Hogar & Deco */}
                  {type === 'home' && (
                    <>
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.inputLabel}>Tienda o Fabricante</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. Zara Home, Kave Home, IKEA"
                            placeholderTextColor={Colors.light.textMuted}
                            value={brand}
                            onChangeText={setBrand}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>Precio aprox. (€)</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="ej. 89"
                            placeholderTextColor={Colors.light.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Espacio de la casa</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. Para el salón junto al ventanal"
                          placeholderTextColor={Colors.light.textMuted}
                          value={occasion}
                          onChangeText={setOccasion}
                        />
                      </View>
                    </>
                  )}

                  {/* Campos específicos: Experiencia */}
                  {type === 'experience' && (
                    <View style={styles.twoColRow}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inputLabel}>Lugar o Proveedor</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. Balneario Alameda / Auditorio"
                          placeholderTextColor={Colors.light.textMuted}
                          value={brand}
                          onChangeText={setBrand}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Presupuesto aprox. (€)</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="ej. 150"
                          placeholderTextColor={Colors.light.textMuted}
                          value={price}
                          onChangeText={setPrice}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}

                  {/* Notas libres */}
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Notas o detalles especiales</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Detalles que hacen especial este deseo, enlaces o notas de amor..."
                      placeholderTextColor={Colors.light.textMuted}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              )}

              {/* ═══════════════════════════════════════════════════════
                  PASO 4: FOTOS, ILUSIÓN & GUARDADO
                  ═══════════════════════════════════════════════════════ */}
              {step === 'media_and_soul' && (
                <View style={styles.stepContainer}>
                  {/* Selector de Galería Autocompletada */}
                  {galleryImages.length > 0 && (
                    <View style={styles.gallerySection}>
                      <View style={styles.galleryHeader}>
                        <Text style={styles.inputLabel}>
                          Fotos extraídas ({galleryImages.length})
                        </Text>
                        <Text style={styles.galleryHint}>Toca para elegir portada</Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.galleryScroll}
                      >
                        {galleryImages.map((img, idx) => {
                          const isCover = imageUrl === img;
                          return (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.galleryThumbCard,
                                isCover && styles.galleryThumbCardActive,
                              ]}
                              activeOpacity={0.8}
                              onPress={() => handleSelectCoverImage(img)}
                            >
                              <Image source={{ uri: img }} style={styles.galleryThumbImg} />
                              {isCover && (
                                <View style={styles.coverBadge}>
                                  <Text style={styles.coverBadgeText}>★ Portada</Text>
                                </View>
                              )}
                              <TouchableOpacity
                                style={styles.removeThumbBtn}
                                onPress={() => handleRemoveGalleryImage(img)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Text style={styles.removeThumbText}>✕</Text>
                              </TouchableOpacity>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* Subir foto personalizada */}
                  <PhotoUploadField
                    imageUri={imageUrl}
                    onImageChange={handleCustomPhotoAdded}
                    label={
                      galleryImages.length > 0
                        ? '+ Añadir otra foto personalizada'
                        : type === 'restaurant'
                        ? 'Foto del local, plato o carta'
                        : type === 'trip'
                        ? 'Foto del destino o alojamiento'
                        : 'Foto del deseo o captura'
                    }
                    placeholderText="Toca para subir foto desde la cámara o galería"
                  />

                  {/* Estado Emocional e Ilusión */}
                  <View style={[styles.formGroup, { marginTop: 16 }]}>
                    <Text style={styles.inputLabel}>Estado emocional & momento</Text>
                    <View style={styles.statusChipsGrid}>
                      {[
                        { id: 'dreaming', label: '💖 Me hace ilusión', desc: 'En mente con mucho cariño' },
                        { id: 'considering', label: '🤔 Lo estoy pensando', desc: 'Comparando opciones' },
                        { id: 'planned', label: '🎁 Ocasión especial', desc: 'Ideal para regalar o celebrar' },
                        { id: 'someday', label: '🌟 Algún día', desc: 'Para el futuro sin prisas' },
                      ].map((item) => {
                        const isSelected = status === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.statusChip,
                              isSelected && styles.statusChipActive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              triggerHaptic('selection');
                              setStatus(item.id as WishlistStatus);
                            }}
                          >
                            <Text
                              style={[
                                styles.statusChipText,
                                isSelected && styles.statusChipTextActive,
                              ]}
                            >
                              {item.label}
                            </Text>
                            <Text
                              style={[
                                styles.statusChipDesc,
                                isSelected && styles.statusChipDescActive,
                              ]}
                            >
                              {item.desc}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* ¿Para quién es el deseo? */}
                  <View style={[styles.formGroup, { marginTop: 14 }]}>
                    <Text style={styles.inputLabel}>¿Para quién es la ilusión?</Text>
                    <View style={styles.whoForWrapper}>
                      <TouchableOpacity
                        style={[styles.whoForBtn, isForSelf && styles.whoForBtnActive]}
                        onPress={() => {
                          triggerHaptic('selection');
                          setIsForSelf(true);
                        }}
                      >
                        <Text style={[styles.whoForBtnText, isForSelf && styles.whoForBtnTextActive]}>
                          ✨ Para mí / Capricho personal
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.whoForBtn, !isForSelf && styles.whoForBtnActive]}
                        onPress={() => {
                          triggerHaptic('selection');
                          setIsForSelf(false);
                        }}
                      >
                        <Text style={[styles.whoForBtnText, !isForSelf && styles.whoForBtnTextActive]}>
                          🎁 Idea de regalo para mi pareja
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Action Bar */}
            <View style={styles.modalFooter}>
              {step !== 'category' && (
                <TouchableOpacity
                  style={styles.footerBackBtn}
                  onPress={handlePrevStep}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerBackBtnText}>Atrás</Text>
                </TouchableOpacity>
              )}

              {step !== 'media_and_soul' ? (
                <TouchableOpacity
                  style={[styles.footerNextBtn, { flex: step === 'category' ? 1 : 2 }]}
                  onPress={handleNextStep}
                  activeOpacity={0.8}
                >
                  <Text style={styles.footerNextBtnText}>
                    {step === 'category' ? 'Siguiente paso →' : 'Continuar →'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.footerSubmitBtn}
                  onPress={handleFinalSubmit}
                  activeOpacity={0.85}
                >
                  <IconSparkles size={18} color="#FFFFFF" />
                  <Text style={styles.footerSubmitBtnText}>Guardar Deseo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  keyboardAvoidContainer: {
    width: '100%',
    maxHeight: '94%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    ...Shadows.cardHover,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A2F38',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2129',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2F38',
  },
  progressTrack: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  modalScrollBody: {
    flexGrow: 1,
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 32,
  },
  stepContainer: {
    width: '100%',
  },
  stepSubtitle: {
    fontSize: 13.5,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  categoryCardSelected: {
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  selectedCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 18,
    gap: 8,
  },
  selectedCatIcon: {
    fontSize: 18,
  },
  selectedCatText: {
    fontSize: 13.5,
    color: '#3A2F38',
  },
  inputSectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: 4,
  },
  inputSectionDesc: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 17,
  },
  inputWithIconWrapper: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16, // Evita auto-zoom en móviles
    color: '#2B2129',
  },
  textArea: {
    minHeight: 74,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  extractingStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  extractingStatusText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  extractedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  extractedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  extractedCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#065F46',
  },
  extractedCardDesc: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  fastManualOptionWrapper: {
    marginTop: 22,
    alignItems: 'center',
  },
  fastManualBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  fastManualBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
  },
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  gallerySection: {
    marginBottom: 16,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryHint: {
    fontSize: 11.5,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  galleryScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  galleryThumbCard: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  galleryThumbCardActive: {
    borderColor: Colors.light.primary,
  },
  galleryThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeThumbText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    borderRadius: 14,
    padding: 10,
  },
  statusChipActive: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  statusChipTextActive: {
    color: Colors.light.primary,
  },
  statusChipDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  statusChipDescActive: {
    color: '#D97706',
  },
  whoForWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  whoForBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
  },
  whoForBtnActive: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  whoForBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A2F38',
  },
  whoForBtnTextActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 47, 56, 0.06)',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  footerBackBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
  },
  footerNextBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  footerNextBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardHover,
  },
  footerSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
