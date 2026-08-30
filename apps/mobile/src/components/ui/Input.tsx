import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.light.textTertiary}
          selectionColor={Colors.light.primary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Space[3],
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.label.fontSize,
    color: Colors.light.textSecondary,
    marginBottom: Space[1],
    letterSpacing: Typography.label.letterSpacing,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.sm, // 12
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Space[3],
  },
  inputError: {
    borderColor: Colors.light.danger,
    backgroundColor: Colors.light.dangerSoft,
  },
  leftIcon: {
    marginRight: Space[2],
  },
  rightIcon: {
    marginLeft: Space[2],
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Typography.family.regular,
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
  },
  errorText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.caption.fontSize,
    color: Colors.light.danger,
    marginTop: Space[1],
  },
  hintText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textTertiary,
    marginTop: Space[1],
  },
});
