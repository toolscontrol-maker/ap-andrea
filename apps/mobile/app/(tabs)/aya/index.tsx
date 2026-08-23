import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Layout, Radii, Shadows, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, Card, Badge, Button } from '../../../src/components/ui';
import { AyaAuraOrb } from '../../../src/components/illustrations/AyaAuraOrb';
import { AyaQuestionDeck } from '../../../src/components/AyaQuestionDeck';
import { AyaMode, AyaChatMessage, AyaQuestionPrompt } from '@andrea/types';

export default function AyaSpaceScreen() {
  const dev = useDev();
  const [selectedMode, setSelectedMode] = useState<AyaMode>('reflect');
  const [inputMessage, setInputMessage] = useState('');
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
      text: `🎲 Pregunta de conexión para ti, ${dev.currentDevUser.name}:\n\n"${prompt.question}"\n\n(Tómate tu tiempo. Puedes responder con una sola palabra o explayarte todo lo que sientas.)`,
      mode: 'reflect',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, ayaMsg]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const userMsg: AyaChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    setTimeout(() => {
      let ayaReply = '';
      const partnerName = dev.partnerDevUser.name;
      const lower = userText.toLowerCase();

      if (lower.includes('pregunta') || lower.includes('otra') || lower.includes('lanza')) {
        const nextQ = dev.getRandomAyaQuestion();
        ayaReply = `¡Me encanta vuestra curiosidad! Aquí tienes otra pregunta para ti y para ${partnerName}:\n\n"${nextQ.question}"\n\n¿Qué es lo primero que te viene al corazón?`;
      } else if (selectedMode === 'mediate') {
        ayaReply = `Entiendo profundamente lo que sientes, ${dev.currentDevUser.name}. Para compartirlo con ${partnerName} sin levantar defensas, una fórmula de Comunicación No Violenta muy efectiva es: "Cuando pasa esto, siento inquietud porque para mí es importante el cuidado mutuo. ¿Podríamos buscar un ratito hoy para hablarlo con calma?"`;
      } else if (selectedMode === 'understand_partner') {
        ayaReply = `Mirando la dinámica de pareja con ${partnerName}, a menudo cuando hay semanas de mucha carga mental, la persona puede necesitar un tiempo de descompresión antes de conectar. No significa que te quiera menos; a menudo es solo una diferencia de ritmos.`;
      } else {
        ayaReply = `Gracias por compartir esto con tanta honestidad, ${dev.currentDevUser.name}. Lo anoto en vuestro historial afectivo para seguir entendiendo vuestra complicidad con ${partnerName}. Pequeños gestos y reflexiones como esta son los que hacen que vuestra casa digital sea cada día más cálida. 🌱`;
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
            <Text style={{ fontSize: 13 }}>✨</Text>
          </View>
        )}

        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAya]}>
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
            💡 {showInsightsBoard ? 'Ocultar aprendizajes de AYA' : 'Ver aprendizajes descubiertos de vosotros'}
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

        {/* Luxury Chat Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Habla o responde a AYA como ${dev.currentDevUser.name}...`}
            placeholderTextColor={Colors.light.textLight}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputMessage.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
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
