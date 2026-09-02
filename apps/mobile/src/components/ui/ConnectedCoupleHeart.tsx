import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../../theme/tokens';
import { IconHeart, IconSparkles, IconCamera } from './Icons';
import { triggerHaptic } from '../../utils/haptics';

export interface ConnectedCoupleHeartProps {
  user1Name: string;
  user1Avatar?: string;
  user1PhotoUrl?: string;
  onEditAvatar1?: () => void;
  isSelf1?: boolean;
  user2Name: string;
  user2Avatar?: string;
  user2PhotoUrl?: string;
  onEditAvatar2?: () => void;
  isSelf2?: boolean;
  currentUserName: string;
  daysTogether: number;
  startDateFormatted?: string;
  onHeartPress?: () => void;
  heartbeatCount?: number;
  todayHeartbeatCount?: number;
  lastReceivedHeartbeat?: { senderName: string; timestamp: number } | null;
}

interface FloatingParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  symbol: string;
}

export function ConnectedCoupleHeart({
  user1Name,
  user1Avatar = 'T',
  user1PhotoUrl,
  onEditAvatar1,
  isSelf1 = true,
  user2Name,
  user2Avatar = 'A',
  user2PhotoUrl,
  onEditAvatar2,
  isSelf2 = false,
  currentUserName,
  daysTogether,
  startDateFormatted = '15 de Febrero de 2025',
  onHeartPress,
  heartbeatCount = 0,
  todayHeartbeatCount = 0,
  lastReceivedHeartbeat,
}: ConnectedCoupleHeartProps) {
  // Animation values
  const heartbeatScale = useRef(new Animated.Value(1)).current;
  const glowRing1Scale = useRef(new Animated.Value(0.8)).current;
  const glowRing1Opacity = useRef(new Animated.Value(0.6)).current;
  const glowRing2Scale = useRef(new Animated.Value(0.8)).current;
  const glowRing2Opacity = useRef(new Animated.Value(0.4)).current;
  const beamWave = useRef(new Animated.Value(0)).current;
  const avatarAura = useRef(new Animated.Value(1)).current;

  // Floating hearts on tap
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [heartbeatToast, setHeartbeatToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const counterBounceScale = useRef(new Animated.Value(1)).current;

  // Image load error fallback state
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  // Live bounce when heartbeat counter updates in real time
  useEffect(() => {
    Animated.sequence([
      Animated.timing(counterBounceScale, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(counterBounceScale, {
        toValue: 1.0,
        friction: 4,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [todayHeartbeatCount, heartbeatCount]);

  useEffect(() => {
    // 1. Biological Double Systolic Heartbeat Loop (Lubb-Dubb)
    const heartbeatAnim = Animated.loop(
      Animated.sequence([
        // Lubb (Systole 1)
        Animated.timing(heartbeatScale, {
          toValue: 1.2,
          duration: 140,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatScale, {
          toValue: 1.06,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Dubb (Systole 2 - Stronger)
        Animated.timing(heartbeatScale, {
          toValue: 1.28,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatScale, {
          toValue: 1.0,
          duration: 380,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        // Diastole (Resting interval)
        Animated.delay(1000),
      ])
    );

    // 2. Ripple Glow Ring 1 (Staggered expand)
    const ripple1 = Animated.loop(
      Animated.parallel([
        Animated.timing(glowRing1Scale, {
          toValue: 2.2,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowRing1Opacity, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowRing1Opacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // 3. Ripple Glow Ring 2 (Offset by 600ms)
    const ripple2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(glowRing2Scale, {
            toValue: 2.5,
            duration: 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(glowRing2Opacity, {
              toValue: 0.4,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(glowRing2Opacity, {
              toValue: 0,
              duration: 1500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    // 4. Connecting Beam Photons Loop
    const beamAnim = Animated.loop(
      Animated.timing(beamWave, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );

    // 5. Avatar Aura Breathing Loop
    const auraAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarAura, {
          toValue: 1.08,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(avatarAura, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    heartbeatAnim.start();
    ripple1.start();
    ripple2.start();
    beamAnim.start();
    auraAnim.start();

    return () => {
      heartbeatAnim.stop();
      ripple1.stop();
      ripple2.stop();
      beamAnim.stop();
      auraAnim.stop();
    };
  }, []);

  // 6. Live Reactive Remote Heartbeat from Partner
  useEffect(() => {
    if (!lastReceivedHeartbeat || !lastReceivedHeartbeat.timestamp) return;

    triggerHaptic('heavy');
    Animated.sequence([
      Animated.timing(heartbeatScale, {
        toValue: 1.6,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(heartbeatScale, {
        toValue: 1.0,
        friction: 3,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    // Spawn rich celebration particles
    const symbols = ['💓', '💖', '✨', '❤️', '🌸'];
    const newParticles: FloatingParticle[] = Array.from({ length: 8 }).map((_, i) => {
      const p = {
        id: Date.now() + i + Math.random(),
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.4),
        symbol: symbols[i % symbols.length],
      };

      const targetX = (Math.random() - 0.5) * 140;
      const targetY = -80 - Math.random() * 90;

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: targetY,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.scale, {
          toValue: 1.4 + Math.random() * 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      return p;
    });

    setFloatingParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1100);

    setHeartbeatToast(`¡${lastReceivedHeartbeat.senderName} te ha enviado un latido! 💓`);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setHeartbeatToast(null));
  }, [lastReceivedHeartbeat?.timestamp]);

  const handleTapHeart = () => {
    // 1. Double tactile haptic rhythm
    triggerHaptic('medium');
    setTimeout(() => {
      triggerHaptic('heavy');
    }, 130);

    // 2. Extra elastic bounce on press
    Animated.sequence([
      Animated.timing(heartbeatScale, {
        toValue: 1.5,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(heartbeatScale, {
        toValue: 1.0,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Spawn floating heart particles
    const partnerName = currentUserName === user1Name ? user2Name : user1Name;
    const symbols = ['❤️', '✨', '💖', '🌸', '💫'];
    const newParticles: FloatingParticle[] = Array.from({ length: 6 }).map((_, i) => {
      const p = {
        id: Date.now() + i + Math.random(),
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.4),
        symbol: symbols[i % symbols.length],
      };

      const targetX = (Math.random() - 0.5) * 120;
      const targetY = -70 - Math.random() * 80;

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: targetY,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.scale, {
          toValue: 1.2 + Math.random() * 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      return p;
    });

    setFloatingParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1000);

    // 4. Show Toast Notification
    setHeartbeatToast(`¡Latido enviado a ${partnerName}! 💕`);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setHeartbeatToast(null));

    if (onHeartPress) onHeartPress();
  };

  // Interpolated photon beam positions
  const photonLeftTranslate = beamWave.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const photonRightTranslate = beamWave.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const photonOpacity = beamWave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.9, 0.2],
  });

  return (
    <View style={styles.container}>
      {/* ── BACKGROUND CONNECTING LASER BEAM ── */}
      <View style={styles.beamTrack}>
        <View style={styles.beamLineGradient} />
        {/* Animated Left Traveling Light Photon */}
        <Animated.View
          style={[
            styles.photonDot,
            {
              transform: [{ translateX: photonLeftTranslate }],
              opacity: photonOpacity,
            },
          ]}
        />
        {/* Animated Right Traveling Light Photon */}
        <Animated.View
          style={[
            styles.photonDot,
            {
              transform: [{ translateX: photonRightTranslate }],
              opacity: photonOpacity,
            },
          ]}
        />
      </View>

      {/* ── AVATAR 1 (USER 1) ── */}
      <View style={styles.avatarColumn}>
        <Animated.View
          style={[
            styles.avatarAuraRing,
            {
              transform: [{ scale: avatarAura }],
              borderColor: 'rgba(212, 175, 55, 0.35)',
            },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onEditAvatar1}
          style={styles.avatarContainer}
        >
          {!img1Error && user1PhotoUrl ? (
            <Image
              source={{ uri: user1PhotoUrl }}
              style={styles.avatarImage}
              onError={() => setImg1Error(true)}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: Colors.light.primary }]}>
              <Text style={styles.avatarFallbackText}>{user1Avatar}</Text>
            </View>
          )}
          <View style={styles.presenceBeacon} />
          {isSelf1 ? (
            <View style={styles.editCameraBadge}>
              <IconCamera size={10} color="#FFFFFF" />
            </View>
          ) : (
            <View style={[styles.editCameraBadge, { backgroundColor: '#EF826A' }]}>
              <Text style={{ fontSize: 9 }}>💖</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onEditAvatar1} style={styles.namePill}>
          <Text style={styles.namePillText} numberOfLines={1}>
            {user1Name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CENTER ANIMATED HEART CONNECTOR ── */}
      <View style={styles.centerHeartWrapper}>
        {/* Expanding Glow Ring 1 */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: glowRing1Scale }],
              opacity: glowRing1Opacity,
              borderColor: 'rgba(235, 87, 87, 0.6)',
              backgroundColor: 'rgba(235, 87, 87, 0.08)',
            },
          ]}
        />

        {/* Expanding Glow Ring 2 */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: glowRing2Scale }],
              opacity: glowRing2Opacity,
              borderColor: 'rgba(212, 175, 55, 0.5)',
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
            },
          ]}
        />

        {/* Interactive Pulsing Heart Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTapHeart}
          style={styles.heartTouchable}
        >
          <Animated.View
            style={[
              styles.heartCircleButton,
              {
                transform: [{ scale: heartbeatScale }],
              },
            ]}
          >
            <IconHeart size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Animated.View>
        </TouchableOpacity>

        {/* Days Together & Live Heartbeats Metric Badges */}
        <View style={styles.metricsContainer}>
          <View style={styles.daysBadge}>
            <Text style={styles.daysNumberText}>{daysTogether}</Text>
            <Text style={styles.daysLabelText}>días</Text>
          </View>
          <Animated.View
            style={[
              styles.heartbeatsBadge,
              { transform: [{ scale: counterBounceScale }] },
            ]}
          >
            <Text style={styles.heartbeatsEmoji}>💓</Text>
            <Text style={styles.heartbeatsNumberText}>{todayHeartbeatCount}</Text>
            <Text style={styles.heartbeatsLabelText}>hoy · {heartbeatCount} tot</Text>
          </Animated.View>
        </View>

        {/* Floating Tap Particles */}
        {floatingParticles.map((p) => (
          <Animated.View
            key={p.id}
            pointerEvents="none"
            style={[
              styles.floatingParticle,
              {
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                ],
                opacity: p.opacity,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{p.symbol}</Text>
          </Animated.View>
        ))}
      </View>

      {/* ── AVATAR 2 (USER 2) ── */}
      <View style={styles.avatarColumn}>
        <Animated.View
          style={[
            styles.avatarAuraRing,
            {
              transform: [{ scale: avatarAura }],
              borderColor: 'rgba(235, 87, 87, 0.35)',
            },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onEditAvatar2}
          style={styles.avatarContainer}
        >
          {!img2Error && user2PhotoUrl ? (
            <Image
              source={{ uri: user2PhotoUrl }}
              style={styles.avatarImage}
              onError={() => setImg2Error(true)}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: Colors.light.secondary }]}>
              <Text style={styles.avatarFallbackText}>{user2Avatar}</Text>
            </View>
          )}
          <View style={styles.presenceBeacon} />
          {isSelf2 ? (
            <View style={styles.editCameraBadge}>
              <IconCamera size={10} color="#FFFFFF" />
            </View>
          ) : (
            <View style={[styles.editCameraBadge, { backgroundColor: '#EF826A' }]}>
              <Text style={{ fontSize: 9 }}>💖</Text>
            </View>
          )}
          <View style={[styles.presenceBeacon, { backgroundColor: '#E05666' }]} />
          {Boolean(onEditAvatar2) && (
            <View style={[styles.editCameraBadge, { backgroundColor: Colors.light.secondary }]}>
              <IconCamera size={10} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onEditAvatar2} style={styles.namePill}>
          <Text style={styles.namePillText} numberOfLines={1}>
            {user2Name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── HEARTBEAT SENT INTERACTIVE TOAST ── */}
      {heartbeatToast && (
        <Animated.View
          style={[
            styles.toastBubble,
            {
              opacity: toastOpacity,
            },
          ]}
        >
          <IconSparkles size={12} color={Colors.light.primary} />
          <Text style={styles.toastText}>{heartbeatToast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  beamTrack: {
    position: 'absolute',
    top: 36,
    left: 45,
    right: 45,
    height: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  beamLineGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderRadius: 1,
  },
  photonDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  avatarColumn: {
    alignItems: 'center',
    zIndex: 2,
    width: 85,
  },
  avatarAuraRing: {
    position: 'absolute',
    top: -4,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    padding: 3,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    ...Typography.h2,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  presenceBeacon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#27AE60',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  editCameraBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  namePill: {
    marginTop: Spacing.xs + 2,
    backgroundColor: Colors.light.backgroundWarm,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
  },
  namePillText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.text,
  },
  centerHeartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    width: 100,
    height: 90,
  },
  glowRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  heartTouchable: {
    zIndex: 4,
  },
  heartCircleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E05666',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  metricsContainer: {
    marginTop: Spacing.xs,
    alignItems: 'center',
    gap: 3,
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1.5,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
  },
  heartbeatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1.5,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.3)',
  },
  heartbeatsEmoji: {
    fontSize: 9,
  },
  heartbeatsNumberText: {
    ...Typography.captionBold,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E05666',
  },
  heartbeatsLabelText: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.light.textMuted,
  },
  daysNumberText: {
    ...Typography.captionBold,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  daysLabelText: {
    ...Typography.caption,
    fontSize: 9.5,
    color: Colors.light.textMuted,
  },
  floatingParticle: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  toastBubble: {
    position: 'absolute',
    bottom: -18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    zIndex: 20,
  },
  toastText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.primary,
  },
});
