import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Layout, Radii, Shadows, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, Card, Badge, Button, IconCamera } from '../../../src/components/ui';
import { AyaAuraOrb } from '../../../src/components/illustrations/AyaAuraOrb';
import { AyaQuestionDeck } from '../../../src/components/AyaQuestionDeck';
import { AyaMode, AyaChatMessage, AyaQuestionPrompt } from '@andrea/types';
import { promptPhotoPicker } from '../../../src/utils/imagePicker';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function AyaSpaceScreen() {
  const dev = useDev();
  const [selectedMode, setSelectedMode] = useState<AyaMode>('reflect');
  const [inputMessage, setInputMessage] = useState('');
  const [attachedPhotoUri, setAttachedPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInsightsBoard, setShowInsightsBoard] = useState(false);

  const [messages, setMessages] = useState<AyaChatMessage[]>([
    {
      id: 'welcome',
      sender: 'aya',
      text: `Hola, ${dev.currentDevUser.name}. Bienvenid@ a AYA Space. Soy vuestra acompañante relacional. Estoy aquí para escucharos con ternura, ayudaros a entender vuestras dinámicas y profundizar en vuestra historia. Si te apetece, explora la Carta de Conexión de arriba o pregúntame lo que sientas. ✨`,
      timestamp: 'Ahora',
    },
  ]);

  const handleSelectDeckQuestion = (prompt: AyaQuestionPrompt) => {
    const ayaMsg: AyaChatMessage = {
      id: 'aya-q-' + Date.now(),
      sender: 'aya',
      text: `Pregunta de conexión para ti, ${dev.currentDevUser.name}:\n\n"${prompt.question}"\n\n(Tómate tu tiempo. Puedes responder con una sola palabra o explayarte todo lo que sientas.)`,
      mode: 'reflect',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, ayaMsg]);
  };

  const handlePickPhoto = () => {
    promptPhotoPicker({
      title: 'Compartir foto con Andrea',
      onImageSelected: (res) => {
        setAttachedPhotoUri(res.base64 || res.uri);
      },
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !attachedPhotoUri) return;

    const userText = inputMessage.trim() || 'Foto compartida';
    const userPhoto = attachedPhotoUri;

    const userMsg: AyaChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      photoUrl: userPhoto || undefined,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setAttachedPhotoUri(null);
    setLoading(true);

    setTimeout(() => {
      let ayaReply = '';
      const partnerName = dev.partnerDevUser.name;
      const lower = userText.toLowerCase();

      if (userPhoto) {
        ayaReply = `Qué momento tan bonito para vuestro archivo, ${dev.currentDevUser.name}. Las imágenes guardadas con intención son anclas emocionales preciosas para ti y para ${partnerName}.`;
      } else if (lower.includes('pregunta') || lower.includes('otra') || lower.includes('lanza')) {
        const nextQ = dev.getRandomAyaQuestion();
        ayaReply = `¡Me encanta vuestra curiosidad! Aquí tienes otra pregunta para ti y para ${partnerName}:\n\n"${nextQ.question}"\n\n¿Qué es lo primero que te viene al corazón?`;
      } else if (selectedMode === 'mediate') {
        ayaReply = `Entiendo profundamente lo que sientes, ${dev.currentDevUser.name}. Para compartirlo con ${partnerName} sin levantar defensas, una fórmula de Comunicación No Violenta muy efectiva es: "Cuando pasa esto, siento inquietud porque para mí es importante el cuidado mutuo. ¿Podríamos buscar un ratito hoy para hablarlo con calma?"`;
      } else if (selectedMode === 'understand_partner') {
        ayaReply = `Mirando la dinámica de pareja con ${partnerName}, a menudo cuando hay semanas de mucha carga mental, la persona puede necesitar un tiempo de descompresión antes de conectar. No significa que te quiera menos; a menudo es solo una diferencia de ritmos.`;
      } else {
        ayaReply = `Gracias por compartir esto con tanta honestidad, ${dev.currentDevUser.name}. Lo anoto en vuestro historial afectivo para seguir entendiendo vuestra complicidad con ${partnerName}. Pequeños gestos y reflexiones como esta son los que hacen que vuestra casa digital sea cada día más cálida.`;
      }

      const ayaResponseMsg: AyaChatMessage = {
        id: 'aya-r-' + Date.now(),
        sender: 'aya',
        text: ayaReply,
        mode: selectedMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, ayaResponseMsg]);
      setLoading(false);
    }, 700);
  };

  const renderMessage = ({ item }: { item: AyaChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAya]}>
        {!isUser && (
          <View style={styles.ayaAvatarSmall}>
            <Text style={{ fontSize: 13, color: Colors.light.primary }}>A</Text>
          </View>
        )}

        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAya]}>
          {item.photoUrl && (
            <Image source={{ uri: item.photoUrl }} style={styles.msgAttachedPhoto} resizeMode="cover" />
          )}
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAya]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAya]}>
            {item.timestamp}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatarSmall}>
            <Text style={styles.userAvatarText}>{dev.currentDevUser.name.charAt(0)}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable={false}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Luxury Atmospheric Header with Orb */}
        <View style={styles.header}>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>AYA Space</Text>
            <Text style={styles.headerSubtitle}>Acompañante relacional y psicológico</Text>
          </View>
          <AyaAuraOrb size={54} />
        </View>

        {/* Question Deck Carousel */}
        <AyaQuestionDeck
          onSelectQuestion={handleSelectDeckQuestion}
          getRandomQuestion={dev.getRandomAyaQuestion}
        />

        {/* Collapsible Insights Drawer Button */}
        <TouchableOpacity
          style={[styles.insightsPill, showInsightsBoard && styles.insightsPillActive]}
          onPress={() => setShowInsightsBoard(!showInsightsBoard)}
          activeOpacity={0.7}
        >
          <Text style={[styles.insightsPillText, showInsightsBoard && styles.insightsPillTextActive]}>
            {showInsightsBoard ? 'Ocultar aprendizajes de Andrea' : 'Ver aprendizajes descubiertos de vosotros'}
          </Text>
        </TouchableOpacity>

        {/* Collapsible Insights Drawer */}
        {showInsightsBoard && (
          <View style={styles.insightsDrawer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dev.ayaInsights.map((ins) => (
                <View key={ins.id} style={styles.insightCard}>
                  <Text style={styles.insightCardTitle}>{ins.title}</Text>
                  <Text style={styles.insightCardDesc}>{ins.description}</Text>
                  <Text style={styles.insightCardDate}>{ins.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat Feed */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Attached Photo Preview */}
        {attachedPhotoUri && (
          <View style={styles.chatPhotoPreviewBox}>
            <Image source={{ uri: attachedPhotoUri }} style={styles.chatPhotoPreviewImg} />
            <TouchableOpacity
              style={styles.chatPhotoRemoveBtn}
              onPress={() => setAttachedPhotoUri(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.chatPhotoRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Luxury Chat Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handlePickPhoto}
            activeOpacity={0.7}
          >
            <IconCamera size={20} color={Colors.light.primary} strokeWidth={2} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={`Habla o comparte una foto con Andrea...`}
            placeholderTextColor={Colors.light.textLight}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputMessage.trim() && !attachedPhotoUri || loading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={(!inputMessage.trim() && !attachedPhotoUri) || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendBtnText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
    marginBottom: Spacing.xs,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.light.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xxs,
  },
  insightsPill: {
    alignSelf: 'center',
    backgroundColor: Colors.light.secondaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(142, 119, 198, 0.3)',
    marginBottom: Spacing.xs,
  },
  insightsPillActive: {
    backgroundColor: Colors.light.secondary,
  },
  insightsPillText: {
    ...Typography.captionBold,
    color: Colors.light.secondaryDark,
  },
  insightsPillTextActive: {
    color: '#FFFFFF',
  },
  insightsDrawer: {
    backgroundColor: '#FAF7FD',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(142, 119, 198, 0.2)',
    marginBottom: Spacing.sm,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    width: 220,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.subtle,
  },
  insightCardTitle: {
    ...Typography.captionBold,
    color: Colors.light.secondaryDark,
    marginBottom: Spacing.xs,
  },
  insightCardDesc: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
  insightCardDate: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  messagesList: {
    paddingVertical: Spacing.md,
  },
  msgWrapper: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  msgWrapperUser: {
    justifyContent: 'flex-end',
  },
  msgWrapperAya: {
    justifyContent: 'flex-start',
  },
  ayaAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primaryDark,
  },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii['2xl'],
  },
  msgBubbleUser: {
    backgroundColor: Colors.light.secondary,
    borderBottomRightRadius: Radii.xs,
  },
  msgBubbleAya: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    borderBottomLeftRadius: Radii.xs,
    ...Shadows.sm,
  },
  msgText: {
    ...Typography.body,
    lineHeight: 22,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextAya: {
    color: Colors.light.text,
  },
  msgTime: {
    fontSize: 10,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  msgTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  msgTimeAya: {
    color: Colors.light.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(142, 119, 198, 0.3)',
    borderRadius: Radii['2xl'],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    maxHeight: 90,
    paddingVertical: Spacing.sm,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPhotoPreviewBox: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: Radii.md,
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  chatPhotoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  chatPhotoRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPhotoRemoveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  msgAttachedPhoto: {
    width: 200,
    height: 140,
    borderRadius: Radii.lg,
    marginBottom: Spacing.xs,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2,
  },
});
