import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconBell, IconHeart, IconCheck } from '../ui/Icons';
import { Button } from '../ui/Button';
import { pushNotificationService, NotificationPreferences } from '../../services/notifications/PushNotificationService';

interface NotificationSettingsSubpageProps {
  onClose: () => void;
}

export function NotificationSettingsSubpage({ onClose }: NotificationSettingsSubpageProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(pushNotificationService.getPreferences());
  const [permission, setPermission] = useState<string>(pushNotificationService.getPermissionStatus());
  const [reminderTime, setReminderTime] = useState<'20:00' | '21:00' | '22:00' | '23:00'>('21:00');

  const handleToggleMaster = async () => {
    triggerHaptic('selection');
    if (permission !== 'granted') {
      const granted = await pushNotificationService.requestPermission();
      setPermission(pushNotificationService.getPermissionStatus());
      if (granted) {
        const updated = await pushNotificationService.savePreferences({ enabled: true });
        setPrefs(updated);
        Alert.alert('🔔 ¡Notificaciones Activadas!', 'Tu iPhone está listo para recibir avisos de amor en tiempo real.');
      } else {
        Alert.alert(
          'Permiso de Notificación',
          'Para recibir notificaciones en iPhone: Abre la app en Safari, pulsa Compartir (⬆️) y "Añadir a pantalla de inicio". Luego ábrela y pulsa Permitir.'
        );
      }
    } else {
      const updated = await pushNotificationService.savePreferences({ enabled: !prefs.enabled });
      setPrefs(updated);
    }
  };

  const handleToggleCategory = async (key: keyof Omit<NotificationPreferences, 'enabled'>) => {
    triggerHaptic('selection');
    const updated = await pushNotificationService.savePreferences({ [key]: !prefs[key] });
    setPrefs(updated);
  };

  const handleTestNotification = async () => {
    triggerHaptic('medium');
    await pushNotificationService.triggerTestNotification();
    Alert.alert('💓 Notificación Enviada', 'Comprueba tu iPhone para ver la alerta de prueba.');
  };

  const reminderTimeOptions = ['20:00', '21:00', '22:00', '23:00'] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* MASTER PUSH BANNER */}
      <View style={styles.masterCard}>
        <View style={styles.masterHeader}>
          <View style={styles.bellCircle}>
            <IconBell size={22} color={Colors.light.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>Notificaciones Push en iPhone</Text>
            <Text style={styles.masterDesc}>
              {permission === 'granted'
                ? (prefs.enabled ? '🟢 Avisos activados en este dispositivo' : '⏸️ Notificaciones en pausa')
                : '🔔 Toca para activar y autorizar en iOS'}
            </Text>
          </View>
          <Switch
            value={prefs.enabled && permission === 'granted'}
            onValueChange={handleToggleMaster}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={styles.testBtn}
          activeOpacity={0.8}
          onPress={handleTestNotification}
        >
          <IconHeart size={15} color={Colors.light.primary} />
          <Text style={styles.testBtnText}>Lanzar Notificación de Prueba 💓</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORIES SECTION */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tipos de Avisos</Text>
        <Text style={styles.sectionSubtitle}>Elige qué momentos quieres que te notifiquen</Text>
      </View>

      <View style={styles.groupCard}>
        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>💓</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Latidos y Toques de Amor</Text>
            <Text style={styles.toggleDesc}>Avisar cuando tu pareja pulse el corazón del Nido</Text>
          </View>
          <Switch
            value={prefs.hearts}
            onValueChange={() => handleToggleCategory('hearts')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>🎁</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Nuevos Deseos e Ilusiones</Text>
            <Text style={styles.toggleDesc}>Avisar cuando se añada un deseo o capricho a la lista</Text>
          </View>
          <Switch
            value={prefs.wishes}
            onValueChange={() => handleToggleCategory('wishes')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>🤫</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Sorpresas y Planes Secretos</Text>
            <Text style={styles.toggleDesc}>Notificación de misterio cuando hay algo en camino</Text>
          </View>
          <Switch
            value={prefs.surprises}
            onValueChange={() => handleToggleCategory('surprises')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>🖤</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Check-in Diario de Encuentro</Text>
            <Text style={styles.toggleDesc}>Avisar cuando tu pareja responda si os habéis visto hoy</Text>
          </View>
          <Switch
            value={prefs.daily_checkin}
            onValueChange={() => handleToggleCategory('daily_checkin')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>📸</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Álbum Semanal de Fotos</Text>
            <Text style={styles.toggleDesc}>Avisar cuando se suban fotos al álbum de la semana</Text>
          </View>
          <Switch
            value={prefs.weekly_album}
            onValueChange={() => handleToggleCategory('weekly_album')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>🗓️</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Citas y Fechas Especiales</Text>
            <Text style={styles.toggleDesc}>Recordatorios de cenas, aniversarios y planes</Text>
          </View>
          <Switch
            value={prefs.calendar}
            onValueChange={() => handleToggleCategory('calendar')}
            trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* REMINDER TIME PREFERENCE */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={styles.sectionTitle}>Horario Preferido de Recordatorio Diario</Text>
        <Text style={styles.sectionSubtitle}>Hora sugerida para el check-in de si os habéis visto</Text>
      </View>

      <View style={styles.timePillsRow}>
        {reminderTimeOptions.map((t) => {
          const isSelected = reminderTime === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.timePill, isSelected && styles.timePillSelected]}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic('selection');
                setReminderTime(t);
              }}
            >
              <Text style={[styles.timePillText, isSelected && styles.timePillTextSelected]}>
                {t} hrs
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  masterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  masterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bellCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  masterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E252B',
  },
  masterDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(224, 86, 102, 0.06)',
    borderRadius: Radii.lg,
    gap: 8,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: '#766B72',
    marginTop: 2,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E252B',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    marginLeft: 46,
  },
  timePillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E252B',
  },
  timePillTextSelected: {
    color: '#FFFFFF',
  },
});
