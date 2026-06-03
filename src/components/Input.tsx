import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, secureTextEntry, ...props }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        error ? styles.inputError : null,
        isFocused && styles.inputFocused,
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  eyeIcon: {
    padding: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
