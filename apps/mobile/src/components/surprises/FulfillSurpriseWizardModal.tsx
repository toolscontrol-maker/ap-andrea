import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { Badge } from '../ui/Badge';
import { PhotoUploadField } from '../ui/PhotoUploadField';
import { CalendarPickerModal } from '../ui/CalendarPickerModal';
import { triggerHaptic } from '../../utils/haptics';
import { WishlistItem, DiaryEntryUI, DecryptedSurpriseContent } from '@andrea/types';

export interface FulfillSurpriseWizardModalProps {
  visible: boolean;
  onClose: () => void;
  surpriseItem: DiaryEntryUI | null;
  linkedWish?: WishlistItem | null;
  mode: 'purchase' | 'delivery';
  currentUserName: string;
  partnerUserName: string;
  onConfirmPurchase: (data: {
    purchasedAt: string;
    purchasePhotoUrl?: string;
    purchaseNotes?: string;
    productUrl?: string;
    price?: number;
  }) => void;
  onConfirmDelivery: (data: {
    deliveredAt: string;
    deliveredPhotoUrl?: string;
    partnerReaction?: string;
  }) => void;
}

export function FulfillSurpriseWizardModal({
  visible,
  onClose,
  surpriseItem,
  linkedWish,
  mode,
  currentUserName,
  partnerUserName,
  onConfirmPurchase,
  onConfirmDelivery,
}: FulfillSurpriseWizardModalProps) {
  const content = surpriseItem?.content as DecryptedSurpriseContent | undefined;
  const existingPurchase = (content as any)?.purchaseDetails;
  const existingDelivery = (content as any)?.deliveryDetails;

  // Purchase Form State
  const [purchaseDate, setPurchaseDate] = useState(
    existingPurchase?.purchasedAt || new Date().toISOString().split('T')[0]
  );
  const [purchasePhotoUrl, setPurchasePhotoUrl] = useState<string | null>(
    existingPurchase?.purchasePhotoUrl || null
  );
  const [purchaseNotes, setPurchaseNotes] = useState(
    existingPurchase?.purchaseNotes || ''
  );
  const [productUrl, setProductUrl] = useState(
    existingPurchase?.productUrl || linkedWish?.sourceUrl || ''
  );

  // Delivery Form State
  const [deliveryDate, setDeliveryDate] = useState(
    existingDelivery?.deliveredAt || new Date().toISOString().split('T')[0]
  );
  const [deliveryPhotoUrl, setDeliveryPhotoUrl] = useState<string | null>(
    existingDelivery?.deliveredPhotoUrl || null
  );
  const [partnerReaction, setPartnerReaction] = useState(
    existingDelivery?.partnerReaction || ''
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'purchase' | 'delivery'>('purchase');

  useEffect(() => {
    if (visible && surpriseItem) {
      const c = surpriseItem.content as any;
      if (c?.purchaseDetails) {
        setPurchaseDate(c.purchaseDetails.purchasedAt || new Date().toISOString().split('T')[0]);
        setPurchasePhotoUrl(c.purchaseDetails.purchasePhotoUrl || null);
        setPurchaseNotes(c.purchaseDetails.purchaseNotes || '');
        setProductUrl(c.purchaseDetails.productUrl || linkedWish?.sourceUrl || '');
      } else {
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setPurchasePhotoUrl(null);
        setPurchaseNotes('');
        setProductUrl(linkedWish?.sourceUrl || '');
      }

      if (c?.deliveryDetails) {
        setDeliveryDate(c.deliveryDetails.deliveredAt || new Date().toISOString().split('T')[0]);
        setDeliveryPhotoUrl(c.deliveryDetails.deliveredPhotoUrl || null);
        setPartnerReaction(c.deliveryDetails.partnerReaction || '');
      } else {
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setDeliveryPhotoUrl(null);
        setPartnerReaction('');
      }
    }
  }, [visible, surpriseItem, linkedWish]);

  if (!visible || !surpriseItem) return null;

  const handleOpenProductLink = () => {
    if (!productUrl) return;
    triggerHaptic('light');
    Linking.openURL(productUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace.');
    });
  };

  const handleSavePurchase = () => {
    triggerHaptic('success');
    onConfirmPurchase({
      purchasedAt: purchaseDate,
      purchasePhotoUrl: purchasePhotoUrl || undefined,
      purchaseNotes: purchaseNotes.trim() || undefined,
      productUrl: productUrl.trim() || undefined,
      price: linkedWish?.estimatedPrice,
    });
    onClose();
  };

  const handleSaveDelivery = () => {
    if (!deliveryPhotoUrl) {
      Alert.alert(
        'Foto del momento',
        '¡Sube una foto tuya con el regalo o del detalle en casa para guardarlo en vuestra historia!'
      );
      return;
    }
    triggerHaptic('success');
    onConfirmDelivery({
      deliveredAt: deliveryDate,
      deliveredPhotoUrl: deliveryPhotoUrl,
      partnerReaction: partnerReaction.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.cardSheet}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerEyebrow}>
                  {mode === 'purchase' ? '🛒 GESTIÓN DE COMPRA & DETALLE' : '✨ RECEPCIÓN & HACER REALIDAD'}
                </Text>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {content?.title || linkedWish?.title || 'Sorpresa'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* ── 1. PRODUCT / WISH INFO CARD ── */}
              <View style={styles.productCard}>
                {(linkedWish?.externalImageUrl || (content as any)?.photos?.[0]) && (
                  <Image
                    source={{
                      uri: linkedWish?.externalImageUrl || (content as any)?.photos?.[0],
                    }}
                    style={styles.productImg}
                  />
                )}
                <View style={styles.productDetails}>
                  <View style={styles.productBadgeRow}>
                    <Badge variant="primary" size="sm">
                      {linkedWish?.brand || linkedWish?.storeName || 'Regalo especial'}
                    </Badge>
                    {linkedWish?.estimatedPrice && (
                      <Text style={styles.productPrice}>{linkedWish.estimatedPrice}€</Text>
                    )}
                  </View>

                  <Text style={styles.productTitle}>
                    {linkedWish?.title || content?.title}
                  </Text>

                  {(linkedWish?.color || linkedWish?.size) && (
                    <Text style={styles.productSpecs}>
                      {linkedWish.size ? `Talla: ${linkedWish.size} ` : ''}
                      {linkedWish.color ? `· Color: ${linkedWish.color}` : ''}
                    </Text>
                  )}

                  {productUrl ? (
                    <TouchableOpacity
                      style={styles.buyLinkBtn}
                      activeOpacity={0.8}
                      onPress={handleOpenProductLink}
                    >
                      <Text style={styles.buyLinkBtnText}>Abrir enlace de compra ↗</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* ── 2. MODE: AUTHOR PURCHASE (TONET) ── */}
              {mode === 'purchase' && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>📦 Confirmar Pedido / Compra</Text>
                  <Text style={styles.sectionSubheading}>
                    Registra la fecha y guarda una foto del comprobante o paquete para poner la sorpresa en marcha:
                  </Text>

                  {/* Purchase Date */}
                  <Text style={styles.fieldLabel}>📅 Fecha de compra</Text>
                  <TouchableOpacity
                    style={styles.dateSelectorBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCalendarTarget('purchase');
                      setIsCalendarOpen(true);
                    }}
                  >
                    <Text style={styles.dateSelectorText}>{purchaseDate}</Text>
                    <Text style={styles.dateSelectorIcon}>🗓️ Cambiar</Text>
                  </TouchableOpacity>

                  {/* Purchase Image Upload */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                    📸 Foto de la compra o comprobante
                  </Text>
                  <PhotoUploadField
                    photoUrl={purchasePhotoUrl}
                    onPhotoUploaded={(url) => setPurchasePhotoUrl(url)}
                    onPhotoRemoved={() => setPurchasePhotoUrl(null)}
                  />

                  {/* Purchase Notes */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                    💬 Notas de pedido o llegada prevista
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Comprado en Sézane, talla S, llega el jueves..."
                    value={purchaseNotes}
                    onChangeText={setPurchaseNotes}
                  />

                  {/* Confirm Button */}
                  <TouchableOpacity
                    style={styles.submitBtn}
                    activeOpacity={0.85}
                    onPress={handleSavePurchase}
                  >
                    <Text style={styles.submitBtnText}>
                      Guardar como Comprado / En Camino 🚚
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── 3. MODE: RECIPIENT RECEPTION (ANDREA) ── */}
              {mode === 'delivery' && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionHeading}>🎁 ¡Hacer Realidad este Deseo!</Text>
                  <Text style={styles.sectionSubheading}>
                    Sube una foto del regalo recibido o contigo para guardarlo en la historia de amor:
                  </Text>

                  {/* Delivery Date */}
                  <Text style={styles.fieldLabel}>📅 Fecha de entrega / recepción</Text>
                  <TouchableOpacity
                    style={styles.dateSelectorBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCalendarTarget('delivery');
                      setIsCalendarOpen(true);
                    }}
                  >
                    <Text style={styles.dateSelectorText}>{deliveryDate}</Text>
                    <Text style={styles.dateSelectorIcon}>🗓️ Cambiar</Text>
                  </TouchableOpacity>

                  {/* Delivery Photo Upload */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                    📸 Foto del regalo real o contigo ✨ (Requerido)
                  </Text>
                  <PhotoUploadField
                    photoUrl={deliveryPhotoUrl}
                    onPhotoUploaded={(url) => setDeliveryPhotoUrl(url)}
                    onPhotoRemoved={() => setDeliveryPhotoUrl(null)}
                  />

                  {/* Reaction / Gratitude */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                    💖 Tu reacción / Mensaje de agradecimiento
                  </Text>
                  <TextInput
                    style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                    placeholder="Ej: ¡Me ha encantado! Es precioso, muchísimas gracias mi amor ❤️"
                    multiline
                    value={partnerReaction}
                    onChangeText={setPartnerReaction}
                  />

                  {/* Confirm Delivery Button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: Colors.light.primary }]}
                    activeOpacity={0.85}
                    onPress={handleSaveDelivery}
                  >
                    <Text style={styles.submitBtnText}>
                      ✨ ¡Hacer Realidad e Inmortalizar!
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Date Picker Modal */}
        <CalendarPickerModal
          visible={isCalendarOpen}
          initialDate={calendarTarget === 'purchase' ? purchaseDate : deliveryDate}
          title={calendarTarget === 'purchase' ? 'Fecha de Compra' : 'Fecha de Entrega'}
          onSelectDate={(selected) => {
            if (calendarTarget === 'purchase') {
              setPurchaseDate(selected);
            } else {
              setDeliveryDate(selected);
            }
            setIsCalendarOpen(false);
          }}
          onClose={() => setIsCalendarOpen(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 41, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    maxHeight: '92%',
  },
  cardSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 33, 41, 0.08)',
  },
  headerEyebrow: {
    ...Typography.overline,
    color: Colors.light.primary,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3A2F38',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#766B72',
  },
  content: {
    marginTop: 14,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EA',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    marginBottom: 16,
    gap: 12,
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EFEBE6',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A6812',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  productSpecs: {
    fontSize: 11,
    color: '#766B72',
    marginBottom: 6,
  },
  buyLinkBtn: {
    backgroundColor: '#E5A93C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  buyLinkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formSection: {
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A2F38',
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
  },
  dateSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
  },
  dateSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2F38',
  },
  dateSelectorIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#3A2F38',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
  },
  submitBtn: {
    backgroundColor: '#E05666',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
    ...Shadows.md,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
