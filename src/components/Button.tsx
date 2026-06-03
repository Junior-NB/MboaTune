import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export default function Button({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) {

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[{ width: '100%' }, (disabled || loading) && styles.disabled, style]}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textPrimary} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
  },
  gradientContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
  },
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.surfaceLight,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  outlineText: {
    color: Colors.primary,
  },
});
