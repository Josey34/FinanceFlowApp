import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const COLORS = ['#7C6FFF', '#FF7B54', '#2DC76D', '#FFD93D', '#FF4B4B', '#B4ADFF', '#1DB954'];
const COUNT = 28;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
}

export default function ConfettiAnimation({ visible }: Readonly<{ visible: boolean }>) {
  const particlesRef = useRef<Particle[] | null>(null);
  if (!particlesRef.current) {
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }));
  }
  const particles = particlesRef.current;

  useEffect(() => {
    if (!visible) return;

    const animations = particles.map((p, i) => {
      const angle = (i / COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 140;
      const duration = 700 + Math.random() * 400;

      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.rotate.setValue(0);

      return Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * distance - 40, duration, useNativeDriver: true }),
        Animated.timing(p.rotate, { toValue: Math.random() * 6, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(duration * 0.5),
          Animated.timing(p.opacity, { toValue: 0, duration: duration * 0.5, useNativeDriver: true }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [visible, particles]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={`p-${i}`}
          style={[
            styles.particle,
            { backgroundColor: COLORS[i % COLORS.length] },
            {
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate: p.rotate.interpolate({ inputRange: [0, 6], outputRange: ['0deg', '360deg'] }) },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
