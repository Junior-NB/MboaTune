import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, FontSize } from '../theme/spacing';

export default function SplashScreen() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient colors={Colors.gradientDark} style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image 
          source={require('../assets/images/logo.jpg')} 
          style={styles.logoImage} 
        />
      </Animated.View>
      <Text style={styles.subtitle}>Musique en ligne & hors ligne</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
    borderRadius: 40,
  },
  logoImage: {
    width: 180,
    height: 180,
    borderRadius: 40,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xl,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
