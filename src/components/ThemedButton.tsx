import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  backgroundColor: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

function ThemedButton({
  label,
  onPress,
  backgroundColor,
  textColor = '#ffffff',
  disabled = false,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.55 : pressed ? 0.82 : 1 },
        style,
      ]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ThemedButton;
